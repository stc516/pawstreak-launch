import type { AppState } from '../data/demo'
import { defaultAppState } from '../data/demo'
import type { OnboardingResult } from './onboardingProfile'
import { resolveLocationProfile, buildDogsFromOnboarding } from './onboardingProfile'
import { resolveMapCenterForLocation } from './mapbox'
import { createDogsForUser, fetchDogsForUser, getActiveDog, updateDogPhotoPath, uploadDogPhoto } from './db/dogs'
import { fetchMemoriesForUser, countDistinctPlaces } from './db/memories'
import { fetchProfile, upsertProfileFromOnboarding } from './db/profiles'
import { trackUserEvent } from './db/userEvents'
import { createAdventure, completeAdventure, cancelAdventure } from './db/adventures'
import { createMemory } from './db/memories'
import { insertLocationCandidate } from './db/locationCandidates'
import { CUSTOM_ADVENTURE_PLACE_ID, getPlaceById } from '../data/places'
import { isCustomAdventure } from './customAdventure'
import {
  deleteScheduledAdventure,
  fetchScheduledAdventuresForUser,
  insertScheduledAdventure,
} from './db/scheduledAdventures'
import type { AdventureFinishPayload } from './adventureFinish'
import type { ActiveAdventure, Dog, LocationCandidate } from '../data/demo'
import { createActiveAdventure } from '../data/demo'

import {
  EMPTY_BOND_LEVEL,
  EMPTY_COMMUNITY_LIVE,
  EMPTY_FLASHBACK,
  applyRealUserContent,
} from './productionState'

export function createProductionInitialState(): AppState {
  return applyRealUserContent({
    ...defaultAppState,
    mode: 'app',
    dogs: [],
    streak: 0,
    adventureCount: 0,
    placeCount: 0,
    journeyEntries: [],
    recentAdventures: [],
    communityPosts: [],
    joinedChallenges: [],
    trainingLessonCompletions: [],
    trainingRewardUnlocks: [],
    achievements: [],
    favoritePlaces: [],
    packAccessMembers: [],
    hasUserDogProfile: false,
    communityLive: EMPTY_COMMUNITY_LIVE,
    bondLevel: EMPTY_BOND_LEVEL,
    flashback: EMPTY_FLASHBACK,
    activeAdventure: null,
    adventurePhotos: ['', '', ''],
    locationCandidates: [],
  })
}

export async function hydrateProductionState(
  userId: string,
  base: AppState,
): Promise<AppState> {
  const profile = await fetchProfile(userId)
  const dogs = await fetchDogsForUser(userId)
  const activeDog = getActiveDog(dogs, profile?.active_dog_id)
  const journeyEntries = await fetchMemoriesForUser(userId, activeDog?.id ?? null)
  const placeCount = await countDistinctPlaces(userId, activeDog?.id ?? null)
  const scheduledAdventures = await fetchScheduledAdventuresForUser(userId)

  const hydrated = {
    ...base,
    onboardingComplete: profile?.onboarding_complete ?? false,
    userName: profile?.display_name ?? base.userName,
    zipCode: profile?.zip_code ?? base.zipCode,
    locationQuery: profile?.location_query ?? base.locationQuery,
    locationLabel: profile?.location_label ?? base.locationLabel,
    locationSupported: profile?.location_supported ?? base.locationSupported,
    mapCenter: resolveMapCenterForLocation({
      zipCode: profile?.zip_code ?? base.zipCode,
      supported: profile?.location_supported ?? base.locationSupported,
      label: profile?.location_label ?? base.locationLabel,
    }),
    dogVibeNames: profile?.dog_vibe_names ?? [],
    onboardingCategoryIds: profile?.onboarding_category_ids ?? [],
    dogs,
    hasUserDogProfile: dogs.length > 0,
    journeyEntries,
    adventureCount: journeyEntries.length,
    placeCount,
    activeDogId: activeDog?.id ?? null,
    scheduledAdventures,
  }

  return applyRealUserContent(hydrated)
}

