import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.106.2'

export async function collectStoragePaths(
  supabase: SupabaseClient,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    for (const item of data ?? []) {
      const path = `${prefix}/${item.name}`
      if (item.id) paths.push(path)
      else paths.push(...await collectStoragePaths(supabase, bucket, path))
    }
    if (!data || data.length < 1000) break
  }
  return paths
}

export async function deleteOwnedStorage(supabase: SupabaseClient, bucket: string, userId: string) {
  const paths = await collectStoragePaths(supabase, bucket, userId)
  for (let offset = 0; offset < paths.length; offset += 1000) {
    const { error } = await supabase.storage.from(bucket).remove(paths.slice(offset, offset + 1000))
    if (error) throw error
  }
}
