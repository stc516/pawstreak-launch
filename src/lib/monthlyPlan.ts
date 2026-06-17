import type { Place } from '../types/place'
import { PLACES, getPlaceById } from '../data/places'

export type MonthlyPlanVibeId =
  | 'surprise'
  | 'beaches'
  | 'trails'
  | 'mixed'
  | 'dog-parks'

export type MonthlyPlanFrequency = 1 | 2 | 3
export type MonthlyPlanDayPreference = 'weekdays' | 'weekends' | 'both'

export interface MonthlyPlanWeek {
  weekIndex: number
  label: string
  placeId: string
  placeName: string
  category: string
  timingLabel: string
  bestTime: string
  addressLabel?: string
  tieInLabel: string
}

export interface MonthlyPlanDraft {
  vibeId: MonthlyPlanVibeId | null
  categoryIds: string[]
  frequencyPerWeek: MonthlyPlanFrequency | null
  dayPreference: MonthlyPlanDayPreference | null
}

export interface MonthlyPlanResult {
  id: string
  vibeId: MonthlyPlanVibeId
  frequencyPerWeek: MonthlyPlanFrequency
  dayPreference: MonthlyPlanDayPreference
  weeks: MonthlyPlanWeek[]
  nextPlaceId: string
  nextWeekIndex: number
  savedAt: string
  status: 'active' | 'completed'
}

export const EMPTY_MONTHLY_PLAN_DRAFT: MonthlyPlanDraft = {
  vibeId: null,
  categoryIds: [],
  frequencyPerWeek: null,
  dayPreference: null,
}

export const MONTHLY_PLAN_VIBE_OPTIONS: {
  id: MonthlyPlanVibeId
  label: string
  subtitle: string
}[] = [
  { id: 'surprise', label: 'Local + easy', subtitle: 'Low-friction outings first' },
  { id: 'mixed', label: 'Balanced mix', subtitle: 'A practical spread across the month' },
  { id: 'trails', label: 'Adventure-heavy', subtitle: 'Bigger outings and trail energy' },
]

export const MONTHLY_PLAN_FREQUENCY_OPTIONS: {
  id: MonthlyPlanFrequency
  label: string
}[] = [
  { id: 1, label: '4 outings this month · 1 adventure per week' },
  { id: 2, label: '8 outings this month · 2 adventures per week' },
  { id: 3, label: '12 outings this month · 3 adventures per week' },
]

export const MONTHLY_PLAN_DAY_OPTIONS: {
  id: MonthlyPlanDayPreference
  label: string
}[] = [
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'both', label: 'Both' },
]

const DAY_TIMING_LABELS: Record<MonthlyPlanDayPreference, string[]> = {
  weekdays: ['Tuesday morning', 'Thursday after work', 'Wednesday lunch walk', 'Friday sunset'],
  weekends: ['Saturday morning', 'Sunday sunset', 'Saturday afternoon', 'Sunday coffee walk'],
  both: ['Tuesday after work', 'Saturday morning', 'Thursday sunset', 'Sunday afternoon'],
}

const VIBE_CATEGORY_MAP: Record<MonthlyPlanVibeId, string[]> = {
  surprise: ['Beach', 'Trail', 'Dog Park', 'Park', 'Coffee'],
  beaches: ['Beach'],
  trails: ['Trail'],
  'dog-parks': ['Dog Park', 'Park'],
  mixed: ['Beach', 'Trail', 'Dog Park', 'Coffee', 'Park'],
}

const CATEGORY_ID_MAP: Record<string, string> = {
  beach: 'Beach',
  trail: 'Trail',
  coffee: 'Coffee',
  park: 'Park',
  'dog-park': 'Dog Park',
  patio: 'Patio',
  brewery: 'Brewery',
  scenic: 'Scenic Spot',
  'road-trip': 'Road trip',
}

function isMappablePlace(place: Place): boolean {
  return (
    place.id !== 'neighborhood-walk' &&
    place.lat != null &&
    place.lng != null
  )
}

