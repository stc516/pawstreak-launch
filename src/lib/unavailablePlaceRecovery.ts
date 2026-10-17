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
