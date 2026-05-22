import type { Dog } from '../data/demo'
import { dogNamesLabel } from '../data/demo'
import { getPlaceById, PLACES } from '../data/places'

export interface CuratedPlanWeekItem {
  day: string
  focus: string
  type: string
}

export interface CuratedPlanBalance {
  id: string
  label: string
  percent: number
}

export interface CuratedPlanDraft {
  optimizeId: string | null
  timeId: string | null
  loveIds: string[]
}

export interface CuratedPlanResult {
  title: string
  planName: string
  emotionalCopy: string
  whyItFits: string
  weeklyCadence: string
  weeklySchedule: CuratedPlanWeekItem[]
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

const WHY_IT_FITS: Record<string, string> = {
  'burn-energy':
    'Bailey needs room to run; Omi does best with a mix of movement and sniff breaks. This plan balances both.',
  confidence:
    'Short, predictable outings help Omi settle in. Bailey still gets novelty without overwhelming either dog.',
  behavior:
    'Structure with built-in sniff time keeps walks productive without feeling rigid.',
  social:
    'Friendly hellos in low-pressure settings — enough social time without overstimulation.',
  calmer:
    'Shorter loops and familiar routes give Omi the slower pace she prefers while Bailey still gets out.',
  bonding:
    'Shared adventures at a pace both dogs can enjoy — that is how trust builds week by week.',
  weight:
    'Steady movement, not intensity. Easy to keep up even on busy weeks.',
  puppy:
    'Small doses of new sights and smells — exposure that stays happy, not overwhelming.',
  weekend:
    'One bigger day to look forward to, with lighter touchpoints during the week.',
  training:
    'Same cues, different places. Skills stick when practice feels like an adventure.',
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

function buildWeeklySchedule(
  timeId: string,
  loveIds: string[],
  optimizeId: string,
): CuratedPlanWeekItem[] {
  const adventureLabel =
    loveIds.includes('beaches') ? 'Beach outing' :
    loveIds.includes('trails') ? 'Trail loop' :
    loveIds.includes('cafes') ? 'Patio stop' : 'Neighborhood explore'

  if (timeId === 'weekends') {
    return [
      { day: 'Sat', focus: `Big ${adventureLabel.toLowerCase()}`, type: 'adventure' },
      { day: 'Sun', focus: 'Recovery sniff walk', type: 'calmer walks' },
      { day: 'Wed', focus: 'Short training loop', type: 'training' },
    ]
  }

  if (timeId === '15min') {
    return [
      { day: 'Mon', focus: 'Quick sniff loop', type: 'activity' },
      { day: 'Wed', focus: adventureLabel, type: 'adventure' },
      { day: 'Fri', focus: 'Calm bonding walk', type: 'bonding' },
      { day: 'Sun', focus: 'Try somewhere new', type: 'adventure' },
    ]
  }

  return [
    { day: 'Mon', focus: 'Neighborhood reset', type: 'activity' },
    { day: 'Wed', focus: adventureLabel, type: 'adventure' },
    { day: 'Fri', focus: optimizeId === 'training' ? 'Cue practice walk' : 'Social hello route', type: optimizeId === 'training' ? 'training' : 'socialization' },
    { day: 'Sat', focus: 'Longer adventure', type: 'adventure' },
  ]
}

function pickFirstAdventure(loveIds: string[]) {
  const spots = recommendSpots(loveIds)
  const place = PLACES.find((p) => p.name === spots[0]?.name) ?? PLACES[0]
  return {
    placeId: place.id,
    name: place.name,
    reason: place.whyDogsLoveIt,
    when: 'This Saturday morning',
  }
}

const EMOTIONAL_COPY: Record<string, string> = {
  'burn-energy':
    'Small adventures count. Bailey thrives when there is something new to explore each week.',
  confidence:
    'Gentle wins build brave dogs. Omi opens up when the routine feels predictable and kind.',
  behavior:
    'Structure plus joy — the best behavior plans leave room for sniff breaks and praise.',
  social:
    'Pack time matters. Even one friendly hello can turn a walk into a highlight.',
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
  weekends: '1 big weekend adventure + 1 midweek reset walk',
  flexible: '2–3 adventures weekly · fit around your schedule',
}

function loveToAdventureTypes(loveIds: string[]): string[] {
  const map: Record<string, string> = {
    beaches: 'Beach mornings',
    trails: 'Trail exploration',
    cafes: 'Patio cafe stops',
    'new-dogs': 'Dog park socials',
    sniffing: 'Sniffari walks',
    water: 'Water play days',
    'road-trips': 'Day trip escapes',
    'off-leash': 'Off-leash runs',
  }

  const types = loveIds.map((id) => map[id]).filter(Boolean)
  return types.length > 0 ? types : ['Neighborhood loops', 'New spot Fridays']
}

function buildMonthlyGoals(optimizeId: string | null, loveIds: string[]): string[] {
  const goals = ['Try 2 places you have never visited']
  if (optimizeId === 'burn-energy') goals.push('Log 4 high-energy outings')
  if (optimizeId === 'confidence') goals.push('Practice calm greetings in 3 new settings')
  if (optimizeId === 'weekend') goals.push('Plan 1 road trip outside your zip code')
  if (loveIds.includes('beaches')) goals.push('Hit 3 different dog beaches')
  if (loveIds.includes('trails')) goals.push('Complete 2 new trail loops')
  if (goals.length < 3) goals.push('Capture one memory photo each week')
  return goals.slice(0, 3)
}

function recommendSpots(loveIds: string[]): { name: string; reason: string }[] {
  const categoryPriority: string[] = []
  if (loveIds.includes('beaches') || loveIds.includes('water')) {
    categoryPriority.push('Beach')
  }
  if (loveIds.includes('trails') || loveIds.includes('sniffing')) {
    categoryPriority.push('Trail')
  }
  if (loveIds.includes('cafes')) categoryPriority.push('Coffee')
  if (loveIds.includes('road-trips')) categoryPriority.push('Road trip')
  if (loveIds.includes('new-dogs')) categoryPriority.push('Dog park')
  if (loveIds.includes('off-leash')) categoryPriority.push('Park')

  const spots = PLACES.filter((place) =>
    categoryPriority.length === 0
      ? true
      : categoryPriority.includes(place.category),
  )
    .slice(0, 3)
    .map((place) => ({
      name: place.name,
      reason: place.whyDogsLoveIt,
    }))

  if (spots.length >= 2) return spots

  return [
    {
      name: getPlaceById('dog-beach-ocean-beach')?.name ?? 'Dog Beach, OB',
      reason: 'Wide sand and room to run — a classic Bailey day.',
    },
    {
      name: getPlaceById('balboa-park')?.name ?? 'Balboa Park',
      reason: 'Shaded paths and new smells every visit.',
    },
    {
      name: getPlaceById('coronado-dog-beach')?.name ?? 'Coronado Dog Beach',
      reason: 'Flat shoreline perfect for a calmer loop with Omi.',
    },
  ]
}

export function generateCuratedPlanResult(
  dogs: Dog[],
  draft: CuratedPlanDraft,
): CuratedPlanResult {
  const optimizeId = draft.optimizeId ?? 'bonding'
  const timeId = draft.timeId ?? 'flexible'
  const loveIds = draft.loveIds.length > 0 ? draft.loveIds : ['trails', 'sniffing']
  const dogLabel = dogNamesLabel(dogs)
  const firstAdventure = pickFirstAdventure(loveIds)

  return {
    title: `${dogLabel}'s Adventure Plan`,
    planName: `${dogLabel} · Weekly rhythm`,
    emotionalCopy:
      EMOTIONAL_COPY[optimizeId] ??
      'Small adventures count. Your dogs thrive when there is something new to explore each week.',
    whyItFits:
      WHY_IT_FITS[optimizeId] ??
      'Built around what they love and the time you actually have — not a perfect schedule.',
    weeklyCadence: TIME_CADENCE[timeId] ?? TIME_CADENCE.flexible,
    weeklySchedule: buildWeeklySchedule(timeId, loveIds, optimizeId),
    firstAdventure,
    balance: BALANCE_BY_OPTIMIZE[optimizeId] ?? DEFAULT_BALANCE,
    adventureTypes: loveToAdventureTypes(loveIds),
    monthlyGoals: buildMonthlyGoals(optimizeId, loveIds),
    recommendedSpots: recommendSpots(loveIds),
    savedAt: new Date().toISOString(),
  }
}

export const EMPTY_CURATED_PLAN_DRAFT: CuratedPlanDraft = {
  optimizeId: null,
  timeId: null,
  loveIds: [],
}
