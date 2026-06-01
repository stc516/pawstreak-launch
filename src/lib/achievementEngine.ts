import type { AppState, Dog, JourneyEntry } from '../data/demo'
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  getAchievementDefinition,
  type Achievement,
  type AchievementDefinition,
  type AchievementProgress,
  type AchievementStatus,
} from '../data/achievements'
import { NEIGHBORHOOD_WALK_PLACE_ID, getPlaceById } from '../data/places'
import { DEMO_SEEDED_JOURNEY_ENTRY_IDS } from './productionState'
import { DEMO_EARNED_ACHIEVEMENT_IDS } from './productionState'

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

function isCoffeeEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) return entry.tags.some((tag) => tag.toLowerCase().includes('coffee'))
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Coffee' || place?.category === 'Brewery'
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
    case 'coffee_visits':
      return entries.filter(isCoffeeEntry).map((entry) => ({
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
  let progress = computeAchievementProgress(definition, state)

  if (state.mode === 'demo' && progress.unlocked && !DEMO_EARNED_ACHIEVEMENT_IDS.has(definition.id)) {
    progress = {
      ...progress,
      unlocked: false,
      unlockedAt: undefined,
    }
  }

  return {
    id: definition.id,
    categoryId: definition.categoryId,
    title: definition.title,
    subtitle: subtitleForAchievement(definition, progress),
    description: definition.description,
    personalityLine: definition.personalityLine,
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

const IDENTITY_DISPLAY_ORDER = [
  'surfer-dog',
  'coastal-explorer',
  'beach-bum',
  'trail-dog',
  'mountain-mutt',
  'summit-pup',
  'snow-dog',
  'winter-explorer',
  'neighborhood-hero',
  'adventure-dog',
  'coffee-pup',
  'memory-maker',
  'friendly-pup',
  'pavement-patrol',
  'walk-legend',
  'story-keeper',
  'pack-member',
]

function identitySortIndex(achievementId: string): number {
  const index = IDENTITY_DISPLAY_ORDER.indexOf(achievementId)
  return index === -1 ? IDENTITY_DISPLAY_ORDER.length : index
}

export function getIdentityProgressUnit(achievement: Achievement): string {
  const definition = getAchievementDefinition(achievement.id)
  if (!definition) return 'steps'

  switch (definition.metric.kind) {
    case 'beach_visits':
      return achievement.progress.target === 1 ? 'Beach day' : 'Beach days'
    case 'beach_distinct':
      return 'Beaches'
    case 'trail_visits':
      return achievement.progress.target === 1 ? 'Trail' : 'Trails'
    case 'trail_distinct':
      return 'Trails'
    case 'snow_visits':
      return 'Winter outings'
    case 'neighborhood_walks':
      return 'Walks'
    case 'coffee_visits':
      return 'Coffee stops'
    case 'total_adventures':
      return 'Adventures'
    case 'memories_with_photo':
      return 'Photo memories'
    case 'total_memories':
      return 'Memories'
    case 'social_adventures':
      return 'Social outings'
    case 'pack_member':
      return 'Pack milestone'
    default:
      return 'steps'
  }
}

export function getIdentityProgressLabel(achievement: Achievement): string {
  const unit = getIdentityProgressUnit(achievement)
  const pluralUnit =
    achievement.progress.target === 1 && !unit.endsWith('s')
      ? unit
      : unit.endsWith('s')
        ? unit
        : `${unit}s`

  return `${achievement.progress.current} / ${achievement.progress.target} ${pluralUnit}`
}

export function getNextIdentityAchievement(state: AppState): Achievement | undefined {
  const identityIds = new Set([
    'surfer-dog',
    'coastal-explorer',
    'beach-bum',
    'trail-dog',
    'mountain-mutt',
    'summit-pup',
    'snow-dog',
    'winter-explorer',
    'neighborhood-hero',
    'adventure-dog',
    'coffee-pup',
  ])

  const active = resolveAchievements(state)
    .filter(
      (achievement) =>
        achievement.status === 'active' && identityIds.has(achievement.id),
    )
    .sort((left, right) => {
      const leftRatio = left.progress.current / left.progress.target
      const rightRatio = right.progress.current / right.progress.target
      if (rightRatio !== leftRatio) return rightRatio - leftRatio
      return identitySortIndex(left.id) - identitySortIndex(right.id)
    })

  return active[0]
}

function entryAttributionForDog(
  entry: JourneyEntry,
  dog: Dog,
  allDogs: Dog[],
): 'primary' | 'shared' | 'none' {
  const haystack = [
    entry.magicLine ?? '',
    ...entry.tags,
    ...(entry.dogTags ?? []),
  ]
    .join(' ')
    .toLowerCase()

  const dogName = dog.name.toLowerCase()
  const otherDogs = allDogs.filter((packDog) => packDog.id !== dog.id)
  const mentionsThisDog = haystack.includes(dogName)
  const mentionsOtherDog = otherDogs.some((packDog) =>
    haystack.includes(packDog.name.toLowerCase()),
  )
  const mentionsBoth = /both dogs|whole pack|all dogs/i.test(haystack) ||
    (mentionsThisDog && mentionsOtherDog)

  if (mentionsThisDog && !mentionsOtherDog) return 'primary'
  if (mentionsBoth) return 'shared'
  if (mentionsThisDog) return 'primary'
  return 'none'
}

function getUnlockingEntries(
  definition: AchievementDefinition,
  state: AppState,
): JourneyEntry[] {
  const entries = getAchievementEntries(state)
  return matchMetric(definition, state, entries).map((match) => match.entry)
}

export function resolveIdentitiesForDog(state: AppState, dog: Dog): Achievement[] {
  const unlocked = getUnlockedAchievements(state).sort(
    (left, right) => identitySortIndex(left.id) - identitySortIndex(right.id),
  )

  const primary: Achievement[] = []
  const sharedPool: Achievement[] = []

  for (const achievement of unlocked) {
    const definition = getAchievementDefinition(achievement.id)
    if (!definition) continue

    const unlockEntries = getUnlockingEntries(definition, state).slice(
      0,
      definition.metric.target,
    )

    const hasPrimary = unlockEntries.some(
      (entry) => entryAttributionForDog(entry, dog, state.dogs) === 'primary',
    )
    const hasShared = unlockEntries.some(
      (entry) => entryAttributionForDog(entry, dog, state.dogs) === 'shared',
    )

    if (hasPrimary) {
      primary.push(achievement)
    } else if (hasShared) {
      sharedPool.push(achievement)
    }
  }

  if (primary.length > 0) {
    const dogIndex = state.dogs.findIndex((packDog) => packDog.id === dog.id)
    const sharedForDog = sharedPool.filter((_, index) => index % state.dogs.length === dogIndex)
    return [...primary, ...sharedForDog]
  }

  const dogIndex = state.dogs.findIndex((packDog) => packDog.id === dog.id)
  if (dogIndex === -1 || state.dogs.length === 0) return []

  return unlocked.filter((_, index) => index % state.dogs.length === dogIndex)
}

export function getRecentUnlockedIdentities(
  state: AppState,
  limit = 3,
): Achievement[] {
  return getUnlockedAchievements(state)
    .filter((achievement) => achievement.progress.unlockedAt)
    .sort((left, right) => {
      const leftAt = Date.parse(left.progress.unlockedAt ?? '')
      const rightAt = Date.parse(right.progress.unlockedAt ?? '')
      return rightAt - leftAt
    })
    .slice(0, limit)
}
