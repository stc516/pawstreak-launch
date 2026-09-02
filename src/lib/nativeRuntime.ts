import { Capacitor } from '@capacitor/core'

export const NATIVE_APP_SCHEME = 'com.pawstreak.app'
export const NATIVE_AUTH_CALLBACK_URL = `${NATIVE_APP_SCHEME}://auth/callback`

export function getNativePlatform(): string {
  return Capacitor.getPlatform()
}

export function isNativeAppRuntime(): boolean {
  try {
    if (Capacitor.isNativePlatform()) return true
  } catch {
    // Fall through to platform detection.
  }

  return ['ios', 'android'].includes(getNativePlatform())
}
