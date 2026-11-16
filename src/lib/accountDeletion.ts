import { getSupabaseClient } from './supabase'
import { clearNativePushAfterAuthLoss } from './nativePushNotifications'

export async function deleteCurrentAccount(): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Account deletion is unavailable while offline.')

  const { error } = await supabase.functions.invoke('delete-account', { body: {} })
  if (error) throw new Error(error.message || 'Could not delete your account.')

  await supabase.auth.signOut({ scope: 'local' })
  await clearNativePushAfterAuthLoss()
}
