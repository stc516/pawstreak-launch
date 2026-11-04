import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const migrationName = (await readdir('supabase/migrations')).find((name) =>
  name.endsWith('_restrict_public_security_definer_execution.sql'),
)
assert.ok(migrationName, 'security-definer ACL migration exists')

const sql = (await readFile(`supabase/migrations/${migrationName}`, 'utf8'))
  .replace(/--.*$/gm, '')
  .replace(/\s+/g, ' ')
  .toLowerCase()

const noDirectClientRpc = [
  'is_pack_owner(uuid)',
  'is_pack_member(uuid)',
  'can_view_dog(uuid)',
  'can_contribute_to_dog(uuid)',
  'ensure_user_pack(uuid)',
  'create_pack_for_profile()',
  'assert_rate_limit(text, integer, integer)',
  'create_pack_invite(text, text)',
  'accept_pack_invite(text)',
  'rate_limit_location_candidate()',
  'rate_limit_challenge_request()',
  'rate_limit_memory_photos()',
  'is_internal_user()',
]

for (const signature of noDirectClientRpc) {
  assert.ok(
    sql.includes(`revoke execute on function public.${signature} from public, anon, authenticated;`),
    `revokes default public/anonymous/authenticated execution for ${signature}`,
  )
}

for (const signature of [
  'is_pack_owner(uuid)',
  'is_pack_member(uuid)',
  'can_view_dog(uuid)',
  'can_contribute_to_dog(uuid)',
  'is_internal_user()',
]) {
  assert.ok(
    sql.includes(`grant execute on function public.${signature} to authenticated;`),
    `preserves authenticated RLS helper execution for ${signature}`,
  )
}

for (const signature of ['create_pack_invite(text, text)', 'accept_pack_invite(text)']) {
  assert.ok(
    sql.includes(`grant execute on function public.${signature} to service_role;`),
    `preserves Edge Function execution for ${signature}`,
  )
}

assert.ok(sql.includes('alter table public.push_cron_tokens enable row level security;'))
assert.ok(
  sql.includes('revoke all on table public.push_cron_tokens from public, anon, authenticated;'),
)

console.log('[PASS] security-definer-acl: anonymous client RPC access is revoked')
console.log('[PASS] security-definer-acl: authenticated policy helpers remain callable')
console.log('[PASS] security-definer-acl: invitation Edge Functions retain service-role access')
console.log('[PASS] security-definer-acl: cron-token table is RLS-enabled and private')