function pickPlacesForVibe(
  vibeId: MonthlyPlanVibeId,
  count: number,
  categoryIds: string[] = [],
): Place[] {
  const categories =
    categoryIds.length > 0
      ? categoryIds.map((id) => CATEGORY_ID_MAP[id]).filter((item): item is string => Boolean(item))
      : VIBE_CATEGORY_MAP[vibeId]
  const pool = PLACES.filter(
    (place) => isMappablePlace(place) && categories.includes(place.category),
  )
  const fallback = PLACES.filter(isMappablePlace)
  const source = pool.length >= count ? pool : fallback
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  const picked: Place[] = []
  const used = new Set<string>()

  for (const place of shuffled) {
    if (picked.length >= count) break
    if (used.has(place.id)) continue
    used.add(place.id)
    picked.push(place)
  }

  while (picked.length < count && fallback.length > 0) {
    const place = fallback[picked.length % fallback.length]
    if (!used.has(place.id)) {
      used.add(place.id)
      picked.push(place)
    } else {
      break
    }
  }

  return picked
}

export function generateMonthlyPlanResult(draft: MonthlyPlanDraft): MonthlyPlanResult | null {
  if (draft.categoryIds.length === 0 || !draft.frequencyPerWeek || !draft.dayPreference) {
    return null
  }

  const vibeId = draft.vibeId ?? 'mixed'
  const weekCount = draft.frequencyPerWeek * 4
  const places = pickPlacesForVibe(vibeId, weekCount, draft.categoryIds)
  const timingLabels = DAY_TIMING_LABELS[draft.dayPreference]
  const weeks: MonthlyPlanWeek[] = places.map((place, index) => ({
    weekIndex: index + 1,
    label: `Outing ${index + 1}`,
    placeId: place.id,
    placeName: place.name.split(',')[0]?.trim() ?? place.name,
    category: place.category,
    timingLabel: timingLabels[index % timingLabels.length],
    bestTime: place.bestTime,
    addressLabel: place.addressLabel ?? place.directionsDestination ?? place.city,
    tieInLabel: `${place.category} progress · Explorer and matching challenges`,
  }))

  const nextPlaceId = weeks[0]?.placeId ?? places[0]?.id ?? 'dog-beach-ob'

  return {
    id: crypto.randomUUID(),
    vibeId,
    frequencyPerWeek: draft.frequencyPerWeek,
    dayPreference: draft.dayPreference,
    weeks,
    nextPlaceId,
    nextWeekIndex: 1,
    savedAt: new Date().toISOString(),
    status: 'active',
  }
}

export function getActiveMonthlyPlanWeek(
  result: MonthlyPlanResult | null,
): MonthlyPlanWeek | null {
  if (!result || result.status !== 'active') return null
  return result.weeks.find((week) => week.weekIndex === result.nextWeekIndex) ?? result.weeks[0] ?? null
}

export function getMonthlyPlanProgressLabel(result: MonthlyPlanResult): string {
  const total = result.weeks.length
  const completed = Math.max(0, result.nextWeekIndex - 1)
  return `${completed} of ${total} adventures planned`
}

export function advanceMonthlyPlanAfterAdventure(
  result: MonthlyPlanResult,
  placeId: string,
): MonthlyPlanResult {
  const currentWeek = getActiveMonthlyPlanWeek(result)
  if (!currentWeek || currentWeek.placeId !== placeId) {
    return result
  }

  const nextWeekIndex = result.nextWeekIndex + 1
  if (nextWeekIndex > result.weeks.length) {
    return { ...result, status: 'completed', nextWeekIndex: result.weeks.length }
  }

  const nextWeek = result.weeks.find((week) => week.weekIndex === nextWeekIndex)
  return {
    ...result,
    nextWeekIndex,
    nextPlaceId: nextWeek?.placeId ?? result.nextPlaceId,
  }
}

export function getMonthlyPlanPlace(result: MonthlyPlanResult, placeId: string): Place | undefined {
  if (!result.weeks.some((week) => week.placeId === placeId)) return undefined
  return getPlaceById(placeId)
}
