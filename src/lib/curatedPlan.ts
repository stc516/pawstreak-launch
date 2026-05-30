import type { Dog } from '../data/demo'
import type { Place } from '../types/place'
import { getDogDisplayName, getPackDisplayName } from './dogLabels'
import { getPlaceById, PLACES } from '../data/places'

export interface CuratedPlanWeekItem {
  day: string
  focus: string
  type: string
}

export interface CuratedPlanAdventureCard {
  id: string
  title: string
  placeId: string
  placeName: string
  category: string
  timeSuggestion: string
  whyItFits: string
}

export interface CuratedPlanBalance {
  id: string
  label: string
  percent: number
}

export interface CuratedPlanDraft {
  optimizeIds: string[]
  timeId: string | null
  loveIds: string[]
}

export interface CuratedPlanResult {
  title: string
  planName: string
  emotionalCopy: string
  whyItFits: string
  goalSummary: string
  weeklyCadence: string
  weeklySchedule: CuratedPlanWeekItem[]
  adventureCards: CuratedPlanAdventureCard[]
  firstAdventure: {
    placeId: string
    name: string
    reason: string
    when: string
  }
  balance: CuratedPlanBalance[]
  adventureTypes: string[]
  monthlyGoals: string[]
  recommendedSpots: { name: string; reason: string }[]
  savedAt: string
}

const OPTIMIZE_LABELS: Record<string, string> = {
  'burn-energy': 'burning energy',
  confidence: 'building confidence',
  behavior: 'better behavior',
  social: 'more social time',
  calmer: 'calmer walks',
  bonding: 'more bonding time',
  weight: 'steady movement',
  puppy: 'gentle puppy exposure',
  weekend: 'weekend adventures',
  training: 'training consistency',
}

const WHY_IT_FITS_TEMPLATES: Record<string, string> = {
  'burn-energy':
    '{lead} needs room to run; {support} does best with a mix of movement and sniff breaks.',
  confidence:
    'Short, predictable outings help {support} settle in without overwhelming either dog.',
  behavior:
    'Structure with built-in sniff time keeps walks productive without feeling rigid.',
  social:
    'Friendly hellos in low-pressure settings — enough social time without overstimulation.',
  calmer:
    'Shorter loops and familiar routes give {support} the slower pace they prefer.',
  bonding:
    'Shared adventures at a pace both dogs can enjoy — that is how trust builds.',
  weight:
    'Steady movement, not intensity. Easy to keep up even on busy weeks.',
  puppy:
    'Small doses of new sights and smells — exposure that stays happy, not overwhelming.',
  weekend:
    'One bigger day to look forward to, with lighter touchpoints during the week.',
  training:
    'Same cues, different places. Skills stick when practice feels like an adventure.',
}

const REAL_ADVENTURE_IDEAS: {
  id: string
  title: string
  categories: Place['category'][]
  timeSuggestion: string
  whyTemplate: string
}[] = [
  {
    id: 'beach-morning',
    title: 'Dog Beach morning',
    categories: ['Beach'],
    timeSuggestion: 'Sat · 8–10 AM',
    whyTemplate: 'Wide sand and room to run — an easy high-energy start.',
  },
  {
    id: 'park-loop',
    title: 'Local park loop',
    categories: ['Park', 'Dog park'],
    timeSuggestion: 'Wed · 5 PM',
    whyTemplate: 'Shaded paths and sniff stops without a long drive.',
  },
  {
    id: 'coffee-patio',
    title: 'Coffee patio walk',
    categories: ['Coffee'],
    timeSuggestion: 'Sun · 9 AM',
    whyTemplate: 'A patio stop plus a short loop — low effort, high reward.',
  },
  {
    id: 'trail-sniff',
    title: 'Easy trail sniff walk',
    categories: ['Trail'],
    timeSuggestion: 'Sat · 7 AM',
    whyTemplate: 'New smells and soft terrain for a calm but interesting outing.',
  },
  {
    id: 'sunset-neighborhood',
    title: 'Sunset neighborhood walk',
    categories: ['Neighborhood'],
    timeSuggestion: 'Fri · 6 PM',
    whyTemplate: 'Your everyday loop with one new corner to explore.',
  },
  {
    id: 'dog-park-play',
    title: 'Dog park play session',
    categories: ['Dog park'],
    timeSuggestion: 'Thu · 4 PM',
    whyTemplate: 'Off-leash play and quick social hellos close to home.',
  },
  {
    id: 'weekend-road-trip',
    title: 'Weekend road trip',
    categories: ['Road trip'],
    timeSuggestion: 'Sat · All day',
    whyTemplate: 'A bigger day out when you have time to make it count.',
  },
  {
    id: 'beach-coffee',
    title: 'Beach + coffee combo',
    categories: ['Beach', 'Coffee'],
    timeSuggestion: 'Sun · 10 AM',
    whyTemplate: 'Sand first, patio treat after — a classic San Diego morning.',
  },
  {
    id: 'trail-photo',
    title: 'Trail + photo stop',
    categories: ['Trail', 'Park'],
    timeSuggestion: 'Sat · 8 AM',
    whyTemplate: 'One viewpoint worth capturing on the way back.',
  },
  {
    id: 'park-picnic',
    title: 'Park picnic walk',
    categories: ['Park', 'Gardens'],
    timeSuggestion: 'Sun · 11 AM',
    whyTemplate: 'Slow loop, grassy break, and time to just be together.',
  },
]

