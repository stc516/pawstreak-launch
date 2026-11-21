import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'
import type { PushPreferences, PushNotificationState } from './pushNotifications'

const KEY = 'pawstreak-native-reminders-v1'
const IDS = [701001, 701002]
const DEFAULTS: PushPreferences = { morningEnabled: true, morningTime: '08:00', eveningEnabled: true, eveningTime: '19:00' }
export function reminderSchedule(preferences: PushPreferences) {
  return [
    { enabled: preferences.morningEnabled, time: preferences.morningTime, id: IDS[0], title: 'A little outside time?', body: 'Find an adventure or take a Neighborhood Walk with your dog.' },
    { enabled: preferences.eveningEnabled, time: preferences.eveningTime, id: IDS[1], title: 'Remember your dog’s day', body: 'Open PawStreak to save a memory or plan your next outing.' },
  ].filter(item => item.enabled).map(item => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) throw new Error('Choose a valid reminder time.')
    const [hour, minute] = item.time.split(':').map(Number)
    return { id: item.id, title: item.title, body: item.body, schedule: { on: { hour, minute }, repeats: true }, extra: { route: '/app' } }
  })
}
export async function getNativeReminderState(): Promise<PushNotificationState> {
  const permission = (await LocalNotifications.checkPermissions()).display
  const saved = await Preferences.get({ key: KEY })
  let preferences = DEFAULTS
  try { if (saved.value) preferences = JSON.parse(saved.value) } catch { /* Use defaults for corrupt local preferences. */ }
  const pending = await LocalNotifications.getPending()
  return { supported: true, configured: true, installed: true, isIos: false,
    permission: permission === 'granted' || permission === 'denied' ? permission : 'default',
    subscribed: permission === 'granted' && pending.notifications.some(item => IDS.includes(item.id)), preferences }
}
export async function setNativeReminders(preferences: PushPreferences, notificationsApi: Pick<typeof LocalNotifications, 'requestPermissions' | 'cancel' | 'schedule'> = LocalNotifications, preferencesApi: Pick<typeof Preferences, 'set'> = Preferences) {
  const notifications = reminderSchedule(preferences)
  if (notifications.length && (await notificationsApi.requestPermissions()).display !== 'granted') throw new Error('Allow PawStreak notifications in your phone settings to receive reminders.')
  await notificationsApi.cancel({ notifications: IDS.map(id => ({ id })) })
  if (notifications.length) await notificationsApi.schedule({ notifications })
  await preferencesApi.set({ key: KEY, value: JSON.stringify(preferences) })
}
export async function disableNativeReminders() {
  await LocalNotifications.cancel({ notifications: IDS.map(id => ({ id })) })
  await Preferences.remove({ key: KEY })
}
