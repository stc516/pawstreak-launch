import { getAuthRedirectUrl } from './routes'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export { isSupabaseConfigured }

export type EmailAuthResult = 'authenticated' | 'email_confirmation_required'

export const AUTH_EMAIL_CONFIRMATION_MESSAGE =
  'Check your email to confirm your account, then sign in.'

export const AUTH_PASSWORD_RESET_SENT_MESSAGE =
  'Password reset link sent. Check your email to continue.'

export function signupRequiresEmailConfirmation(data: {
  user: { id: string } | null
  session: unknown
}): boolean {
  return Boolean(data.user && !data.session)
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  })
  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const redirectTo = getAuthRedirectUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })
  if (error) throw error

  if (data?.url && typeof window !== 'undefined') {
    window.location.assign(data.url)
  }

  return data
}

export async function signOut() {
  const supabase = getSupabaseClient()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function resetPasswordForEmail(email: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getAuthRedirectUrl(),
  })
  if (error) throw error
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user ?? null
}
