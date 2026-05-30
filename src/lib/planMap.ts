import type { Place } from '../types/place'

export const PLAN_MAP_BOUNDS = {
  north: 33.75,
  south: 32.55,
  west: -117.85,
  east: -116.25,
}

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

/** One pin per place at its real lat/lng — no decorative offsets. */
export function layoutPlanMapPins(places: Place[]): PlanMapPinLayout[] {
  return places.flatMap((place) => {
    const position = placeToMapPosition(place)
    if (!position) return []
    return [{ placeId: place.id, top: position.top, left: position.left }]
  })
}

export function shortPlaceMapLabel(name: string): string {
  const primary = name.split(',')[0]?.trim() ?? name
  if (primary.length <= 14) return primary
  return `${primary.slice(0, 12).trim()}…`
}
