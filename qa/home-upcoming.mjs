import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getHomeUpcomingItems } from '../src/lib/homeUpcoming.ts'

const now = new Date(2026, 10, 3, 8, 0)
const todayAt = (h) => new Date(2026, 10, 3, h, 0).toISOString()
const tomorrowAt = (h) => new Date(2026, 10, 4, h, 0).toISOString()
const base = () => ({
  dogs: [{ id: 'bailey', name: 'Bailey' }, { id: 'omi', name: 'Meiomi' }],
  scheduledAdventures: [],
  monthlyPlanResult: null,
  randomPlanResult: null,
  selectedMonthlyPlanId: null,
})
const planned = (id, scheduledFor, selectedDogIds = ['bailey', 'omi']) => ({
  id, title: `Plan ${id}`, selectedDogIds, scheduledFor, createdAt: todayAt(7),
})

test('saved outings lead Home instead of generic prompts, earliest future first', () => {
  const state = base()
  state.scheduledAdventures = [planned('later', tomorrowAt(16)), planned('soon', todayAt(17))]
  const items = getHomeUpcomingItems(state, now)
  assert.deepEqual(items.map(({ id }) => id), ['scheduled-soon', 'scheduled-later'])
  assert.match(items[0].detail, /^Today, .* · Bailey \+ Meiomi$/)
  assert.match(items[1].detail, /^Tomorrow, .* · Bailey \+ Meiomi$/)
  assert.equal(items[0].kind, 'adventure')
})

test('selected one-dog outing does not claim both dogs', () => {
  const state = base()
  state.scheduledAdventures = [planned('solo', todayAt(17), ['omi'])]
  assert.match(getHomeUpcomingItems(state, now)[0].detail, / · Meiomi$/)
})

test('undated saved plans show behind future plans with honest wording', () => {
  const state = base()
  state.scheduledAdventures = [planned('undated', undefined), planned('soon', tomorrowAt(9))]
  const items = getHomeUpcomingItems(state, now)
  assert.deepEqual(items.map(({ id }) => id), ['scheduled-soon', 'scheduled-undated'])
  assert.match(items[1].detail, /^Saved for later/)
})

test('expired plans never appear as upcoming appointments', () => {
  const state = base()
  state.scheduledAdventures = [planned('expired', todayAt(7))]
  assert.match(getHomeUpcomingItems(state, now)[0].detail, /^Ready when you are/)
})

test('invalid stored date does not throw', () => {
  const state = base()
  state.scheduledAdventures = [planned('invalid', 'not-a-date')]
  assert.match(getHomeUpcomingItems(state, now)[0].detail, /^Saved for later/)
})

test('real saved plan leads monthly plan; monthly fills remaining room', () => {
  const state = base()
  state.scheduledAdventures = [planned('real', tomorrowAt(16))]
  state.selectedMonthlyPlanId = 'monthly'
  state.monthlyPlanResult = { weeks: [{ weekIndex: 1, label: 'Week 1', placeName: 'Mission Bay' }], nextWeekIndex: 1 }
  assert.deepEqual(getHomeUpcomingItems(state, now).map((item) => item.id), ['scheduled-real', 'monthly-next'])
})

test('maximum three previews, without mutating source order', () => {
  const state = base()
  state.scheduledAdventures = [
    planned('3', tomorrowAt(17)), planned('1', todayAt(12)),
    planned('4', tomorrowAt(18)), planned('2', tomorrowAt(10)),
  ]
  const original = state.scheduledAdventures.map((adventure) => adventure.id)
  assert.deepEqual(getHomeUpcomingItems(state, now).map((item) => item.id), ['scheduled-1', 'scheduled-2', 'scheduled-3'])
  assert.deepEqual(state.scheduledAdventures.map((adventure) => adventure.id), original)
})

test('empty Home prompts a new dog outing, not fictitious events', () => {
  assert.deepEqual(getHomeUpcomingItems(base(), now).map((item) => item.id), ['next-outing-idea', 'new-place-idea'])
})
