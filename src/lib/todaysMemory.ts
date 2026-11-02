import type { JourneyEntry } from '../data/demo'

interface TodayMemoryOptions {
  now?: Date
  /** Historical demo fixtures can lack occurredAt; never enable in production. */
  includeUndatedDemoEntries?: boolean
}

/**
 * A saved memory is "today" only when its actual timestamp falls on the
 * device's current local calendar day. The persisted display label "Today"
 * is not a reliable date: it remains unchanged after midnight.
 *
 * When several outings are saved today, the latest real outing wins.
 */
export function getLatestTodayJourneyEntry(
  entries: readonly JourneyEntry[],
  options: TodayMemoryOptions = {},
): JourneyEntry | undefined {
  const now = options.now ?? new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()

  let latestEntry: JourneyEntry | undefined
  let latestTime = Number.NEGATIVE_INFINITY

  for (const entry of entries) {
    const occurredAt = entry.occurredAt?.trim()
    let timestamp: number

    if (occurredAt) {
      timestamp = Date.parse(occurredAt)
      if (!Number.isFinite(timestamp) || timestamp < start || timestamp >= end) continue
    } else if (
      options.includeUndatedDemoEntries &&
      entry.date.trim().toLowerCase() === 'today'
    ) {
      // The seeded public demo intentionally includes a "Today" memory with no
      // timestamp. Do not let that legacy fixture override a real timed memory.
      timestamp = start
    } else {
      continue
    }

    if (timestamp > latestTime) {
      latestTime = timestamp
      latestEntry = entry
    }
  }

  return latestEntry
}
