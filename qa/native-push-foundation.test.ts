import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  mapNativePermission,
  nativeTokenUpsertRow,
  safeNativePushTarget,
} from '../src/lib/nativePushNotifications'

assert.equal(mapNativePermission('granted'), 'granted')
assert.equal(mapNativePermission('denied'), 'denied')
assert.equal(mapNativePermission('prompt'), 'default')
assert.equal(mapNativePermission('prompt-with-rationale'), 'default')

assert.equal(safeNativePushTarget({ path: '/app' }), '/app')
assert.equal(safeNativePushTarget({ path: 'https://attacker.example' }), '/app')
assert.equal(safeNativePushTarget({ path: '/privacy' }), '/app')
assert.equal(safeNativePushTarget(null), '/app')

const row = nativeTokenUpsertRow({
  userId: '00000000-0000-0000-0000-000000000001',
  platform: 'ios',
  token: 'test-device-token',
  preferences: {
    morningEnabled: true,
    morningTime: '07:30',
    eveningEnabled: false,
    eveningTime: '19:15',
  },
})
assert.equal(row.user_id, '00000000-0000-0000-0000-000000000001')
assert.equal(row.platform, 'ios')
assert.equal(row.token, 'test-device-token')
assert.equal(row.enabled, true)
assert.equal(row.morning_time, '07:30')
assert.equal(row.evening_enabled, false)

const migrationPath = fileURLToPath(new URL(
  '../supabase/migrations/20261103114617_native_device_tokens.sql',
  import.meta.url,
))
const migration = readFileSync(migrationPath, 'utf8')
assert.match(migration, /alter table public\.native_device_tokens enable row level security;/)
assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\);/)
assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)\s+with check/)
assert.match(migration, /revoke all on public\.native_device_tokens from anon, authenticated;/)
assert.match(migration, /create index native_device_tokens_user_id_idx/)
assert.match(migration, /unique \(platform, token\)/)

console.info('Native push foundation checks passed.')
