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

// Check real Android dotted-scheme and cold/warm auth routing. OAuth codes
// must be exchanged by nativeDeepLinks, not left in the WebView URL.
const cases = [
  ['com.pawstreak.app://auth/invite?token=native-qa-token', '/app/invite?token=native-qa-token'],
  ['COM.PAWSTREAK.APP://AUTH/invite#accepted', '/app/invite#accepted'],
  ['com.pawstreak.app://auth/callback?code=oauth-code', '/app'],
  ['com.pawstreak.app://auth/invite?token=dog-pack&code=temporary', '/app/invite?token=dog-pack'],
  ['com.pawstreak.app://auth/callback?code=temporary&signin=1', '/app?signin=1'],
  ['com.pawstreak.app://auth/callback#access_token=secret&refresh_token=secret2', '/app'],
  ['com.pawstreak.app://auth/invite?token=pack#access_token=secret&state=ok', '/app/invite?token=pack#state=ok'],
  ['com.pawstreak.app://auth/invite-extra?token=wrong-route', '/app?token=wrong-route'],
  ['com.pawstreak.app://auth/callback?error=access_denied&error_description=cancelled', '/app?error=access_denied&error_description=cancelled'],
  ['https://pawstreakapp.com/app/invite?token=web', null],
  ['not a native URL', null],
]

for (const [url, expected] of cases) {
  assert.equal(route(url), expected, `Unexpected routing for ${url}`)
}
console.log(`[PASS] ${cases.length} native invite/auth redirects; OAuth credentials never remain in app URL`)
