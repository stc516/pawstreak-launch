import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'npm:jose@6.1.0'
const keys = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))
type Identity = { provider: string; id?: string; identity_data?: Record<string, unknown> }
export type AppleProof = { authorizationCode?: string; refreshToken?: string; platform?: string }
export type RevocationResult = 'not_applicable' | 'revoked' | 'manual_required'
export interface AppleDependencies {
  env: (name: string) => string | undefined
  post: typeof fetch
  verify: (token: string, audience: string) => Promise<{ sub?: string }>
  secret: (clientId: string) => Promise<string>
}
const defaults: AppleDependencies = {
  env: name => Deno.env.get(name), post: fetch,
  verify: async (token, audience) => (await jwtVerify(token, keys, { issuer: 'https://appleid.apple.com', audience, algorithms: ['RS256'] })).payload,
  secret: async clientId => {
    const team = Deno.env.get('APPLE_TEAM_ID'), keyId = Deno.env.get('APPLE_SIGN_IN_KEY_ID'), pem = Deno.env.get('APPLE_SIGN_IN_PRIVATE_KEY')
    if (!team || !keyId || !pem) throw new Error('Apple revocation configuration missing')
    const key = await importPKCS8(pem.replace(/\\n/g, '\n'), 'ES256')
    return new SignJWT({}).setProtectedHeader({ alg: 'ES256', kid: keyId }).setIssuer(team).setSubject(clientId).setAudience('https://appleid.apple.com').setIssuedAt().setExpirationTime('5m').sign(key)
  },
}
// No raw tokens are persisted/logged. Missing credentials must not prevent account deletion.
export async function revokeAppleGrant(identities: Identity[], proof: AppleProof, deps: AppleDependencies = defaults): Promise<RevocationResult> {
  const apple = identities.filter(identity => identity.provider === 'apple')
  if (!apple.length) return 'not_applicable'
  try {
    const native = proof.platform === 'ios'
    const grant = native ? proof.authorizationCode : proof.refreshToken
    if (typeof grant !== 'string' || !grant || grant.length > 8192) return 'manual_required'
    const clientId = native ? 'com.pawstreak.app' : deps.env('APPLE_SERVICE_ID')
    if (!clientId) return 'manual_required'
    const secret = await deps.secret(clientId)
    const form = new URLSearchParams({ client_id: clientId, client_secret: secret, grant_type: native ? 'authorization_code' : 'refresh_token', [native ? 'code' : 'refresh_token']: grant })
    const exchanged = await deps.post('https://appleid.apple.com/auth/token', { method: 'POST', body: form, signal: AbortSignal.timeout(10000) })
    if (!exchanged.ok) return 'manual_required'
    const tokens = await exchanged.json()
    if (typeof tokens.id_token !== 'string') return 'manual_required'
    const identity = await deps.verify(tokens.id_token, clientId)
    // Only server-verified linked identities; never trust client user IDs or user_metadata.
    if (!identity.sub || !apple.some(item => (item.identity_data?.sub ?? item.id) === identity.sub)) return 'manual_required'
    const token = native ? tokens.refresh_token : grant
    if (typeof token !== 'string' || !token) return 'manual_required'
    const result = await deps.post('https://appleid.apple.com/auth/revoke', { method: 'POST', body: new URLSearchParams({ client_id: clientId, client_secret: secret, token, token_type_hint: 'refresh_token' }), signal: AbortSignal.timeout(10000) })
    return result.ok ? 'revoked' : 'manual_required'
  } catch { return 'manual_required' }
}
