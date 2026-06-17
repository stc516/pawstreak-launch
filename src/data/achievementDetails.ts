import type { Dog } from './demo'
import type { Achievement } from './achievements'
import {
  getAchievementCategory,
  getAchievementDefinition,
} from './achievements'
import { personalizeGhostText } from '../lib/dogLabels'

export interface AchievementMemory {
  placeName: string
  caption: string
  imageUrl: string
  date?: string
}

export interface AchievementDetail {
  statusLabel: 'Unlocked' | 'In progress' | 'Locked'
  emotionalExplanation: string
  howToEarn: string
  currentCount: number
  targetCount: number
  dateEarned?: string
  progressLabel?: string
  progressPercent?: number
  unlockSteps?: string[]
  relatedMemories: AchievementMemory[]
  rewardEmoji: string
  rewardTitle: string
  rewardDescription: string
  suggestedAction: {
    label: string
    description: string
    placeName?: string
    imageUrl?: string
  }
}

function formatUnlockDate(unlockedAt: string): string {
  const parsed = Date.parse(unlockedAt)
  if (Number.isNaN(parsed)) return unlockedAt

  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function buildSuggestedAction(
  achievement: Achievement,
): AchievementDetail['suggestedAction'] {
  const category = getAchievementCategory(achievement.categoryId)
  const definition = getAchievementDefinition(achievement.id)

  return {
    label: achievement.progress.unlocked ? 'Keep going' : 'Easy next step',
    description: achievement.progress.unlocked
      ? `${achievement.title} is part of your story now — plan another adventure to keep the streak alive.`
      : definition?.requirementHint ?? achievement.description,
    imageUrl: achievement.badgeImageUrl,
    placeName: category ? `${category.label} adventures` : undefined,
  }
}

function buildAchievementDetail(achievement: Achievement): AchievementDetail {
  const definition = getAchievementDefinition(achievement.id)
  const { progress } = achievement
  const progressPercent =
    progress.target > 0
      ? Math.round((progress.current / progress.target) * 100)
      : 0
  const howToEarn = definition?.requirementHint ?? achievement.subtitle
  const baseDetail = {
    howToEarn,
    currentCount: progress.current,
    targetCount: progress.target,
  }

  if (progress.unlocked) {
    return {
      statusLabel: 'Unlocked',
      emotionalExplanation: definition?.description ?? achievement.description,
      ...baseDetail,
      dateEarned: progress.unlockedAt
        ? formatUnlockDate(progress.unlockedAt)
        : undefined,
      progressLabel: `${progress.target} of ${progress.target} complete`,
      progressPercent: 100,
      relatedMemories: [],
      rewardEmoji: achievement.emoji,
      rewardTitle: `${achievement.title} badge`,
      rewardDescription: 'Unlocked automatically when you hit the milestone.',
      suggestedAction: buildSuggestedAction(achievement),
    }
  }

  if (progress.current > 0) {
    return {
      statusLabel: 'In progress',
      emotionalExplanation: definition?.description ?? achievement.description,
      ...baseDetail,
      progressLabel: `${progress.current} of ${progress.target} complete`,
      progressPercent,
      relatedMemories: [],
      rewardEmoji: achievement.emoji,
      rewardTitle: `${achievement.title} badge`,
      rewardDescription: definition?.requirementHint ?? achievement.subtitle,
      suggestedAction: buildSuggestedAction(achievement),
    }
  }

  return {
    statusLabel: 'Locked',
    emotionalExplanation: definition?.description ?? achievement.description,
    ...baseDetail,
    unlockSteps: [howToEarn],
    progressLabel: `0 of ${progress.target} complete`,
    progressPercent: 0,
    relatedMemories: [],
    rewardEmoji: achievement.emoji,
    rewardTitle: `${achievement.title} badge`,
      rewardDescription: 'Earned only after the real action is completed.',
    suggestedAction: buildSuggestedAction(achievement),
  }
}

function personalizeAchievementDetail(
  detail: AchievementDetail,
  dogs: Dog[],
): AchievementDetail {
  if (dogs.length === 0) return detail

  return {
    ...detail,
    emotionalExplanation: personalizeGhostText(detail.emotionalExplanation, dogs),
    suggestedAction: {
      ...detail.suggestedAction,
      description: personalizeGhostText(detail.suggestedAction.description, dogs),
    },
  }
}

export function getAchievementDetail(
  achievement: Achievement,
  dogs: Dog[] = [],
): AchievementDetail {
  const detail = buildAchievementDetail(achievement)
  return dogs.length > 0 ? personalizeAchievementDetail(detail, dogs) : detail
}

export function getAchievementDetailById(
  achievementId: string,
  achievements: Achievement[],
  dogs: Dog[] = [],
): AchievementDetail | null {
  const achievement = achievements.find((item) => item.id === achievementId)
  if (!achievement) return null
  return getAchievementDetail(achievement, dogs)
}
