import { SAMPLE_IMAGES } from './sampleImages'

export type AchievementCategoryId =
  | 'beach'
  | 'trail'
  | 'snow'
  | 'walks'
  | 'memories'
  | 'social'

export type AchievementStatus = 'done' | 'active' | 'locked'

export type AchievementMetricKind =
  | 'beach_visits'
  | 'beach_distinct'
  | 'trail_visits'
  | 'trail_distinct'
  | 'snow_visits'
  | 'neighborhood_walks'
  | 'total_adventures'
  | 'memories_with_photo'
  | 'total_memories'
  | 'social_adventures'
  | 'pack_member'

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
  emoji: string
  badgeImageUrl: string
  status: AchievementStatus
  badge: string
  progress: AchievementProgress
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'trail', label: 'Trail', emoji: '🌲' },
  { id: 'snow', label: 'Snow', emoji: '❄️' },
  { id: 'walks', label: 'Walks', emoji: '🐾' },
  { id: 'memories', label: 'Memories', emoji: '📸' },
  { id: 'social', label: 'Social', emoji: '🐕' },
]

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'surfer-dog',
    categoryId: 'beach',
    title: 'Surfer Dog',
    description: 'First splash at the shore — the adventure story begins.',
    requirementHint: 'Finish your first beach adventure',
    badgeImageUrl: SAMPLE_IMAGES.beach,
    emoji: '🏄',
    metric: { kind: 'beach_visits', target: 1 },
  },
  {
    id: 'coastal-explorer',
    categoryId: 'beach',
    title: 'Coastal Explorer',
    description: 'Three different beaches — your pup is learning the coast.',
    requirementHint: 'Visit 3 different beaches',
    badgeImageUrl: SAMPLE_IMAGES.coastal,
    emoji: '🌊',
    metric: { kind: 'beach_distinct', target: 3 },
  },
  {
    id: 'beach-bum',
    categoryId: 'beach',
    title: 'Beach Bum',
    description: 'Sand in the car, salt in the fur — living for beach days.',
    requirementHint: 'Log 8 beach adventures',
    badgeImageUrl: SAMPLE_IMAGES.dogsOutdoors,
    emoji: '🏖️',
    metric: { kind: 'beach_visits', target: 8 },
  },
  {
    id: 'trail-dog',
    categoryId: 'trail',
    title: 'Trail Dog',
    description: 'First path through the trees — nose up, tail high.',
    requirementHint: 'Finish your first trail adventure',
    badgeImageUrl: SAMPLE_IMAGES.trail,
    emoji: '🥾',
    metric: { kind: 'trail_visits', target: 1 },
  },
  {
    id: 'mountain-mutt',
    categoryId: 'trail',
    title: 'Mountain Mutt',
    description: 'Five trail days — legs, lungs, and loyalty.',
    requirementHint: 'Log 5 trail adventures',
    badgeImageUrl: SAMPLE_IMAGES.mountain,
    emoji: '⛰️',
    metric: { kind: 'trail_visits', target: 5 },
  },
  {
    id: 'summit-pup',
    categoryId: 'trail',
    title: 'Summit Pup',
    description: 'Ten trails conquered — peak pup energy.',
    requirementHint: 'Log 10 trail adventures',
    badgeImageUrl: SAMPLE_IMAGES.trail,
    emoji: '🏔️',
    metric: { kind: 'trail_visits', target: 10 },
  },
  {
    id: 'snow-dog',
    categoryId: 'snow',
    title: 'Snow Dog',
    description: 'First mountain or winter outing — cold nose, warm heart.',
    requirementHint: 'Finish a mountain or winter adventure',
    badgeImageUrl: SAMPLE_IMAGES.mountain,
    emoji: '🐺',
    metric: { kind: 'snow_visits', target: 1 },
  },
  {
    id: 'winter-explorer',
    categoryId: 'snow',
    title: 'Winter Explorer',
    description: 'Three winter days — built for the chill.',
    requirementHint: 'Log 3 mountain or winter adventures',
    badgeImageUrl: SAMPLE_IMAGES.mountain,
    emoji: '❄️',
    metric: { kind: 'snow_visits', target: 3 },
  },
  {
    id: 'neighborhood-hero',
    categoryId: 'walks',
    title: 'Neighborhood Hero',
    description: 'The block knows your dog now.',
    requirementHint: 'Finish a neighborhood walk',
    badgeImageUrl: SAMPLE_IMAGES.neighborhood,
    emoji: '🏘️',
    metric: { kind: 'neighborhood_walks', target: 1 },
  },
  {
    id: 'pavement-patrol',
    categoryId: 'walks',
    title: 'Pavement Patrol',
    description: 'Ten local loops — small days, big bond.',
    requirementHint: 'Log 10 neighborhood walks',
    badgeImageUrl: SAMPLE_IMAGES.neighborhood,
    emoji: '🚶',
    metric: { kind: 'neighborhood_walks', target: 10 },
  },
  {
    id: 'walk-legend',
    categoryId: 'walks',
    title: 'Walk Legend',
    description: 'Twenty-five adventures — a real streak of showing up.',
    requirementHint: 'Log 25 adventures',
    badgeImageUrl: SAMPLE_IMAGES.dogsOutdoors,
    emoji: '🏅',
    metric: { kind: 'total_adventures', target: 25 },
  },
  {
    id: 'memory-maker',
    categoryId: 'memories',
    title: 'Memory Maker',
    description: 'First photo saved — the story is real now.',
    requirementHint: 'Save a memory with a photo',
    badgeImageUrl: SAMPLE_IMAGES.beach,
    emoji: '📷',
    metric: { kind: 'memories_with_photo', target: 1 },
  },
  {
    id: 'story-keeper',
    categoryId: 'memories',
    title: 'Story Keeper',
    description: 'Ten memories — a journal your dog would approve of.',
    requirementHint: 'Save 10 memories',
    badgeImageUrl: SAMPLE_IMAGES.coastal,
    emoji: '📖',
    metric: { kind: 'total_memories', target: 10 },
  },
  {
    id: 'friendly-pup',
    categoryId: 'social',
    title: 'Friendly Pup',
    description: 'Made a friend or found the social scene.',
    requirementHint: 'Visit a dog park or meet new friends on a walk',
    badgeImageUrl: SAMPLE_IMAGES.dogPark,
    emoji: '🤝',
    metric: { kind: 'social_adventures', target: 1 },
  },
  {
    id: 'pack-member',
    categoryId: 'social',
    title: 'Pack Member',
    description: 'Multi-dog life with a growing adventure log.',
    requirementHint: 'Add 2+ dogs and save 5 memories together',
    badgeImageUrl: SAMPLE_IMAGES.dogsOutdoors,
    emoji: '🐾',
    metric: { kind: 'pack_member', target: 1 },
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
