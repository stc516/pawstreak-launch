import { revokeAppleGrant, type AppleDependencies } from '../supabase/functions/_shared/appleRevocation.ts'
function assert(value: unknown, label: string) { if (!value) throw new Error(label) }
const apple = [{ provider: 'apple', identity_data: { sub: 'verified-user' } }]
function fixture(options: { wrongUser?: boolean; invalidSignature?: boolean; exchangeFails?: boolean; revokeFails?: boolean } = {}) {
  const calls: { url: string; form: URLSearchParams }[] = []
  const deps: AppleDependencies = {
    env: () => 'web.service', secret: async () => 'test-only-secret',
    verify: async () => { if (options.invalidSignature) throw new Error('invalid signature'); return { sub: options.wrongUser ? 'other-user' : 'verified-user' } },
    post: async (input, init) => {
      const url = String(input); calls.push({ url, form: init?.body as URLSearchParams })
      if (url.endsWith('/token')) return Response.json({ id_token: 'test-token', refresh_token: 'refresh-from-apple' }, { status: options.exchangeFails ? 400 : 200 })
      return new Response(null, { status: options.revokeFails ? 503 : 200 })
    },
  }
  return { deps, calls }
}
Deno.test('native code exchanged, bound to authenticated Apple identity, then revoked', async () => {
  const { deps, calls } = fixture()
  assert(await revokeAppleGrant(apple, { platform: 'ios', authorizationCode: 'fresh-code' }, deps) === 'revoked', 'revoke success')
  assert(calls.length === 2, 'exchange then revoke')
  assert(calls[0].form.get('client_id') === 'com.pawstreak.app', 'native client pinned')
  assert(calls[0].form.get('code') === 'fresh-code', 'authorization code')
  assert(calls[1].form.get('token') === 'refresh-from-apple', 'revoke exchange token')
})
Deno.test('web refresh token validated before revocation', async () => {
  const { deps, calls } = fixture()
  assert(await revokeAppleGrant(apple, { platform: 'web', refreshToken: 'web-refresh' }, deps) === 'revoked', 'web revoke success')
  assert(calls[0].form.get('grant_type') === 'refresh_token', 'refresh grant')
  assert(calls[1].form.get('token') === 'web-refresh', 'web token revoked')
})
for (const options of [{ wrongUser: true }, { invalidSignature: true }, { exchangeFails: true }]) {
  Deno.test(`unverified/mismatched Apple grant is never revoked: ${JSON.stringify(options)}`, async () => {
    const { deps, calls } = fixture(options)
    assert(await revokeAppleGrant(apple, { platform: 'ios', authorizationCode: 'untrusted-code' }, deps) === 'manual_required', 'manual fallback')
    assert(calls.length === 1, 'no revoke call')
  })
}
Deno.test('missing grant or provider outage allows manual-disconnect deletion path', async () => {
  const { deps, calls } = fixture({ revokeFails: true })
  assert(await revokeAppleGrant(apple, {}, deps) === 'manual_required', 'missing proof fallback')
  assert(calls.length === 0, 'no network without proof')
  assert(await revokeAppleGrant(apple, { platform: 'ios', authorizationCode: 'code' }, deps) === 'manual_required', 'provider failure fallback')
  assert(await revokeAppleGrant([], {}, deps) === 'not_applicable', 'other providers unchanged')
})
