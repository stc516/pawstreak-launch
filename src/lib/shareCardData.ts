import type { Achievement } from '../data/achievements'
import type { AppState, JourneyEntry } from '../data/demo'
import type { Challenge } from '../data/challenges'
import { getChallengeById } from '../data/challenges'
import { resolveChallenge } from './challengeEngine'
import { getPackDisplayName } from './dogLabels'
import { getPlaceById, isNeighborhoodWalkPlace } from '../data/places'
import { getPlanNearbyPlaces } from './planDiscovery'
import { getRecommendationPrefs } from './onboardingProfile'
import type { ShareCardData } from '../types/shareCards'
import { authenticPhotoUrls } from './authenticImages'
import { getDistinctPlaceKey } from './customAdventure'

export type ShareCardRequest =
  | { kind: 'adventure-complete'; entryId?: string }
  | { kind: 'monthly-recap' }
  | { kind: 'challenge-progress'; challengeId: string }
  | { kind: 'achievement-unlocked'; achievementId: string }
  | { kind: 'plan-next' }
  | { kind: 'founder-demo' }

function dogNamesForShare(state: AppState): string {
  return state.dogs.length > 0 ? getPackDisplayName(state.dogs) : 'Your dog'
}

function latestEntry(state: AppState): JourneyEntry | undefined {
  return state.journeyEntries[0]
}

function categoryCounts(entries: JourneyEntry[]): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  entries.forEach((entry) => {
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
  const imageUrl = authenticPhotoUrls(entry?.photoUrls)[0]
  const category = entry && isNeighborhoodWalkPlace(entry.placeId)
    ? 'Quick walk'
    : place?.category ?? entry?.tags[0] ?? 'Adventure'
  const photoCount = authenticPhotoUrls(entry?.photoUrls).length

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

// Relative labels like "Today" can remain in saved memories after midnight.
// Only use a persisted timestamp or an explicitly dated legacy entry in recaps.
function getMemoryCalendarDate(entry: JourneyEntry): Date | null {
  if (entry.occurredAt) {
    const occurredAt = new Date(entry.occurredAt)
    if (!Number.isNaN(occurredAt.getTime())) return occurredAt
  }

  const label = entry.date.trim()
  if (!/\b(?:19|20)\d{2}\b/.test(label)) return null

  // Date-only ISO strings are parsed as UTC by JavaScript, which can move
  // November 1 into October for dogs in Pacific and other western time zones.
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label)
  if (isoDate) {
    const year = Number(isoDate[1])
    const month = Number(isoDate[2])
    const day = Number(isoDate[3])
    const localDate = new Date(year, month - 1, day, 12)
    return localDate.getFullYear() === year &&
      localDate.getMonth() === month - 1 &&
      localDate.getDate() === day
      ? localDate
      : null
  }

  const dated = new Date(label)
  return Number.isNaN(dated.getTime()) ? null : dated
}

export function getCurrentMonthJourneyEntries(
  entries: JourneyEntry[],
  now: Date = new Date(),
): JourneyEntry[] {
  return entries.filter((entry) => {
    const date = getMemoryCalendarDate(entry)
    return date !== null &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
  })
}

function buildMonthlyRecapCard(state: AppState): ShareCardData {
  const entries = getCurrentMonthJourneyEntries(state.journeyEntries)
  const counts = categoryCounts(entries)
  const latest = [...entries].sort(
    (left, right) => (getMemoryCalendarDate(right)?.getTime() ?? 0) -
      (getMemoryCalendarDate(left)?.getTime() ?? 0),
  )[0]
  const imageUrl = authenticPhotoUrls(latest?.photoUrls)[0]
  const placesVisited = new Set(entries.map(getDistinctPlaceKey)).size
  const photosSaved = entries.reduce(
    (count, entry) => count + authenticPhotoUrls(entry.photoUrls).length,
    0,
  )
  const dogNames = dogNamesForShare(state)

  return {
    kind: 'monthly-recap',
    eyebrow: `This month with ${dogNames}`,
    title: `${entries.length} ${entries.length === 1 ? 'adventure' : 'adventures'} this month`,
    subtitle: entries.length
      ? `Real outings and memories saved with ${dogNames} this month.`
      : 'No adventures saved this month yet. Your next dog day is waiting.',
    dogNames,
    cta: 'Save the life you are giving them.',
    brandLine: 'PawStreak',
    imageUrl,
    location: latest?.place ?? 'Your next adventure',
    metrics: [
      { label: 'Adventures', value: `${entries.length}` },
      { label: 'Places visited', value: `${placesVisited}` },
      { label: 'Photos saved', value: `${photosSaved}` },
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
