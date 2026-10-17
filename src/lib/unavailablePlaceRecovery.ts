import type { Dog, JourneyEntry } from '../data/demo'
import { dogNamesLabel } from './dogLabels'
import {
  buildEmotionalMemoryLine,
  buildFavoriteMoment,
} from './adventureFinish'

export function resolveCatalogAdventureIdentity(
  adventure: { placeId?: string; location: string },
  place?: { id: string; name: string },
): { placeId: string; location: string } {
  return {
    placeId: place?.id ?? adventure.placeId ?? 'unavailable-catalog-place',
    location: place?.name ?? adventure.location,
  }
}

export function buildUnavailablePlaceMemoryPayload(input: {
  placeId: string
  placeName: string
  dogs: Dog[]
  durationLabel?: string
  recapLabels?: string[]
}) {
  const recapLabels = input.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, input.dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace')
      ? 'Calm + close'
      : recapLabels.includes('Loved every second')
        ? 'Joyful + tired'
        : 'Warm + steady'

  return {
    place_id: input.placeId,
    place_name: input.placeName.trim() || 'Saved adventure',
    magic_line: 'A day worth keeping.',
    emotional_line: emotionalLine,
    favorite_moment: buildFavoriteMoment(recapLabels, input.dogs),
    memory_mood: memoryMood,
    tags: ['Adventure'],
    recap_labels: recapLabels,
    duration_label: input.durationLabel ?? '',
  }
}

export function createJourneyEntryFromUnavailablePlace(
  location: string,
  dogs: Dog[],
  options: {
    photoUrls?: string[]
    durationLabel?: string
    recapLabels?: string[]
  } = {},
): JourneyEntry {
  const recapLabels = options.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, dogs)
  const favoriteMoment = buildFavoriteMoment(recapLabels, dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace') ? 'Calm + close' :
    recapLabels.includes('Loved every second') ? 'Joyful + tired' :
    'Warm + steady'

  return {
    id: `adventure-unavailable-place-${Date.now()}`,
    place: location.trim() || 'Saved adventure',
    date: 'Today',
    occurredAt: new Date().toISOString(),
    magicLine: 'A day worth keeping.',
    tags: ['Adventure', dogNamesLabel(dogs), 'Loved it'],
    photoUrls: options.photoUrls?.length ? options.photoUrls : undefined,
    durationLabel: options.durationLabel,
    recapLabels: recapLabels.length > 0 ? recapLabels : undefined,
    emotionalLine,
    favoriteMoment,
    memoryMood,
    dogTags: dogs.map(
      (dog) => `${dog.name} · ${dog.breed.split('·')[0]?.trim() ?? 'companion'}`,
    ),
  }
}
