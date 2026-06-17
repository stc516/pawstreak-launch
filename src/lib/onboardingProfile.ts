import type { Dog } from '../data/demo'
import { getPackDisplayName } from './dogLabels'
import type { AppState } from '../data/demo'
import { resolveMapCenterForLocation } from './mapbox'
import type { CuratedPlanDraft } from './curatedPlan'
import type { Place, PlaceCategory } from '../types/place'
import { personalizeAppContentForDogs } from './personalizeContent'

export function getRecommendationPrefs(state: AppState): RecommendationPrefs {
  return {
    vibeNames: state.dogVibeNames,
    categoryIds: state.onboardingCategoryIds,
    locationSupported: state.locationSupported,
  }
}

export interface OnboardingDogInput {
  name: string
  breed: string
  otherBreed: string
  age: string
}

export interface OnboardingResult {
  userName: string
  dogs: OnboardingDogInput[]
  vibeNames: string[]
  categoryIds: string[]
  locationQuery: string
  dogPhotoDataUrl?: string | null
}

export interface LocationProfile {
  query: string
  zipCode: string
  label: string
  supported: boolean
  mapTitle: string
  mapSubtitle: string
  communityLabel: string
}

const AVATAR_CLASSES: Dog['avatarClass'][] = ['da-b', 'da-o']
const CIRCLE_CLASSES: Dog['circleClass'][] = ['dc-b', 'dc-o']
const PROFILE_EMOJIS = ['🐕', '🐾']

const SUPPORTED_LOCATION_PATTERNS = [
  /\b921\d{2}\b/,
  /\b920\d{2}\b/,
  /\b926\d{2}\b/,
  /san\s*diego/i,
  /ocean\s*beach/i,
  /coronado/i,
  /del\s*mar/i,
  /la\s*jolla/i,
  /mission\s*bay/i,
  /balboa/i,
  /normal\s*heights/i,
  /north\s*park/i,
  /orange\s*county/i,
  /\boc\b/i,
  /huntington/i,
  /irvine/i,
  /costa\s*mesa/i,
]

const VIBE_ACTIVITY_PRIORITY: Record<string, string[]> = {
  'Beach Dog': ['beach'],
  Explorer: ['trail', 'road-trip'],
  'Social Pup': ['dog-park', 'coffee', 'brewery'],
  'Slow Sniffer': ['neighborhood', 'gardens', 'trail'],
  'Cozy Companion': ['neighborhood', 'gardens', 'coffee'],
  'Road Tripper': ['road-trip', 'trail'],
  'Cafe Pup': ['coffee', 'brewery', 'dog-park'],
  'Local Legend': ['neighborhood', 'dog-park', 'coffee'],
}

const VIBE_CATEGORY_BOOST: Record<string, PlaceCategory[]> = {
  'Beach Dog': ['Beach'],
  Explorer: ['Trail', 'Park'],
  'Social Pup': ['Dog Park', 'Coffee', 'Brewery'],
  'Slow Sniffer': ['Park', 'Neighborhood', 'Trail'],
  'Cozy Companion': ['Park', 'Neighborhood'],
  'Road Tripper': ['Road trip', 'Trail'],
  'Cafe Pup': ['Coffee', 'Brewery', 'Dog Park'],
  'Local Legend': ['Neighborhood', 'Park'],
}

const CAT_ACTIVITY_MAP: Record<string, string> = {
  park: 'trail',
  beach: 'beach',
  trail: 'trail',
  cafe: 'coffee',
  brewery: 'brewery',
  'dog-park': 'dog-park',
  gardens: 'gardens',
}

const CAT_PLACE_CATEGORY: Record<string, PlaceCategory> = {
  park: 'Park',
  beach: 'Beach',
  trail: 'Trail',
  cafe: 'Coffee',
  brewery: 'Brewery',
  'dog-park': 'Dog Park',
  gardens: 'Gardens',
}

export function formatBreedLabel(breed: string, otherBreed: string): string {
  if (breed === 'Mixed / Other' && otherBreed.trim()) {
    return otherBreed.trim()
  }
  return breed.trim() || 'Mixed breed'
}

