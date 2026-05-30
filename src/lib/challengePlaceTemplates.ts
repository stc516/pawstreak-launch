import type { AppState, JourneyEntry } from '../data/demo'
import { defaultAppState } from '../data/demo'
import type { Challenge } from '../data/challenges'
import type { Place, PlaceCategory } from '../types/place'
import { getPlacesForPlanCategory, getPlaceById } from '../data/places'
import { getJourneyEntryDisplayImageUrl } from './adventureDisplayImage'
import { getRecommendationPrefs, resolveLocationProfile } from './onboardingProfile'
import type { ChallengeNodeState } from './challengeEngine'

export type ChallengeTemplateKind =
  | 'beach-explorer'
  | 'trail-sniffer'
  | 'coffee-pup'
  | 'park-explorer'
  | 'neighborhood-hero'
  | 'local-mix'
  | 'holiday-outing'

export interface ChallengeNodeSlotTemplate {
  kind: ChallengeTemplateKind
  placeCategory?: PlaceCategory
  genericTitle: string
  genericDescription: string
  genericPlanHint: string
  unlockHint?: string
}

export interface ChallengePlaceTemplate {
  challengeId: string
  displayName: string
  slots: ChallengeNodeSlotTemplate[]
}

const PLAN_CATEGORY_BY_PLACE: Partial<Record<PlaceCategory, string>> = {
  Beach: 'beach',
  Trail: 'trail',
  Coffee: 'coffee',
  'Dog park': 'dog-park',
  Park: 'park',
  Brewery: 'brewery',
  Gardens: 'gardens',
  Neighborhood: 'neighborhood',
  'Road trip': 'road-trip',
}

const BEACH_SLOT: Omit<ChallengeNodeSlotTemplate, 'genericTitle'> = {
  kind: 'beach-explorer',
  placeCategory: 'Beach',
  genericDescription: 'Log a dog-friendly beach adventure.',
  genericPlanHint: 'Activity goal · find a dog-friendly beach near you',
  unlockHint: 'Complete the previous beach stop to unlock this step.',
}

const TRAIL_SLOT: Omit<ChallengeNodeSlotTemplate, 'genericTitle'> = {
  kind: 'trail-sniffer',
  placeCategory: 'Trail',
  genericDescription: 'Log a sniff-heavy trail outing with your pack.',
  genericPlanHint: 'Activity goal · plan any dog-friendly trail near you',
  unlockHint: 'Complete the previous trail stop to unlock this step.',
}

const COFFEE_SLOT: Omit<ChallengeNodeSlotTemplate, 'genericTitle'> = {
  kind: 'coffee-pup',
  placeCategory: 'Coffee',
  genericDescription: 'Log a patio coffee stop your dog can join.',
  genericPlanHint: 'Activity goal · find a dog-friendly café patio nearby',
  unlockHint: 'Complete the previous stop to unlock this coffee outing.',
}

const PARK_SLOT: Omit<ChallengeNodeSlotTemplate, 'genericTitle'> = {
  kind: 'park-explorer',
  placeCategory: 'Park',
  genericDescription: 'Log a park or green-space adventure.',
  genericPlanHint: 'Activity goal · visit any dog-friendly park near you',
  unlockHint: 'Complete the previous park stop to unlock this step.',
}

const DOG_PARK_SLOT: Omit<ChallengeNodeSlotTemplate, 'genericTitle'> = {
  kind: 'park-explorer',
  placeCategory: 'Dog park',
  genericDescription: 'Log a off-leash or fenced dog park visit.',
  genericPlanHint: 'Activity goal · find a dog park near you',
  unlockHint: 'Complete the previous stop to unlock this dog park visit.',
}

const NEIGHBORHOOD_SLOT: ChallengeNodeSlotTemplate = {
  kind: 'neighborhood-hero',
  genericTitle: 'Neighborhood walk streak',
  genericDescription: 'Everyday loops and sniff walks count — no destination required.',
  genericPlanHint: 'Activity goal · start a neighborhood walk or any local outing',
  unlockHint: 'Complete earlier walk milestones to unlock this step.',
}

