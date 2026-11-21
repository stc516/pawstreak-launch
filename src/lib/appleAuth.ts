import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { getSupabaseClient } from './supabase'
import { getNativePlatform } from './nativeRuntime'
import { getAuthRedirectUrl } from './routes'

export async function createAppleNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const raw = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hashed = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('')
  return { raw, hashed }
}
export async function signInWithApple() {
  const client = getSupabaseClient()
  if (!client || import.meta.env.VITE_APPLE_AUTH_ENABLED !== 'true') throw new Error('Apple sign-in is not configured for this build.')
  if (getNativePlatform() === 'ios') {
    const nonce = await createAppleNonce()
    const { response } = await SignInWithApple.authorize({ clientId: 'com.pawstreak.app', redirectURI: getAuthRedirectUrl(), scopes: 'email name', nonce: nonce.hashed, state: crypto.randomUUID() })
    if (!response.identityToken) throw new Error('Apple did not return a sign-in token. Please try again.')
    const { data, error } = await client.auth.signInWithIdToken({ provider: 'apple', token: response.identityToken, nonce: nonce.raw })
    if (error) throw error
    if (!data.session) throw new Error('Apple sign-in could not be completed. Please try again.')
    return
  }
  const { data, error } = await client.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: getAuthRedirectUrl(), skipBrowserRedirect: true } })
  if (error) throw error
  if (!data.url) throw new Error('Apple sign-in could not be started. Please try again.')
  window.location.assign(data.url)
}
