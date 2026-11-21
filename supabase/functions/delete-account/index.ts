import { deleteOwnedStorage } from '../_shared/deleteOwnedStorage.ts'
import { revokeAppleGrant } from '../_shared/appleRevocation.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.106.2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'


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
    const body = await req.json().catch(() => ({}))
    const appleRevocation = await revokeAppleGrant(userData.user.identities ?? [], body?.apple ?? {})
    // Deploy alongside the private video bucket before enabling video uploads.
    const { data: buckets, error: bucketsError } = await admin.storage.listBuckets()
    if (bucketsError) throw bucketsError
    if (buckets?.some(bucket => bucket.id === 'memory-videos')) {
      await deleteOwnedStorage(admin, 'memory-videos', userId)
    }
    await deleteOwnedStorage(admin, 'memory-photos', userId)

    const { error: signOutError } = await admin.auth.admin.signOut(authorization.replace(/^Bearer\s+/i, ''), 'global')
    if (signOutError) throw signOutError
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return jsonResponse({ deleted: true, appleRevocation })
  } catch {
    return jsonResponse({ error: 'Could not finish deleting your account. Please try again or contact support.' }, { status: 500 })
  }
})
