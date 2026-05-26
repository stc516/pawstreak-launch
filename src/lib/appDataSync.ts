import type { AppState } from '../data/demo'
import { defaultAppState } from '../data/demo'
import type { OnboardingResult } from './onboardingProfile'
import { resolveLocationProfile, buildDogsFromOnboarding } from './onboardingProfile'
import { createDogsForUser, fetchDogsForUser, getActiveDog } from './db/dogs'
import { fetchMemoriesForUser, countDistinctPlaces } from './db/memories'
import { fetchProfile, upsertProfileFromOnboarding } from './db/profiles'
import { trackUserEvent } from './db/userEvents'
import { createAdventure, completeAdventure, cancelAdventure } from './db/adventures'
import { createMemory } from './db/memories'
import { getPlaceById } from '../data/places'
import type { AdventureFinishPayload } from './adventureFinish'
import type { ActiveAdventure, Dog } from '../data/demo'

const EMPTY_COMMUNITY_LIVE: AppState['communityLive'] = {
  label: 'Community',
  count: '0',
  countLabel: 'pack members nearby',
  tagline: 'Share adventures when you are ready.',
  topSpot: 'Your neighborhood',
  topSpotNote: 'Community launches soon.',
  chips: [{ label: 'Coming soon' }],
}

const EMPTY_BOND_LEVEL: AppState['bondLevel'] = {
  label: 'Bond level',
  rank: 'Getting started',
  fillWidth: '8%',
  subtitle: 'Every adventure builds your story together.',
  nextRank: 'Adventure buddy',
  nextUnlock: 'Save your first memory',
  favoriteCategory: '—',
  beachDays: 0,
  recentMoments: [],
}

export function createProductionInitialState(): AppState {
  return {
    ...defaultAppState,
    mode: 'app',
    dogs: [],
    streak: 0,
    adventureCount: 0,
    placeCount: 0,
    journeyEntries: [],
    recentAdventures: [],
    communityPosts: [],
    challenges: [],
    achievements: [],
    favoritePlaces: [],
    packAccessMembers: [],
    hasUserDogProfile: false,
    communityLive: EMPTY_COMMUNITY_LIVE,
    bondLevel: EMPTY_BOND_LEVEL,
    flashback: {
      title: 'Your first memory is waiting',
      subtitle: 'Finish an adventure to start your journey.',
    },
    activeAdventure: null,
    adventurePhotos: ['', '', ''],
  }
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

  return {
    ...base,
    onboardingComplete: profile?.onboarding_complete ?? false,
    userName: profile?.display_name ?? base.userName,
    zipCode: profile?.zip_code ?? base.zipCode,
    locationQuery: profile?.location_query ?? base.locationQuery,
    locationLabel: profile?.location_label ?? base.locationLabel,
    locationSupported: profile?.location_supported ?? base.locationSupported,
    dogVibeNames: profile?.dog_vibe_names ?? [],
    onboardingCategoryIds: profile?.onboarding_category_ids ?? [],
    dogs,
    hasUserDogProfile: dogs.length > 0,
    journeyEntries,
    adventureCount: journeyEntries.length,
    placeCount,
    activeDogId: activeDog?.id ?? null,
  }
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
  await createDogsForUser(userId, localDogs)
  await trackUserEvent('onboarding_complete', { dogCount: localDogs.length }, userId)
}

export async function startAdventureOnServer(input: {
  userId: string
  dogId: string
  placeId: string
  durationLabel: string
}): Promise<ActiveAdventure | null> {
  const adventure = await createAdventure(input)
  if (!adventure) return null

  const place = getPlaceById(input.placeId)
  if (!place) return null

  await trackUserEvent(
    'adventure_started',
    { placeId: input.placeId, adventureId: adventure.id },
    input.userId,
  )

  return {
    serverId: adventure.id,
    dogId: input.dogId,
    placeId: place.id,
    location: place.name,
    durationLabel: input.durationLabel,
    started: false,
  }
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

  const memory = await createMemory({
    userId: input.userId,
    dogId: input.dogId,
    adventureId: input.activeAdventure.serverId ?? null,
    place,
    dogs: input.dogs,
    durationLabel: input.activeAdventure.durationLabel,
    recapLabels: input.payload.recapLabels,
    photoDataUrls: input.photoDataUrls,
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
