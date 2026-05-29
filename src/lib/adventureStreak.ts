import type { JourneyEntry } from '../data/demo'

function toLocalDayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function entryDayKey(entry: JourneyEntry): string | null {
  if (entry.occurredAt) {
    const parsed = new Date(entry.occurredAt)
    if (!Number.isNaN(parsed.getTime())) {
      return toLocalDayKey(parsed)
    }
  }

  if (entry.date.trim().toLowerCase() === 'today') {
    return toLocalDayKey(new Date())
  }

  return null
}

export function calculateAdventureStreak(entries: JourneyEntry[]): number {
  const dayKeys = new Set<string>()

  for (const entry of entries) {
    const key = entryDayKey(entry)
    if (key) dayKeys.add(key)
  }

  if (dayKeys.size === 0) return 0

  const today = new Date()
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const todayKey = toLocalDayKey(cursor)
  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (true) {
    const key = toLocalDayKey(cursor)
    if (!dayKeys.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
