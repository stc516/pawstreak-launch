import assert from 'node:assert/strict'
import {
  getInternalPathFromNativeUrl,
  getNativeRouteTarget,
} from '../src/lib/nativeDeepLinks'

const safariShape = { hostname: 'auth', pathname: '/invite' }
const androidWebViewShape = { hostname: '', pathname: '//auth/invite' }

assert.equal(getNativeRouteTarget(safariShape), 'auth/invite')
assert.equal(getNativeRouteTarget(androidWebViewShape), 'auth/invite')
assert.equal(
  getInternalPathFromNativeUrl('com.pawstreak.app://auth/invite?token=qa'),
  '/app/invite?token=qa',
)
assert.equal(
  getInternalPathFromNativeUrl('com.pawstreak.app://auth/callback?code=qa'),
  '/app?code=qa',
)
assert.equal(getInternalPathFromNativeUrl('https://pawstreakapp.com/app'), null)
assert.equal(getInternalPathFromNativeUrl('not a url'), null)

console.log('[PASS] native-deep-links: Safari and Android WebView URL shapes route correctly.')
