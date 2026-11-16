import assert from 'node:assert/strict'
import { calculateAdventureStreak } from '../src/lib/adventureStreak.ts'

// Deterministic local-day tests; also run under America/Los_Angeles for DST.
const local = (y, m, d, h = 12) => new Date(y, m - 1, d, h)
const withTimestamp = (day, displayDate = 'Today') => ({
  id: day.toISOString(), place: 'A real outing', date: displayDate,
  occurredAt: day.toISOString(), tags: [],
})
const withoutTimestamp = (displayDate) => ({
  id: displayDate, place: 'Legacy memory', date: displayDate, tags: [],
})
const now = local(2026, 11, 12)
const today = withTimestamp(local(2026, 11, 12, 9))
const yesterday = withTimestamp(local(2026, 11, 11, 16))
const twoDaysAgo = withTimestamp(local(2026, 11, 10, 16))
const fourDaysAgo = withTimestamp(local(2026, 11, 8, 16))
const testCases = [
  ['fresh outing earns first day', [today], now, 1],
  ['yesterday stays a one-day streak until an outing today', [yesterday], now, 1],
  ['two consecutive days count through today', [today, yesterday], now, 2],
  ['duplicate outings on one day do not inflate streak', [today, today, yesterday], now, 2],
  ['missing intermediate day breaks the streak', [today, twoDaysAgo], now, 1],
  ['older days with no yesterday/today earn no current streak', [twoDaysAgo, fourDaysAgo], now, 0],
  ['stale Today label without a timestamp never makes fake progress', [withoutTimestamp('Today')], now, 0],
  ['corrupt timestamp cannot fall back to Today label', [{...withoutTimestamp('Today'), occurredAt: 'invalid'}], now, 0],
  ['legacy explicit ISO day is counted in local time', [withoutTimestamp('2026-11-11')], now, 1],
  ['invalid calendar day is not normalized into the next month', [withoutTimestamp('2026-11-31')], now, 0],
  ['unparseable weekday is not treated as a date', [withoutTimestamp('Wednesday')], now, 0],
  ['future adventures do not count', [withTimestamp(local(2026, 11, 13))], now, 0],
  ['new-year boundary counts consecutive local days', [withTimestamp(local(2027, 1, 1)), withTimestamp(local(2026, 12, 31))], local(2027, 1, 1), 2],
  ['spring DST shift counts calendar days not elapsed hours', [withTimestamp(local(2027, 3, 14)), withTimestamp(local(2027, 3, 13))], local(2027, 3, 14), 2],
  ['fall DST shift counts calendar days not elapsed hours', [withTimestamp(local(2026, 11, 1)), withTimestamp(local(2026, 10, 31))], local(2026, 11, 1), 2],
]
for (const [description, entries, at, expected] of testCases) {
  assert.equal(calculateAdventureStreak(entries, at), expected, description)
  console.log(`[PASS] ${description}`)
}
console.log(`Adventure streak calendar QA: ${testCases.length}/${testCases.length} passed (${Intl.DateTimeFormat().resolvedOptions().timeZone})`)
