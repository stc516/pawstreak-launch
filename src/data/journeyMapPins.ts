import type { JourneyEntry } from './demo'
import { getPlaceById } from './places'

export type JourneyMapFilterId =
  | 'all'
  | 'beach'
  | 'trail'
  | 'road-trips'
  | 'parks'
  | 'cafes'

export interface JourneyMapPin {
  id: string
  label: string
  category: JourneyMapFilterId
  top: string
  left: string
  entryId: string
}

const MAP_BOUNDS = {
  north: 33.75,
  south: 32.55,
  west: -117.85,
  east: -116.25,
}

function latLngToMapPosition(lat: number, lng: number): { top: string; left: string } {
  const topPct = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100
  const leftPct = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100

  return {
    top: `${Math.min(90, Math.max(10, topPct)).toFixed(1)}%`,
    left: `${Math.min(90, Math.max(10, leftPct)).toFixed(1)}%`,
  }
}

function categoryForEntry(entry: JourneyEntry): JourneyMapFilterId {
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  if (place?.category === 'Road trip') return 'road-trips'
  if (place?.category === 'Beach') return 'beach'
  if (place?.category === 'Trail') return 'trail'
  if (place?.category === 'Park' || place?.category === 'Dog park') return 'parks'
  if (place?.category === 'Coffee' || place?.category === 'Brewery') return 'cafes'

  const tagText = entry.tags.join(' ').toLowerCase()
  if (tagText.includes('road trip')) return 'road-trips'
  if (tagText.includes('beach')) return 'beach'
  if (tagText.includes('trail')) return 'trail'
  if (tagText.includes('park')) return 'parks'
  if (tagText.includes('coffee') || tagText.includes('cafe')) return 'cafes'
  return 'all'
}

export function buildJourneyMapPins(entries: JourneyEntry[]): JourneyMapPin[] {
  return entries.flatMap((entry) => {
    const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
    if (!place?.lat || !place?.lng) return []

    const position = latLngToMapPosition(place.lat, place.lng)
    return [
      {
        id: `entry-${entry.id}`,
        label: entry.place,
        category: categoryForEntry(entry),
        top: position.top,
        left: position.left,
        entryId: entry.id,
      },
    ]
  })
}

export function filterJourneyMapPins(
  pins: JourneyMapPin[],
  filterId: JourneyMapFilterId,
): JourneyMapPin[] {
  if (filterId === 'all') return pins
  return pins.filter((pin) => pin.category === filterId)
}
