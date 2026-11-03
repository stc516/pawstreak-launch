import { PushNotifications } from '@capacitor/push-notifications'
import { Preferences } from '@capacitor/preferences'
import type { PushPreferences } from './pushNotifications'
import { getNativePlatform, isNativeAppRuntime } from './nativeRuntime'
import { getSupabaseClient } from './supabase'

const TOKEN_KEY = 'pawstreak.nativePush.token'
const ENABLED_KEY = 'pawstreak.nativePush.enabled'
const PREFERENCES_KEY = 'pawstreak.nativePush.preferences'
const REGISTRATION_TIMEOUT_MS = 15_000
const NATIVE_DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  morningEnabled: true,
  morningTime: '08:00',
  eveningEnabled: true,
  eveningTime: '19:00',
}

type NativePlatform = 'ios' | 'android'

interface RegistrationWaiter {
  resolve: () => void
  reject: (error: Error) => void
  timeoutId: number
}

export interface NativePushState {
  permission: NotificationPermission
  subscribed: boolean
  preferences: PushPreferences
}

let listenerSetupPromise: Promise<void> | null = null
let registrationWaiter: RegistrationWaiter | null = null
let initializationPromise: Promise<void> | null = null

function nativePlatform(): NativePlatform | null {
  const platform = getNativePlatform()
  return platform === 'ios' || platform === 'android' ? platform : null
}

function validTime(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    ? value
    : fallback
}

function normalizePreferences(value: Partial<PushPreferences> | null | undefined): PushPreferences {
  return {
    morningEnabled: value?.morningEnabled ?? NATIVE_DEFAULT_PUSH_PREFERENCES.morningEnabled,
    morningTime: validTime(value?.morningTime, NATIVE_DEFAULT_PUSH_PREFERENCES.morningTime),
    eveningEnabled: value?.eveningEnabled ?? NATIVE_DEFAULT_PUSH_PREFERENCES.eveningEnabled,
    eveningTime: validTime(value?.eveningTime, NATIVE_DEFAULT_PUSH_PREFERENCES.eveningTime),
  }
}

async function readPreferences(): Promise<PushPreferences> {
  const { value } = await Preferences.get({ key: PREFERENCES_KEY })
  if (!value) return NATIVE_DEFAULT_PUSH_PREFERENCES
  try {
    return normalizePreferences(JSON.parse(value) as Partial<PushPreferences>)
  } catch {
    return NATIVE_DEFAULT_PUSH_PREFERENCES
  }
}

async function readToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: TOKEN_KEY })
  return value?.trim() || null
}

async function isLocallyEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: ENABLED_KEY })
  return value === 'true'
}

async function writeLocalState(
  enabled: boolean,
  preferences: PushPreferences,
  token?: string,
): Promise<void> {
  await Promise.all([
    Preferences.set({ key: ENABLED_KEY, value: String(enabled) }),
    Preferences.set({ key: PREFERENCES_KEY, value: JSON.stringify(preferences) }),
    token ? Preferences.set({ key: TOKEN_KEY, value: token }) : Promise.resolve(),
  ])
}

function resolvedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function mapNativePermission(value: string): NotificationPermission {
  if (value === 'granted') return 'granted'
  if (value === 'denied') return 'denied'
  return 'default'
}

export function safeNativePushTarget(data: unknown): '/app' {
  if (!data || typeof data !== 'object') return '/app'
  const candidate = (data as Record<string, unknown>).path
  return candidate === '/app' ? candidate : '/app'
}

export function nativeTokenUpsertRow(input: {
  userId: string
  platform: NativePlatform
  token: string
  preferences: PushPreferences
}) {
  const now = new Date().toISOString()
  return {
    user_id: input.userId,
    platform: input.platform,
    token: input.token,
    timezone: resolvedTimezone(),
    app_version: import.meta.env?.VITE_APP_VERSION?.trim() || null,
    enabled: input.preferences.morningEnabled || input.preferences.eveningEnabled,
    morning_enabled: input.preferences.morningEnabled,
    morning_time: input.preferences.morningTime,
    evening_enabled: input.preferences.eveningEnabled,
    evening_time: input.preferences.eveningTime,
    last_seen_at: now,
    updated_at: now,
  }
}

async function saveToken(token: string, preferences: PushPreferences): Promise<void> {
  const platform = nativePlatform()
  const supabase = getSupabaseClient()
  if (!platform || !supabase) throw new Error('Sign in to save notification settings.')

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Sign in to save notification settings.')

  const previousToken = await readToken()
  const row = nativeTokenUpsertRow({
    userId: userData.user.id,
    platform,
    token,
    preferences,
  })
  const { error } = await supabase
    .from('native_device_tokens')
    .upsert(row, { onConflict: 'platform,token' })
  if (error) throw new Error(error.message || 'Could not save native notification settings.')

  if (previousToken && previousToken !== token) {
    await supabase
      .from('native_device_tokens')
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('platform', platform)
      .eq('token', previousToken)
      .eq('user_id', userData.user.id)
  }

  await writeLocalState(row.enabled, preferences, token)
}

function finishRegistration(error?: Error): void {
  if (!registrationWaiter) return
  window.clearTimeout(registrationWaiter.timeoutId)
  const waiter = registrationWaiter
  registrationWaiter = null
  if (error) waiter.reject(error)
  else waiter.resolve()
}

