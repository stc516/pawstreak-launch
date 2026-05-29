import type { AppState, JourneyEntry } from '../data/demo'
import type {
  Challenge,
  ChallengeNode,
  JoinedChallengeRecord,
} from '../data/challenges'
import {
  CURATED_CHALLENGES,
  getChallengeById,
  isCuratedChallengeId,
} from '../data/challenges'
import { NEIGHBORHOOD_WALK_PLACE_ID, getPlaceById } from '../data/places'
import { DEMO_SEEDED_JOURNEY_ENTRY_IDS } from './productionState'

export type ChallengeNodeState = 'completed' | 'current' | 'locked'

export interface ChallengeProgress {
  challengeId: string
  joined: boolean
  joinedAt?: string
  metricValue: number
  metricTarget: number
  completedNodes: number
  totalNodes: number
  percentComplete: number
  fillWidth: string
  completedAt?: string
  durationLabel: string
  isActiveWindow: boolean
}

export interface ChallengeLeaderboardEntry {
  participantId: string
  displayName: string
  score: number
  rank: number
  avatarInitial: string
}

/** Leaderboard-ready snapshot — replace entries with API data later. */
export interface ChallengeLeaderboardSnapshot {
  challengeId: string
  leaderboardKey: string
  updatedAt: string
  entries: ChallengeLeaderboardEntry[]
}

export interface ResolvedChallengeNode extends ChallengeNode {
  state: ChallengeNodeState
  statusLabel: string
  journeyEntry?: JourneyEntry
  /** Alias for UI components expecting `name`. */
  name: string
}

export interface ResolvedChallenge extends Challenge {
  progress: ChallengeProgress
  leaderboard: ChallengeLeaderboardSnapshot
  nodes: ResolvedChallengeNode[]
}

function parseEntryTimestamp(entry: JourneyEntry): number {
  if (entry.occurredAt) {
    const parsed = Date.parse(entry.occurredAt)
    if (!Number.isNaN(parsed)) return parsed
  }

  const normalized = entry.date.trim().toLowerCase()
  if (normalized === 'today') return Date.now()
  if (normalized === 'yesterday') return Date.now() - 86_400_000

  const parsed = Date.parse(entry.date)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

function getChallengeEntries(state: AppState): JourneyEntry[] {
  const entries =
    state.mode === 'demo'
      ? state.journeyEntries
      : state.journeyEntries.filter(
          (entry) => !DEMO_SEEDED_JOURNEY_ENTRY_IDS.has(entry.id),
        )

  return [...entries].sort(
    (left, right) => parseEntryTimestamp(left) - parseEntryTimestamp(right),
  )
}

function isBeachEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) return entry.tags.some((tag) => tag.toLowerCase().includes('beach'))
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Beach'
}

function isNeighborhoodEntry(entry: JourneyEntry): boolean {
  if (entry.placeId === NEIGHBORHOOD_WALK_PLACE_ID) return true
  if (!entry.placeId) {
    return entry.tags.some((tag) => tag.toLowerCase().includes('neighborhood'))
  }
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Neighborhood'
}

function isHolidayEntry(_entry: JourneyEntry, at: number): boolean {
  const month = new Date(at).getMonth() + 1
  const day = new Date(at).getDate()
  return (month === 12 && day >= 1) || (month === 1 && day <= 5)
}

function getSeasonalWindowMs(
  duration: Extract<Challenge['duration'], { kind: 'seasonal' }>,
  referenceYear: number,
): { start: number; end: number } {
  let start = new Date(referenceYear, duration.startMonth - 1, duration.startDay).getTime()
  let endYear = referenceYear
  if (duration.endMonth < duration.startMonth) {
    endYear = referenceYear + 1
  }
  const end = new Date(
    endYear,
    duration.endMonth - 1,
    duration.endDay,
    23,
    59,
    59,
    999,
  ).getTime()

  if (duration.endMonth < duration.startMonth && Date.now() < start) {
    start = new Date(referenceYear - 1, duration.startMonth - 1, duration.startDay).getTime()
  }

  return { start, end }
}

export function isChallengeWindowActive(
  challenge: Challenge,
  now = Date.now(),
): boolean {
  if (challenge.duration.kind === 'rolling') return true

  const year = new Date(now).getFullYear()
  const { start, end } = getSeasonalWindowMs(challenge.duration, year)
  if (now >= start && now <= end) return true

  if (challenge.duration.endMonth < challenge.duration.startMonth) {
    const prev = getSeasonalWindowMs(challenge.duration, year - 1)
    return now >= prev.start && now <= prev.end
  }

  return false
}

