import type { Achievement } from '../data/achievements'
import type { AppState, JourneyEntry } from '../data/demo'
import type { Challenge } from '../data/challenges'
import { getChallengeById } from '../data/challenges'
import { resolveChallenge } from './challengeEngine'
import { getPackDisplayName } from './dogLabels'
import { getPlaceById, isNeighborhoodWalkPlace } from '../data/places'
import { getJourneyEntryDisplayImageUrl } from './adventureDisplayImage'
import { getPlanNearbyPlaces } from './planDiscovery'
import { getRecommendationPrefs } from './onboardingProfile'
import type { ShareCardData } from '../types/shareCards'

export type ShareCardRequest =
  | { kind: 'adventure-complete'; entryId?: string }
  | { kind: 'monthly-recap' }
  | { kind: 'challenge-progress'; challengeId: string }
  | { kind: 'achievement-unlocked'; achievementId: string }
  | { kind: 'plan-next' }
  | { kind: 'founder-demo' }

function dogNamesForShare(state: AppState): string {
  return state.dogs.length > 0 ? getPackDisplayName(state.dogs) : 'Bailey + Omi'
}

function latestEntry(state: AppState): JourneyEntry | undefined {
  return state.journeyEntries[0]
}

function categoryCounts(state: AppState): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  state.journeyEntries.forEach((entry) => {
    const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
    const label = place?.category ?? entry.tags[0] ?? 'Adventure'
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
}

function buildAdventureCompleteCard(
  state: AppState,
  entry = latestEntry(state),
): ShareCardData {
  const place = entry?.placeId ? getPlaceById(entry.placeId) : undefined
  const imageUrl = entry
    ? getJourneyEntryDisplayImageUrl(state.journeyEntries, entry) ?? place?.imageUrl
    : undefined
  const category = entry && isNeighborhoodWalkPlace(entry.placeId)
    ? 'Quick walk'
    : place?.category ?? entry?.tags[0] ?? 'Adventure'
  const photoCount = entry?.photoUrls?.filter(Boolean).length ?? 0

  return {
    kind: 'adventure-complete',
    eyebrow: 'Adventure complete',
    title: entry?.place ?? 'A better dog day',
    subtitle: `${dogNamesForShare(state)} got a real outing worth remembering.`,
    dogNames: dogNamesForShare(state),
    cta: 'Your dog deserves more than the same old walk.',
    brandLine: 'PawStreak',
    imageUrl,
    category,
    location: entry?.place ?? place?.name ?? 'Dog-friendly adventure',
    duration: entry?.durationLabel ?? 'Open end',
    distance: place?.distanceLabel,
    photoCount,
    progressLabel: 'Memory saved to Journey',
    progressPercent: 100,
    metrics: [
      { label: 'Type', value: category },
      { label: 'Duration', value: entry?.durationLabel ?? 'Saved' },
      { label: 'Photos', value: `${photoCount}` },
    ],
  }
}

function buildMonthlyRecapCard(state: AppState): ShareCardData {
  const counts = categoryCounts(state)
  const entry = latestEntry(state)
  const imageUrl = entry
    ? getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
    : undefined
  const favorite = entry?.place ?? 'First saved adventure'

  return {
    kind: 'monthly-recap',
    eyebrow: `This month with ${dogNamesForShare(state)}`,
    title: `${state.journeyEntries.length || state.adventureCount} adventures saved`,
    subtitle: `New places, shared days, and memories with ${dogNamesForShare(state)}.`,
    dogNames: dogNamesForShare(state),
    cta: 'Save the life you are giving them.',
    brandLine: 'PawStreak',
    imageUrl,
    location: favorite,
    metrics: [
      { label: 'Adventures', value: `${state.journeyEntries.length || state.adventureCount}` },
      { label: 'New places', value: `${state.placeCount}` },
      { label: 'Streak', value: `${state.streak} days` },
    ],
    slots: counts.slice(0, 4).map((item) => ({
      label: `${item.count} ${item.label.toLowerCase()}`,
      status: 'done',
    })),
  }
}

function buildChallengeCard(state: AppState, challenge: Challenge): ShareCardData {
  const resolved = resolveChallenge(challenge, state)
  const percent = resolved.progress.percentComplete
  const nodes = resolved.nodes

  return {
    kind: 'challenge-progress',
    eyebrow: 'Challenge progress',
    title: challenge.title,
    subtitle: challenge.description,
    dogNames: dogNamesForShare(state),
    cta: 'Complete adventures with your dog.',
    brandLine: 'PawStreak',
    imageUrl: challenge.heroImageUrl,
    badgeEmoji: challenge.emoji,
    progressLabel: `${resolved.progress.metricValue}/${resolved.progress.metricTarget}`,
    progressPercent: percent,
    metrics: [
      { label: 'Progress', value: `${resolved.progress.metricValue}/${resolved.progress.metricTarget}` },
      { label: 'Goal', value: challenge.goal.replace(/\.$/, '') },
    ],
    slots: nodes.slice(0, 6).map((node) => ({
      label: node.title,
      status:
        node.state === 'completed'
          ? 'done'
          : node.state === 'current'
            ? 'next'
            : 'open',
    })),
  }
}

function buildAchievementCard(state: AppState, achievement: Achievement): ShareCardData {
  return {
    kind: 'achievement-unlocked',
    eyebrow: achievement.status === 'done' ? 'Achievement unlocked' : 'Reward progress',
    title: achievement.title,
    subtitle: achievement.personalityLine,
    dogNames: dogNamesForShare(state),
    cta: 'Save the life you’re giving them.',
    brandLine: 'PawStreak',
    imageUrl: achievement.badgeImageUrl,
    badgeImageUrl: achievement.badgeImageUrl,
    badgeEmoji: achievement.emoji,
    dateLabel: achievement.progress.unlockedAt
      ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
          Date.parse(achievement.progress.unlockedAt),
        )
      : 'In progress',
    progressLabel: `${achievement.progress.current}/${achievement.progress.target}`,
    progressPercent: Math.min(
      100,
      Math.round((achievement.progress.current / achievement.progress.target) * 100),
    ),
    metrics: [
      { label: 'Dogs', value: dogNamesForShare(state) },
      { label: 'Status', value: achievement.status === 'done' ? 'Unlocked' : 'In progress' },
    ],
  }
}

