import type { JourneyEntry } from '../data/demo'

type JourneyCalendarFields = Pick<JourneyEntry, 'date' | 'occurredAt'>

/** Device-local day keys; UTC midnight would misclassify West Coast dog outings. */
export function toLocalDayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Persisted "Today"/weekday labels are presentation only, never proof of an
 * outing date. Prefer the recorded timestamp; accept only valid legacy ISO
 * calendar dates when that timestamp is absent.
 */
export function getJourneyEntryDayKey(entry: JourneyCalendarFields): string | null {
  if (entry.occurredAt) {
    const parsed = new Date(entry.occurredAt)
    return Number.isFinite(parsed.getTime()) ? toLocalDayKey(parsed) : null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entry.date.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  // Reject impossible days (including rollover), and years 00–99 coercion.
  if (parsed.getFullYear() !== year ||
      parsed.getMonth() + 1 !== month ||
      parsed.getDate() !== day) return null
  return toLocalDayKey(parsed)
}
