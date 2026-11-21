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

const { watchNativeRoute } = await import('../src/lib/nativeWalkRoute')
let resolveWatcher!: (id: string) => void
let removed = 0
const pendingWatcher = new Promise<string>(resolve => { resolveWatcher = resolve })
const stop = watchNativeRoute(() => assert.fail('No fix after stop'), () => assert.fail('Unexpected GPS error'), {
  addWatcher: () => pendingWatcher,
  removeWatcher: async ({ id }) => { assert.equal(id, 'test'); removed++ },
})
const stopping = stop()
resolveWatcher('test')
await stopping
await stop()
assert.equal(removed, 1)
let errors = 0
const stopRetry = watchNativeRoute(() => {}, () => { errors++ }, {
  addWatcher: async () => 'retry', removeWatcher: async () => { throw new Error('native failure') },
})
await stopRetry()
assert.equal(errors, 1)
const { createAppleNonce } = await import('../src/lib/appleAuth')
const nonce = await createAppleNonce()
assert.match(nonce.raw, /^[a-f0-9]{64}$/)
assert.equal(nonce.hashed, Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce.raw))).toString('hex'))
assert.notEqual((await createAppleNonce()).raw, nonce.raw)
console.log('PASS delayed native GPS cleanup, stop failure reporting, Apple nonce entropy/hash')
