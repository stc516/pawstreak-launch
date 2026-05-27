import { getSupabaseClient } from '../supabase'
import type { WaitlistSignupInput } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidWaitlistEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export async function insertWaitlistSignup(input: WaitlistSignupInput) {
  const supabase = getSupabaseClient()
  if (!supabase) return { ok: false as const, reason: 'not_configured' as const }

  const email = input.email.trim()
  if (!isValidWaitlistEmail(email)) {
    return { ok: false as const, reason: 'invalid_email' as const }
  }

  const { error } = await supabase.from('waitlist_signups').insert({
    name: input.name?.trim() ?? '',
    email,
    dog_name: input.dogName?.trim() ?? '',
    zip_code: input.zipCode?.trim() ?? '',
    source: input.source ?? 'landing_page',
  })

  if (error) {
    if (error.code === '23505') {
      return { ok: true as const, duplicate: true as const }
    }
    return { ok: false as const, reason: 'insert_failed' as const, error }
  }

  return { ok: true as const }
}