async function ensureNativePushListeners(): Promise<void> {
  if (!isNativeAppRuntime()) return
  if (listenerSetupPromise) return listenerSetupPromise

  listenerSetupPromise = Promise.all([
    PushNotifications.addListener('registration', (registration) => {
      void (async () => {
        try {
          if (!(await isLocallyEnabled())) {
            finishRegistration(new Error('Daily reminders are not enabled.'))
            return
          }
          await saveToken(registration.value, await readPreferences())
          finishRegistration()
        } catch (error) {
          const registrationError = error instanceof Error
            ? error
            : new Error('Could not save the device token.')
          if (registrationWaiter) finishRegistration(registrationError)
          else console.warn('[Native push] Could not save a refreshed device token.', registrationError)
        }
      })()
    }),
    PushNotifications.addListener('registrationError', (error) => {
      const registrationError = new Error(error.error || 'Native notification registration failed.')
      if (registrationWaiter) finishRegistration(registrationError)
      else console.warn('[Native push] Background registration failed.', registrationError)
    }),
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      window.location.assign(safeNativePushTarget(action.notification.data))
    }),
  ]).then(() => undefined).catch((error) => {
    listenerSetupPromise = null
    throw error
  })

  return listenerSetupPromise
}

async function registerAndWait(): Promise<void> {
  await ensureNativePushListeners()
  if (registrationWaiter) throw new Error('Notification registration is already in progress.')

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      registrationWaiter = null
      reject(new Error('Notification registration timed out. Check the native push configuration.'))
    }, REGISTRATION_TIMEOUT_MS)
    registrationWaiter = { resolve, reject, timeoutId }
    void PushNotifications.register().catch((error) => {
      finishRegistration(error instanceof Error ? error : new Error('Native notification registration failed.'))
    })
  })
}

export async function getNativePushState(): Promise<NativePushState> {
  const permission = mapNativePermission((await PushNotifications.checkPermissions()).receive)
  const token = await readToken()
  const preferences = await readPreferences()
  const locallyEnabled = await isLocallyEnabled()
  const platform = nativePlatform()
  const supabase = getSupabaseClient()

  if (token && platform && supabase) {
    const { data, error } = await supabase
      .from('native_device_tokens')
      .select('enabled,morning_enabled,morning_time,evening_enabled,evening_time')
      .eq('platform', platform)
      .eq('token', token)
      .maybeSingle()
    if (error) throw new Error(error.message || 'Could not load native notification settings.')
    if (data) {
      return {
        permission,
        subscribed: permission === 'granted' && data.enabled,
        preferences: {
          morningEnabled: data.morning_enabled,
          morningTime: String(data.morning_time).slice(0, 5),
          eveningEnabled: data.evening_enabled,
          eveningTime: String(data.evening_time).slice(0, 5),
        },
      }
    }
  }

  return {
    permission,
    subscribed: permission === 'granted' && locallyEnabled && Boolean(token),
    preferences,
  }
}

export async function enableNativePushNotifications(preferences: PushPreferences): Promise<void> {
  await ensureNativePushListeners()
  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') {
    throw new Error(permission.receive === 'denied'
      ? 'Notifications are blocked. Enable them in your device settings.'
      : 'Notification permission was not granted.')
  }

  const normalized = normalizePreferences(preferences)
  await writeLocalState(true, normalized)
  try {
    await registerAndWait()
  } catch (error) {
    await Preferences.set({ key: ENABLED_KEY, value: 'false' })
    throw error
  }
}

export async function updateNativePushPreferences(preferences: PushPreferences): Promise<void> {
  const normalized = normalizePreferences(preferences)
  const token = await readToken()
  if (!token) {
    await enableNativePushNotifications(normalized)
    return
  }
  await saveToken(token, normalized)
}

export async function disableNativePushNotifications(): Promise<void> {
  const token = await readToken()
  const platform = nativePlatform()
  const supabase = getSupabaseClient()
  if (token && platform && supabase) {
    const { error } = await supabase
      .from('native_device_tokens')
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('platform', platform)
      .eq('token', token)
    if (error) throw new Error(error.message || 'Could not disable native reminders.')
  }
  await Preferences.set({ key: ENABLED_KEY, value: 'false' })
}

export async function initializeNativePushForAuthenticatedUser(): Promise<void> {
  if (!isNativeAppRuntime()) return
  if (initializationPromise) return initializationPromise
  initializationPromise = (async () => {
    if (!(await isLocallyEnabled())) return
    await ensureNativePushListeners()
    const permission = await PushNotifications.checkPermissions()
    if (permission.receive === 'granted') {
      await PushNotifications.register()
    }
  })().finally(() => {
    initializationPromise = null
  })
  return initializationPromise
}

export async function clearNativePushForSignOut(): Promise<void> {
  if (!isNativeAppRuntime()) return
  const token = await readToken()
  const platform = nativePlatform()
  const supabase = getSupabaseClient()
  if (token && platform && supabase) {
    await supabase
      .from('native_device_tokens')
      .delete()
      .eq('platform', platform)
      .eq('token', token)
  }

  await Promise.all([
    Preferences.remove({ key: TOKEN_KEY }),
    Preferences.remove({ key: ENABLED_KEY }),
    Preferences.remove({ key: PREFERENCES_KEY }),
    PushNotifications.unregister().catch(() => undefined),
  ])
}

export async function clearNativePushAfterAuthLoss(): Promise<void> {
  if (!isNativeAppRuntime()) return
  await Promise.all([
    Preferences.remove({ key: TOKEN_KEY }),
    Preferences.remove({ key: ENABLED_KEY }),
    Preferences.remove({ key: PREFERENCES_KEY }),
    PushNotifications.unregister().catch(() => undefined),
  ])
}
