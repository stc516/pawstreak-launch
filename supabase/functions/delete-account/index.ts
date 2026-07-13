import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

async function collectStoragePaths(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error) throw error

  const paths: string[] = []
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`
    if (item.id) paths.push(path)
    else paths.push(...await collectStoragePaths(supabase, bucket, path))
  }
  return paths
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, { status: 405 })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const authorization = req.headers.get('Authorization') ?? ''

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
      return jsonResponse({ error: 'Account deletion is not configured.' }, { status: 503 })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Authentication required.' }, { status: 401 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const userId = userData.user.id
    const photoPaths = await collectStoragePaths(admin, 'memory-photos', userId)
    if (photoPaths.length > 0) {
      const { error: photoError } = await admin.storage.from('memory-photos').remove(photoPaths)
      if (photoError) throw photoError
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return jsonResponse({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete account.'
    return jsonResponse({ error: message }, { status: 500 })
  }
})
