import type { JourneyEntry } from '../data/demo'

/**
 * A display label such as "Today" is persisted in older memories and cannot
 * establish when the outing happened. Prefer its actual timestamp instead.
 */
export function isJourneyEntryFromToday(
  entry: Pick<JourneyEntry, 'date' | 'occurredAt'>,
  now: Date = new Date(),
  allowUndatedTodayLabel = false,
): boolean {
  if (entry.occurredAt) {
    const occurred = new Date(entry.occurredAt)
    return Number.isFinite(occurred.getTime()) &&
      occurred.getFullYear() === now.getFullYear() &&
      occurred.getMonth() === now.getMonth() &&
      occurred.getDate() === now.getDate()
  }

  const label = entry.date.trim()
  // The seeded DEMO story intentionally uses an undated "Today" label.
  // Never make that assumption for an actual user's older saved memories.
  if (allowUndatedTodayLabel && /^today$/i.test(label)) return true

  // Exact calendar dates are safe for older timestamp-free records. Parse the
  // components locally: Date.parse('2026-11-11') interprets midnight as UTC.
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label)
  return isoDay !== null &&
    Number(isoDay[1]) === now.getFullYear() &&
    Number(isoDay[2]) === now.getMonth() + 1 &&
    Number(isoDay[3]) === now.getDate()
}

export function findTodaysJourneyEntry(
  entries: JourneyEntry[],
  now: Date = new Date(),
  allowUndatedTodayLabel = false,
): JourneyEntry | undefined {
  return entries.find((entry) => isJourneyEntryFromToday(entry, now, allowUndatedTodayLabel))
}
