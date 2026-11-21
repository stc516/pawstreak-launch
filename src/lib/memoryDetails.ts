import type { JourneyEntry } from '../data/demo'
import { getSupabaseClient } from './supabase'
import { memoryRowToJourneyEntry } from './db/memories'
import type { MemoryRow } from './db/types'

export interface MemoryDetailInput { note: string; photoDataUrl?: string }

// Uses the existing memory fields, JPEG bucket and owner policies. No migration.
export async function saveMemoryDetails(userId: string, memoryId: string, input: MemoryDetailInput): Promise<JourneyEntry> {
  const client = getSupabaseClient()
  if (!client) throw new Error('Connect to save this detail. Your walk is already saved.')
  const { data: row, error } = await client.from('memories').select('*').eq('id', memoryId).eq('user_id', userId).single()
  if (error || !row) throw new Error('Could not open this memory for editing. Your walk is already saved.')
  const paths: string[] = row.photo_paths ?? []
  let newPath: string | undefined
  if (input.photoDataUrl) {
    if (paths.length >= 3) throw new Error('This memory already has three photos.')
    if (!input.photoDataUrl.startsWith('data:image/jpeg;')) throw new Error('Choose another photo.')
    const blob = await (await fetch(input.photoDataUrl)).blob()
    newPath = `${userId}/${memoryId}/detail-${crypto.randomUUID()}.jpg`
    const { error: uploadError } = await client.storage.from('memory-photos').upload(newPath, blob, { contentType: 'image/jpeg', upsert: false })
    if (uploadError) throw new Error('Could not add this photo. Try again; your walk is already saved.')
  }
  const { data: updated, error: updateError } = await client.from('memories')
    .update({ user_notes: input.note.trim() || null, photo_paths: newPath ? [...paths, newPath] : paths })
    .eq('id', memoryId).eq('user_id', userId).eq('updated_at', row.updated_at).select('*').single()
  if (updateError || !updated) {
    // A transport failure may follow a successful write. Only clean up a
    // definite optimistic-lock miss; never remove a possibly attached photo.
    if (newPath && updateError?.code === 'PGRST116') await client.storage.from('memory-photos').remove([newPath])
    throw new Error('Could not save this detail. Reopen the memory and try again. Your walk is already saved.')
  }
  return memoryRowToJourneyEntry(updated as MemoryRow)
}