export function buildDogsFromOnboarding(inputs: OnboardingDogInput[]): Dog[] {
  return inputs
    .filter((input) => input.name.trim().length > 0)
    .map((input, index) => {
      const name = input.name.trim()
      const breed = formatBreedLabel(input.breed, input.otherBreed)
      return {
        id: `dog-${index}-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        initial: name.charAt(0).toUpperCase(),
        avatarClass: AVATAR_CLASSES[index % AVATAR_CLASSES.length],
        profileEmoji: PROFILE_EMOJIS[index % PROFILE_EMOJIS.length],
        breed,
        age: input.age.trim() || undefined,
        circleClass: CIRCLE_CLASSES[index % CIRCLE_CLASSES.length],
      }
    })
}

export function getSpotsReadyLabel(location: LocationProfile): string {
  if (!location.supported) return 'Generic adventures for now'
  return location.label.includes('Orange County')
    ? 'Suggested Spots in Orange County'
    : 'Suggested Spots in San Diego'
}

export function resolveLocationProfile(query: string): LocationProfile {
  const trimmed = query.trim()
  const zipMatch = trimmed.match(/\b(\d{5})\b/)
  const zipCode = zipMatch?.[1] ?? ''
  const supported =
    SUPPORTED_LOCATION_PATTERNS.some((pattern) => pattern.test(trimmed)) ||
    ['92123', '92101', '92109', '92107', '92648', '92657'].includes(zipCode)

  if (supported) {
    const isOc = /orange\s*county|\boc\b|926|huntington|irvine|costa\s*mesa/i.test(
      trimmed,
    )
    const label = isOc ? 'Orange County, CA' : 'San Diego, CA'
    return {
      query: trimmed || label,
      zipCode: zipCode || '92123',
      label,
      supported: true,
      mapTitle: isOc ? 'Orange County spots' : 'San Diego spots',
      mapSubtitle: 'Dog-friendly spots nearby · Tap a pin to explore',
      communityLabel: isOc ? 'Orange County' : 'San Diego',
    }
  }

  return {
    query: trimmed || 'Your area',
    zipCode: zipCode,
    label: trimmed || 'Your area',
    supported: false,
    mapTitle: 'Your adventures, anywhere',
    mapSubtitle:
      "We don't have curated local spots here yet, but PawStreak still works. " +
      "We'll build adventures around your area and use this to improve local recommendations.",
    communityLabel: 'Your area',
  }
}

export function recommendActivityId(
  vibeNames: string[],
  categoryIds: string[],
): string {
  for (const vibe of vibeNames) {
    const activities = VIBE_ACTIVITY_PRIORITY[vibe]
    if (activities?.[0]) return activities[0]
  }

  for (const cat of categoryIds) {
    const activity = CAT_ACTIVITY_MAP[cat]
    if (activity) return activity
  }

  return 'beach'
}

export function buildCuratedDraftFromOnboarding(
  vibeNames: string[],
  categoryIds: string[],
): Partial<CuratedPlanDraft> {
  const loveIds: string[] = []

  if (vibeNames.includes('Beach Dog') || categoryIds.includes('beach')) {
    loveIds.push('beaches')
  }
  if (
    vibeNames.some((v) => ['Explorer', 'Slow Sniffer', 'Local Legend'].includes(v)) ||
    categoryIds.includes('trail') ||
    categoryIds.includes('park')
  ) {
    loveIds.push('trails')
  }
  if (vibeNames.includes('Cafe Pup') || categoryIds.includes('cafe')) {
    loveIds.push('cafes')
  }
  if (vibeNames.includes('Social Pup') || categoryIds.includes('dog-park')) {
    loveIds.push('new-dogs')
  }
  if (vibeNames.includes('Slow Sniffer')) loveIds.push('sniffing')
  if (vibeNames.includes('Beach Dog')) loveIds.push('water')
  if (vibeNames.includes('Road Tripper') || categoryIds.includes('brewery')) {
    loveIds.push('road-trips')
  }

  const optimizeIds: string[] = []
  if (vibeNames.includes('Explorer') || vibeNames.includes('Beach Dog')) {
    optimizeIds.push('burn-energy')
  }
  if (vibeNames.includes('Slow Sniffer') || vibeNames.includes('Cozy Companion')) {
    optimizeIds.push('calmer')
  }
  if (vibeNames.includes('Social Pup')) optimizeIds.push('social')
  if (optimizeIds.length === 0) optimizeIds.push('bonding')

  return {
    optimizeIds,
    loveIds: [...new Set(loveIds)],
  }
}

export function journeyTitleFor(dogs: Dog[]): string {
  if (dogs.length === 0) return 'Your Journey'
  if (dogs.length === 1) return `${dogs[0].name}'s Journey`
  return `${getPackDisplayName(dogs)}'s Journey`
}

export function dogsAreOutLabel(dogs: Dog[]): string {
  if (dogs.length === 0) return 'Your pack is out'
  if (dogs.length === 1) return `${dogs[0].name} is out`
  return `${getPackDisplayName(dogs)} are out`
}

export function bondSubtitleFor(dogs: Dog[], adventureCount: number, placeCount: number): string {
  const stats = `${adventureCount} adventures · ${placeCount} places`
  if (dogs.length === 0) return stats
  if (dogs.length === 1) return `${stats} · ${dogs[0].name}`
  return `${stats} · ${getPackDisplayName(dogs)}`
}

export function buildAdventureRecapOptions(dogs: Dog[]): {
  id: string
  label: string
}[] {
  const base = [
    { id: 'loved-every-second', label: 'Loved every second' },
    { id: 'slower-pace', label: 'Needed a slower pace' },
    { id: 'met-new-friends', label: 'Met new friends' },
    { id: 'new-smell', label: 'Found a new smell' },
  ]

  if (dogs.length === 1) {
    return [
      ...base,
      { id: 'dog-led', label: `${dogs[0].name} led the way` },
      { id: 'dog-pace', label: `${dogs[0].name} set the pace` },
    ]
  }

  if (dogs.length >= 2) {
    return [
      ...base,
      { id: 'dog1-led', label: `${dogs[0].name} led the way` },
      { id: 'dog2-pace', label: `${dogs[1].name} set the pace` },
    ]
  }

  return base
}

export function scorePlaceForProfile(
  place: Place,
  vibeNames: string[],
  categoryIds: string[],
): number {
  let score = 0
  if (place.popularNow) score += 3
  if (place.featured) score += 2

  for (const vibe of vibeNames) {
    const boosts = VIBE_CATEGORY_BOOST[vibe] ?? []
    if (boosts.includes(place.category)) score += 4
  }

  for (const cat of categoryIds) {
    const mapped = CAT_PLACE_CATEGORY[cat]
    if (mapped === place.category) score += 3
  }

  return score
}

export interface RecommendationPrefs {
  vibeNames: string[]
  categoryIds: string[]
  locationSupported: boolean
}

export interface ResolvedOnboardingLocation {
  profile: LocationProfile
  resolved: import('./geocode').ResolvedLocation | null
}

export function applyOnboardingToAppState(
  current: AppState,
  result: OnboardingResult,
  locatedOverride?: ResolvedOnboardingLocation,
): Partial<AppState> {
  const builtDogs = buildDogsFromOnboarding(result.dogs)
  const hasNamedDog = builtDogs.length > 0
  const finalDogs = hasNamedDog ? builtDogs : current.dogs
  const location =
    locatedOverride?.profile ?? resolveLocationProfile(result.locationQuery)
  const activityId = recommendActivityId(result.vibeNames, result.categoryIds)
  const curatedPartial = buildCuratedDraftFromOnboarding(
    result.vibeNames,
    result.categoryIds,
  )
  const personalized = hasNamedDog
    ? personalizeAppContentForDogs(current, finalDogs)
    : {}

  return {
    onboardingComplete: true,
    hasUserDogProfile: hasNamedDog,
    activeTab: 'home',
    userName: result.userName.trim(),
    dogs: finalDogs,
    zipCode: location.zipCode,
    locationQuery: location.query,
    locationLabel: location.label,
    locationSupported: location.supported,
    resolvedLocation: locatedOverride?.resolved ?? null,
    dogVibeNames: result.vibeNames,
    onboardingCategoryIds: result.categoryIds,
    selectedActivityId: activityId,
    mapRegion: {
      title: location.mapTitle,
      subtitle: location.mapSubtitle,
    },
    mapCenter: resolveMapCenterForLocation(location),
    communityLive: {
      ...current.communityLive,
      label: location.communityLabel,
    },
    curatedPlanDraft: {
      ...current.curatedPlanDraft,
      optimizeIds: curatedPartial.optimizeIds ?? [],
      loveIds: curatedPartial.loveIds ?? [],
    },
    ...personalized,
  }
}
