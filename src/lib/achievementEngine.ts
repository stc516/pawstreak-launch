import type { AppState, JourneyEntry } from '../data/demo'
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  type Achievement,
  type AchievementDefinition,
  type AchievementProgress,
  type AchievementStatus,
} from '../data/achievements'
import { NEIGHBORHOOD_WALK_PLACE_ID, getPlaceById } from '../data/places'
import { DEMO_SEEDED_JOURNEY_ENTRY_IDS } from './productionState'

type MetricMatch = {
  entry: JourneyEntry
  at: number
}

function parseEntryTimestamp(entry: JourneyEntry): number {
  if (entry.occurredAt) {
    const parsed = Date.parse(entry.occurredAt)
    if (!Number.isNaN(parsed)) return parsed
  }

  const normalized = entry.date.trim().toLowerCase()
  if (normalized === 'today') return Date.now()
  if (normalized === 'yesterday') return Date.now() - 86_400_000

  const parsed = Date.parse(entry.date)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

function formatUnlockLabel(unlockedAt: string): string {
  const parsed = Date.parse(unlockedAt)
  if (Number.isNaN(parsed)) return unlockedAt

  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function getAchievementEntries(state: AppState): JourneyEntry[] {
  const entries =
    state.mode === 'demo'
      ? state.journeyEntries
      : state.journeyEntries.filter(
          (entry) => !DEMO_SEEDED_JOURNEY_ENTRY_IDS.has(entry.id),
        )

  return [...entries].sort(
    (left, right) => parseEntryTimestamp(left) - parseEntryTimestamp(right),
  )
}

function isBeachEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) return entry.tags.some((tag) => tag.toLowerCase().includes('beach'))
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Beach'
}

function isTrailEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) return entry.tags.some((tag) => tag.toLowerCase().includes('trail'))
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Trail'
}

function isSnowEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) {
    return entry.tags.some((tag) => /snow|winter|mountain/i.test(tag))
  }

  const place = getPlaceById(entry.placeId)
  if (!place) return false

  return (
    place.region === 'Julian / Mountain' ||
    place.tags.some((tag) => /snow|winter/i.test(tag)) ||
    (place.category === 'Trail' && place.imageTone === 'mountain')
  )
}

function isNeighborhoodEntry(entry: JourneyEntry): boolean {
  if (entry.placeId === NEIGHBORHOOD_WALK_PLACE_ID) return true
  if (!entry.placeId) {
    return entry.tags.some((tag) => tag.toLowerCase().includes('neighborhood'))
  }

  const place = getPlaceById(entry.placeId)
  return place?.category === 'Neighborhood'
}

function isSocialEntry(entry: JourneyEntry): boolean {
  const recapMatch = entry.recapLabels?.some((label) =>
    /met new friends|new friends/i.test(label),
  )

  if (recapMatch) return true

  if (!entry.placeId) return false

  const place = getPlaceById(entry.placeId)
  if (!place) return false

  return (
    place.category === 'Dog park' ||
    (place.category === 'Beach' && place.tags.includes('social'))
  )
}

function hasPhoto(entry: JourneyEntry): boolean {
  return Boolean(entry.photoUrls?.some(Boolean))
}

function matchMetric(
  definition: AchievementDefinition,
  state: AppState,
  entries: JourneyEntry[],
): MetricMatch[] {
  const { kind } = definition.metric

  switch (kind) {
    case 'beach_visits':
      return entries.filter(isBeachEntry).map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'beach_distinct': {
      const seen = new Set<string>()
      return entries
        .filter(isBeachEntry)
        .filter((entry) => {
          const key = entry.placeId ?? entry.place
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map((entry) => ({ entry, at: parseEntryTimestamp(entry) }))
    }
    case 'trail_visits':
      return entries.filter(isTrailEntry).map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'trail_distinct': {
      const seen = new Set<string>()
      return entries
        .filter(isTrailEntry)
        .filter((entry) => {
          const key = entry.placeId ?? entry.place
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map((entry) => ({ entry, at: parseEntryTimestamp(entry) }))
    }
    case 'snow_visits':
      return entries.filter(isSnowEntry).map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'neighborhood_walks':
      return entries.filter(isNeighborhoodEntry).map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'total_adventures':
      return entries.map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'memories_with_photo':
      return entries.filter(hasPhoto).map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'total_memories':
      return entries.map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'social_adventures':
      return entries.filter(isSocialEntry).map((entry) => ({
        entry,
        at: parseEntryTimestamp(entry),
      }))
    case 'pack_member': {
      const qualifies = state.dogs.length >= 2 && entries.length >= 5
      if (!qualifies) return []

      const unlockEntry = entries[Math.min(4, entries.length - 1)]
      return [{ entry: unlockEntry, at: parseEntryTimestamp(unlockEntry) }]
    }
    default:
      return []
  }
}

export function computeAchievementProgress(
  definition: AchievementDefinition,
  state: AppState,
): AchievementProgress {
  const entries = getAchievementEntries(state)
  const matches = matchMetric(definition, state, entries)
  const current = matches.length
  const target = definition.metric.target
  const unlocked = current >= target
  const unlockMatch = unlocked ? matches[target - 1] : undefined

  return {
    achievementId: definition.id,
    current: Math.min(current, target),
    target,
    unlocked,
    unlockedAt: unlockMatch
      ? new Date(unlockMatch.at).toISOString()
      : undefined,
  }
}

function statusForProgress(progress: AchievementProgress): AchievementStatus {
  if (progress.unlocked) return 'done'
  if (progress.current > 0) return 'active'
  return 'locked'
}

function badgeForProgress(progress: AchievementProgress): string {
  if (progress.unlocked) return 'Unlocked'
  if (progress.current > 0) return `${progress.current}/${progress.target}`
  return 'Locked'
}

function subtitleForAchievement(
  definition: AchievementDefinition,
  progress: AchievementProgress,
): string {
  if (progress.unlocked && progress.unlockedAt) {
    return formatUnlockLabel(progress.unlockedAt)
  }

  if (progress.current > 0) {
    const remaining = progress.target - progress.current
    return remaining === 1
      ? '1 more to unlock'
      : `${remaining} more to unlock`
  }

  return definition.requirementHint
}

export function resolveAchievement(
  definition: AchievementDefinition,
  state: AppState,
): Achievement {
  const progress = computeAchievementProgress(definition, state)

  return {
    id: definition.id,
    categoryId: definition.categoryId,
    title: definition.title,
    subtitle: subtitleForAchievement(definition, progress),
    description: definition.description,
    emoji: definition.emoji,
    badgeImageUrl: definition.badgeImageUrl,
    status: statusForProgress(progress),
    badge: badgeForProgress(progress),
    progress,
  }
}

export function resolveAchievements(state: AppState): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) =>
    resolveAchievement(definition, state),
  )
}

export function resolveAchievementsByCategory(state: AppState): {
  category: (typeof ACHIEVEMENT_CATEGORIES)[number]
  achievements: Achievement[]
}[] {
  return ACHIEVEMENT_CATEGORIES.map((category) => ({
    category,
    achievements: resolveAchievements(state).filter(
      (achievement) => achievement.categoryId === category.id,
    ),
  }))
}

export function getUnlockedAchievements(state: AppState): Achievement[] {
  return resolveAchievements(state).filter(
    (achievement) => achievement.progress.unlocked,
  )
}

export function getActiveAchievement(state: AppState): Achievement | undefined {
  return resolveAchievements(state).find((achievement) => achievement.status === 'active')
}
