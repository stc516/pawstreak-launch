import { SAMPLE_IMAGES } from './sampleImages'

export type ChallengeAccent = 'coastal' | 'forest' | 'warm' | 'festive'

export type ChallengeMetricKind =
  | 'beach_adventures'
  | 'total_adventures'
  | 'neighborhood_walks'
  | 'distinct_places'
  | 'holiday_adventures'

export type ChallengeDuration =
  | {
      kind: 'seasonal'
      label: string
      startMonth: number
      startDay: number
      endMonth: number
      endDay: number
    }
  | {
      kind: 'rolling'
      label: string
      days: number
    }

export interface ChallengeSeries {
  id: string
  title: string
  description: string
  emoji: string
}

export interface ChallengeNode {
  id: string
  order: number
  title: string
  description: string
  imageUrl: string
  /** Cumulative metric value required to complete this node. */
  threshold: number
  planHint: string
}

/** Opt-in challenge catalog — location-agnostic metrics. */
export interface Challenge {
  id: string
  seriesId: string
  title: string
  subtitle: string
  description: string
  accent: ChallengeAccent
  emoji: string
  heroImageUrl: string
  duration: ChallengeDuration
  metric: {
    kind: ChallengeMetricKind
    target: number
  }
  nodes: ChallengeNode[]
}

export interface JoinedChallengeRecord {
  challengeId: string
  joinedAt: string
}

export const CHALLENGE_SERIES: ChallengeSeries[] = [
  {
    id: 'seasonal',
    title: 'Seasonal',
    description: 'Limited-time adventures tied to the calendar.',
    emoji: '🌞',
  },
  {
    id: 'fitness',
    title: 'Fitness',
    description: 'Build a walking habit with your pack.',
    emoji: '🐾',
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Explore new places wherever you are.',
    emoji: '🧭',
  },
]

const SUMMER_BEACH_NODES: ChallengeNode[] = Array.from({ length: 8 }, (_, index) => {
  const threshold = index + 1
  return {
    id: `summer-beach-${threshold}`,
    order: threshold,
    title: threshold === 1 ? 'First beach day' : `Beach day ${threshold}`,
    description: 'Log a dog-friendly beach adventure anywhere in the world.',
    imageUrl: SAMPLE_IMAGES.beach,
    threshold,
    planHint: 'Find a dog-friendly beach near you',
  }
})

const WALK_MILESTONES = [5, 10, 15, 20, 25, 30]

const THIRTY_WALK_NODES: ChallengeNode[] = WALK_MILESTONES.map((threshold, index) => ({
  id: `30-walk-${threshold}`,
  order: index + 1,
  title: `${threshold} walks`,
  description: 'Neighborhood loops, park strolls, and everyday adventures all count.',
  imageUrl: SAMPLE_IMAGES.neighborhood,
  threshold,
  planHint: 'Start a neighborhood walk or plan any outing',
}))

const HOLIDAY_MILESTONES = [2, 4, 6, 8, 10, 12]

const HOLIDAY_NODES: ChallengeNode[] = HOLIDAY_MILESTONES.map((threshold, index) => ({
  id: `holiday-${threshold}`,
  order: index + 1,
  title: `${threshold} holiday outings`,
  description: 'Festive walks, winter trails, and seasonal adventures count.',
    imageUrl: SAMPLE_IMAGES.trail,
  threshold,
  planHint: 'Plan a seasonal adventure with your dog',
}))

const EXPLORER_MILESTONES = [2, 4, 6, 8, 10]

const LOCAL_EXPLORER_NODES: ChallengeNode[] = EXPLORER_MILESTONES.map((threshold, index) => ({
  id: `local-explorer-${threshold}`,
  order: index + 1,
  title: `${threshold} new places`,
  description: 'Visit distinct dog-friendly spots in your area — any category counts.',
  imageUrl: SAMPLE_IMAGES.park,
  threshold,
  planHint: 'Try a new park, trail, café patio, or neighborhood route',
}))

export const CURATED_CHALLENGES: Challenge[] = [
  {
    id: 'summer-beach-challenge',
    seriesId: 'seasonal',
    title: 'Beach Explorer',
    subtitle: '8 San Diego & OC beaches · Jun 1 – Aug 31',
    description:
      'Hit real dog beaches near you — Dog Beach OB, Fiesta Island, Coronado, Del Mar, and more.',
    accent: 'coastal',
    emoji: '🏖️',
    heroImageUrl: SAMPLE_IMAGES.coastal,
    duration: {
      kind: 'seasonal',
      label: 'Jun 1 – Aug 31',
      startMonth: 6,
      startDay: 1,
      endMonth: 8,
      endDay: 31,
    },
    metric: { kind: 'beach_adventures', target: 8 },
    nodes: SUMMER_BEACH_NODES,
  },
  {
    id: '30-walk-challenge',
    seriesId: 'fitness',
    title: 'Trail & Neighborhood Challenge',
    subtitle: '30 outings · 90 days from join',
    description:
      'Real local trails, parks, and patios when we know your area — neighborhood walk goals when we do not.',
    accent: 'warm',
    emoji: '🚶',
    heroImageUrl: SAMPLE_IMAGES.neighborhood,
    duration: {
      kind: 'rolling',
      label: '90 days from join',
      days: 90,
    },
    metric: { kind: 'total_adventures', target: 30 },
    nodes: THIRTY_WALK_NODES,
  },
  {
    id: 'holiday-adventure-challenge',
    seriesId: 'seasonal',
    title: 'Holiday Adventure Challenge',
    subtitle: '12 outings · Dec 1 – Jan 5',
    description:
      'Celebrate the season with festive walks and winter outings — wherever the holidays find you.',
    accent: 'festive',
    emoji: '🎄',
    heroImageUrl: SAMPLE_IMAGES.park,
    duration: {
      kind: 'seasonal',
      label: 'Dec 1 – Jan 5',
      startMonth: 12,
      startDay: 1,
      endMonth: 1,
      endDay: 5,
    },
    metric: { kind: 'holiday_adventures', target: 12 },
    nodes: HOLIDAY_NODES,
  },
  {
    id: 'local-explorer-challenge',
    seriesId: 'discovery',
    title: 'Local Explorer',
    subtitle: '10 new places · 60 days from join',
    description:
      'Discover ten distinct dog-friendly spots near you — beaches, trails, coffee patios, dog parks, and parks.',
    accent: 'forest',
    emoji: '🧭',
    heroImageUrl: SAMPLE_IMAGES.trail,
    duration: {
      kind: 'rolling',
      label: '60 days from join',
      days: 60,
    },
    metric: { kind: 'distinct_places', target: 10 },
    nodes: LOCAL_EXPLORER_NODES,
  },
]

export function getChallengeSeriesById(seriesId: string): ChallengeSeries | undefined {
  return CHALLENGE_SERIES.find((series) => series.id === seriesId)
}

export function getChallengeById(challengeId: string): Challenge | undefined {
  return CURATED_CHALLENGES.find((challenge) => challenge.id === challengeId)
}

export function isCuratedChallengeId(challengeId: string): boolean {
  return CURATED_CHALLENGES.some((challenge) => challenge.id === challengeId)
}

export function getChallengesForSeries(seriesId: string): Challenge[] {
  return CURATED_CHALLENGES.filter((challenge) => challenge.seriesId === seriesId)
}