function personalizeWhyCopy(template: string, dogs: Dog[]): string {
  if (dogs.length === 0) return template.replace(/\{lead\}|\{support\}/g, 'Your dog')
  if (dogs.length === 1) {
    return template
      .replace('{lead}', dogs[0].name)
      .replace('{support}', dogs[0].name)
      .replace('either dog', 'them')
      .replace('both dogs', 'them')
  }
  return template.replace('{lead}', dogs[0].name).replace('{support}', dogs[1].name)
}

function whyItFitsFor(dogs: Dog[], optimizeId: string): string {
  const template =
    WHY_IT_FITS_TEMPLATES[optimizeId] ??
    'Built around what they love and the time you actually have — not a perfect schedule.'
  return personalizeWhyCopy(template, dogs)
}

const BALANCE_BY_OPTIMIZE: Record<string, CuratedPlanBalance[]> = {
  'burn-energy': [
    { id: 'adventure', label: 'Adventure', percent: 45 },
    { id: 'activity', label: 'Activity', percent: 30 },
    { id: 'training', label: 'Training', percent: 15 },
    { id: 'bonding', label: 'Bonding', percent: 10 },
  ],
  confidence: [
    { id: 'confidence', label: 'Confidence', percent: 35 },
    { id: 'calmer', label: 'Calmer walks', percent: 25 },
    { id: 'socialization', label: 'Socialization', percent: 20 },
    { id: 'bonding', label: 'Bonding', percent: 20 },
  ],
  calmer: [
    { id: 'calmer', label: 'Calmer walks', percent: 40 },
    { id: 'senior', label: 'Senior-friendly', percent: 30 },
    { id: 'bonding', label: 'Bonding', percent: 20 },
    { id: 'activity', label: 'Activity', percent: 10 },
  ],
  social: [
    { id: 'socialization', label: 'Socialization', percent: 40 },
    { id: 'adventure', label: 'Adventure', percent: 30 },
    { id: 'activity', label: 'Activity', percent: 20 },
    { id: 'bonding', label: 'Bonding', percent: 10 },
  ],
}

const DEFAULT_BALANCE: CuratedPlanBalance[] = [
  { id: 'adventure', label: 'Adventure', percent: 35 },
  { id: 'activity', label: 'Activity', percent: 25 },
  { id: 'training', label: 'Training', percent: 15 },
  { id: 'bonding', label: 'Bonding', percent: 15 },
  { id: 'confidence', label: 'Confidence', percent: 10 },
]

const EMOTIONAL_COPY_TEMPLATES: Record<string, string> = {
  'burn-energy':
    'Small adventures count. {lead} thrives when there is something new to explore each week.',
  confidence:
    'Gentle wins build brave dogs. {support} opens up when the routine feels predictable and kind.',
  behavior:
    'Structure plus joy — the best behavior plans leave room for sniff breaks and praise.',
  social:
    'Friendly outings in low-pressure places — even one hello can turn a walk into a highlight.',
  calmer:
    'Slow is smart. Calmer walks start with familiar routes and unhurried sniff time.',
  bonding:
    'You are building a language together — shared adventures are how dogs learn they are safe.',
  weight:
    'Consistency beats intensity. Steady movement keeps tails up and energy balanced.',
  puppy:
    'New sights, new smells, same calm you. Exposure works best in small, happy doses.',
  weekend:
    'Big days recharge the week. Save the wide-open adventures for when you have time to savor them.',
  training:
    'Repetition with variety — same cues, different places. That is how skills stick.',
}

const TIME_CADENCE: Record<string, string> = {
  '15min': '3 short outings per week · 15 minutes each',
  '30min': '4 walks per week · 30 minutes each',
  hour: '2 longer adventures + 2 neighborhood loops weekly',
  weekends: '1 big weekend adventure + 1 midweek neighborhood walk',
  flexible: '2–3 adventures weekly · fit around your schedule',
}

