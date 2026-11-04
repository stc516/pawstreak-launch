import assert from 'node:assert/strict'
import { build } from 'esbuild'

const output = await build({
  entryPoints: ['src/lib/nativeDeepLinkRoute.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
})
const compiled = output.outputFiles[0].text
const routeModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const route = (url) => routeModule.getInternalPathFromNativeUrl(url, 'com.pawstreak.app')

assert.equal(
  route('com.pawstreak.app://auth/invite?token=native-qa-token'),
  '/app/invite?token=native-qa-token',
  'Android appUrlOpen invite payload should preserve the invite route and query.',
)
assert.equal(
  route('COM.PAWSTREAK.APP://AUTH/invite#accepted'),
  '/app/invite#accepted',
  'Native URL scheme and host matching should be case-insensitive.',
)
assert.equal(
  route('com.pawstreak.app://auth/callback?code=oauth-code'),
  '/app?code=oauth-code',
  'OAuth callback should continue to route to the production app shell.',
)
assert.equal(
  route('com.pawstreak.app://auth/invite-extra?token=wrong-route'),
  '/app?token=wrong-route',
  'Invite matching must stop at a path boundary.',
)
assert.equal(route('https://pawstreakapp.com/app/invite?token=web'), null)
assert.equal(route('not a native URL'), null)

console.log('[PASS] Native invite and auth callback URLs map to the intended internal routes')
