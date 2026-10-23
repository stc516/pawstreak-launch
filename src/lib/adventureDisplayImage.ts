import type { JourneyEntry } from '../data/demo'
import type { Place, PlaceCategory } from '../types/place'
import { getPlaceById } from '../data/places'
import { authenticImageUrl } from './authenticImages'

export type AdventureImageSource = 'user-place' | 'destination' | 'none'
export interface AdventureDisplayImage { imageUrl?: string; source: AdventureImageSource }

const PLACE_CATEGORIES: PlaceCategory[] = ['Beach', 'Trail', 'Coffee', 'Dog Park', 'Park', 'Patio', 'Brewery', 'Restaurant', 'Lake', 'Campground', 'Scenic Spot', 'Gardens', 'Road trip', 'Neighborhood', 'Custom']

export function resolveCategoryFromJourneyEntry(entry: JourneyEntry): PlaceCategory | null {
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  if (place) return place.category
  const firstTag = entry.tags[0]
  return PLACE_CATEGORIES.find(category => category.toLowerCase() === firstTag?.toLowerCase()) ?? null
}

export function resolveAdventureDisplayImage(_journeyEntries: JourneyEntry[], place: Place): AdventureDisplayImage {
  const imageUrl = authenticImageUrl(place.imageUrl)
  return { imageUrl, source: imageUrl ? 'destination' : 'none' }
}

export function getAdventureDisplayImageUrl(journeyEntries: JourneyEntry[], place: Place): string | undefined {
  return resolveAdventureDisplayImage(journeyEntries, place).imageUrl
}

/** A memory without a photo stays photo-free; another outing is never substituted. */
export function resolveJourneyEntryDisplayImage(_journeyEntries: JourneyEntry[], entry: JourneyEntry): AdventureDisplayImage {
  const imageUrl = entry.photoUrls?.map(authenticImageUrl).find(Boolean)
  return { imageUrl, source: imageUrl ? 'user-place' : 'none' }
}

export function getJourneyEntryDisplayImageUrl(journeyEntries: JourneyEntry[], entry: JourneyEntry): string | undefined {
  return resolveJourneyEntryDisplayImage(journeyEntries, entry).imageUrl
}
