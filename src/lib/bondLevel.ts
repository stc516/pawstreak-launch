import type { AppState } from '../data/demo'
import { resolveCategoryFromJourneyEntry } from './adventureDisplayImage'
import { getDistinctPlaceKey } from './customAdventure'
import { bondSubtitleFor } from './onboardingProfile'

const EMPTY_BOND_LEVEL: AppState['bondLevel'] = {
  label: 'Journey level',
  rank: 'Getting started',
  fillWidth: '8%',
  subtitle: 'Every adventure builds your story together.',
  nextRank: 'Adventure buddy',
  nextUnlock: 'Save your first memory',
  favoriteCategory: '—',
  beachDays: 0,
  recentMoments: [],
}

function countDistinctPlaces(entries: AppState['journeyEntries']): number {
  const ids = new Set(entries.map((entry) => getDistinctPlaceKey(entry)))
  return ids.size
}

function favoriteCategory(entries: AppState['journeyEntries']): string {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    const category = resolveCategoryFromJourneyEntry(entry)
    if (!category) continue
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  let best = '—'
  let bestCount = 0
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category
      bestCount = count
    }
  }

  if (best === 'Beach') return 'Beach days'
  if (best === 'Trail') return 'Trail days'
  if (best === 'Coffee') return 'Coffee runs'
  if (best === 'Neighborhood') return 'Neighborhood loops'
  return best === '—' ? '—' : `${best} outings`
}

const RANK_STEPS = [
  { minAdventures: 0, rank: 'Getting started', nextRank: 'Adventure buddy', nextUnlock: 'Save your first memory' },
  { minAdventures: 1, rank: 'Adventure buddy', nextRank: 'Trail scout', nextUnlock: 'Log 5 adventures together' },
  { minAdventures: 5, rank: 'Trail scout', nextRank: 'Place explorer', nextUnlock: 'Discover 5 different places' },
  { minAdventures: 10, rank: 'Place explorer', nextRank: 'Memory keeper', nextUnlock: 'Reach 20 saved adventures' },
  { minAdventures: 20, rank: 'Memory keeper', nextRank: 'Pack legend', nextUnlock: 'Keep writing your story' },
  { minAdventures: 40, rank: 'Pack legend', nextRank: 'Pack legend', nextUnlock: 'Every new adventure adds more' },
] as const

export function computeBondLevel(state: AppState): AppState['bondLevel'] {
  const entries = state.journeyEntries
  const adventureCount = entries.length
  const placeCount = countDistinctPlaces(entries)
  const dogs = state.dogs

  if (adventureCount === 0) {
    return {
      ...EMPTY_BOND_LEVEL,
      subtitle: bondSubtitleFor(dogs, 0, 0),
    }
  }

  let stepIndex = 0
  for (let index = RANK_STEPS.length - 1; index >= 0; index -= 1) {
    if (adventureCount >= RANK_STEPS[index].minAdventures) {
      stepIndex = index
      break
    }
  }

  const current = RANK_STEPS[stepIndex]
  const next = RANK_STEPS[Math.min(stepIndex + 1, RANK_STEPS.length - 1)]
  const rangeStart = current.minAdventures
  const rangeEnd = next.minAdventures > rangeStart ? next.minAdventures : rangeStart + 10
  const progress = Math.min(
    100,
    Math.round(((adventureCount - rangeStart) / Math.max(1, rangeEnd - rangeStart)) * 100),
  )

  const beachDays = entries.filter(
    (entry) => resolveCategoryFromJourneyEntry(entry) === 'Beach',
  ).length

  const recentMoments = entries.slice(0, 3).map((entry) => {
    const category = resolveCategoryFromJourneyEntry(entry)
    const emoji =
      category === 'Beach'
        ? '🏖️'
        : category === 'Trail'
          ? '🌲'
          : category === 'Road trip'
            ? '🚗'
            : category === 'Coffee'
              ? '☕'
              : '🐾'

    return {
      emoji,
      title: entry.place,
      subtitle: entry.date,
    }
  })

  return {
    label: 'Journey level',
    rank: current.rank,
    fillWidth: `${Math.max(8, progress)}%`,
    subtitle: bondSubtitleFor(dogs, adventureCount, placeCount),
    nextRank: current.nextRank,
    nextUnlock: current.nextUnlock,
    favoriteCategory: favoriteCategory(entries),
    beachDays,
    recentMoments,
  }
}

export function shouldShowBondLevel(state: AppState): boolean {
  return state.journeyEntries.length > 0
}
