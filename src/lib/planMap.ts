import type { Place } from '../types/place'

export const PLAN_MAP_BOUNDS = {
  north: 33.75,
  south: 32.55,
  west: -117.85,
  east: -116.25,
}

const PIN_MIN_DISTANCE = 12

function clampPinPosition(value: number): number {
  return Math.min(88, Math.max(12, value))
}

export function placeToMapPosition(place: Place): { top: string; left: string } | null {
  if (place.lat == null || place.lng == null) return null

  const topPct =
    ((PLAN_MAP_BOUNDS.north - place.lat) / (PLAN_MAP_BOUNDS.north - PLAN_MAP_BOUNDS.south)) * 100
  const leftPct =
    ((place.lng - PLAN_MAP_BOUNDS.west) / (PLAN_MAP_BOUNDS.east - PLAN_MAP_BOUNDS.west)) * 100

  return {
    top: `${clampPinPosition(topPct).toFixed(1)}%`,
    left: `${clampPinPosition(leftPct).toFixed(1)}%`,
  }
}

export interface PlanMapPinLayout {
  placeId: string
  top: string
  left: string
}

function parsePercent(value: string): number {
  return Number.parseFloat(value)
}

export function layoutPlanMapPins(places: Place[]): PlanMapPinLayout[] {
  const pins = places.flatMap((place) => {
    const position = placeToMapPosition(place)
    if (!position) return []
    return [{ placeId: place.id, top: position.top, left: position.left }]
  })

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

export function shortPlaceMapLabel(name: string): string {
  const primary = name.split(',')[0]?.trim() ?? name
  if (primary.length <= 14) return primary
  return `${primary.slice(0, 12).trim()}…`
}