function getJoinedRecord(
  state: AppState,
  challengeId: string,
): JoinedChallengeRecord | undefined {
  return state.joinedChallenges.find((record) => record.challengeId === challengeId)
}

function entryMatchesMetric(
  challenge: Challenge,
  entry: JourneyEntry,
  joinedAt?: string,
): boolean {
  const at = parseEntryTimestamp(entry)
  if (joinedAt && at < Date.parse(joinedAt)) return false

  if (challenge.duration.kind === 'rolling') {
    if (!joinedAt) return false
    const windowEnd = Date.parse(joinedAt) + challenge.duration.days * 86_400_000
    if (at > windowEnd) return false
  } else if (joinedAt) {
    const year = new Date(at).getFullYear()
    const { start, end } = getSeasonalWindowMs(challenge.duration, year)
    if (at < start || at > end) return false
  }

  switch (challenge.metric.kind) {
    case 'beach_adventures':
      return isBeachEntry(entry)
    case 'total_adventures':
      return true
    case 'neighborhood_walks':
      return isNeighborhoodEntry(entry)
    case 'distinct_places':
      return Boolean(entry.placeId || entry.place)
    case 'holiday_adventures':
      return isHolidayEntry(entry, at)
    default:
      return false
  }
}

function countMetricMatches(
  challenge: Challenge,
  entries: JourneyEntry[],
  joinedAt?: string,
): { value: number; qualifying: JourneyEntry[] } {
  const qualifying = entries.filter((entry) =>
    entryMatchesMetric(challenge, entry, joinedAt),
  )

  if (challenge.metric.kind === 'distinct_places') {
    const seen = new Set<string>()
    const distinct: JourneyEntry[] = []
    for (const entry of qualifying) {
      const key = entry.placeId ?? entry.place
      if (seen.has(key)) continue
      seen.add(key)
      distinct.push(entry)
    }
    return { value: distinct.length, qualifying: distinct }
  }

  return { value: qualifying.length, qualifying }
}

function statusLabelForState(state: ChallengeNodeState): string {
  if (state === 'completed') return 'Completed'
  if (state === 'current') return 'Up next'
  return 'Locked'
}

export function resolveChallengeNodes(
  challenge: Challenge,
  state: AppState,
): ResolvedChallengeNode[] {
  const joined = getJoinedRecord(state, challenge.id)
  const entries = getChallengeEntries(state)
  const { value: metricValue, qualifying } = joined
    ? countMetricMatches(challenge, entries, joined.joinedAt)
    : { value: 0, qualifying: [] as JourneyEntry[] }

  let foundCurrent = false

  return challenge.nodes.map((node) => {
    const isCompleted = joined ? metricValue >= node.threshold : false
    let nodeState: ChallengeNodeState

    if (!joined) {
      nodeState = 'locked'
    } else if (isCompleted) {
      nodeState = 'completed'
    } else if (!foundCurrent) {
      nodeState = 'current'
      foundCurrent = true
    } else {
      nodeState = 'locked'
    }

    const journeyEntry = isCompleted
      ? qualifying[Math.min(node.threshold - 1, qualifying.length - 1)]
      : nodeState === 'current'
        ? qualifying[qualifying.length - 1]
        : undefined

    return {
      ...node,
      name: node.title,
      state: nodeState,
      journeyEntry,
      statusLabel: joined ? statusLabelForState(nodeState) : 'Join to start',
    }
  })
}

export function computeChallengeProgress(
  challenge: Challenge,
  state: AppState,
): ChallengeProgress {
  const joined = getJoinedRecord(state, challenge.id)
  const entries = getChallengeEntries(state)
  const { value: metricValue } = joined
    ? countMetricMatches(challenge, entries, joined.joinedAt)
    : { value: 0 }

  const nodes = resolveChallengeNodes(challenge, state)
  const completedNodes = nodes.filter((node) => node.state === 'completed').length
  const totalNodes = nodes.length
  const percentComplete =
    challenge.metric.target === 0
      ? 0
      : Math.min(100, Math.round((metricValue / challenge.metric.target) * 100))

  const durationLabel =
    challenge.duration.kind === 'seasonal'
      ? challenge.duration.label
      : joined
        ? `${challenge.duration.label} · joined ${new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
          }).format(Date.parse(joined.joinedAt))}`
        : challenge.duration.label

  return {
    challengeId: challenge.id,
    joined: Boolean(joined),
    joinedAt: joined?.joinedAt,
    metricValue,
    metricTarget: challenge.metric.target,
    completedNodes,
    totalNodes,
    percentComplete,
    fillWidth: `${percentComplete}%`,
    completedAt:
      joined && metricValue >= challenge.metric.target ? joined.joinedAt : undefined,
    durationLabel,
    isActiveWindow: isChallengeWindowActive(challenge),
  }
}

