import { getSupabaseClient } from './supabase'

export interface PushPreferences {
  morningEnabled: boolean
  morningTime: string
  eveningEnabled: boolean
  eveningTime: string
}

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  morningEnabled: true,
  morningTime: '08:00',
  eveningEnabled: true,
  eveningTime: '19:00',
}

export interface PushNotificationState {
  supported: boolean
  configured: boolean
  installed: boolean
  isIos: boolean
  permission: NotificationPermission | 'unsupported'
  subscribed: boolean
  preferences: PushPreferences
}

function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInstalledApp(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || standaloneNavigator.standalone === true
}

function isSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function publicVapidKey(): string {
  return import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY?.trim() ?? ''
}

function applicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from(raw, (character) => character.charCodeAt(0))
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!isSupported()) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

async function saveSubscription(
  subscription: PushSubscription,
  preferences: PushPreferences,
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Sign in to save notification settings.')
  const payload = subscription.toJSON()
  const { error } = await supabase.functions.invoke('push-subscriptions', {
    body: {
      action: 'upsert',
      subscription: payload,
      preferences: {
        ...preferences,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
    },
  })
  if (error) throw new Error(error.message || 'Could not save notification settings.')
}

export async function getPushNotificationState(): Promise<PushNotificationState> {
  const supported = isSupported()
  const subscription = supported ? await currentSubscription() : null
  let preferences = DEFAULT_PUSH_PREFERENCES

  if (subscription) {
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('morning_enabled,morning_time,evening_enabled,evening_time')
        .eq('endpoint', subscription.endpoint)
        .maybeSingle()
      if (data) {
        preferences = {
          morningEnabled: data.morning_enabled,
          morningTime: String(data.morning_time).slice(0, 5),
          eveningEnabled: data.evening_enabled,
          eveningTime: String(data.evening_time).slice(0, 5),
        }
      }
    }
  }

  return {
    supported,
    configured: Boolean(publicVapidKey()),
    installed: isInstalledApp(),
    isIos: isIosDevice(),
    permission: supported ? Notification.permission : 'unsupported',
    subscribed: Boolean(subscription),
    preferences,
  }
}

export async function enablePushNotifications(
  preferences: PushPreferences = DEFAULT_PUSH_PREFERENCES,
): Promise<void> {
  if (!isSupported()) throw new Error('Push notifications are not supported on this browser.')
  if (isIosDevice() && !isInstalledApp()) {
    throw new Error('On iPhone, add PawStreak to your Home Screen before enabling notifications.')
  }
  const vapidKey = publicVapidKey()
  if (!vapidKey) throw new Error('Push notifications still need their production key configured.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error(permission === 'denied'
      ? 'Notifications are blocked. Enable them in your device settings.'
      : 'Notification permission was not granted.')
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(vapidKey),
  })
  await saveSubscription(subscription, preferences)
}

export async function updatePushPreferences(preferences: PushPreferences): Promise<void> {
  const subscription = await currentSubscription()
  if (!subscription) {
    await enablePushNotifications(preferences)
    return
  }
  await saveSubscription(subscription, preferences)
}

export async function disablePushNotifications(): Promise<void> {
  const subscription = await currentSubscription()
  if (!subscription) return
  const supabase = getSupabaseClient()
  if (!supabase) return
  const { error } = await supabase.functions.invoke('push-subscriptions', {
    body: { action: 'disable', subscription: subscription.toJSON() },
  })
  if (error) throw new Error(error.message || 'Could not disable reminders.')
}
