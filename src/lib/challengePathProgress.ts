import type { JourneyEntry } from '../data/demo'
import type { ChallengePathDefinition, ChallengePathNode } from '../data/challengePaths'
import { NEIGHBORHOOD_WALK_PLACE_ID, getPlaceById } from '../data/places'
import { getJourneyEntryDisplayImageUrl, resolveCategoryFromJourneyEntry } from './adventureDisplayImage'

export type ChallengeNodeState = 'completed' | 'current' | 'locked'

export interface ResolvedChallengeNode extends ChallengePathNode {
  state: ChallengeNodeState
  journeyEntry?: JourneyEntry
  imageUrl: string
  statusLabel: string
}

function getEntrySortTime(entry: JourneyEntry): number {
  if (entry.occurredAt) {
    const ms = new Date(entry.occurredAt).getTime()
    if (!Number.isNaN(ms)) return ms
  }
  return 0
}

function findLatestJourneyEntry(
  placeId: string,
  journeyEntries: JourneyEntry[],
): JourneyEntry | undefined {
  return [...journeyEntries]
    .filter((entry) => entry.placeId === placeId)
    .sort((a, b) => getEntrySortTime(b) - getEntrySortTime(a))[0]
}

function statusLabelForState(state: ChallengeNodeState): string {
  if (state === 'completed') return 'Completed'
  if (state === 'current') return 'Up next'
  return 'Locked'
}

function resolveNodeImage(
  path: ChallengePathDefinition,
  journeyEntries: JourneyEntry[],
  journeyEntry: JourneyEntry | undefined,
  placeId: string,
): string {
  if (journeyEntry) {
    return getJourneyEntryDisplayImageUrl(journeyEntries, journeyEntry)
  }

  const place = getPlaceById(placeId)
  return place?.imageUrl ?? path.fallbackImage
}

export function getCompletedPlaceIdsForPath(
  path: ChallengePathDefinition,
  journeyEntries: JourneyEntry[],
  isDemoMode: boolean,
): Set<string> {
  const pathPlaceIds = new Set(path.nodes.map((node) => node.placeId))
  const completed = new Set(
    journeyEntries
      .map((entry) => entry.placeId)
      .filter((placeId): placeId is string => Boolean(placeId && pathPlaceIds.has(placeId))),
  )

  if (isDemoMode && path.demoCompletedPlaceIds) {
    for (const placeId of path.demoCompletedPlaceIds) {
      completed.add(placeId)
    }
  }

  return completed
}

function getNeighborhoodWalkEntries(journeyEntries: JourneyEntry[]): JourneyEntry[] {
  return [...journeyEntries]
    .filter(
      (entry) =>
        entry.placeId === NEIGHBORHOOD_WALK_PLACE_ID ||
        resolveCategoryFromJourneyEntry(entry) === 'Neighborhood',
    )
    .sort((a, b) => getEntrySortTime(b) - getEntrySortTime(a))
}

function resolvePlaceBasedPathNodes(
  path: ChallengePathDefinition,
  journeyEntries: JourneyEntry[],
  isDemoMode: boolean,
): ResolvedChallengeNode[] {
  const completedPlaceIds = getCompletedPlaceIdsForPath(path, journeyEntries, isDemoMode)
  let foundCurrent = false

  return path.nodes.map((node) => {
    const isCompleted = completedPlaceIds.has(node.placeId)
    let state: ChallengeNodeState

    if (isCompleted) {
      state = 'completed'
    } else if (!foundCurrent) {
      state = 'current'
      foundCurrent = true
    } else {
      state = 'locked'
    }

    const journeyEntry = findLatestJourneyEntry(node.placeId, journeyEntries)

    return {
      ...node,
      state,
      journeyEntry,
      imageUrl: resolveNodeImage(path, journeyEntries, journeyEntry, node.placeId),
      statusLabel: statusLabelForState(state),
    }
  })
}

function resolveCountBasedPathNodes(
  path: ChallengePathDefinition,
  journeyEntries: JourneyEntry[],
  isDemoMode: boolean,
): ResolvedChallengeNode[] {
  const entries = getNeighborhoodWalkEntries(journeyEntries)
  const demoBoost = isDemoMode ? (path.demoCompletedCount ?? 0) : 0
  const completedCount = Math.min(path.nodes.length, entries.length + demoBoost)
  let foundCurrent = false

  return path.nodes.map((node, index) => {
    const slot = index + 1
    const isCompleted = slot <= completedCount
    let state: ChallengeNodeState

    if (isCompleted) {
      state = 'completed'
    } else if (!foundCurrent) {
      state = 'current'
      foundCurrent = true
    } else {
      state = 'locked'
    }

    const journeyEntry = entries[index]

    return {
      ...node,
      state,
      journeyEntry,
      imageUrl: resolveNodeImage(path, journeyEntries, journeyEntry, node.placeId),
      statusLabel: statusLabelForState(state),
    }
  })
}

export function resolveChallengePathNodes(
  path: ChallengePathDefinition,
  journeyEntries: JourneyEntry[],
  isDemoMode: boolean,
): ResolvedChallengeNode[] {
  if (path.completionMode === 'neighborhood-count') {
    return resolveCountBasedPathNodes(path, journeyEntries, isDemoMode)
  }

  return resolvePlaceBasedPathNodes(path, journeyEntries, isDemoMode)
}

export function getChallengePathProgressSummary(
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
