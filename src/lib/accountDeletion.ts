import { appleDeletionProof } from './appleAuth'
import { getSupabaseClient } from './supabase'

export async function deleteCurrentAccount(): Promise<{ appleRevocation: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Account deletion is unavailable while offline.')

  const apple = await appleDeletionProof()
  const { data, error } = await supabase.functions.invoke('delete-account', { body: { apple } })
  if (error) throw new Error(error.message || 'Could not delete your account.')

  if (data?.deleted !== true) throw new Error('Account deletion was not confirmed. Please try again.')
  await supabase.auth.signOut({ scope: 'local' })
  return { appleRevocation: data.appleRevocation ?? 'manual_required' }
}