export async function persistOnboardingToSupabase(
  userId: string,
  email: string | undefined,
  result: OnboardingResult,
) {
  const location = resolveLocationProfile(result.locationQuery)
  await upsertProfileFromOnboarding(userId, email, result, {
    zipCode: location.zipCode,
    locationQuery: location.query,
    locationLabel: location.label,
    locationSupported: location.supported,
  })

  const localDogs = buildDogsFromOnboarding(result.dogs)
  const createdDogs = await createDogsForUser(userId, localDogs)

  if (result.dogPhotoDataUrl && createdDogs[0]) {
    const photoPath = await uploadDogPhoto(
      userId,
      createdDogs[0].id,
      result.dogPhotoDataUrl,
    )
    if (!photoPath) {
      throw new Error('Could not save dog photo. Try again or remove the photo to continue.')
    }

    const saved = await updateDogPhotoPath(userId, createdDogs[0].id, photoPath)
    if (!saved) {
      throw new Error('Could not save dog photo. Try again or remove the photo to continue.')
    }
  }

  await trackUserEvent('onboarding_complete', { dogCount: createdDogs.length }, userId)
}

export async function startAdventureOnServer(input: {
  userId: string
  dogId: string
  placeId: string
  durationLabel: string
  selectedDogIds?: string[]
  source?: 'catalog' | 'neighborhood' | 'custom'
  customTitle?: string
  customLocationLabel?: string
  userNotes?: string
  started?: boolean
  startedAt?: string
}): Promise<ActiveAdventure | null> {
  const adventure = await createAdventure({
    userId: input.userId,
    dogId: input.dogId,
    placeId: input.placeId,
    durationLabel: input.durationLabel,
    source: input.source,
    customTitle: input.customTitle,
    customLocationLabel: input.customLocationLabel,
    notes: input.userNotes,
  })
  if (!adventure) return null

  const place = getPlaceById(input.placeId)
  if (!place) return null

  await trackUserEvent(
    'adventure_started',
    { placeId: input.placeId, adventureId: adventure.id },
    input.userId,
  )

  const isCustom = input.placeId === CUSTOM_ADVENTURE_PLACE_ID
  const location = isCustom
    ? (input.customTitle ?? place.name)
    : place.name

  return createActiveAdventure(place.id, location, input.durationLabel, {
    serverId: adventure.id,
    dogId: input.dogId,
    selectedDogIds: input.selectedDogIds ?? [input.dogId],
    started: input.started ?? false,
    startedAt: input.startedAt,
    source: input.source ?? (isCustom ? 'custom' : 'catalog'),
    customTitle: input.customTitle,
    customLocationLabel: input.customLocationLabel,
    userNotes: input.userNotes,
  })
}

export async function finishAdventureOnServer(input: {
  userId: string
  dogId: string
  activeAdventure: ActiveAdventure
  dogs: Dog[]
  photoDataUrls: string[]
  payload: AdventureFinishPayload
}) {
  const place = getPlaceById(input.activeAdventure.placeId)
  if (!place) throw new Error('Place not found')

  const custom = isCustomAdventure(input.activeAdventure)
  const memory = await createMemory({
    userId: input.userId,
    dogId: input.dogId,
    adventureId: input.activeAdventure.serverId ?? null,
    place,
    dogs: input.dogs,
    durationLabel: input.activeAdventure.durationLabel,
    recapLabels: input.payload.recapLabels,
    photoDataUrls: input.photoDataUrls,
    displayPlaceName: custom
      ? (input.activeAdventure.customTitle ?? input.activeAdventure.location)
      : undefined,
    customLocationLabel: input.activeAdventure.customLocationLabel,
    userNotes: input.activeAdventure.userNotes,
  })

  if (!memory) throw new Error('Could not save memory')

  if (input.activeAdventure.serverId) {
    await completeAdventure(
      input.activeAdventure.serverId,
      input.userId,
      input.payload.recapLabels,
    )
  }

  await trackUserEvent(
    'memory_created',
    { memoryId: memory.id, placeId: place.id },
    input.userId,
  )
  await trackUserEvent(
    'adventure_completed',
    { adventureId: input.activeAdventure.serverId, placeId: place.id },
    input.userId,
  )

  return memory
}

export async function cancelAdventureOnServer(userId: string, activeAdventure: ActiveAdventure) {
  if (activeAdventure.serverId) {
    await cancelAdventure(activeAdventure.serverId, userId)
  }
}

export async function saveScheduledAdventureOnServer(input: {
  userId: string
  title: string
  locationLabel?: string
  notes?: string
  selectedDogIds: string[]
}) {
  return insertScheduledAdventure(input)
}

export async function removeScheduledAdventureOnServer(id: string, userId: string) {
  return deleteScheduledAdventure(id, userId)
}

export async function saveLocationCandidateOnServer(candidate: LocationCandidate) {
  return insertLocationCandidate(candidate)
}
