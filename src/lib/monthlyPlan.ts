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
}

export interface MonthlyPlanDraft {
  vibeId: MonthlyPlanVibeId | null
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
  frequencyPerWeek: null,
  dayPreference: null,
}

export const MONTHLY_PLAN_VIBE_OPTIONS: {
  id: MonthlyPlanVibeId
  label: string
  subtitle: string
}[] = [
  { id: 'surprise', label: 'Surprise Me', subtitle: 'Mix it up each week' },
  { id: 'beaches', label: 'Mostly Beaches', subtitle: 'Coastal outings first' },
  { id: 'trails', label: 'Mostly Trails', subtitle: 'Sniff-heavy adventures' },
  { id: 'dog-parks', label: 'Dog Parks', subtitle: 'Off-leash social time' },
  { id: 'mixed', label: 'Mixed Adventures', subtitle: 'Beaches, trails, parks, coffee' },
]

export const MONTHLY_PLAN_FREQUENCY_OPTIONS: {
  id: MonthlyPlanFrequency
  label: string
}[] = [
  { id: 1, label: '1 adventure per week' },
  { id: 2, label: '2 adventures per week' },
  { id: 3, label: '3 adventures per week' },
]

export const MONTHLY_PLAN_DAY_OPTIONS: {
  id: MonthlyPlanDayPreference
  label: string
}[] = [
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'both', label: 'Both' },
]

const VIBE_CATEGORY_MAP: Record<MonthlyPlanVibeId, string[]> = {
  surprise: ['Beach', 'Trail', 'Dog park', 'Park', 'Coffee'],
  beaches: ['Beach'],
  trails: ['Trail'],
  'dog-parks': ['Dog park', 'Park'],
  mixed: ['Beach', 'Trail', 'Dog park', 'Coffee', 'Park'],
}

function isMappablePlace(place: Place): boolean {
  return (
    place.id !== 'neighborhood-walk' &&
    place.lat != null &&
    place.lng != null
  )
}

function pickPlacesForVibe(vibeId: MonthlyPlanVibeId, count: number): Place[] {
  const categories = VIBE_CATEGORY_MAP[vibeId]
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
  if (!draft.vibeId || !draft.frequencyPerWeek || !draft.dayPreference) {
    return null
  }

  const weekCount = Math.min(4, Math.max(3, draft.frequencyPerWeek + 1))
  const places = pickPlacesForVibe(draft.vibeId, weekCount)
  const weeks: MonthlyPlanWeek[] = places.map((place, index) => ({
    weekIndex: index + 1,
    label: `Week ${index + 1}`,
    placeId: place.id,
    placeName: place.name.split(',')[0]?.trim() ?? place.name,
    category: place.category,
  }))

  const nextPlaceId = weeks[0]?.placeId ?? places[0]?.id ?? 'dog-beach-ob'

  return {
    id: crypto.randomUUID(),
    vibeId: draft.vibeId,
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
