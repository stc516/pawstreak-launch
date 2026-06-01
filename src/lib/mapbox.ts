import type { Place } from '../types/place'
import { PLAN_MAP_BOUNDS } from './planMap'

export interface MapCenter {
  lat: number
  lng: number
}

export const DEFAULT_MAP_STYLE =
  import.meta.env.VITE_MAPBOX_STYLE_URL ?? 'mapbox://styles/mapbox/outdoors-v12'

export const DEFAULT_MAP_CENTER: MapCenter = {
  lat: 32.7157,
  lng: -117.1611,
}

const ZIP_MAP_CENTERS: Record<string, MapCenter> = {
  '92101': { lat: 32.7157, lng: -117.1611 },
  '92107': { lat: 32.7412, lng: -117.2468 },
  '92109': { lat: 32.7731, lng: -117.2516 },
  '92123': { lat: 32.8012, lng: -117.074 },
  '92648': { lat: 33.6595, lng: -117.9988 },
  '92657': { lat: 33.6189, lng: -117.9298 },
}

const ORANGE_COUNTY_CENTER: MapCenter = { lat: 33.6846, lng: -117.8265 }

const CATALOG_REGION_CENTER: MapCenter = {
  lat: (PLAN_MAP_BOUNDS.north + PLAN_MAP_BOUNDS.south) / 2,
  lng: (PLAN_MAP_BOUNDS.west + PLAN_MAP_BOUNDS.east) / 2,
}

export function getMapboxAccessToken(): string | undefined {
  const token = import.meta.env.VITE_MAPBOX_TOKEN?.trim()
  return token || undefined
}

export function isMapboxConfigured(): boolean {
  return Boolean(getMapboxAccessToken())
}

export interface LocationCenterInput {
  zipCode: string
  supported: boolean
  label: string
}

export function resolveMapCenterForLocation(location: LocationCenterInput): MapCenter {
  const zip = location.zipCode.trim()
  if (zip && ZIP_MAP_CENTERS[zip]) {
    return ZIP_MAP_CENTERS[zip]
  }

  if (location.supported) {
    if (/orange\s*county/i.test(location.label)) {
      return ORANGE_COUNTY_CENTER
    }
    return DEFAULT_MAP_CENTER
  }

  return CATALOG_REGION_CENTER
}

export type LngLatBounds = [[number, number], [number, number]]

export function getBoundsFromPlaces(places: Place[]): LngLatBounds | null {
  const mappable = places.filter(
    (place) => place.lat != null && place.lng != null,
  )
  if (mappable.length === 0) return null

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const place of mappable) {
    minLng = Math.min(minLng, place.lng!)
    maxLng = Math.max(maxLng, place.lng!)
    minLat = Math.min(minLat, place.lat!)
    maxLat = Math.max(maxLat, place.lat!)
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export function getCatalogRegionBounds(): LngLatBounds {
  return [
    [PLAN_MAP_BOUNDS.west, PLAN_MAP_BOUNDS.south],
    [PLAN_MAP_BOUNDS.east, PLAN_MAP_BOUNDS.north],
  ]
}

export function getMapFitBounds(places: Place[]): LngLatBounds {
  return getBoundsFromPlaces(places) ?? getCatalogRegionBounds()
}

export function getMapInitialZoom(places: Place[]): number {
  if (places.length === 0) return 9
  if (places.length === 1) return 12
  return 10.5
}
