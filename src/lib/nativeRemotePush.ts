import { PushNotifications } from '@capacitor/push-notifications'
import { Preferences } from '@capacitor/preferences'
import { getNativePlatform } from './nativeRuntime'
import { getSupabaseClient } from './supabase'
import { disableNativeReminders } from './nativeReminders'
import type { PushPreferences, PushNotificationState } from './pushNotifications'
const KEY = 'pawstreak-apns-token'
export const usesRemotePush = () => getNativePlatform() === 'ios' && import.meta.env.VITE_NATIVE_REMOTE_PUSH_ENABLED === 'true'
async function save(action: string, token: string, preferences?: PushPreferences) {
  const client = getSupabaseClient()
  if (!client) throw new Error('Sign in to update reminders.')
  const { error } = await client.functions.invoke('native-push-tokens', { body: { action, token, preferences, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } })
  if (error) throw new Error('Could not update reminders. Please try again.')
}
async function register(): Promise<string> {
  if ((await PushNotifications.requestPermissions()).receive !== 'granted') throw new Error('Allow notifications in your iPhone settings.')
  const handles: { remove: () => Promise<void> }[] = []
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await new Promise<string>((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Notification registration timed out. Please try again.')), 15000)
      void (async () => {
        handles.push(await PushNotifications.addListener('registration', token => resolve(token.value)))
        handles.push(await PushNotifications.addListener('registrationError', () => reject(new Error('Could not register this iPhone for notifications.'))))
        await PushNotifications.register()
      })().catch(reject)
    })
  } finally { clearTimeout(timeout); await Promise.all(handles.map(handle => handle.remove())) }
}
export async function setRemoteReminders(preferences: PushPreferences) {
  const token = await register()
  await save('upsert', token, preferences)
  await Preferences.set({ key: KEY, value: token })
  await disableNativeReminders()
}
export async function disableRemoteReminders() {
  const { value } = await Preferences.get({ key: KEY })
  if (value) await save('disable', value)
  await PushNotifications.unregister()
  await Preferences.remove({ key: KEY })
  await disableNativeReminders()
}
export async function getRemoteReminderState(): Promise<PushNotificationState> {
  const permission = (await PushNotifications.checkPermissions()).receive
  const { value } = await Preferences.get({ key: KEY })
  const client = getSupabaseClient()
  const result = value && client ? await client.from('native_push_devices').select('morning_enabled,morning_time,evening_enabled,evening_time').eq('token', value).maybeSingle() : null
  if (result?.error) throw new Error('Could not load notification settings.')
  const row = result?.data
  return { supported: true, configured: Boolean(client), installed: true, isIos: true, permission: permission === 'granted' || permission === 'denied' ? permission : 'default', subscribed: permission === 'granted' && Boolean(row && (row.morning_enabled || row.evening_enabled)), preferences: { morningEnabled: row?.morning_enabled ?? true, morningTime: String(row?.morning_time ?? '08:00').slice(0,5), eveningEnabled: row?.evening_enabled ?? true, eveningTime: String(row?.evening_time ?? '19:00').slice(0,5) } }
}
