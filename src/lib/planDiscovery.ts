import type { Place } from '../types/place'
import { PLACES, getPlacesForPlanCategory } from '../data/places'
import type { RecommendationPrefs } from './onboardingProfile'
import { resolveAllCuratedChallenges } from './challengeEngine'
import type { AppState } from '../data/demo'
import type { DevelopedRegionMatch } from './geocode'

export type PlanProximityBucket = '5min' | '15min' | '30min' | 'road-trip'

export const PLAN_PROXIMITY_OPTIONS: {
  id: PlanProximityBucket
  label: string
  emoji: string
}[] = [
  { id: '5min', label: '5 min', emoji: '🏘️' },
  { id: '15min', label: '15 min', emoji: '⏱️' },
  { id: '30min', label: '30 min', emoji: '🚗' },
  { id: 'road-trip', label: 'Road trip', emoji: '🛣️' },
]

export function parseDistanceMiles(label: string): number | null {
  const miles = label.match(/([\d.]+)\s*mi/i)
  if (miles) return Number.parseFloat(miles[1])

  const minutes = label.match(/([\d.]+)\s*min/i)
  if (minutes) return Number.parseFloat(minutes[1]) / 10

  return null
}

interface PlanLocationContext {
  supported: boolean
  regionId: DevelopedRegionMatch['regionId']
  lat: number | null
  lng: number | null
}

function resolvePlanLocationContext(state?: AppState): PlanLocationContext {
  if (!state) {
    return { supported: true, regionId: null, lat: null, lng: null }
  }

  const label = state.locationLabel.toLowerCase()
  const regionId =
    label.includes('orange county') ? 'orange-county' :
    label.includes('san diego') ? 'san-diego' :
    null

  return {
    supported: state.locationSupported,
    regionId,
    lat: state.resolvedLocation?.lat ?? state.mapCenter.lat ?? null,
    lng: state.resolvedLocation?.lng ?? state.mapCenter.lng ?? null,
  }
}

function placeRegionId(place: Place): DevelopedRegionMatch['regionId'] {
  if (place.region === 'San Diego') return 'san-diego'
  if (place.region === 'Orange County') return 'orange-county'
  return null
}

function sameDevelopedRegion(place: Place, context: PlanLocationContext): boolean {
  if (!context.regionId) return true
  return placeRegionId(place) === context.regionId
}

