import { SAMPLE_IMAGES } from './sampleImages'

export type AchievementCategoryId =
  | 'adventure'
  | 'memory'
  | 'streak'
  | 'explore'
  | 'social'
  | 'training'

export type AchievementStatus = 'done' | 'active' | 'locked'

export type AchievementMetricKind =
  | 'first_adventure'
  | 'first_memory'
  | 'week_streak'
  | 'place_types'
  | 'beach_visits'
  | 'trail_visits'
  | 'training_sessions'
  | 'road_trip_adventures'
  | 'total_adventures'
  | 'memories_with_photo'
  | 'social_adventures'

export interface AchievementMetric {
  kind: AchievementMetricKind
  target: number
}

export interface AchievementCategory {
  id: AchievementCategoryId
  label: string
  emoji: string
}

export interface AchievementDefinition {
  id: string
  categoryId: AchievementCategoryId
  title: string
  description: string
  /** Short personality trait — who your dog is becoming. */
  personalityLine: string
  requirementHint: string
  badgeImageUrl: string
  emoji: string
  metric: AchievementMetric
}

export interface AchievementProgress {
  achievementId: string
  current: number
  target: number
  unlocked: boolean
  unlockedAt?: string
}

/** UI-facing achievement row — definition + live progress. */
export interface Achievement {
  id: string
  categoryId: AchievementCategoryId
  title: string
  subtitle: string
  description: string
  personalityLine: string
  emoji: string
  badgeImageUrl: string
  status: AchievementStatus
  badge: string
  progress: AchievementProgress
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  { id: 'adventure', label: 'Adventure', emoji: '🐾' },
  { id: 'memory', label: 'Memories', emoji: '📸' },
  { id: 'streak', label: 'Consistency', emoji: '🔥' },
  { id: 'explore', label: 'Explore', emoji: '🧭' },
  { id: 'social', label: 'Social', emoji: '🐕' },
  { id: 'training', label: 'Training', emoji: '🎯' },
]

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-adventure',
    categoryId: 'adventure',
    title: 'First Adventure',
    description: 'The first completed outing that starts the real record.',
    personalityLine: 'One real adventure finished — the streak has a beginning.',
    requirementHint: 'Finish 1 adventure',
    badgeImageUrl: SAMPLE_IMAGES.neighborhood,
    emoji: '🐾',
    metric: { kind: 'first_adventure', target: 1 },
  },
  {
    id: 'first-memory',
    categoryId: 'memory',
    title: 'First Memory',
    description: 'A real photo saved from an actual outing.',
    personalityLine: 'The camera roll has its first PawStreak keeper.',
    requirementHint: 'Save 1 photo from an adventure',
    badgeImageUrl: SAMPLE_IMAGES.scenic,
    emoji: '📸',
    metric: { kind: 'first_memory', target: 1 },
  },
  {
    id: 'memory-maker',
    categoryId: 'memory',
    title: 'Memory Maker',
    description: 'Five saved photos from real completed adventures.',
    personalityLine: 'A growing little gallery of the good stuff.',
    requirementHint: 'Save 5 adventure photos',
    badgeImageUrl: SAMPLE_IMAGES.scenic,
    emoji: '🖼️',
    metric: { kind: 'memories_with_photo', target: 5 },
  },
  {
    id: 'week-streak',
    categoryId: 'streak',
    title: 'Week Streak',
    description: 'Three completed outings in a seven-day window.',
    personalityLine: 'A real rhythm is forming.',
    requirementHint: 'Complete 3 outings in 7 days',
    badgeImageUrl: SAMPLE_IMAGES.park,
    emoji: '🔥',
    metric: { kind: 'week_streak', target: 3 },
  },
  {
    id: 'explorer',
    categoryId: 'explore',
    title: 'Explorer',
    description: 'Three different place types completed.',
    personalityLine: 'Not just one routine — a real mix of adventures.',
    requirementHint: 'Visit 3 different place types',
    badgeImageUrl: SAMPLE_IMAGES.roadTrip,
    emoji: '🧭',
    metric: { kind: 'place_types', target: 3 },
  },
  {
    id: 'social-pup',
    categoryId: 'social',
    title: 'Social Pup',
    description: 'One social dog-friendly outing completed.',
    personalityLine: 'A little confidence around the social scene.',
    requirementHint: 'Visit 1 social dog-friendly place',
    badgeImageUrl: SAMPLE_IMAGES.dogPark,
    emoji: '🐕',
    metric: { kind: 'social_adventures', target: 1 },
  },
  {
    id: 'trail-dog',
    categoryId: 'explore',
    title: 'Trail Dog',
    description: 'Three trail outings completed.',
    personalityLine: 'Fresh air and path-sniffing are becoming a thing.',
    requirementHint: 'Complete 3 trail outings',
    badgeImageUrl: SAMPLE_IMAGES.trail,
    emoji: '🌲',
    metric: { kind: 'trail_visits', target: 3 },
  },
  {
    id: 'beach-dog',
    categoryId: 'explore',
    title: 'Beach Dog',
    description: 'Three beach outings completed.',
    personalityLine: 'Sand, waves, and a pattern worth earning.',
    requirementHint: 'Complete 3 beach outings',
    badgeImageUrl: SAMPLE_IMAGES.beach,
    emoji: '🏖️',
    metric: { kind: 'beach_visits', target: 3 },
  },
  {
    id: 'training-buddy',
    categoryId: 'training',
    title: 'Training Buddy',
    description: 'Three short training sessions completed.',
    personalityLine: 'Practice is becoming part of the plan.',
    requirementHint: 'Complete 3 training sessions',
    badgeImageUrl: SAMPLE_IMAGES.training,
    emoji: '🎯',
    metric: { kind: 'training_sessions', target: 3 },
  },
  {
    id: 'road-trip-pup',
    categoryId: 'explore',
    title: 'Road Trip Pup',
    description: 'One day-trip adventure completed.',
    personalityLine: 'Out of the usual zip code, into a bigger day.',
    requirementHint: 'Complete 1 day-trip adventure',
    badgeImageUrl: SAMPLE_IMAGES.roadTrip,
    emoji: '🚗',
    metric: { kind: 'road_trip_adventures', target: 1 },
  },
]

export function getAchievementCategory(
  categoryId: AchievementCategoryId,
): AchievementCategory | undefined {
  return ACHIEVEMENT_CATEGORIES.find((category) => category.id === categoryId)
}

export function getAchievementDefinition(
  achievementId: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((definition) => definition.id === achievementId)
}