const HOLIDAY_SLOT: ChallengeNodeSlotTemplate = {
  kind: 'holiday-outing',
  genericTitle: 'Holiday outing',
  genericDescription: 'Festive walks, winter trails, and seasonal adventures count.',
  genericPlanHint: 'Activity goal · plan a seasonal adventure with your dog',
  unlockHint: 'Complete earlier holiday outings to unlock this step.',
}

function beachSlot(index: number): ChallengeNodeSlotTemplate {
  return {
    ...BEACH_SLOT,
    genericTitle: index === 0 ? 'First beach adventure' : `Beach adventure ${index + 1}`,
  }
}

function trailSlot(index: number): ChallengeNodeSlotTemplate {
  return {
    ...TRAIL_SLOT,
    genericTitle: index === 0 ? 'First trail outing' : `Trail outing ${index + 1}`,
  }
}

function coffeeSlot(index: number): ChallengeNodeSlotTemplate {
  return {
    ...COFFEE_SLOT,
    genericTitle: index === 0 ? 'First coffee patio stop' : `Coffee patio stop ${index + 1}`,
  }
}

function parkSlot(index: number): ChallengeNodeSlotTemplate {
  return {
    ...PARK_SLOT,
    genericTitle: index === 0 ? 'First park visit' : `Park visit ${index + 1}`,
  }
}

function holidaySlot(index: number): ChallengeNodeSlotTemplate {
  return {
    ...HOLIDAY_SLOT,
    genericTitle: index === 0 ? 'First holiday outing' : `Holiday outing ${index + 1}`,
  }
}

export const CHALLENGE_PLACE_TEMPLATES: ChallengePlaceTemplate[] = [
  {
    challengeId: 'summer-beach-challenge',
    displayName: 'Beach Explorer',
    slots: Array.from({ length: 8 }, (_, index) => beachSlot(index)),
  },
  {
    challengeId: '30-walk-challenge',
    displayName: 'Trail & Neighborhood Mix',
    slots: [
      trailSlot(0),
      trailSlot(1),
      parkSlot(0),
      { ...DOG_PARK_SLOT, genericTitle: 'Dog park visit' },
      { ...COFFEE_SLOT, genericTitle: 'Coffee patio stop' },
      NEIGHBORHOOD_SLOT,
    ],
  },
  {
    challengeId: 'holiday-adventure-challenge',
    displayName: 'Holiday Adventure',
    slots: [
      { ...PARK_SLOT, genericTitle: 'Festive park stroll' },
      trailSlot(0),
      { ...DOG_PARK_SLOT, genericTitle: 'Holiday dog park visit' },
      holidaySlot(1),
      holidaySlot(2),
      holidaySlot(3),
    ],
  },
  {
    challengeId: 'local-explorer-challenge',
    displayName: 'Local Explorer',
    slots: [
      beachSlot(0),
      trailSlot(0),
      coffeeSlot(0),
      { ...DOG_PARK_SLOT, genericTitle: 'Dog park discovery' },
      parkSlot(0),
    ],
  },
]

export function getChallengePlaceTemplate(
  challengeId: string,
): ChallengePlaceTemplate | undefined {
  return CHALLENGE_PLACE_TEMPLATES.find((template) => template.challengeId === challengeId)
}

export function getChallengeNodeSlotTemplate(
  challengeId: string,
  slotIndex: number,
): ChallengeNodeSlotTemplate {
  const template = getChallengePlaceTemplate(challengeId)
  const slot = template?.slots[slotIndex]
  if (slot) return slot

  return {
    kind: 'local-mix',
    genericTitle: `Milestone ${slotIndex + 1}`,
    genericDescription: 'Log another qualifying adventure for this challenge.',
    genericPlanHint: 'Activity goal · plan any dog-friendly outing near you',
    unlockHint: 'Complete earlier milestones to unlock this step.',
  }
}

