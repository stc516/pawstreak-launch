import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'
import { isNativeAppRuntime } from './nativeRuntime'

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (client) return client

  const nativeStorage = {
    async getItem(key: string): Promise<string | null> {
      return (await Preferences.get({ key })).value
    },
    async setItem(key: string, value: string): Promise<void> {
      await Preferences.set({ key, value })
    },
    async removeItem(key: string): Promise<void> {
      await Preferences.remove({ key })
    },
  }

  client = createClient(
    import.meta.env.VITE_SUPABASE_URL!.trim(),
    import.meta.env.VITE_SUPABASE_ANON_KEY!.trim(),
    isNativeAppRuntime()
      ? {
          auth: {
            storage: nativeStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            flowType: 'pkce',
          },
        }
      : undefined,
  )
  return client
}
