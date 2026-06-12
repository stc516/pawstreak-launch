import { SAMPLE_IMAGES } from './sampleImages'

export type ChallengeAccent = 'coastal' | 'forest' | 'warm' | 'festive'

export type ChallengeMetricKind =
  | 'beach_adventures'
  | 'trail_adventures'
  | 'dog_park_adventures'
  | 'patio_adventures'
  | 'brewery_adventures'
  | 'total_adventures'
  | 'neighborhood_walks'
  | 'memories_with_photo'
  | 'social_adventures'
  | 'distinct_routes'

export type ChallengeAvailability = 'local' | 'generic'

export type ChallengeDuration = {
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
  threshold: number
  planHint: string
}

export interface Challenge {
  id: string
  seriesId: string
  title: string
  subtitle: string
  description: string
  goal: string
  whatCounts: string
  actionCta: string
  rewardConnection: string
  availability: ChallengeAvailability
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
    id: 'local',
    title: 'Local',
    description: 'Curated SD/OC challenge paths when local coverage exists.',
    emoji: '📍',
  },
  {
    id: 'everywhere',
    title: 'Anywhere',
    description: 'Flexible goals that work without curated local places.',
    emoji: '🐾',
  },
]

function makeNodes(
  challengeId: string,
  count: number,
  metricTarget: number,
  titleFor: (step: number) => string,
  description: string,
  imageUrl: string,
  planHint: string,
): ChallengeNode[] {
  return Array.from({ length: count }, (_, index) => {
    const order = index + 1
    const threshold = Math.max(1, Math.ceil((order / count) * metricTarget))
    return {
      id: `${challengeId}-${order}`,
      order,
      title: titleFor(order),
      description,
      imageUrl,
      threshold,
      planHint,
    }
  })
}