function getPlacesForCategory(
  category: PlaceCategory,
  prefs: ReturnType<typeof getRecommendationPrefs>,
  location: ReturnType<typeof resolveLocationProfile>,
): Place[] {
  const categoryId = PLAN_CATEGORY_BY_PLACE[category]
  if (!categoryId) return []

  const places = getPlacesForPlanCategory(categoryId, prefs)
  if (!location.supported) return []

  if (location.label.includes('Orange County')) {
    return places.filter(
      (place) => place.region === 'Orange County' || place.region === 'San Diego',
    )
  }

  const sanDiego = places.filter((place) => place.region === 'San Diego')
  const orangeCounty = places.filter((place) => place.region === 'Orange County')
  return [...sanDiego, ...orangeCounty, ...places.filter((place) => place.region === 'Julian / Mountain')]
}

function collectVisitedPlaceIds(entries: JourneyEntry[]): Set<string> {
  const visited = new Set<string>()
  for (const entry of entries) {
    if (entry.placeId) visited.add(entry.placeId)
  }
  return visited
}

function pickPlaceForSlot(
  places: Place[],
  slotIndex: number,
  visitedPlaceIds: Set<string>,
): Place | undefined {
  if (places.length === 0) return undefined

  const unvisited = places.filter((place) => !visitedPlaceIds.has(place.id))
  const pool = unvisited.length > 0 ? unvisited : places
  return pool[slotIndex % pool.length]
}

function buildPlaceDescription(place: Place): string {
  return place.whyDogsLoveIt
}

function buildPlacePlanHint(place: Place): string {
  return `${place.city} · ${place.distanceLabel} · ${place.dogFriendlyNotes}`
}

function buildUnlockHint(slot: ChallengeNodeSlotTemplate, placeName?: string): string {
  if (placeName) {
    return `Complete the previous step to unlock ${placeName}.`
  }
  return slot.unlockHint ?? 'Complete earlier milestones to unlock this step.'
}

export interface EnrichedChallengeNodeContent {
  title: string
  name: string
  description: string
  imageUrl: string
  planHint: string
  placeId?: string
  isGenericFallback: boolean
  unlockHint?: string
  thumbnailUrl?: string
  completionDate?: string
  memoryCount?: number
}

function enrichCompletedNode(
  node: { imageUrl: string; description: string; planHint: string },
  entry: JourneyEntry,
  state: AppState,
): EnrichedChallengeNodeContent {
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  const title = place?.name ?? entry.place
  const imageUrl =
    getJourneyEntryDisplayImageUrl(state.journeyEntries, entry) ??
    place?.imageUrl ??
    node.imageUrl
  const memoryCount = entry.photoUrls?.filter(Boolean).length ?? 0

  return {
    title,
    name: title,
    description:
      entry.magicLine ??
      entry.emotionalLine ??
      place?.whyDogsLoveIt ??
      node.description,
    imageUrl,
    planHint: place ? buildPlacePlanHint(place) : node.planHint,
    placeId: entry.placeId,
    isGenericFallback: !place && !entry.placeId,
    thumbnailUrl: entry.photoUrls?.find(Boolean) ?? imageUrl,
    completionDate: entry.date,
    memoryCount: memoryCount > 0 ? memoryCount : undefined,
  }
}