const LEADERBOARD_NAMES = [
  'Bailey & Omi',
  'Mochi pack',
  'Luna + Rex',
  'The Barkleys',
  'River city pups',
  'Coastal crew',
  'Trail twins',
  'Maple & Moose',
]

function hashSeed(input: string): number {
  return input.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

export function buildChallengeLeaderboard(
  challenge: Challenge,
  userScore: number,
  userLabel: string,
): ChallengeLeaderboardSnapshot {
  const seed = hashSeed(challenge.leaderboardKey)
  const entries: ChallengeLeaderboardEntry[] = LEADERBOARD_NAMES.map((displayName, index) => ({
    participantId: `${challenge.leaderboardKey}:${index}`,
    displayName,
    score: Math.max(1, challenge.metric.target - index + (seed % 4)),
    rank: index + 1,
    avatarInitial: displayName.charAt(0).toUpperCase(),
  }))

  if (userScore > 0) {
    entries.push({
      participantId: 'local-user',
      displayName: userLabel,
      score: userScore,
      rank: 0,
      avatarInitial: userLabel.charAt(0).toUpperCase(),
    })
  }

  entries.sort((left, right) => right.score - left.score)
  const ranked = entries.map((entry, index) => ({ ...entry, rank: index + 1 }))

  return {
    challengeId: challenge.id,
    leaderboardKey: challenge.leaderboardKey,
    updatedAt: new Date().toISOString(),
    entries: ranked.slice(0, 8),
  }
}

export function resolveChallenge(
  challenge: Challenge,
  state: AppState,
): ResolvedChallenge {
  const progress = computeChallengeProgress(challenge, state)
  const nodes = resolveChallengeNodes(challenge, state)
  const userLabel =
    state.dogs.length > 0
      ? state.dogs.map((dog) => dog.name).join(' & ')
      : state.userName || 'Your pack'

  return {
    ...challenge,
    progress,
    nodes,
    leaderboard: buildChallengeLeaderboard(
      challenge,
      progress.joined ? progress.metricValue : 0,
      userLabel,
    ),
  }
}

export function resolveJoinedChallenges(state: AppState): ResolvedChallenge[] {
  return state.joinedChallenges
    .map((record) => getChallengeById(record.challengeId))
    .filter((challenge): challenge is Challenge => Boolean(challenge))
    .map((challenge) => resolveChallenge(challenge, state))
}

export function resolveAllCuratedChallenges(state: AppState): ResolvedChallenge[] {
  return CURATED_CHALLENGES.map((challenge) => resolveChallenge(challenge, state))
}

export function getFeaturedChallenge(state: AppState): ResolvedChallenge | undefined {
  const joined = resolveJoinedChallenges(state)
  if (joined.length > 0) return joined[0]
  return resolveChallenge(CURATED_CHALLENGES[0], state)
}

export function joinChallengeState(
  state: AppState,
  challengeId: string,
): AppState {
  if (!isCuratedChallengeId(challengeId)) return state
  if (state.joinedChallenges.some((record) => record.challengeId === challengeId)) {
    return state
  }

  return {
    ...state,
    joinedChallenges: [
      ...state.joinedChallenges,
      { challengeId, joinedAt: new Date().toISOString() },
    ],
  }
}

export function leaveChallengeState(
  state: AppState,
  challengeId: string,
): AppState {
  return {
    ...state,
    joinedChallenges: state.joinedChallenges.filter(
      (record) => record.challengeId !== challengeId,
    ),
  }
}

export function getChallengeProgressSummary(
  nodes: ResolvedChallengeNode[],
): { completed: number; total: number; fillWidth: string } {
  const completed = nodes.filter((node) => node.state === 'completed').length
  const total = nodes.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return {
    completed,
    total,
    fillWidth: `${percent}%`,
  }
}

/** @deprecated Use resolveChallengeNodes */
export const resolveChallengePathNodes = resolveChallengeNodes

/** @deprecated Use getChallengeProgressSummary */
export const getChallengePathProgressSummary = getChallengeProgressSummary

export type { ResolvedChallengeNode as ResolvedChallengePathNode }
