import type { AppState, JourneyEntry } from '../data/demo'
import type {
  DogProgressionMetricKind,
  DogProgressionNode,
  DogProgressionPath,
} from '../data/dogProgression'
import {
  DOG_PROGRESSION_PATH,
  DOG_PROGRESSION_RANKS,
} from '../data/dogProgression'
import { getPlaceById } from '../data/places'
import { DEMO_SEEDED_JOURNEY_ENTRY_IDS } from './productionState'

export type DogProgressionNodeState = 'completed' | 'current' | 'locked'

export interface ResolvedDogProgressionNode extends DogProgressionNode {
  state: DogProgressionNodeState
  statusLabel: string
  journeyEntry?: JourneyEntry
  completionDate?: string
  memoryCount: number
  photoUrls: string[]
}

export interface DogProgressionSummary {
  chaptersCompleted: number
  chaptersTotal: number
  percentComplete: number
  fillWidth: string
  rank: string
  nextUnlock: string
  storyLine: string
}

export interface ResolvedDogProgression extends DogProgressionPath {
  nodes: ResolvedDogProgressionNode[]
  summary: DogProgressionSummary
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

function getProgressionEntries(state: AppState): JourneyEntry[] {
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

function isTrailEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) return entry.tags.some((tag) => tag.toLowerCase().includes('trail'))
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Trail'
}

function isRoadTripEntry(entry: JourneyEntry): boolean {
  if (!entry.placeId) {
    return entry.tags.some((tag) => tag.toLowerCase().includes('road trip'))
  }
  const place = getPlaceById(entry.placeId)
  return place?.category === 'Road trip'
}

function entryMatchesMetric(metric: DogProgressionMetricKind, entry: JourneyEntry): boolean {
  switch (metric) {
    case 'total_adventures':
      return true
    case 'beach_adventures':
      return isBeachEntry(entry)
    case 'trail_adventures':
      return isTrailEntry(entry)
    case 'road_trip_adventures':
      return isRoadTripEntry(entry)
    case 'distinct_places':
      return true
    default:
      return true
  }
}

function countMetricMatches(
  metric: DogProgressionMetricKind,
  entries: JourneyEntry[],
): { value: number; qualifying: JourneyEntry[] } {
  const qualifying = entries.filter((entry) => entryMatchesMetric(metric, entry))

  if (metric === 'distinct_places') {
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

function formatCompletionDate(entry: JourneyEntry): string {
  if (entry.occurredAt) {
    const parsed = Date.parse(entry.occurredAt)
    if (!Number.isNaN(parsed)) {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(parsed)
    }
  }

  return entry.date
}

function memoryCountForEntry(entry: JourneyEntry): number {
  const photos = entry.photoUrls?.filter(Boolean).length ?? 0
  return photos > 0 ? photos : 1
}

function statusLabelForState(state: DogProgressionNodeState): string {
  if (state === 'completed') return 'Saved'
  if (state === 'current') return 'Writing now'
  return 'Not yet'
}

export function resolveDogProgressionNodes(state: AppState): ResolvedDogProgressionNode[] {
  const entries = getProgressionEntries(state)
  let foundCurrent = false

  return DOG_PROGRESSION_PATH.nodes.map((node) => {
    const { value: metricValue, qualifying } = countMetricMatches(node.metric, entries)
    const isCompleted = metricValue >= node.threshold

    let nodeState: DogProgressionNodeState
    if (isCompleted) {
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

    const photoUrls = journeyEntry?.photoUrls?.filter(Boolean) ?? []

    return {
      ...node,
      state: nodeState,
      statusLabel: statusLabelForState(nodeState),
      journeyEntry,
      completionDate: journeyEntry ? formatCompletionDate(journeyEntry) : undefined,
      memoryCount: journeyEntry ? memoryCountForEntry(journeyEntry) : 0,
      photoUrls,
    }
  })
}

function buildStoryLine(state: AppState, chaptersCompleted: number): string {
  const dogLabel =
    state.dogs.length > 0
      ? state.dogs.map((dog) => dog.name).join(' + ')
      : 'Your pack'

  if (chaptersCompleted === 0) {
    return `Start writing ${dogLabel}'s story — one adventure at a time.`
  }

  if (chaptersCompleted === 1) {
    return `The first chapter of ${dogLabel}'s story is saved.`
  }

  return `${chaptersCompleted} chapters saved — you are building ${dogLabel}'s life story.`
}

export function resolveDogProgression(state: AppState): ResolvedDogProgression {
  const nodes = resolveDogProgressionNodes(state)
  const chaptersCompleted = nodes.filter((node) => node.state === 'completed').length
  const chaptersTotal = nodes.length
  const percentComplete =
    chaptersTotal === 0 ? 0 : Math.round((chaptersCompleted / chaptersTotal) * 100)

  const rankIndex = Math.min(chaptersCompleted, DOG_PROGRESSION_RANKS.length - 1)
  const rankInfo = DOG_PROGRESSION_RANKS[rankIndex]

  return {
    ...DOG_PROGRESSION_PATH,
    nodes,
    summary: {
      chaptersCompleted,
      chaptersTotal,
      percentComplete,
      fillWidth: `${percentComplete}%`,
      rank: rankInfo.rank,
      nextUnlock: rankInfo.nextUnlock,
      storyLine: buildStoryLine(state, chaptersCompleted),
    },
  }
}
