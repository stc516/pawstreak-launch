import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (client) return client

  client = createClient(
    import.meta.env.VITE_SUPABASE_URL!.trim(),
    import.meta.env.VITE_SUPABASE_ANON_KEY!.trim(),
  )
  return client
}
