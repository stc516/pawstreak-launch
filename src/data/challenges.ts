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
    subtitle: '6 beach goals · SD/OC',
    description: 'Earn this through real beach adventures in supported local markets.',
    goal: 'Complete 6 beach goals.',
    whatCounts: 'Completed adventures at Beach category places.',
    actionCta: 'Plan a beach outing',
    rewardConnection: 'Helps unlock Beach Regular.',
    availability: 'local',
    accent: 'coastal',
    emoji: '🏖️',
    heroImageUrl: SAMPLE_IMAGES.beach,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'beach_adventures', target: 6 },
    nodes: makeNodes('beach-explorer', 6, 6, (step) => [
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
    subtitle: '6 trail goals · SD/OC',
    description: 'Build a real trail habit with local trail cards.',
    goal: 'Complete 6 trail goals.',
    whatCounts: 'Completed adventures at Trail category places.',
    actionCta: 'Plan a trail',
    rewardConnection: 'Helps unlock Trail Dog.',
    availability: 'local',
    accent: 'forest',
    emoji: '🌲',
    heroImageUrl: SAMPLE_IMAGES.trail,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'trail_adventures', target: 6 },
    nodes: makeNodes('trail-scout', 6, 6, (step) => [
      'Pick a trail or park walk',
      'Complete a 20-minute sniff walk',
      'Save one trail photo',
      'Try a new route',
      'Add a trail memory',
      'Finish Trail Scout',
    ][step - 1] ?? `Trail outing ${step}`, 'Log a completed trail adventure.', SAMPLE_IMAGES.trail, 'Pick a local trail on Plan.'),
  },
  {
    id: 'dog-park-tour',
    seriesId: 'local',
    title: 'Dog Park Tour',
    subtitle: '6 dog park goals · SD/OC',
    description: 'Practice social energy through real dog park visits.',
    goal: 'Complete 6 dog park goals.',
    whatCounts: 'Completed adventures at Dog Park category places.',
    actionCta: 'Plan a dog park visit',
    rewardConnection: 'Helps unlock Patio Pup.',
    availability: 'local',
    accent: 'forest',
    emoji: '🐕',
    heroImageUrl: SAMPLE_IMAGES.dogPark,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'dog_park_adventures', target: 6 },
    nodes: makeNodes('dog-park-tour', 6, 6, (step) => [
      'Choose a dog park',
      'Visit during a calm window',
      'Practice one check-in',
      'Try a second dog park',
      'Save a social memory',
      'Finish Dog Park Tour',
    ][step - 1] ?? `Dog park visit ${step}`, 'Log a completed dog park adventure.', SAMPLE_IMAGES.dogPark, 'Choose a local dog park on Plan.'),
  },
  {
    id: 'patio-pup',
    seriesId: 'local',
    title: 'Patio Pup',
    subtitle: '6 patio goals · SD/OC',
    description: 'Practice calm hangs at dog-friendly patios.',
    goal: 'Complete 6 patio goals.',
    whatCounts: 'Completed adventures at Patio or Restaurant places.',
    actionCta: 'Plan a patio stop',
    rewardConnection: 'Builds toward Patio Pup and Outing Ready.',
    availability: 'local',
    accent: 'warm',
    emoji: '🍽️',
    heroImageUrl: SAMPLE_IMAGES.patio,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'patio_adventures', target: 6 },
    nodes: makeNodes('patio-pup', 6, 6, (step) => [
      'Pick a calm patio',
      'Practice a 5-minute settle',
      'Save one patio note',
      'Try a quieter time',
      'Complete a second patio outing',
      'Finish Patio Pup',
    ][step - 1] ?? `Patio outing ${step}`, 'Log a completed patio or restaurant adventure.', SAMPLE_IMAGES.patio, 'Pick a calm patio on Plan.'),
  },
  {
    id: 'brewery-buddy',
    seriesId: 'local',
    title: 'Brewery Buddy',
    subtitle: '6 brewery goals · SD/OC',
    description: 'Visit real dog-friendly taprooms without fake stock imagery.',
    goal: 'Complete 6 brewery goals.',
    whatCounts: 'Completed adventures at Brewery category places.',
    actionCta: 'Plan a brewery patio',
    rewardConnection: 'Builds toward Routine Breaker and Patio Pup.',
    availability: 'local',
    accent: 'warm',
    emoji: '🍺',
    heroImageUrl: SAMPLE_IMAGES.brewery,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'brewery_adventures', target: 6 },
    nodes: makeNodes('brewery-buddy', 6, 6, (step) => [
      'Pick a dog-friendly brewery',
      'Choose patio seating',
      'Practice a calm settle',
      'Save a brewery memory',
      'Visit a second taproom',
      'Finish Brewery Buddy',
    ][step - 1] ?? `Brewery outing ${step}`, 'Log a completed brewery adventure.', SAMPLE_IMAGES.brewery, 'Pick a brewery card on Plan.'),
  },
  {
    id: 'first-walk-week',
    seriesId: 'everywhere',
    title: 'First Adventure Month',
    subtitle: '6 easy outings · anywhere',
    description: 'Six easy outings to break the same-walk routine.',
    goal: 'Complete 6 easy outings.',
    whatCounts: 'Quick Walks and Neighborhood Walk adventures.',
    actionCta: 'Start a walk',
    rewardConnection: 'Helps unlock Good Week Given.',
    availability: 'generic',
    accent: 'warm',
    emoji: '🏘️',
    heroImageUrl: SAMPLE_IMAGES.neighborhood,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'neighborhood_walks', target: 6 },
    nodes: makeNodes('first-walk-week', 6, 6, (step) => [
      'Start a 10-minute walk',
      'Let your dog pick one turn',
      'Save one walk note',
      'Repeat once this week',
      'Finish a third walk',
      'Complete First Adventure Month',
    ][step - 1] ?? `Walk ${step}`, 'Complete a neighborhood walk.', SAMPLE_IMAGES.neighborhood, 'Start Quick Walk from Home.'),
  },
  {
    id: 'sniffari-streak',
    seriesId: 'everywhere',
    title: 'Sniffari Streak',
    subtitle: '6 sniff-led outings · anywhere',
    description: 'Let the dog lead with their nose and build consistency.',
    goal: 'Complete 6 sniff-led outings.',
    whatCounts: 'Any completed PawStreak adventure.',
    actionCta: 'Plan the next outing',
    rewardConnection: 'Helps unlock First Adventure and Good Week Given.',
    availability: 'generic',
    accent: 'forest',
    emoji: '👃',
    heroImageUrl: SAMPLE_IMAGES.scenic,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'total_adventures', target: 6 },
    nodes: makeNodes('sniffari-streak', 6, 6, (step) => [
      'Let your dog choose the route',
      'Stop for 5 good smells',
      'Save one photo',
      'Add a note',
      'Repeat once this week',
      'Finish Sniffari Streak',
    ][step - 1] ?? `Sniffari ${step}`, 'Complete any outing and keep the streak alive.', SAMPLE_IMAGES.scenic, 'Pick a generic adventure idea.'),
  },
  {
    id: 'memory-maker-challenge',
    seriesId: 'everywhere',
    title: 'Memory Keeper',
    subtitle: '6 memory goals · anywhere',
    description: 'Make the month feel real with captured moments.',
    goal: 'Save 6 photo memories.',
    whatCounts: 'Completed adventures with saved photos.',
    actionCta: 'Finish an outing with a photo',
    rewardConnection: 'Helps unlock Memory Keeper and Adventure Album.',
    availability: 'generic',
    accent: 'warm',
    emoji: '📸',
    heroImageUrl: SAMPLE_IMAGES.scenic,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'memories_with_photo', target: 6 },
    nodes: makeNodes('memory-maker-challenge', 6, 6, (step) => [
      'Finish any outing',
      'Save one real photo',
      'Add a memory note',
      'Capture a second outing',
      'Save a third photo memory',
      'Finish Memory Keeper',
    ][step - 1] ?? `Photo memory ${step}`, 'Finish an outing and save a real photo.', SAMPLE_IMAGES.scenic, 'Add a photo at finish.'),
  },
  {
    id: 'social-confidence',
    seriesId: 'everywhere',
    title: 'Social Confidence',
    subtitle: '6 calm social goals · anywhere',
    description: 'Practice calm around people, patios, or dog-friendly spaces.',
    goal: 'Complete 6 social goals.',
    whatCounts: 'Dog park, patio, social beach, or recap tagged with new friends.',
    actionCta: 'Plan a calm social stop',
    rewardConnection: 'Helps unlock Patio Pup.',
    availability: 'generic',
    accent: 'warm',
    emoji: '🤝',
    heroImageUrl: SAMPLE_IMAGES.dogPark,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'social_adventures', target: 6 },
    nodes: makeNodes('social-confidence', 6, 6, (step) => [
      'Pick a low-pressure social spot',
      'Practice calm at the edge',
      'Reward one check-in',
      'Save a confidence note',
      'Try a second social outing',
      'Finish Social Confidence',
    ][step - 1] ?? `Social outing ${step}`, 'Complete a calm social adventure.', SAMPLE_IMAGES.dogPark, 'Try a dog park entrance or calm patio.'),
  },
  {
    id: 'new-route-challenge',
    seriesId: 'everywhere',
    title: 'New Route Challenge',
    subtitle: '6 different-route goals · anywhere',
    description: 'Break the same-loop habit with new nearby routes.',
    goal: 'Complete 6 distinct routes or place types.',
    whatCounts: 'Distinct places, custom adventure titles, or different categories.',
    actionCta: 'Try a new route',
    rewardConnection: 'Helps unlock Routine Breaker.',
    availability: 'generic',
    accent: 'forest',
    emoji: '🧭',
    heroImageUrl: SAMPLE_IMAGES.roadTrip,
    duration: { kind: 'rolling', label: '30 days from join', days: 30 },
    metric: { kind: 'distinct_routes', target: 6 },
    nodes: makeNodes('new-route-challenge', 6, 6, (step) => [
      'Pick a route you do not usually take',
      'Complete the first new loop',
      'Save what felt different',
      'Try a second new route',
      'Add a third distinct place',
      'Finish New Route Challenge',
    ][step - 1] ?? `New route ${step}`, 'Complete a new route or place type.', SAMPLE_IMAGES.roadTrip, 'Use Type a Plan or Add Adventure.'),
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
