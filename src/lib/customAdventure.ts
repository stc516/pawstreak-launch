import type { ActiveAdventure, AppState, Dog, JourneyEntry } from '../data/demo'
import { createActiveAdventure } from '../data/demo'
import { getPackDisplayName } from './dogLabels'
import {
  buildEmotionalMemoryLine,
  buildFavoriteMoment,
} from './adventureFinish'
import { dogNamesLabel } from '../data/demo'

export const CUSTOM_ADVENTURE_PLACE_ID = 'custom-adventure'

export type AdventureSource = 'catalog' | 'neighborhood' | 'custom'

export interface AddAdventureDraft {
  title: string
  locationLabel: string
  notes: string
  scheduledFor: string
  photoDataUrl: string | null
  selectedDogIds: string[]
}

export interface ScheduledAdventure {
  id: string
  title: string
  locationLabel?: string
  notes?: string
  photoDataUrl?: string
  selectedDogIds: string[]
  createdAt: string
  scheduledFor?: string
}

export const EMPTY_ADD_ADVENTURE_DRAFT: AddAdventureDraft = {
  title: '',
  locationLabel: '',
  notes: '',
  scheduledFor: '',
  photoDataUrl: null,
  selectedDogIds: [],
}

export function createDefaultAddAdventureDraft(state: AppState): AddAdventureDraft {
  return {
    ...EMPTY_ADD_ADVENTURE_DRAFT,
    selectedDogIds: state.dogs.map((dog) => dog.id),
  }
}

export function normalizeCustomTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isCustomAdventurePlace(placeId: string | undefined): boolean {
  return placeId === CUSTOM_ADVENTURE_PLACE_ID
}

export function isCustomAdventure(
  adventure: ActiveAdventure | null | undefined,
): boolean {
  if (!adventure) return false
  return (
    adventure.source === 'custom' ||
    isCustomAdventurePlace(adventure.placeId)
  )
}

export function inferAdventureSource(
  placeId: string | undefined,
): AdventureSource {
  if (isCustomAdventurePlace(placeId)) return 'custom'
  if (placeId === 'neighborhood-walk') return 'neighborhood'
  return 'catalog'
}

export function getDistinctPlaceKey(entry: JourneyEntry): string {
  if (isCustomAdventurePlace(entry.placeId)) {
    return `custom:${normalizeCustomTitle(entry.place)}`
  }
  return entry.placeId ?? entry.place
}

export function getDogsForAdventure(
  allDogs: Dog[],
  selectedDogIds?: string[],
): Dog[] {
  if (!selectedDogIds?.length) return allDogs
  const selected = new Set(selectedDogIds)
  const filtered = allDogs.filter((dog) => selected.has(dog.id))
  return filtered.length > 0 ? filtered : allDogs
}

export function isValidAddAdventureDraft(draft: AddAdventureDraft): boolean {
  return (
    draft.title.trim().length >= 2 &&
    draft.selectedDogIds.length >= 1
  )
}

export function createCustomActiveAdventure(
  draft: AddAdventureDraft,
  options: {
    started?: boolean
    startedAt?: string
    serverId?: string
  } = {},
): ActiveAdventure {
  const title = draft.title.trim()
  const started = options.started ?? true
  return createActiveAdventure(
    CUSTOM_ADVENTURE_PLACE_ID,
    title,
    'Open end',
    {
      source: 'custom',
      customTitle: title,
      customLocationLabel: draft.locationLabel.trim() || undefined,
      userNotes: draft.notes.trim() || undefined,
      selectedDogIds: draft.selectedDogIds,
      dogId: draft.selectedDogIds[0],
      started,
      startedAt: options.startedAt ?? (started ? new Date().toISOString() : undefined),
      serverId: options.serverId,
    },
  )
}

export function scheduledFromDraft(
  draft: AddAdventureDraft,
): ScheduledAdventure {
  const scheduledDate = draft.scheduledFor ? new Date(draft.scheduledFor) : null
  return {
    id: crypto.randomUUID(),
    title: draft.title.trim(),
    locationLabel: draft.locationLabel.trim() || undefined,
    notes: draft.notes.trim() || undefined,
    photoDataUrl: draft.photoDataUrl ?? undefined,
    selectedDogIds: [...draft.selectedDogIds],
    createdAt: new Date().toISOString(),
    scheduledFor:
      scheduledDate && !Number.isNaN(scheduledDate.getTime())
        ? scheduledDate.toISOString()
        : undefined,
  }
}

export function createJourneyEntryFromCustom(
  dogs: Dog[],
  input: {
    title: string
    locationLabel?: string
    userNotes?: string
    photoUrls?: string[]
    durationLabel?: string
    recapLabels?: string[]
  },
): JourneyEntry {
  const recapLabels = input.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, dogs)
  const favoriteMoment = buildFavoriteMoment(recapLabels, dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace')
      ? 'Calm + close'
      : recapLabels.includes('Loved every second')
        ? 'Joyful + tired'
        : 'Warm + steady'

  const locationSnippet = input.locationLabel?.trim()
  const notesSnippet = input.userNotes?.trim()
  const magicLine =
    notesSnippet ||
    (locationSnippet ? `At ${locationSnippet}` : 'Your adventure')

  const tags = [
    'Custom',
    ...(locationSnippet ? [locationSnippet] : []),
    dogNamesLabel(dogs),
    'Loved it',
  ]

  return {
    id: `custom-adventure-${Date.now()}`,
    placeId: CUSTOM_ADVENTURE_PLACE_ID,
    place: input.title.trim(),
    date: 'Today',
    occurredAt: new Date().toISOString(),
    magicLine,
    tags,
    photoUrls: input.photoUrls?.length ? input.photoUrls : undefined,
    durationLabel: input.durationLabel,
    recapLabels: recapLabels.length > 0 ? recapLabels : undefined,
    emotionalLine,
    favoriteMoment,
    memoryMood,
    customLocationLabel: locationSnippet || undefined,
    userNotes: notesSnippet || undefined,
    dogTags: dogs.map(
      (dog) => `${dog.name} · ${dog.breed.split('·')[0]?.trim() ?? 'companion'}`,
    ),
  }
}

export function getPackLabelForDogIds(dogs: Dog[], dogIds: string[]): string {
  const selected = getDogsForAdventure(dogs, dogIds)
  return getPackDisplayName(selected)
}
