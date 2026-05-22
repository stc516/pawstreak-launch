export interface AchievementMemory {
  placeName: string
  caption: string
  imageUrl: string
  date?: string
}

export interface AchievementDetail {
  statusLabel: 'Done' | 'In progress' | 'Locked'
  emotionalExplanation: string
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

const ACHIEVEMENT_DETAILS: Record<string, AchievementDetail> = {
  'first-beach': {
    statusLabel: 'Done',
    emotionalExplanation:
      "Bailey + Omi's first beach memory — wide sand, cold water, and that moment when both dogs forgot everything else.",
    dateEarned: 'March 12, 2025',
    relatedMemories: [
      {
        placeName: 'Dog Beach, OB',
        caption: 'Bailey kept pulling toward the water.',
        imageUrl: '/sample-images/beach.jpg',
        date: 'March 12',
      },
    ],
    rewardEmoji: '🏖️',
    rewardTitle: 'First Beach Day badge',
    rewardDescription: 'You unlocked this by completing your first beach adventure.',
    suggestedAction: {
      label: 'Go again',
      description: 'Dog Beach is still one of their favorites — worth another visit.',
      placeName: 'Dog Beach, OB',
      imageUrl: '/sample-images/beach.jpg',
    },
  },
  'trail-scout': {
    statusLabel: 'In progress',
    emotionalExplanation:
      'Trail walks build stamina and curiosity. Three more loops and this one is yours.',
    progressLabel: '3 more trail walks to earn this',
    progressPercent: 40,
    relatedMemories: [
      {
        placeName: 'Torrey Pines State Reserve',
        caption: 'Omi stayed close, like she knew this was a slower day.',
        imageUrl: '/sample-images/trail.jpg',
      },
      {
        placeName: 'Balboa Park loop',
        caption: 'Bailey led the way through the pine section.',
        imageUrl: '/sample-images/park.jpg',
      },
    ],
    rewardEmoji: '🌲',
    rewardTitle: 'Trail Scout badge',
    rewardDescription: 'Earned after 5 different trail adventures.',
    suggestedAction: {
      label: 'Suggested next trail',
      description: 'Torrey Pines has shaded paths — good for a mixed-pace day with both dogs.',
      placeName: 'Torrey Pines State Reserve',
      imageUrl: '/sample-images/trail.jpg',
    },
  },
  'road-tripper-ach': {
    statusLabel: 'Locked',
    emotionalExplanation:
      'Day trips outside your home city — the kind of outing that becomes a story you tell later.',
    unlockSteps: [
      'Take 3 day trips outside your home city',
      'Log each trip as a finished adventure',
      'Capture at least one memory photo per trip',
    ],
    progressLabel: '0 of 3 day trips logged',
    progressPercent: 0,
    relatedMemories: [],
    rewardEmoji: '🚗',
    rewardTitle: 'Road Tripper badge',
    rewardDescription: 'For explorers who leave their zip code behind.',
    suggestedAction: {
      label: 'Start with Julian',
      description: 'Take 3 day trips outside your home city — Julian is a gentle first one.',
      placeName: 'Julian day trip',
      imageUrl: '/sample-images/road-trip.jpg',
    },
  },
}

export function getAchievementDetail(achievementId: string): AchievementDetail | null {
  return ACHIEVEMENT_DETAILS[achievementId] ?? null
}