function enrichPlaceNode(
  node: { imageUrl: string },
  slot: ChallengeNodeSlotTemplate,
  slotIndex: number,
  state: AppState,
  nodeState: ChallengeNodeState,
  visitedPlaceIds: Set<string>,
): EnrichedChallengeNodeContent {
  const prefs = getRecommendationPrefs(state)
  const location = resolveLocationProfile(state.locationQuery)
  const hasLocalData = state.locationSupported && location.supported && slot.placeCategory

  if (!hasLocalData || !slot.placeCategory) {
    return {
      title: slot.genericTitle,
      name: slot.genericTitle,
      description: slot.genericDescription,
      imageUrl: node.imageUrl,
      planHint: slot.genericPlanHint,
      isGenericFallback: true,
      unlockHint:
        nodeState === 'locked' ? buildUnlockHint(slot) : undefined,
    }
  }

  const places = getPlacesForCategory(slot.placeCategory, prefs, location)
  const place = pickPlaceForSlot(places, slotIndex, visitedPlaceIds)

  if (!place) {
    return {
      title: slot.genericTitle,
      name: slot.genericTitle,
      description: slot.genericDescription,
      imageUrl: node.imageUrl,
      planHint: slot.genericPlanHint,
      isGenericFallback: true,
      unlockHint:
        nodeState === 'locked' ? buildUnlockHint(slot) : undefined,
    }
  }

  return {
    title: place.name,
    name: place.name,
    description: buildPlaceDescription(place),
    imageUrl: place.imageUrl ?? node.imageUrl,
    planHint: buildPlacePlanHint(place),
    placeId: place.id,
    isGenericFallback: false,
    unlockHint:
      nodeState === 'locked' ? buildUnlockHint(slot, place.name) : undefined,
  }
}

export function enrichChallengeNodeContent(
  challenge: Challenge,
  slotIndex: number,
  nodeState: ChallengeNodeState,
  baseNode: {
    imageUrl: string
    description: string
    planHint: string
  },
  state: AppState,
  journeyEntry?: JourneyEntry,
  qualifyingEntries: JourneyEntry[] = [],
): EnrichedChallengeNodeContent {
  if (nodeState === 'completed' && journeyEntry) {
    return enrichCompletedNode(baseNode, journeyEntry, state)
  }

  const slot = getChallengeNodeSlotTemplate(challenge.id, slotIndex)
  const visitedPlaceIds = collectVisitedPlaceIds(qualifyingEntries)
  return enrichPlaceNode(
    baseNode,
    slot,
    slotIndex,
    state,
    nodeState,
    visitedPlaceIds,
  )
}

export function getChallengeTemplateSampleLines(
  kind: ChallengeTemplateKind,
  state?: AppState,
): string[] {
  const demoState: AppState | undefined = state
  const sampleState: AppState =
    demoState ??
    {
      ...defaultAppState,
      locationSupported: true,
      locationQuery: 'San Diego, CA',
      dogVibeNames: ['Beach Dog'],
      onboardingCategoryIds: ['beach'],
      journeyEntries: [],
    }

  const challengeByKind: Record<ChallengeTemplateKind, string> = {
    'beach-explorer': 'summer-beach-challenge',
    'trail-sniffer': '30-walk-challenge',
    'coffee-pup': 'local-explorer-challenge',
    'park-explorer': 'local-explorer-challenge',
    'neighborhood-hero': '30-walk-challenge',
    'local-mix': 'local-explorer-challenge',
    'holiday-outing': 'holiday-adventure-challenge',
  }

  const slotByKind: Record<ChallengeTemplateKind, number> = {
    'beach-explorer': 0,
    'trail-sniffer': 0,
    'coffee-pup': 2,
    'park-explorer': 4,
    'neighborhood-hero': 5,
    'local-mix': 0,
    'holiday-outing': 3,
  }

  const challengeId = challengeByKind[kind]
  const slotIndex = slotByKind[kind]
  const slot = getChallengeNodeSlotTemplate(challengeId, slotIndex)

  if (kind === 'neighborhood-hero') {
    return [
      slot.genericTitle,
      slot.genericDescription,
      slot.genericPlanHint,
    ]
  }

  const enriched = enrichPlaceNode(
    { imageUrl: '' },
    slot,
    slotIndex,
    sampleState,
    'current',
    new Set(),
  )

  return [enriched.title, enriched.description, enriched.planHint]
}
