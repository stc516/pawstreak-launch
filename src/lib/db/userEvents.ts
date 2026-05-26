import { getSupabaseClient } from '../supabase'
import type { UserEventName } from './types'

export async function trackUserEvent(
  eventName: UserEventName,
  metadata: Record<string, unknown> = {},
  userId?: string | null,
) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase.from('user_events').insert({
    event_name: eventName,
    metadata,
    user_id: userId ?? null,
    page_path: typeof window !== 'undefined' ? window.location.pathname : null,
  })
}
