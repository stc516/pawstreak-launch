import type { JourneyEntry } from '../data/demo'

function toLocalDayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/** Display labels like "Today" remain on saved entries after midnight. */
function entryDayKey(entry: JourneyEntry): string | null {
  if (entry.occurredAt) {
    const parsed = new Date(entry.occurredAt)
    // A corrupt timestamp must not fall back to a relative display label.
    return Number.isFinite(parsed.getTime()) ? toLocalDayKey(parsed) : null
  }

  // Older timestamp-free records may have an explicit local calendar date.
  // Parse YYYY-MM-DD as local components: Date.parse treats it as UTC midnight.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entry.date.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) return null
  return toLocalDayKey(parsed)
}

/** A live streak counts consecutive local calendar days through today or yesterday. */
export function calculateAdventureStreak(
  entries: readonly JourneyEntry[],
  asOf: Date = new Date(),
): number {
  const dayKeys = new Set<string>()
  for (const entry of entries) {
    const key = entryDayKey(entry)
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
