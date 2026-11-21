import { App as CapacitorApp } from '@capacitor/app'
import { createSerialQueue, refreshConsentedDevice, type DeviceConsent } from './remotePushLifecycle'
import { PushNotifications } from '@capacitor/push-notifications'
import { Preferences } from '@capacitor/preferences'
import { getNativePlatform } from './nativeRuntime'
import { getSupabaseClient } from './supabase'
import { disableNativeReminders } from './nativeReminders'
import type { PushPreferences, PushNotificationState } from './pushNotifications'
const KEY = 'pawstreak-apns-token'
const CONSENT = 'pawstreak-apns-consent-v1'
const serial = createSerialQueue()
export const usesRemotePush = () => getNativePlatform() === 'ios' && import.meta.env.VITE_NATIVE_REMOTE_PUSH_ENABLED === 'true'
async function save(action: string, token: string, preferences?: PushPreferences, previousToken?: string) {
  const client = getSupabaseClient()
  if (!client) throw new Error('Sign in to update reminders.')
  const { data, error } = await client.functions.invoke('native-push-tokens', { body: { action, token, previousToken, preferences, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } })
  if (error) throw new Error('Could not update reminders. Please try again.')
  return data?.saved === true
}
async function register(prompt = true): Promise<string> {
  if ((await (prompt ? PushNotifications.requestPermissions() : PushNotifications.checkPermissions())).receive !== 'granted') throw new Error('Allow notifications in your iPhone settings.')
  const handles: { remove: () => Promise<void> }[] = []
  let closed = false
  const keep = async (pending: Promise<{ remove: () => Promise<void> }>) => {
    const handle = await pending
    if (closed) await handle.remove()
    else handles.push(handle)
  }
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await new Promise<string>((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Notification registration timed out. Please try again.')), 15000)
      void (async () => {
        await keep(PushNotifications.addListener('registration', token => resolve(token.value)))
        await keep(PushNotifications.addListener('registrationError', () => reject(new Error('Could not register this iPhone for notifications.'))))
        if (!closed) await PushNotifications.register()
      })().catch(reject)
    })
  } finally { closed = true; clearTimeout(timeout); await Promise.all(handles.map(handle => handle.remove())) }
}
export function setRemoteReminders(preferences: PushPreferences) { return serial(async () => {
  const userId = await currentUserId()
  if (!userId) throw new Error('Sign in to update reminders.')
  const token = await register()
  if (userId !== await currentUserId()) throw new Error('Account changed. Please try again.')
  const previous = await Preferences.get({ key: KEY })
  if (!await save('upsert', token, preferences, previous.value ?? undefined)) throw new Error('Reminder settings were not saved.')
  await persistConsent({ userId, token })
  await disableNativeReminders()
}) }
export function disableRemoteReminders() { return serial(async () => {
  const { value } = await Preferences.get({ key: KEY })
  if (value) await save('disable', value)
  await PushNotifications.unregister()
  await clearConsent()
  await disableNativeReminders()
}) }
export async function getRemoteReminderState(): Promise<PushNotificationState> {
  const permission = (await PushNotifications.checkPermissions()).receive
  const { value } = await Preferences.get({ key: KEY })
  const client = getSupabaseClient()
  const result = value && client ? await client.from('native_push_devices').select('morning_enabled,morning_time,evening_enabled,evening_time').eq('token', value).maybeSingle() : null
  if (result?.error) throw new Error('Could not load notification settings.')
  const row = result?.data
  return { supported: true, configured: Boolean(client), installed: true, isIos: true, permission: permission === 'granted' || permission === 'denied' ? permission : 'default', subscribed: permission === 'granted' && Boolean(row && (row.morning_enabled || row.evening_enabled)), preferences: { morningEnabled: row?.morning_enabled ?? true, morningTime: String(row?.morning_time ?? '08:00').slice(0,5), eveningEnabled: row?.evening_enabled ?? true, eveningTime: String(row?.evening_time ?? '19:00').slice(0,5) } }
}


async function currentUserId() {
  const client = getSupabaseClient()
  return client ? (await client.auth.getUser()).data.user?.id ?? null : null
}
async function persistConsent(record: DeviceConsent) {
  await Preferences.set({ key: KEY, value: record.token })
  await Preferences.set({ key: CONSENT, value: JSON.stringify(record) })
}
async function clearConsent() {
  await Preferences.remove({ key: KEY })
  await Preferences.remove({ key: CONSENT })
}
export function refreshRemoteReminders() { return serial(() => refreshConsentedDevice({
  read: async () => {
    const { value } = await Preferences.get({ key: CONSENT })
    try { const record = JSON.parse(value || 'null'); return typeof record?.userId === 'string' && typeof record?.token === 'string' ? record : null } catch { return null }
  },
  userId: currentUserId,
  permission: async () => (await PushNotifications.checkPermissions()).receive === 'granted',
  register: () => register(false),
  rotate: (oldToken, newToken) => save('refresh', newToken, undefined, oldToken),
  persist: persistConsent,
  clear: clearConsent,
})) }
export function startRemoteReminderRefresh() {
  if (!usesRemotePush()) return () => {}
  let stopped = false
  const refresh = () => { if (!stopped) void refreshRemoteReminders().catch(() => { /* Retry on next foreground; settings exposes errors. */ }) }
  refresh()
  const listener = CapacitorApp.addListener('appStateChange', state => { if (state.isActive) refresh() })
  return () => { stopped = true; void listener.then(handle => handle.remove()).catch(() => {}) }
}
