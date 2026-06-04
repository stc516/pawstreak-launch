import type { JourneyEntry } from '../data/demo'
import type { Place, PlaceCategory } from '../types/place'
import { getPlaceById } from '../data/places'
import { getSampleImageForPlace } from '../data/sampleImages'

export type AdventureImageSource = 'user-place' | 'user-category' | 'destination'

export interface AdventureDisplayImage {
  imageUrl?: string
  source: AdventureImageSource
}

const PLACE_CATEGORIES: PlaceCategory[] = [
  'Beach',
  'Trail',
  'Coffee',
  'Dog Park',
  'Park',
  'Brewery',
  'Gardens',
  'Road trip',
  'Neighborhood',
]

function getEntrySortTime(entry: JourneyEntry): number {
  if (entry.occurredAt) {
    const ms = new Date(entry.occurredAt).getTime()
    if (!Number.isNaN(ms)) return ms
  }
  return 0
}

function getLatestPhotoFromEntries(entries: JourneyEntry[]): string | undefined {
  const sorted = [...entries].sort((a, b) => getEntrySortTime(b) - getEntrySortTime(a))
  for (const entry of sorted) {
    const photo = entry.photoUrls?.find(Boolean)
    if (photo) return photo
  }
  return undefined
}

export function resolveCategoryFromJourneyEntry(
  entry: JourneyEntry,
): PlaceCategory | null {
  if (entry.placeId) {
    const place = getPlaceById(entry.placeId)
    if (place) return place.category
  }

  const firstTag = entry.tags[0]
  if (!firstTag) return null

  return (
    PLACE_CATEGORIES.find(
      (category) => category.toLowerCase() === firstTag.toLowerCase(),
    ) ?? null
  )
}

function getDestinationImageForPlace(place: Place): string | undefined {
  return place.imageUrl ?? getSampleImageForPlace(place.category, place.id)
}

function getDestinationImageForCategory(
  category: PlaceCategory,
  seedId: string,
): string {
  return getSampleImageForPlace(category, seedId)
}

export function resolveAdventureDisplayImage(
  journeyEntries: JourneyEntry[],
  place: Place,
): AdventureDisplayImage {
  const placePhoto = getLatestPhotoFromEntries(
    journeyEntries.filter(
      (entry) => entry.placeId === place.id && entry.photoUrls?.some(Boolean),
    ),
  )
  if (placePhoto) {
    return { imageUrl: placePhoto, source: 'user-place' }
  }

  const categoryPhoto = getLatestPhotoFromEntries(
    journeyEntries.filter((entry) => {
      if (!entry.photoUrls?.some(Boolean)) return false
      return resolveCategoryFromJourneyEntry(entry) === place.category
    }),
  )
  if (categoryPhoto) {
    return { imageUrl: categoryPhoto, source: 'user-category' }
  }

  const destinationUrl = getDestinationImageForPlace(place)
  return { imageUrl: destinationUrl, source: 'destination' }
}

export function getAdventureDisplayImageUrl(
  journeyEntries: JourneyEntry[],
  place: Place,
): string | undefined {
  return resolveAdventureDisplayImage(journeyEntries, place).imageUrl
}

export function resolveJourneyEntryDisplayImage(
  journeyEntries: JourneyEntry[],
  entry: JourneyEntry,
): AdventureDisplayImage {
  const ownPhoto = entry.photoUrls?.find(Boolean)
  if (ownPhoto) {
    return { imageUrl: ownPhoto, source: 'user-place' }
  }

  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  if (place) {
    return resolveAdventureDisplayImage(journeyEntries, place)
  }

  const category = resolveCategoryFromJourneyEntry(entry)
  if (category) {
    const categoryPhoto = getLatestPhotoFromEntries(
      journeyEntries.filter((candidate) => {
        if (!candidate.photoUrls?.some(Boolean)) return false
        return resolveCategoryFromJourneyEntry(candidate) === category
      }),
    )
    if (categoryPhoto) {
      return { imageUrl: categoryPhoto, source: 'user-category' }
    }

    return {
      imageUrl: getDestinationImageForCategory(category, entry.id),
      source: 'destination',
    }
  }

  return {
    imageUrl: getDestinationImageForCategory('Neighborhood', entry.id),
    source: 'destination',
  }
}

export function getJourneyEntryDisplayImageUrl(
  journeyEntries: JourneyEntry[],
  entry: JourneyEntry,
): string | undefined {
  return resolveJourneyEntryDisplayImage(journeyEntries, entry).imageUrl
}
