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
    description: "Complete the first outing that starts your dog's adventure map.",
    personalityLine: 'One real adventure finished. The map has a beginning.',
    requirementHint: 'Complete 1 adventure.',
    badgeImageUrl: SAMPLE_IMAGES.neighborhood,
    emoji: '🐾',
    metric: { kind: 'first_adventure', target: 1 },
  },
  {
    id: 'first-memory',
    categoryId: 'memory',
    title: 'First Memory',
    description: 'Save a photo from an adventure so the day is easy to find again.',
    personalityLine: 'The first saved memory is part of the story now.',
    requirementHint: 'Save 1 photo from an adventure.',
    badgeImageUrl: SAMPLE_IMAGES.scenic,
    emoji: '📸',
    metric: { kind: 'first_memory', target: 1 },
  },
  {
    id: 'memory-maker',
    categoryId: 'memory',
    title: 'Memory Keeper',
    description: 'Save memories from real adventures so the good days do not disappear into the camera roll.',
    personalityLine: 'A growing record of places, days, and moments worth keeping.',
    requirementHint: 'Save 10 memories from adventures.',
    badgeImageUrl: SAMPLE_IMAGES.scenic,
    emoji: '🖼️',
    metric: { kind: 'memories_with_photo', target: 10 },
  },
  {
    id: 'week-streak',
    categoryId: 'streak',
    title: 'Good Week Given',
    description: 'Complete three outings in a week and give your dog a visible rhythm of better days.',
    personalityLine: 'A good week is something you can see now.',
    requirementHint: 'Complete 3 outings in 7 days.',
    badgeImageUrl: SAMPLE_IMAGES.park,
    emoji: '🔥',
    metric: { kind: 'week_streak', target: 3 },
  },
  {
    id: 'explorer',
    categoryId: 'explore',
    title: 'Routine Breaker',
    description: 'Try different kinds of outings so the week is not only the same route.',
    personalityLine: 'A better mix of dog days is taking shape.',
    requirementHint: 'Try 3 different outing types this week.',
    badgeImageUrl: SAMPLE_IMAGES.roadTrip,
    emoji: '🧭',
    metric: { kind: 'place_types', target: 3 },
  },
  {
    id: 'social-pup',
    categoryId: 'social',
    title: 'Patio Pup',
    description: 'Complete a social dog-friendly outing where your dog can practice being out in the world.',
    personalityLine: 'A calm public outing is part of the adventure record.',
    requirementHint: 'Visit 1 social dog-friendly place.',
    badgeImageUrl: SAMPLE_IMAGES.dogPark,
    emoji: '🐕',
    metric: { kind: 'social_adventures', target: 1 },
  },
  {
    id: 'trail-dog',
    categoryId: 'explore',
    title: 'Trail Dog',
    description: 'Complete trail outings that give your dog new paths, smells, and steady time outside.',
    personalityLine: 'Fresh air and path-sniffing are becoming a routine.',
    requirementHint: 'Complete 3 trail outings.',
    badgeImageUrl: SAMPLE_IMAGES.trail,
    emoji: '🌲',
    metric: { kind: 'trail_visits', target: 3 },
  },
  {
    id: 'beach-dog',
    categoryId: 'explore',
    title: 'Beach Regular',
    description: "Complete beach adventures until the coast becomes part of your dog's map.",
    personalityLine: 'Sand, waves, and repeat visits are part of the story now.',
    requirementHint: 'Complete 3 beach adventures.',
    badgeImageUrl: SAMPLE_IMAGES.beach,
    emoji: '🏖️',
    metric: { kind: 'beach_visits', target: 3 },
  },
  {
    id: 'training-buddy',
    categoryId: 'training',
    title: 'Outing Ready',
    description: 'Complete short training sessions that make real adventures easier.',
    personalityLine: 'Practice is supporting better days out together.',
    requirementHint: 'Complete 3 training sessions.',
    badgeImageUrl: SAMPLE_IMAGES.training,
    emoji: '🎯',
    metric: { kind: 'training_sessions', target: 3 },
  },
  {
    id: 'road-trip-pup',
    categoryId: 'explore',
    title: 'Local Explorer',
    description: 'Take a bigger dog-friendly outing beyond the usual neighborhood loop.',
    personalityLine: 'The map reaches beyond the usual places.',
    requirementHint: 'Complete 1 day-trip adventure.',
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
