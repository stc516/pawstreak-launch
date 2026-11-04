import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const migrationName = '20261104153311_harden_public_function_privileges.sql'
const migrationPath = path.join('supabase', 'migrations', migrationName)
const migration = await readFile(migrationPath, 'utf8')

const targetSignatures = [
  'set_updated_at()',
  'accept_pack_invite(text)',
  'assert_rate_limit(text, integer, integer)',
  'can_contribute_to_dog(uuid)',
  'can_view_dog(uuid)',
  'create_pack_for_profile()',
  'create_pack_invite(text, text)',
  'ensure_user_pack(uuid)',
  'is_internal_user()',
  'is_pack_member(uuid)',
  'is_pack_owner(uuid)',
  'rate_limit_challenge_request()',
  'rate_limit_location_candidate()',
  'rate_limit_memory_photos()',
]

const authenticatedAllowlist = new Set([
  'accept_pack_invite(text)',
  'can_contribute_to_dog(uuid)',
  'can_view_dog(uuid)',
  'create_pack_invite(text, text)',
  'is_internal_user()',
  'is_pack_member(uuid)',
  'is_pack_owner(uuid)',
])

assert.match(
  migration,
  /alter function public\.set_updated_at\(\) set search_path = '';/,
  'set_updated_at must pin an empty search_path',
)

for (const signature of targetSignatures) {
  const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  assert.match(
    migration,
    new RegExp(`revoke execute on function public\\.${escaped} from public, anon, authenticated;`),
    `${signature} must revoke default/public API execution before any allowlisted grant`,
  )

  const grantPattern = new RegExp(`grant execute on function public\\.${escaped} to authenticated;`, 'g')
  const grants = migration.match(grantPattern) ?? []
  assert.equal(
    grants.length,
    authenticatedAllowlist.has(signature) ? 1 : 0,
    `${signature} has an unexpected authenticated grant`,
  )
}

assert.doesNotMatch(migration, /grant execute on function .* to (anon|public);/i)
assert.match(migration, /has_function_privilege\('anon'/)
assert.match(migration, /has_function_privilege\('authenticated'/)
assert.match(migration, /acl\.grantee = 0/)

const rpcNames = new Set()
for (const directory of ['src', path.join('supabase', 'functions')]) {
  const queue = [directory]
  while (queue.length > 0) {
    const current = queue.pop()
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(entryPath)
        continue
      }
      if (!/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) continue
      const source = await readFile(entryPath, 'utf8')
      for (const match of source.matchAll(/\.rpc\(\s*['"]([^'"]+)['"]/g)) rpcNames.add(match[1])
    }
  }
}

assert.deepEqual(
  [...rpcNames].sort(),
  ['accept_pack_invite', 'create_pack_invite'],
  'Only the two reviewed authenticated RPC endpoints should be called by app or Edge Function code',
)

console.log('[PASS] Supabase function privileges match the reviewed RPC/RLS allowlist')
