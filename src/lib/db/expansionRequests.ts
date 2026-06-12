import type { ResolvedLocation } from '../geocode'
import { getSupabaseClient } from '../supabase'

export interface ExpansionRequestInput {
  userId?: string | null
  dogId?: string | null
  rawLocationInput: string
  resolved: ResolvedLocation | null
  source: 'onboarding' | 'profile'
}

/**
 * Record a location outside developed regions for market planning.
 * Never throws and never blocks the caller — onboarding/profile flows
 * must continue even if this fails.
 */
export async function recordLocationExpansionRequest(
  input: ExpansionRequestInput,
): Promise<boolean> {
  const locationLabel =
    input.resolved
      ? [input.resolved.city, input.resolved.state].filter(Boolean).join(', ') ||
        input.rawLocationInput
      : input.rawLocationInput

  // Founder/dev visibility until an admin surface exists.
  console.info(`New unsupported location request: ${locationLabel}`)

  try {
    const supabase = getSupabaseClient()
    if (!supabase || !input.userId) return false

    const { error } = await supabase.from('location_expansion_requests').insert({
      user_id: input.userId,
      dog_id: input.dogId ?? null,
      raw_location_input: input.rawLocationInput,
      resolved_city: input.resolved?.city ?? '',
      resolved_state: input.resolved?.state ?? '',
      resolved_country: input.resolved?.country ?? '',
      latitude: input.resolved?.lat ?? null,
      longitude: input.resolved?.lng ?? null,
      mapbox_place_id: input.resolved?.mapboxPlaceId || null,
      mapbox_relevance: input.resolved?.relevance ?? null,
      supported_region: false,
      requested_region: locationLabel,
      source: input.source,
      status: 'new',
      notes: 'User outside developed region',
    })

    return !error
  } catch {
    return false
  }
}
