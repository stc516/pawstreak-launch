import { getAuthRedirectUrl } from './routes'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export { isSupabaseConfigured }

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = getSupabaseClient()
  if (!supabase) return
  await supabase.auth.signOut()
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