export const CURATED_CHALLENGES: Challenge[] = [
  {
    id: 'beach-explorer',
    seriesId: 'local',
    title: 'Beach Explorer',
    subtitle: '3 beach outings · SD/OC',
    description: 'Earn this through real beach adventures in supported local markets.',
    goal: 'Complete 3 beach outings.',
    whatCounts: 'Completed adventures at Beach category places.',
    actionCta: 'Plan a beach outing',
    rewardConnection: 'Helps unlock Beach Dog.',
    availability: 'local',
    accent: 'coastal',
    emoji: '🏖️',
    heroImageUrl: SAMPLE_IMAGES.beach,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'beach_adventures', target: 3 },
    nodes: makeNodes('beach-explorer', 6, 3, (step) => [
      'Visit a dog-friendly beach',
      'Save one beach photo',
      'Try a lower-crowd beach',
      'Complete a sunset beach walk',
      'Visit a second beach',
      'Finish Beach Explorer',
    ][step - 1] ?? `Beach step ${step}`, 'Log a completed dog-friendly beach adventure.', SAMPLE_IMAGES.beach, 'Choose a local beach on Plan.'),
  },
  {
    id: 'trail-scout',
    seriesId: 'local',
    title: 'Trail Scout',
    subtitle: '3 trail outings · SD/OC',
    description: 'Build a real trail habit with local trail cards.',
    goal: 'Complete 3 trail outings.',
    whatCounts: 'Completed adventures at Trail category places.',
    actionCta: 'Plan a trail',
    rewardConnection: 'Helps unlock Trail Dog.',
    availability: 'local',
    accent: 'forest',
    emoji: '🌲',
    heroImageUrl: SAMPLE_IMAGES.trail,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'trail_adventures', target: 3 },
    nodes: makeNodes('trail-scout', 6, 3, (step) => `Trail step ${step}`, 'Log a completed trail adventure.', SAMPLE_IMAGES.trail, 'Pick a local trail on Plan.'),
  },
  {
    id: 'dog-park-tour',
    seriesId: 'local',
    title: 'Dog Park Tour',
    subtitle: '3 dog park outings · SD/OC',
    description: 'Practice social energy through real dog park visits.',
    goal: 'Complete 3 dog park outings.',
    whatCounts: 'Completed adventures at Dog Park category places.',
    actionCta: 'Plan a dog park visit',
    rewardConnection: 'Helps unlock Social Pup.',
    availability: 'local',
    accent: 'forest',
    emoji: '🐕',
    heroImageUrl: SAMPLE_IMAGES.dogPark,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'dog_park_adventures', target: 3 },
    nodes: makeNodes('dog-park-tour', 6, 3, (step) => `Dog park step ${step}`, 'Log a completed dog park adventure.', SAMPLE_IMAGES.dogPark, 'Choose a local dog park on Plan.'),
  },
  {
    id: 'patio-pup',
    seriesId: 'local',
    title: 'Patio Pup',
    subtitle: '2 patio outings · SD/OC',
    description: 'Practice calm hangs at dog-friendly patios.',
    goal: 'Complete 2 patio outings.',
    whatCounts: 'Completed adventures at Patio or Restaurant places.',
    actionCta: 'Plan a patio stop',
    rewardConnection: 'Builds toward Social Pup and Training Buddy.',
    availability: 'local',
    accent: 'warm',
    emoji: '🍽️',
    heroImageUrl: SAMPLE_IMAGES.patio,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'patio_adventures', target: 2 },
    nodes: makeNodes('patio-pup', 6, 2, (step) => `Patio step ${step}`, 'Log a completed patio or restaurant adventure.', SAMPLE_IMAGES.patio, 'Pick a calm patio on Plan.'),
  },
  {
    id: 'brewery-buddy',
    seriesId: 'local',
    title: 'Brewery Buddy',
    subtitle: '2 brewery outings · SD/OC',
    description: 'Visit real dog-friendly taprooms without fake stock imagery.',
    goal: 'Complete 2 brewery outings.',
    whatCounts: 'Completed adventures at Brewery category places.',
    actionCta: 'Plan a brewery patio',
    rewardConnection: 'Builds toward Explorer and Social Pup.',
    availability: 'local',
    accent: 'warm',
    emoji: '🍺',
    heroImageUrl: SAMPLE_IMAGES.brewery,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'brewery_adventures', target: 2 },
    nodes: makeNodes('brewery-buddy', 6, 2, (step) => `Brewery step ${step}`, 'Log a completed brewery adventure.', SAMPLE_IMAGES.brewery, 'Pick a brewery card on Plan.'),
  },
  {
    id: 'first-walk-week',
    seriesId: 'everywhere',
    title: 'First Walk Week',
    subtitle: '3 walks · anywhere',
    description: 'A simple first week goal for any location.',
    goal: 'Complete 3 neighborhood walks.',
    whatCounts: 'Quick Walks and Neighborhood Walk adventures.',
    actionCta: 'Start a walk',
    rewardConnection: 'Helps unlock Week Streak.',
    availability: 'generic',
    accent: 'warm',
    emoji: '🏘️',
    heroImageUrl: SAMPLE_IMAGES.neighborhood,
    duration: { kind: 'rolling', label: '7 days from join', days: 7 },
    metric: { kind: 'neighborhood_walks', target: 3 },
    nodes: makeNodes('first-walk-week', 6, 3, (step) => `Walk step ${step}`, 'Complete a neighborhood walk.', SAMPLE_IMAGES.neighborhood, 'Start Quick Walk from Home.'),
  },
  {
    id: 'sniffari-streak',
    seriesId: 'everywhere',
    title: 'Sniffari Streak',
    subtitle: '5 outings · anywhere',
    description: 'Let the dog lead with their nose and build consistency.',
    goal: 'Complete 5 outings.',
    whatCounts: 'Any completed PawStreak adventure.',
    actionCta: 'Plan the next outing',
    rewardConnection: 'Helps unlock First Adventure and Week Streak.',
    availability: 'generic',
    accent: 'forest',
    emoji: '👃',
    heroImageUrl: SAMPLE_IMAGES.scenic,
    duration: { kind: 'rolling', label: '14 days from join', days: 14 },
    metric: { kind: 'total_adventures', target: 5 },
    nodes: makeNodes('sniffari-streak', 6, 5, (step) => `Sniffari step ${step}`, 'Complete any outing and keep the streak alive.', SAMPLE_IMAGES.scenic, 'Pick a generic adventure idea.'),
  },
  {
    id: 'memory-maker-challenge',
    seriesId: 'everywhere',
    title: 'Memory Maker',
    subtitle: '3 photo memories · anywhere',
    description: 'Make the month feel real with captured moments.',
    goal: 'Save 3 photo memories.',
    whatCounts: 'Completed adventures with saved photos.',
    actionCta: 'Finish an outing with a photo',
    rewardConnection: 'Helps unlock First Memory and Memory Maker.',
    availability: 'generic',
    accent: 'warm',
    emoji: '📸',
    heroImageUrl: SAMPLE_IMAGES.scenic,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'memories_with_photo', target: 3 },
    nodes: makeNodes('memory-maker-challenge', 6, 3, (step) => `Photo memory step ${step}`, 'Finish an outing and save a real photo.', SAMPLE_IMAGES.scenic, 'Add a photo at finish.'),
  },
  {
    id: 'social-confidence',
    seriesId: 'everywhere',
    title: 'Social Confidence',
    subtitle: '2 calm social outings · anywhere',
    description: 'Practice calm around people, patios, or dog-friendly spaces.',
    goal: 'Complete 2 social outings.',
    whatCounts: 'Dog park, patio, social beach, or recap tagged with new friends.',
    actionCta: 'Plan a calm social stop',
    rewardConnection: 'Helps unlock Social Pup.',
    availability: 'generic',
    accent: 'warm',
    emoji: '🤝',
    heroImageUrl: SAMPLE_IMAGES.dogPark,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'social_adventures', target: 2 },
    nodes: makeNodes('social-confidence', 6, 2, (step) => `Social step ${step}`, 'Complete a calm social adventure.', SAMPLE_IMAGES.dogPark, 'Try a dog park entrance or calm patio.'),
  },
  {
    id: 'new-route-challenge',
    seriesId: 'everywhere',
    title: 'New Route Challenge',
    subtitle: '3 different routes · anywhere',
    description: 'Break the same-loop habit with new nearby routes.',
    goal: 'Complete 3 distinct routes or place types.',
    whatCounts: 'Distinct places, custom adventure titles, or different categories.',
    actionCta: 'Try a new route',
    rewardConnection: 'Helps unlock Explorer.',
    availability: 'generic',
    accent: 'forest',
    emoji: '🧭',
    heroImageUrl: SAMPLE_IMAGES.roadTrip,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'distinct_routes', target: 3 },
    nodes: makeNodes('new-route-challenge', 6, 3, (step) => `New route step ${step}`, 'Complete a new route or place type.', SAMPLE_IMAGES.roadTrip, 'Use Type a Plan or Add Adventure.'),
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
