import { getSupabaseClient } from '../supabase'
import type { EarlyAccessSignupInput } from './types'

export async function insertEarlyAccessSignup(input: EarlyAccessSignupInput) {
  const supabase = getSupabaseClient()
  if (!supabase) return { ok: false as const }

  const { error } = await supabase.from('early_access_signups').insert({
    email: input.email.trim(),
    name: input.name?.trim() ?? '',
    dog_name: input.dogName?.trim() ?? '',
    zip_or_city: input.zipOrCity?.trim() ?? '',
    instagram_handle: input.instagramHandle?.trim() || null,
    source: input.source ?? 'website',
    user_id: input.userId ?? null,
  })

  if (error) {
    if (error.code === '23505') return { ok: true as const, duplicate: true as const }
    return { ok: false as const, error }
  }

  return { ok: true as const }
}
