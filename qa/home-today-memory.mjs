import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// Load the actual TypeScript helper, not a duplicate implementation.
const source = await readFile('src/lib/todaysMemory.ts', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const exports = {}
runInNewContext(compiled.outputText, { exports, Date, Number })
const { getLatestTodayJourneyEntry } = exports
assert.equal(typeof getLatestTodayJourneyEntry, 'function')

const now = new Date(2026, 10, 2, 12, 0, 0)
const todayMorning = new Date(2026, 10, 2, 8, 0, 0).toISOString()
const todayAfternoon = new Date(2026, 10, 2, 15, 0, 0).toISOString()
const yesterday = new Date(2026, 10, 1, 15, 0, 0).toISOString()
const tomorrow = new Date(2026, 10, 3, 9, 0, 0).toISOString()

const oldMemory = { id: 'old', place: 'Old outing', date: 'Today', occurredAt: yesterday }
const morningMemory = { id: 'morning', place: 'Park', date: 'Yesterday', occurredAt: todayMorning }
const afternoonMemory = { id: 'afternoon', place: 'Beach', date: 'Today', occurredAt: todayAfternoon }
const futureMemory = { id: 'future', place: 'Future', date: 'Today', occurredAt: tomorrow }
const corruptMemory = { id: 'corrupt', place: 'Unknown', date: 'Today', occurredAt: 'not-a-date' }
const seededDemo = { id: 'demo', place: 'Demo', date: 'Today' }

assert.equal(getLatestTodayJourneyEntry([oldMemory], { now }), undefined, 'Yesterday cannot stay today')
assert.equal(getLatestTodayJourneyEntry([morningMemory], { now }), morningMemory, 'Timestamp outranks stale display label')
assert.equal(
  getLatestTodayJourneyEntry([morningMemory, afternoonMemory, oldMemory], { now }),
  afternoonMemory,
  'Most recent same-day memory wins regardless of array order',
)
assert.equal(getLatestTodayJourneyEntry([futureMemory, corruptMemory], { now }), undefined, 'Future and invalid dates excluded')
assert.equal(getLatestTodayJourneyEntry([seededDemo], { now }), undefined, 'Undated demo label never counts in production')
assert.equal(
  getLatestTodayJourneyEntry([seededDemo], { now, includeUndatedDemoEntries: true }),
  seededDemo,
  'Legacy seeded DEMO memory remains visible only in demo mode',
)
assert.equal(
  getLatestTodayJourneyEntry([seededDemo, morningMemory], { now, includeUndatedDemoEntries: true }),
  morningMemory,
  'Real timestamp wins over a demo-only fixture',
)
console.log('[PASS] Home today-memory date and recency checks (7 cases)')
