import assert from 'node:assert/strict'
import { findTodaysJourneyEntry, isJourneyEntryFromToday } from '../src/lib/homeTodayMemory.ts'

const now = new Date(2026, 10, 11, 8, 0, 0)
const today = new Date(2026, 10, 11, 0, 1, 0)
const yesterday = new Date(2026, 10, 10, 23, 59, 0)
const tomorrow = new Date(2026, 10, 12, 0, 0, 0)
const make = (id, date, occurredAt) => ({ id, date, occurredAt, place: id, tags: [] })
let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`[PASS] ${name}`) }

check('real adventure saved today is identified by occurredAt', () => {
  assert.equal(isJourneyEntryFromToday(make('new', 'Today', today.toISOString()), now), true)
})
check('persisted Today label from yesterday does not hijack Home', () => {
  assert.equal(isJourneyEntryFromToday(make('old', 'Today', yesterday.toISOString()), now), false)
})
check('future timestamp is never presented as a saved-today memory', () => {
  assert.equal(isJourneyEntryFromToday(make('future', 'Today', tomorrow.toISOString()), now), false)
})
check('invalid timestamp does not fall back to an unproven Today label', () => {
  assert.equal(isJourneyEntryFromToday(make('bad', 'Today', 'not-a-date'), now, true), false)
})
check('undated legacy Today label is not assumed to be today in production', () => {
  assert.equal(isJourneyEntryFromToday(make('legacy', 'Today'), now), false)
})
check('undated seeded DEMO Today label remains usable in preview', () => {
  assert.equal(isJourneyEntryFromToday(make('demo', 'Today'), now, true), true)
})
check('explicit legacy ISO local date works without a timestamp', () => {
  assert.equal(isJourneyEntryFromToday(make('iso', '2026-11-11'), now), true)
  assert.equal(isJourneyEntryFromToday(make('iso-prev', '2026-11-10'), now), false)
})
check('unparseable weekday labels do not masquerade as today', () => {
  assert.equal(isJourneyEntryFromToday(make('week', 'Wednesday'), now), false)
})
check('older memory is skipped when a newer genuine today record is present', () => {
  const entries = [make('old', 'Today', yesterday.toISOString()), make('new', 'Today', today.toISOString())]
  assert.equal(findTodaysJourneyEntry(entries, now)?.id, 'new')
})
check('no current memory means Home offers an adventure again', () => {
  assert.equal(findTodaysJourneyEntry([make('old', 'Today', yesterday.toISOString())], now), undefined)
})
check('demo preview keeps historical sample memory for screenshot QA', () => {
  assert.equal(findTodaysJourneyEntry([make('dog-beach-today', 'Today')], now, true)?.id, 'dog-beach-today')
})

console.log(`Home today memory: ${passed}/11 checks passed`)
