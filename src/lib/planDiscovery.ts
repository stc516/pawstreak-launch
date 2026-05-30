import type { Place } from '../types/place'
import { PLACES, getPlacesForPlanCategory } from '../data/places'
import type { RecommendationPrefs } from './onboardingProfile'
import { resolveAllCuratedChallenges } from './challengeEngine'
import type { AppState } from '../data/demo'

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

function parseDistanceMiles(label: string): number | null {
  const miles = label.match(/([\d.]+)\s*mi/i)
  if (miles) return Number.parseFloat(miles[1])

  const minutes = label.match(/([\d.]+)\s*min/i)
  if (minutes) return Number.parseFloat(minutes[1]) / 10

  return null
}

function sortByDistance(places: Place[]): Place[] {
  return [...places].sort((left, right) => {
    const leftMiles = parseDistanceMiles(left.distanceLabel) ?? 999
    const rightMiles = parseDistanceMiles(right.distanceLabel) ?? 999
    return leftMiles - rightMiles
  })
}

export function getMapPreviewPlaces(_prefs?: RecommendationPrefs): Place[] {
  const featured = sortByDistance(
    PLACES.filter((place) => place.featured || place.popularNow),
  )
  return featured.slice(0, 4)
}

export function getPlacesForProximityBucket(
  bucket: PlanProximityBucket,
  _prefs?: RecommendationPrefs,
): Place[] {
  if (bucket === 'road-trip') {
    return sortByDistance(PLACES.filter((place) => place.category === 'Road trip')).slice(0, 4)
  }

  const maxMiles = bucket === '5min' ? 2.5 : bucket === '15min' ? 6 : 14
  const nearby = sortByDistance(
    PLACES.filter((place) => {
      if (place.category === 'Road trip') return false
      const miles = parseDistanceMiles(place.distanceLabel)
      return miles !== null && miles <= maxMiles
    }),
  )

  if (bucket === '5min') {
    const neighborhood = PLACES.find((place) => place.id === 'neighborhood-walk')
    const picks = neighborhood ? [neighborhood, ...nearby.filter((place) => place.id !== neighborhood.id)] : nearby
    return picks.slice(0, 4)
  }

  return nearby.slice(0, 4)
}

export function getPlanNearbyPlaces(
  categoryId: string,
  proximityBucket: PlanProximityBucket,
  prefs?: RecommendationPrefs,
): Place[] {
  if (proximityBucket !== '15min') {
    return getPlacesForProximityBucket(proximityBucket, prefs)
  }

  return getPlacesForPlanCategory(categoryId, prefs)
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
