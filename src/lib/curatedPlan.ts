import type { Dog } from '../data/demo'
import { dogNamesLabel } from '../data/demo'
import { getPlaceById, PLACES } from '../data/places'

export interface CuratedPlanDraft {
  optimizeId: string | null
  timeId: string | null
  loveIds: string[]
}

export interface CuratedPlanResult {
  title: string
  emotionalCopy: string
  weeklyCadence: string
  adventureTypes: string[]
  monthlyGoals: string[]
  recommendedSpots: { name: string; reason: string }[]
  savedAt: string
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

  return {
    title: `${dogNamesLabel(dogs)}'s Adventure Plan`,
    emotionalCopy:
      EMOTIONAL_COPY[optimizeId] ??
      'Small adventures count. Your dogs thrive when there is something new to explore each week.',
    weeklyCadence: TIME_CADENCE[timeId] ?? TIME_CADENCE.flexible,
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
