import { deleteOwnedStorage } from '../supabase/functions/_shared/deleteOwnedStorage.ts'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.106.2'
Deno.test('deletion paginates nested files and removes in bounded batches', async () => {
  const removed: string[][] = [], offsets: number[] = []
  const files = Array.from({ length: 2005 }, (_, index) => ({ id: `${index}`, name: `file-${index}` }))
  const client = { storage: { from: () => ({
    list: async (prefix: string, options: { offset: number; limit: number }) => {
      if (prefix === 'owner') return { data: [{ id: null, name: 'memory' }], error: null }
      offsets.push(options.offset)
      return { data: files.slice(options.offset, options.offset + options.limit), error: null }
    },
    remove: async (paths: string[]) => { removed.push(paths); return { error: null } },
  }) } } as unknown as SupabaseClient
  await deleteOwnedStorage(client, 'memory-photos', 'owner')
  if (JSON.stringify(offsets) !== '[0,1000,2000]') throw new Error('Wrong offsets')
  if (JSON.stringify(removed.map(batch => batch.length)) !== '[1000,1000,5]') throw new Error('Wrong batch size')
  if (!removed.flat().every(path => path.startsWith('owner/memory/'))) throw new Error('Ownership prefix lost')
})
Deno.test('listing failure never proceeds to removal', async () => {
  let removed = false, failed = false
  const client = { storage: { from: () => ({ list: async () => ({ data: null, error: new Error('offline') }), remove: async () => { removed = true } }) } } as unknown as SupabaseClient
  try { await deleteOwnedStorage(client, 'memory-photos', 'owner') } catch { failed = true }
  if (!failed || removed) throw new Error('Unsafe failure behavior')
})
