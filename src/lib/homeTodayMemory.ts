import type { JourneyEntry } from '../data/demo'
import { getJourneyEntryDayKey, toLocalDayKey } from './journeyCalendar'

/**
 * A display label such as "Today" is persisted in older memories and cannot
 * establish when the outing happened. Prefer its actual timestamp instead.
 */
export function isJourneyEntryFromToday(
  entry: Pick<JourneyEntry, 'date' | 'occurredAt'>,
  now: Date = new Date(),
  allowUndatedTodayLabel = false,
): boolean {
  // Only seeded DEMO entries may deliberately preview a timestamp-free Today.
  // Corrupt real timestamps never fall back to this presentation convention.
  if (allowUndatedTodayLabel && !entry.occurredAt && /^today$/i.test(entry.date.trim())) return true
  const key = getJourneyEntryDayKey(entry)
  return key !== null && key === toLocalDayKey(now)
}

export function findTodaysJourneyEntry(
  entries: JourneyEntry[],
  now: Date = new Date(),
  allowUndatedTodayLabel = false,
): JourneyEntry | undefined {
  return entries.find((entry) => isJourneyEntryFromToday(entry, now, allowUndatedTodayLabel))
}
