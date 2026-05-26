import type { ProfileRow } from './types'
import type { OnboardingResult } from '../onboardingProfile'
import { getSupabaseClient } from '../supabase'

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as ProfileRow
}

export async function upsertProfileFromOnboarding(
  userId: string,
  email: string | undefined,
  result: OnboardingResult,
  location: {
    zipCode: string
    locationQuery: string
    locationLabel: string
    locationSupported: boolean
  },
): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const payload = {
    id: userId,
    display_name: result.userName,
    email: email ?? null,
    zip_code: location.zipCode,
    location_query: location.locationQuery,
    location_label: location.locationLabel,
    location_supported: location.locationSupported,
    dog_vibe_names: result.vibeNames,
    onboarding_category_ids: result.categoryIds,
    onboarding_complete: true,
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (error || !data) return null
  return data as ProfileRow
}

export async function ensureProfileShell(userId: string, email?: string | null) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase.from('profiles').upsert(
    {
      id: userId,
      email: email ?? null,
    },
    { onConflict: 'id' },
  )
}
