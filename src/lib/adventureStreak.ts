import type { JourneyEntry } from '../data/demo'
import { getJourneyEntryDayKey, toLocalDayKey } from './journeyCalendar'

/** A live streak counts consecutive device-local days through today or yesterday. */
export function calculateAdventureStreak(
  entries: readonly JourneyEntry[],
  asOf: Date = new Date(),
): number {
  const dayKeys = new Set<string>()
  for (const entry of entries) {
    const key = getJourneyEntryDayKey(entry)
    if (key) dayKeys.add(key)
  }
  if (dayKeys.size === 0) return 0

  const cursor = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())
  if (!dayKeys.has(toLocalDayKey(cursor))) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (dayKeys.has(toLocalDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
