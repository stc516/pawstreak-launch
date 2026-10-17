import type { JourneyEntry } from './demo'
import { getPlaceById } from './places'

export type JourneyMapFilterId = 'all' | 'beach' | 'trail' | 'road-trips' | 'parks' | 'cafes'

export interface JourneyMapPin {
  id: string
  label: string
  category: JourneyMapFilterId
  lat: number
  lng: number
  entryId: string
  placeId: string
}

export function categoryForEntry(entry: JourneyEntry): JourneyMapFilterId {
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  if (place?.category === 'Road trip') return 'road-trips'
  if (place?.category === 'Beach') return 'beach'
  if (place?.category === 'Trail') return 'trail'
  if (place?.category === 'Park' || place?.category === 'Dog Park') return 'parks'
  if (place?.category === 'Coffee' || place?.category === 'Brewery') return 'cafes'
  const tags = entry.tags.join(' ').toLowerCase()
  if (tags.includes('road trip')) return 'road-trips'
  if (tags.includes('beach')) return 'beach'
  if (tags.includes('trail')) return 'trail'
  if (tags.includes('park')) return 'parks'
  if (tags.includes('coffee') || tags.includes('cafe')) return 'cafes'
  return 'all'
}

export function buildJourneyMapPins(entries: JourneyEntry[]): JourneyMapPin[] {
  const seen = new Set<string>()
  return [...entries].sort((a, b) => (Date.parse(b.occurredAt ?? '') || 0) - (Date.parse(a.occurredAt ?? '') || 0)).flatMap(entry => {
    const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
    if (!place || place.lat == null || place.lng == null ||
      !Number.isFinite(place.lat) || !Number.isFinite(place.lng) ||
      Math.abs(place.lat) > 90 || Math.abs(place.lng) > 180 || seen.has(place.id)) return []
    seen.add(place.id)
    return [{ id: `place-${place.id}`, label: place.name, category: categoryForEntry(entry),
      lat: place.lat, lng: place.lng, entryId: entry.id, placeId: place.id }]
  })
}

export function filterJourneyMapPins(pins: JourneyMapPin[], filterId: JourneyMapFilterId): JourneyMapPin[] {
  return filterId === 'all' ? pins : pins.filter(pin => pin.category === filterId)
}