function formatGoalList(labels: string[]): string {
  if (labels.length === 0) return 'what matters most right now'
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

function mergeBalance(optimizeIds: string[]): CuratedPlanBalance[] {
  const merged = new Map<string, CuratedPlanBalance>()

  for (const id of optimizeIds) {
    const rows = BALANCE_BY_OPTIMIZE[id] ?? DEFAULT_BALANCE
    for (const row of rows) {
      const existing = merged.get(row.id)
      if (existing) {
        merged.set(row.id, {
          ...existing,
          percent: Math.round((existing.percent + row.percent) / 2),
        })
      } else {
        merged.set(row.id, { ...row })
      }
    }
  }

  const values = [...merged.values()]
  if (values.length === 0) return DEFAULT_BALANCE

  const total = values.reduce((sum, row) => sum + row.percent, 0)
  if (total <= 100) return values.slice(0, 5)

  const scale = 100 / total
  return values
    .map((row) => ({ ...row, percent: Math.round(row.percent * scale) }))
    .slice(0, 5)
}

function pickPlaceForIdea(idea: (typeof REAL_ADVENTURE_IDEAS)[number], usedIds: Set<string>): Place {
  if (idea.categories.includes('Neighborhood')) {
    return getPlaceById('neighborhood-walk') ?? PLACES[0]
  }

  const match = PLACES.find(
    (place) => idea.categories.includes(place.category) && !usedIds.has(place.id),
  )
  if (match) return match

  const fallback = PLACES.find((place) => idea.categories.includes(place.category))
  return fallback ?? PLACES[0]
}

function buildCuratedAdventureCards(
  loveIds: string[],
  dogs: Dog[],
): CuratedPlanAdventureCard[] {
  const categoryBoost = new Set<string>()
  if (loveIds.includes('beaches') || loveIds.includes('water')) categoryBoost.add('Beach')
  if (loveIds.includes('trails') || loveIds.includes('sniffing')) categoryBoost.add('Trail')
  if (loveIds.includes('cafes')) categoryBoost.add('Coffee')
  if (loveIds.includes('road-trips')) categoryBoost.add('Road trip')
  if (loveIds.includes('new-dogs') || loveIds.includes('off-leash')) categoryBoost.add('Dog park')
  if (loveIds.includes('sniffing')) categoryBoost.add('Park')

  const rankedIdeas = [...REAL_ADVENTURE_IDEAS].sort((left, right) => {
    const leftScore = left.categories.some((category) => categoryBoost.has(category)) ? 1 : 0
    const rightScore = right.categories.some((category) => categoryBoost.has(category)) ? 1 : 0
    return rightScore - leftScore
  })

  const usedPlaceIds = new Set<string>()
  const cards: CuratedPlanAdventureCard[] = []

  for (const idea of rankedIdeas) {
    if (cards.length >= 4) break
    const place = pickPlaceForIdea(idea, usedPlaceIds)
    if (usedPlaceIds.has(place.id) && idea.categories[0] !== 'Neighborhood') continue
    usedPlaceIds.add(place.id)

    cards.push({
      id: idea.id,
      title: idea.title,
      placeId: place.id,
      placeName: place.name,
      category: place.category,
      timeSuggestion: idea.timeSuggestion,
      whyItFits: personalizeWhyCopy(idea.whyTemplate, dogs),
    })
  }

  return cards
}

function buildWeeklySchedule(cards: CuratedPlanAdventureCard[]): CuratedPlanWeekItem[] {
  const days = ['Mon', 'Wed', 'Fri', 'Sat']
  return cards.slice(0, 4).map((card, index) => ({
    day: days[index] ?? 'Sat',
    focus: card.title,
    type: card.category,
  }))
}

function pickFirstAdventure(cards: CuratedPlanAdventureCard[]) {
  const first = cards[0]
  if (!first) {
    const place = getPlaceById('dog-beach-ocean-beach') ?? PLACES[0]
    return {
      placeId: place.id,
      name: place.name,
      reason: place.whyDogsLoveIt,
      when: 'This Saturday morning',
    }
  }

  return {
    placeId: first.placeId,
    name: first.placeName,
    reason: first.whyItFits,
    when: first.timeSuggestion,
  }
}

function loveToAdventureTypes(loveIds: string[]): string[] {
  const map: Record<string, string> = {
    beaches: 'Dog Beach mornings',
    trails: 'Trail sniff walks',
    cafes: 'Coffee patio walks',
    'new-dogs': 'Dog park play sessions',
    sniffing: 'Park loop sniff walks',
    water: 'Beach + splash days',
    'road-trips': 'Weekend road trips',
    'off-leash': 'Off-leash beach runs',
  }

  const types = loveIds.map((id) => map[id]).filter(Boolean)
  return types.length > 0 ? types : ['Dog Beach morning', 'Local park loop', 'Sunset neighborhood walk']
}

function buildMonthlyGoals(optimizeIds: string[], loveIds: string[]): string[] {
  const goals = ['Try 2 new places you have not visited yet']
  if (optimizeIds.includes('burn-energy')) goals.push('Log 4 high-energy outings')
  if (optimizeIds.includes('weekend')) goals.push('Plan 1 road trip outside your zip code')
  if (loveIds.includes('beaches')) goals.push('Hit 3 different dog beaches')
  if (loveIds.includes('trails')) goals.push('Complete 2 new trail loops')
  if (goals.length < 3) goals.push('Capture one memory photo each week')
  return [...new Set(goals)].slice(0, 4)
}

function recommendSpots(
  loveIds: string[],
  dogs: Dog[],
): { name: string; reason: string }[] {
  const categoryPriority: string[] = []
  if (loveIds.includes('beaches') || loveIds.includes('water')) categoryPriority.push('Beach')
  if (loveIds.includes('trails') || loveIds.includes('sniffing')) categoryPriority.push('Trail')
  if (loveIds.includes('cafes')) categoryPriority.push('Coffee')
  if (loveIds.includes('road-trips')) categoryPriority.push('Road trip')
  if (loveIds.includes('new-dogs')) categoryPriority.push('Dog park')
  if (loveIds.includes('off-leash')) categoryPriority.push('Park')

  const spots = PLACES.filter((place) =>
    categoryPriority.length === 0 ? true : categoryPriority.includes(place.category),
  )
    .slice(0, 3)
    .map((place) => ({
      name: place.name,
      reason: place.whyDogsLoveIt,
    }))

  if (spots.length >= 2) return spots

  return buildFallbackSpots(dogs)
}

function buildFallbackSpots(dogs: Dog[]): { name: string; reason: string }[] {
  const support = getDogDisplayName(dogs, 1)
  const pacedLabel = dogs.length >= 2 ? `${support}-paced` : 'slower-paced'

  return [
    {
      name: getPlaceById('dog-beach-ocean-beach')?.name ?? 'Dog Beach, OB',
      reason: 'Wide sand and room to run — an easy win for a high-energy day.',
    },
    {
      name: getPlaceById('balboa-park')?.name ?? 'Balboa Park',
      reason: 'Shaded paths and new smells every visit.',
    },
    {
      name: getPlaceById('coronado-dog-beach')?.name ?? 'Coronado Dog Beach',
      reason: `Flat shoreline perfect for a calmer loop on a ${pacedLabel} day.`,
    },
  ]
}

export function generateCuratedPlanResult(
  dogs: Dog[],
  draft: CuratedPlanDraft,
): CuratedPlanResult {
  const optimizeIds =
    draft.optimizeIds.length > 0 ? draft.optimizeIds : ['bonding']
  const timeId = draft.timeId ?? 'flexible'
  const loveIds = draft.loveIds.length > 0 ? draft.loveIds : ['trails', 'sniffing']
  const dogLabel = getPackDisplayName(dogs)
  const goalLabels = optimizeIds.map((id) => OPTIMIZE_LABELS[id] ?? id)
  const goalSummary = formatGoalList(goalLabels)
  const adventureCards = buildCuratedAdventureCards(loveIds, dogs)
  const firstAdventure = pickFirstAdventure(adventureCards)

  const whyParts = optimizeIds
    .map((id) => whyItFitsFor(dogs, id))
    .slice(0, 2)

  const emotionalParts = optimizeIds
    .map((id) => personalizeWhyCopy(EMOTIONAL_COPY_TEMPLATES[id] ?? '', dogs))
    .filter(Boolean)
    .slice(0, 2)

  return {
    title: `${dogLabel}'s Adventure Plan`,
    planName: `${dogLabel} · Built for ${goalSummary}`,
    goalSummary,
    emotionalCopy:
      emotionalParts.join(' ') ||
      'Real outings, not wellness homework — built around places your dogs will actually love.',
    whyItFits:
      whyParts.join(' ') ||
      'Built around what they love and the time you actually have.',
    weeklyCadence: TIME_CADENCE[timeId] ?? TIME_CADENCE.flexible,
    weeklySchedule: buildWeeklySchedule(adventureCards),
    adventureCards,
    firstAdventure,
    balance: mergeBalance(optimizeIds),
    adventureTypes: loveToAdventureTypes(loveIds),
    monthlyGoals: buildMonthlyGoals(optimizeIds, loveIds),
    recommendedSpots: recommendSpots(loveIds, dogs),
    savedAt: new Date().toISOString(),
  }
}

export const EMPTY_CURATED_PLAN_DRAFT: CuratedPlanDraft = {
  optimizeIds: [],
  timeId: null,
  loveIds: [],
}

/** @deprecated legacy single-select field — migrated in storage */
export type LegacyCuratedPlanDraft = CuratedPlanDraft & {
  optimizeId?: string | null
}
