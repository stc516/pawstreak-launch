import assert from 'node:assert/strict'
import { checkReleaseEnvironment as check } from '../scripts/release-preflight.mjs'
const jwt = role => `test.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`
const valid = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'sb_publishable_example', VITE_SITE_URL: 'https://pawstreakapp.com' }
assert.equal(check({}).failures.length, 3)
assert.equal(check(valid).failures.length, 0)
assert.equal(check({ ...valid, VITE_SUPABASE_ANON_KEY: jwt('anon') }).failures.length, 0)
for (const key of ['sb_secret_example', jwt('service_role'), 'garbage']) assert.ok(check({ ...valid, VITE_SUPABASE_ANON_KEY: key }).failures.length)
assert.ok(check({ ...valid, VITE_OTHER: jwt('service_role') }).failures.length)
assert.ok(check({ ...valid, VITE_MAPBOX_TOKEN: 'sk.private' }).failures.length)
assert.ok(check({ ...valid, VITE_SUPABASE_URL: 'http://localhost:54321' }).failures.length)
assert.ok(check({ ...valid, VITE_SITE_URL: 'https://wrong.example' }).failures.length)
assert.ok(check(valid).warnings.length)
console.log('PASS: release config rejects missing, malformed and privileged client credentials without printing values.')
