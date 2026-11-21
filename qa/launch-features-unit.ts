import assert from 'node:assert/strict'
import { buildIcs } from '../src/lib/calendarExport'
import { reminderSchedule, setNativeReminders } from '../src/lib/nativeReminders'
import { appendRoutePoint } from '../src/lib/walkRoute'
const events = [{ title: 'Beach, dog; day\r\nBEGIN:EVIL', description: '🐕'.repeat(100), start: new Date('2026-12-01T17:00:00Z') }]
const calendar = buildIcs(events, 'PawStreak')
assert.ok(calendar.includes('DTSTART:20261201T170000Z'))
assert.ok(!calendar.includes('\r\nBEGIN:EVIL'))
assert.ok(calendar.split('\r\n').every(line => Buffer.byteLength(line) <= 75))
assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 1)
const prefs = { morningEnabled: true, morningTime: '08:30', eveningEnabled: false, eveningTime: '19:00' }
assert.deepEqual(reminderSchedule(prefs)[0].schedule.on, { hour: 8, minute: 30 })
assert.equal(reminderSchedule(prefs).length, 1)
assert.throws(() => reminderSchedule({ ...prefs, morningTime: '25:00' }))
assert.equal(reminderSchedule({ ...prefs, morningEnabled: false }).length, 0)
const point = { coords: { latitude: 32.7, longitude: -117.1, accuracy: 5 }, timestamp: 1800000000000 } as GeolocationPosition
const first = appendRoutePoint([], point)
assert.equal(first.length, 1)
assert.equal(appendRoutePoint(first, point).length, 1)
assert.equal(appendRoutePoint([], { ...point, coords: { ...point.coords, accuracy: 100 } }).length, 0)
assert.equal(appendRoutePoint(first, { ...point, timestamp: point.timestamp + 11000 }).length, 2)
console.log('PASS calendar UTC/escaping/UTF-8 folding, notification opt-outs/times, GPS accuracy and throttling')

const calls: string[] = []
const api = {
  requestPermissions: async () => { calls.push('permission'); return { display: 'granted' as const } },
  cancel: async () => { calls.push('cancel') },
  schedule: async () => { calls.push('schedule'); return { notifications: [{ id: 701001 }] } },
}
const preferencesApi = { set: async () => { calls.push('persist') } }
await setNativeReminders(prefs, api, preferencesApi)
assert.deepEqual(calls, ['permission', 'cancel', 'schedule', 'persist'])
calls.length = 0
await assert.rejects(() => setNativeReminders(prefs, { ...api, requestPermissions: async () => ({ display: 'denied' }) }, preferencesApi))
assert.deepEqual(calls, [])
await setNativeReminders({ ...prefs, morningEnabled: false }, api, preferencesApi)
assert.deepEqual(calls, ['cancel', 'persist'])
console.log('PASS native reminder permission denial leaves existing schedule unchanged; opt-out cancels without prompting')
