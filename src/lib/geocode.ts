import { getMapboxAccessToken } from './mapbox'
import {
  resolveLocationProfile,
  type LocationProfile,
} from './onboardingProfile'

/** Resolved geocoding result for a user-entered location. */
export interface ResolvedLocation {
  rawInput: string
  placeName: string
  city: string
  state: string
  country: string
  lat: number
  lng: number
  mapboxPlaceId: string
  relevance: number | null
}

export interface DevelopedRegionMatch {
  supported: boolean
  regionId: 'san-diego' | 'orange-county' | null
  regionLabel: string | null
}

interface RegionBounds {
  id: 'san-diego' | 'orange-county'
  label: string
  north: number
  south: number
  west: number
  east: number
}

/** Curated coverage today: San Diego County and Orange County. */
const DEVELOPED_REGION_BOUNDS: RegionBounds[] = [
  {
    id: 'orange-county',
    label: 'Orange County',
    north: 33.95,
    south: 33.33,
    west: -118.13,
    east: -117.41,
  },
  {
    id: 'san-diego',
    label: 'San Diego',
    north: 33.51,
    south: 32.5,
    west: -117.65,
    east: -116.08,
  },
]

export function detectDevelopedRegion(
  lat: number,
  lng: number,
): DevelopedRegionMatch {
  for (const region of DEVELOPED_REGION_BOUNDS) {
    if (
      lat >= region.south &&
      lat <= region.north &&
      lng >= region.west &&
      lng <= region.east
    ) {
      return { supported: true, regionId: region.id, regionLabel: region.label }
    }
  }
  return { supported: false, regionId: null, regionLabel: null }
}

type GeocodeMock = Record<string, ResolvedLocation | null>

declare global {
  interface Window {
    __PAWSTREAK_GEOCODE_MOCK__?: GeocodeMock
  }
}

interface MapboxFeature {
  id?: string
  place_name?: string
  relevance?: number
  center?: [number, number]
  text?: string
  place_type?: string[]
  context?: { id?: string; text?: string; short_code?: string }[]
}

function contextText(
  feature: MapboxFeature,
  prefix: string,
): string {
  const match = feature.context?.find((item) => item.id?.startsWith(prefix))
  return match?.text ?? ''
}

function parseFeature(rawInput: string, feature: MapboxFeature): ResolvedLocation | null {
  const center = feature.center
  if (!center || center.length < 2) return null

  const isPlace = feature.place_type?.includes('place')
  const city = isPlace ? (feature.text ?? '') : contextText(feature, 'place')

  return {
    rawInput,
    placeName: feature.place_name ?? rawInput,
    city,
    state: contextText(feature, 'region'),
    country: contextText(feature, 'country'),
    lat: center[1],
    lng: center[0],
    mapboxPlaceId: feature.id ?? '',
    relevance: typeof feature.relevance === 'number' ? feature.relevance : null,
  }
}

/**
 * Forward-geocode a user-entered location through Mapbox.
 * Returns null on missing token, network failure, timeout, or no results —
 * callers must treat null as "geocoding unavailable" and fall back gracefully.
 */
export async function geocodeLocation(
  query: string,
): Promise<ResolvedLocation | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  // Deterministic QA hook — lets tests resolve locations without network.
  if (typeof window !== 'undefined' && window.__PAWSTREAK_GEOCODE_MOCK__) {
    const mock = window.__PAWSTREAK_GEOCODE_MOCK__
    const key = trimmed.toLowerCase()
    if (key in mock) return mock[key]
    return null
  }

  const token = getMapboxAccessToken()
  if (!token) return null

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json` +
    `?access_token=${encodeURIComponent(token)}&country=US&limit=1` +
    `&types=postcode,place,locality,neighborhood,address`

  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, { signal: controller.signal })
    window.clearTimeout(timeout)

    if (!response.ok) return null

    const data = (await response.json()) as { features?: MapboxFeature[] }
    const feature = data.features?.[0]
    if (!feature) return null

    return parseFeature(trimmed, feature)
  } catch {
    return null
  }
}

export interface GeocodedLocationResolution {
  profile: LocationProfile
  resolved: ResolvedLocation | null
  region: DevelopedRegionMatch
}

const UNSUPPORTED_AREA_SUBTITLE =
  "We don't have curated local spots here yet, but PawStreak still works. " +
  "We'll build adventures around your area and use this to improve local recommendations."

/**
 * Geocode-first location resolution. Falls back to the existing
 * pattern-based resolveLocationProfile when geocoding is unavailable,
 * so onboarding is never blocked by Mapbox errors.
 */
export async function resolveLocationProfileGeocoded(
  query: string,
): Promise<GeocodedLocationResolution> {
  const fallbackProfile = resolveLocationProfile(query)
  const resolved = await geocodeLocation(query)

  if (!resolved) {
    return {
      profile: fallbackProfile,
      resolved: null,
      region: fallbackProfile.supported
        ? {
            supported: true,
            regionId: /orange\s*county/i.test(fallbackProfile.label)
              ? 'orange-county'
              : 'san-diego',
            regionLabel: /orange\s*county/i.test(fallbackProfile.label)
              ? 'Orange County'
              : 'San Diego',
          }
        : { supported: false, regionId: null, regionLabel: null },
    }
  }

  const region = detectDevelopedRegion(resolved.lat, resolved.lng)

  if (region.supported) {
    const isOc = region.regionId === 'orange-county'
    const label = isOc ? 'Orange County, CA' : 'San Diego, CA'
    const zipMatch = query.trim().match(/\b(\d{5})\b/)
    return {
      profile: {
        query: query.trim() || label,
        zipCode: zipMatch?.[1] ?? fallbackProfile.zipCode ?? '92123',
        label,
        supported: true,
        mapTitle: isOc ? 'Orange County spots' : 'San Diego spots',
        mapSubtitle: 'Dog-friendly spots nearby · Tap a pin to explore',
        communityLabel: isOc ? 'Orange County' : 'San Diego',
      },
      resolved,
      region,
    }
  }

  const resolvedLabel = [resolved.city, resolved.state]
    .filter(Boolean)
    .join(', ')

  return {
    profile: {
      query: query.trim(),
      zipCode: fallbackProfile.zipCode,
      label: resolvedLabel || fallbackProfile.label,
      supported: false,
      mapTitle: 'Your adventures, anywhere',
      mapSubtitle: UNSUPPORTED_AREA_SUBTITLE,
      communityLabel: resolved.city || 'Your area',
    },
    resolved,
    region,
  }
}
