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
import { getDistinctPlaceKey } from './customAdventure'
import { DEMO_SEEDED_JOURNEY_ENTRY_IDS } from './productionState'
import { enrichChallengeNodeContent } from './challengePlaceTemplates'

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

export interface ResolvedChallengeNode extends ChallengeNode {
  state: ChallengeNodeState
  statusLabel: string
  journeyEntry?: JourneyEntry
  /** Alias for UI components expecting `name`. */
  name: string
  placeId?: string
  isGenericFallback?: boolean
  unlockHint?: string
  thumbnailUrl?: string
  completionDate?: string
  memoryCount?: number
}

export interface ResolvedChallenge extends Challenge {
  progress: ChallengeProgress
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
  const entries = state.journeyEntries.filter(
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

function isCategoryEntry(entry: JourneyEntry, categories: string[]): boolean {
  if (!entry.placeId) {
    const haystack = [entry.place, ...entry.tags].join(' ').toLowerCase()
    return categories.some((category) => haystack.includes(category.toLowerCase()))
  }
  const place = getPlaceById(entry.placeId)
  return Boolean(place && categories.includes(place.category))
}

function isNeighborhoodEntry(entry: JourneyEntry): boolean {
  if (entry.placeId === NEIGHBORHOOD_WALK_PLACE_ID) return true
  if (!entry.placeId) {
    return entry.tags.some((tag) => tag.toLowerCase().includes('neighborhood'))
  }
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Neighborhood'
}

export function isChallengeWindowActive(
  challenge: Challenge,
  now = Date.now(),
): boolean {
  void challenge
  void now
  return true
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
  }

  switch (challenge.metric.kind) {
    case 'beach_adventures':
      return isBeachEntry(entry)
    case 'trail_adventures':
      return isCategoryEntry(entry, ['Trail'])
    case 'dog_park_adventures':
      return isCategoryEntry(entry, ['Dog Park'])
    case 'patio_adventures':
      return isCategoryEntry(entry, ['Patio', 'Restaurant'])
    case 'brewery_adventures':
      return isCategoryEntry(entry, ['Brewery'])
    case 'total_adventures':
      return true
    case 'neighborhood_walks':
      return isNeighborhoodEntry(entry)
    case 'memories_with_photo':
      return Boolean(entry.photoUrls?.some(Boolean))
    case 'social_adventures':
      return isCategoryEntry(entry, ['Dog Park', 'Patio', 'Brewery', 'Restaurant']) ||
        entry.recapLabels?.some((label) => /friend|social/i.test(label)) === true
    case 'distinct_routes':
      return Boolean(entry.placeId || entry.place)
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

  if (challenge.metric.kind === 'distinct_routes') {
    const seen = new Set<string>()
    const distinct: JourneyEntry[] = []
    for (const entry of qualifying) {
      const key = getDistinctPlaceKey(entry)
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

  return challenge.nodes.map((node, index) => {
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

    const enriched = enrichChallengeNodeContent(
      challenge,
      index,
      nodeState,
      node,
      state,
      journeyEntry,
      qualifying,
    )

    return {
      ...node,
      ...enriched,
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

  const durationLabel = joined
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

export function resolveChallenge(
  challenge: Challenge,
  state: AppState,
): ResolvedChallenge {
  const progress = computeChallengeProgress(challenge, state)
  const nodes = resolveChallengeNodes(challenge, state)

  return {
    ...challenge,
    progress,
    nodes,
  }
}

export function resolveJoinedChallenges(state: AppState): ResolvedChallenge[] {
  return state.joinedChallenges
    .map((record) => getChallengeById(record.challengeId))
    .filter((challenge): challenge is Challenge => Boolean(challenge))
    .filter((challenge) => challenge.availability === 'generic' || state.locationSupported)
    .map((challenge) => resolveChallenge(challenge, state))
}

export function resolveAllCuratedChallenges(state: AppState): ResolvedChallenge[] {
  return CURATED_CHALLENGES
    .filter((challenge) => challenge.availability === 'generic' || state.locationSupported)
    .map((challenge) => resolveChallenge(challenge, state))
}

export function getFeaturedChallenge(state: AppState): ResolvedChallenge | undefined {
  const joined = resolveJoinedChallenges(state)
  if (joined.length > 0) return joined[0]
  const first = resolveAllCuratedChallenges(state)[0]
  return first
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
