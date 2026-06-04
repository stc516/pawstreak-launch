import type { ScheduledAdventure } from '../customAdventure'
import { getSupabaseClient } from '../supabase'

export interface ScheduledAdventureRow {
  id: string
  user_id: string
  dog_ids: string[]
  title: string
  location_label: string
  notes: string
  photo_path: string | null
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

function rowToScheduled(row: ScheduledAdventureRow): ScheduledAdventure {
  return {
    id: row.id,
    title: row.title,
    locationLabel: row.location_label || undefined,
    notes: row.notes || undefined,
    selectedDogIds: row.dog_ids.map(String),
    createdAt: row.created_at,
    scheduledFor: row.scheduled_for ?? undefined,
  }
}

export async function fetchScheduledAdventuresForUser(
  userId: string,
): Promise<ScheduledAdventure[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('scheduled_adventures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as ScheduledAdventureRow[]).map(rowToScheduled)
}

export async function insertScheduledAdventure(input: {
  userId: string
  title: string
  locationLabel?: string
  notes?: string
  selectedDogIds: string[]
}): Promise<ScheduledAdventure | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('scheduled_adventures')
    .insert({
      user_id: input.userId,
      dog_ids: input.selectedDogIds,
      title: input.title.trim(),
      location_label: input.locationLabel?.trim() ?? '',
      notes: input.notes?.trim() ?? '',
    })
    .select('*')
    .single()

  if (error || !data) return null
  return rowToScheduled(data as ScheduledAdventureRow)
}

export async function deleteScheduledAdventure(
  id: string,
  userId: string,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('scheduled_adventures')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return !error
}
