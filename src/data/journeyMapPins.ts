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
  shortLabel: string
  category: JourneyMapFilterId
  top: string
  left: string
  entryId: string
}

const PIN_MIN_DISTANCE = 14

function shortLabelFor(label: string): string {
  const primary = label.split(',')[0]?.trim() ?? label
  if (primary.length <= 16) return primary
  return `${primary.slice(0, 14).trim()}…`
}

function parsePercent(value: string): number {
  return Number.parseFloat(value)
}

function clampPinPosition(value: number): number {
  return Math.min(86, Math.max(14, value))
}

function layoutMapPins(pins: JourneyMapPin[]): JourneyMapPin[] {
  if (pins.length <= 1) return pins

  const positions = pins.map((pin) => ({
    top: parsePercent(pin.top),
    left: parsePercent(pin.left),
  }))

  for (let pass = 0; pass < 4; pass += 1) {
    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i]
        const b = positions[j]
        const dx = a.left - b.left
        const dy = a.top - b.top
        const distance = Math.hypot(dx, dy)

        if (distance >= PIN_MIN_DISTANCE || distance === 0) continue

        const push = (PIN_MIN_DISTANCE - distance) / 2
        const angle = Math.atan2(dy, dx)
        a.left = clampPinPosition(a.left + Math.cos(angle) * push)
        a.top = clampPinPosition(a.top + Math.sin(angle) * push)
        b.left = clampPinPosition(b.left - Math.cos(angle) * push)
        b.top = clampPinPosition(b.top - Math.sin(angle) * push)
      }
    }
  }

  return pins.map((pin, index) => ({
    ...pin,
    top: `${positions[index].top.toFixed(1)}%`,
    left: `${positions[index].left.toFixed(1)}%`,
  }))
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
  if (place?.category === 'Park' || place?.category === 'Dog Park') return 'parks'
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
  const pins = entries.flatMap((entry) => {
    const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
    if (!place?.lat || !place?.lng) return []

    const position = latLngToMapPosition(place.lat, place.lng)
    const label = entry.place
    return [
      {
        id: `entry-${entry.id}`,
        label,
        shortLabel: shortLabelFor(label),
        category: categoryForEntry(entry),
        top: position.top,
        left: position.left,
        entryId: entry.id,
      },
    ]
  })

  return layoutMapPins(pins)
}

export function filterJourneyMapPins(
  pins: JourneyMapPin[],
  filterId: JourneyMapFilterId,
): JourneyMapPin[] {
  if (filterId === 'all') return pins
  return pins.filter((pin) => pin.category === filterId)
}