function buildPlanCard(state: AppState): ShareCardData {
  const prefs = getRecommendationPrefs(state)
  const spots = getPlanNearbyPlaces(state.selectedPlanCategoryId, '15min', prefs, state).slice(0, 3)

  return {
    kind: 'plan-next',
    eyebrow: 'Plan your next adventure',
    title: `Dog-friendly spots near ${state.locationLabel || state.zipCode || 'you'}`,
    subtitle: `A better day for ${dogNamesForShare(state)} starts with one good place.`,
    dogNames: dogNamesForShare(state),
    cta: 'Find your next dog-friendly adventure.',
    brandLine: 'PawStreak',
    imageUrl: spots[0]?.imageUrl,
    metrics: [
      { label: 'Nearby spots', value: `${spots.length}` },
      { label: 'Categories', value: state.planCategories.slice(1, 4).map((item) => item.label).join(', ') },
    ],
    spots: spots.map((place) => ({
      name: place.name,
      meta: `${place.distanceLabel} · ${place.leashInfo}`,
      category: place.category,
      imageUrl: place.imageUrl,
    })),
  }
}

function buildFounderDemoCard(state: AppState): ShareCardData {
  const plan = buildPlanCard(state)
  return {
    ...plan,
    kind: 'founder-demo',
    eyebrow: 'Founder demo mode',
    title: 'PawStreak helps dog parents give better days',
    subtitle: 'Plan dog-friendly adventures, save memories, and see progress grow.',
    dogNames: 'Bailey + Omi',
    cta: 'Your dog deserves more than the same old walk.',
  }
}

export function buildShareCardData(
  state: AppState,
  request: ShareCardRequest,
): ShareCardData | null {
  if (request.kind === 'adventure-complete') {
    const entry = request.entryId
      ? state.journeyEntries.find((item) => item.id === request.entryId)
      : latestEntry(state)
    return buildAdventureCompleteCard(state, entry)
  }
  if (request.kind === 'monthly-recap') return buildMonthlyRecapCard(state)
  if (request.kind === 'challenge-progress') {
    const challenge = getChallengeById(request.challengeId)
    return challenge ? buildChallengeCard(state, challenge) : null
  }
  if (request.kind === 'achievement-unlocked') {
    const achievement = state.achievements.find((item) => item.id === request.achievementId)
    return achievement ? buildAchievementCard(state, achievement) : null
  }
  if (request.kind === 'plan-next') return buildPlanCard(state)
  if (request.kind === 'founder-demo') return buildFounderDemoCard(state)
  return null
}

export function buildChallengeShareCardData(
  state: AppState,
  challenge: Challenge,
): ShareCardData {
  return buildChallengeCard(state, challenge)
}