function distanceMilesBetween(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
): number {
  const radiusMiles = 3958.8
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(endLat - startLat)
  const dLng = toRadians(endLng - startLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(dLng / 2) ** 2
  return radiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getPlaceDistanceMiles(
  place: Place,
  state?: AppState,
): number | null {
  const context = resolvePlanLocationContext(state)
  if (
    context.lat != null &&
    context.lng != null &&
    place.lat != null &&
    place.lng != null
  ) {
    return distanceMilesBetween(context.lat, context.lng, place.lat, place.lng)
  }
  return parseDistanceMiles(place.distanceLabel)
}

function formatDistanceLabel(place: Place, miles: number | null): string {
  if (place.category === 'Road trip') {
    return place.driveTimeEstimate ?? 'Day trip'
  }
  if (miles == null) return place.distanceLabel
  if (miles < 10) return `${miles.toFixed(1)} mi`
  if (miles < 45) return `${Math.round(miles)} mi`
  if (miles < 95) return `Worth the drive · ${Math.round(miles)} mi`
  return `Day trip · ${Math.round(miles)} mi`
}

function withLocationDistance(place: Place, state?: AppState): Place {
  const miles = getPlaceDistanceMiles(place, state)
  return {
    ...place,
    distanceLabel: formatDistanceLabel(place, miles),
  }
}

function sortByLocation(places: Place[], state?: AppState): Place[] {
  const context = resolvePlanLocationContext(state)
  return [...places].sort((left, right) => {
    const leftSameRegion = sameDevelopedRegion(left, context) ? 0 : 1
    const rightSameRegion = sameDevelopedRegion(right, context) ? 0 : 1
    if (leftSameRegion !== rightSameRegion) return leftSameRegion - rightSameRegion

    const leftMiles = getPlaceDistanceMiles(left, state) ?? 999
    const rightMiles = getPlaceDistanceMiles(right, state) ?? 999
    if (leftMiles !== rightMiles) return leftMiles - rightMiles

    if (left.popularNow !== right.popularNow) return left.popularNow ? -1 : 1
    if (left.featured !== right.featured) return left.featured ? -1 : 1
    return left.name.localeCompare(right.name)
  })
}

function rankAndDecoratePlaces(places: Place[], state?: AppState): Place[] {
  return sortByLocation(places, state).map((place) => withLocationDistance(place, state))
}

export function getPlanMapPlaces(
  proximityBucket: PlanProximityBucket,
  prefs?: RecommendationPrefs,
  state?: AppState,
): Place[] {
  return getPlacesForProximityBucket(proximityBucket, prefs, state).filter(
    (place) => place.lat != null && place.lng != null,
  )
}

export function getMapPreviewPlaces(
  _prefs?: RecommendationPrefs,
  state?: AppState,
): Place[] {
  if (state && !state.locationSupported) return []

  const featured = rankAndDecoratePlaces(
    PLACES.filter((place) => place.featured || place.popularNow),
    state,
  )
  return featured.slice(0, 4)
}

export function getPlacesForProximityBucket(
  bucket: PlanProximityBucket,
  _prefs?: RecommendationPrefs,
  state?: AppState,
): Place[] {
  const context = resolvePlanLocationContext(state)
  if (state && !context.supported) return []

  if (bucket === 'road-trip') {
    return rankAndDecoratePlaces(
      PLACES.filter(
        (place) =>
          place.category === 'Road trip' ||
          (!sameDevelopedRegion(place, context) &&
            placeRegionId(place) !== null &&
            getPlaceDistanceMiles(place, state) != null),
      ),
      state,
    ).slice(0, 4)
  }

  const maxMiles = bucket === '5min' ? 2.5 : bucket === '15min' ? 6 : 14
  const nearby = rankAndDecoratePlaces(
    PLACES.filter((place) => {
      if (place.category === 'Road trip') return false
      if (!sameDevelopedRegion(place, context)) return false
      const miles = getPlaceDistanceMiles(place, state)
      return miles !== null && miles <= maxMiles
    }),
    state,
  )

  if (bucket === '5min') {
    const neighborhood = PLACES.find((place) => place.id === 'neighborhood-walk')
    const picks = neighborhood
      ? [
          withLocationDistance(neighborhood, state),
          ...nearby.filter((place) => place.id !== neighborhood.id),
        ]
      : nearby
    return picks.slice(0, 4)
  }

  return nearby.slice(0, 4)
}

export function getPlanNearbyPlaces(
  categoryId: string,
  proximityBucket: PlanProximityBucket,
  prefs?: RecommendationPrefs,
  state?: AppState,
): Place[] {
  if (proximityBucket !== '15min') {
    return getPlacesForProximityBucket(proximityBucket, prefs, state)
  }

  if (state && !state.locationSupported) return []

  const context = resolvePlanLocationContext(state)
  const categoryPlaces = getPlacesForPlanCategory(categoryId, prefs).filter((place) => {
    if (place.category === 'Road trip') return false
    if (!sameDevelopedRegion(place, context)) return false
    const miles = getPlaceDistanceMiles(place, state)
    return miles == null || miles <= 20
  })

  return rankAndDecoratePlaces(categoryPlaces, state)
}

export function getPlanChallengeOpportunities(state: AppState) {
  return resolveAllCuratedChallenges(state)
    .filter((challenge) => !challenge.progress.joined)
    .slice(0, 3)
}

export function getMapPinPosition(index: number): { left: string; top: string } {
  const slots = [
    { left: '18%', top: '28%' },
    { left: '52%', top: '22%' },
    { left: '72%', top: '46%' },
    { left: '34%', top: '58%' },
  ]
  return slots[index % slots.length] ?? { left: `${20 + index * 16}%`, top: '40%' }
}
