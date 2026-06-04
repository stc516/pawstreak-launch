import { getSupabaseClient } from '../supabase'
import type { AdventureRow } from './types'

export async function createAdventure(input: {
  userId: string
  dogId: string
  placeId: string
  durationLabel: string
  source?: AdventureRow['source']
  customTitle?: string
  customLocationLabel?: string
  notes?: string
}): Promise<AdventureRow | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('adventures')
    .insert({
      user_id: input.userId,
      dog_id: input.dogId,
      place_id: input.placeId,
      duration_label: input.durationLabel,
      status: 'active',
      source: input.source ?? 'catalog',
      custom_title: input.customTitle ?? null,
      custom_location_label: input.customLocationLabel ?? null,
      notes: input.notes ?? '',
    })
    .select('*')
    .single()

  if (error || !data) return null
  return data as AdventureRow
}

export async function completeAdventure(
  adventureId: string,
  userId: string,
  recapLabels: string[],
) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase
    .from('adventures')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      recap_labels: recapLabels,
    })
    .eq('id', adventureId)
    .eq('user_id', userId)
}

export async function cancelAdventure(adventureId: string, userId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase
    .from('adventures')
    .update({ status: 'cancelled', finished_at: new Date().toISOString() })
    .eq('id', adventureId)
    .eq('user_id', userId)
}
