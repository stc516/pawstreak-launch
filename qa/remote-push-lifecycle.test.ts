import assert from 'node:assert/strict'
import { createSerialQueue, refreshConsentedDevice, type DeviceConsent } from '../src/lib/remotePushLifecycle'
let record: DeviceConsent | null = { userId: 'owner', token: 'old' }
let user = 'owner', allowed = true, retained = true
const events: string[] = []
const driver = {
  read: async () => record, userId: async () => user, permission: async () => allowed,
  register: async () => { events.push('register'); return 'new' },
  rotate: async (oldToken: string, newToken: string) => { events.push(`rotate:${oldToken}:${newToken}`); return retained },
  persist: async (next: DeviceConsent) => { record = next; events.push('persist') },
  clear: async () => { record = null; events.push('clear') },
}
await refreshConsentedDevice(driver)
assert.deepEqual(events, ['register','rotate:old:new','persist'])
assert.equal(record?.token, 'new')
for (const reason of ['no consent','other account','permission denied']) {
  events.length = 0; record = reason === 'no consent' ? null : { userId: 'owner', token: 'old' }; user = reason === 'other account' ? 'other' : 'owner'; allowed = reason !== 'permission denied'
  await refreshConsentedDevice(driver); assert.deepEqual(events, [], reason)
}
record = { userId: 'owner', token: 'old' }; user = 'owner'; allowed = true; retained = false
await refreshConsentedDevice(driver)
assert.equal(record, null)
assert.deepEqual(events, ['register','rotate:old:new','clear'])
events.length = 0; record = { userId: 'owner', token: 'old' }
await refreshConsentedDevice({ ...driver, register: async () => { user = 'other'; return 'new' } })
assert.deepEqual(events, [], 'account switch while registering cannot bind another account')
const serial = createSerialQueue()
let finish!: () => void
const refresh = serial(async () => { events.push('refresh'); await new Promise<void>(resolve => { finish = resolve }); events.push('refreshed') })
const optOut = serial(async () => { events.push('opt-out') })
await Promise.resolve(); finish(); await Promise.all([refresh, optOut])
assert.deepEqual(events, ['refresh','refreshed','opt-out'])
await assert.rejects(serial(async () => { throw new Error('offline') }))
assert.equal(await serial(async () => 'recovered'), 'recovered')
console.log('PASS remote token rotation, consent/account isolation, denial, opt-out serialization and failure recovery')
