import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { sendPackWelcomeEmail } from '../_shared/email.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, { status: 405 })

  try {
    const { token } = await req.json()
    const inviteToken = String(token ?? '').trim()
    if (!inviteToken) {
      return jsonResponse({ error: 'Invite token is required.' }, { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authHeader = req.headers.get('Authorization') ?? ''

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return jsonResponse({ error: 'Authentication required.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .rpc('accept_pack_invite', { invite_token: inviteToken })
      .single()

    if (error || !data) {
      return jsonResponse({ error: error?.message ?? 'Could not accept invite.' }, { status: 400 })
    }

    if (userData.user.email) {
      await sendPackWelcomeEmail({ to: userData.user.email, role: data.role })
    }

    await supabase.from('user_events').insert({
      event_name: 'pack_invite_accepted',
      metadata: { packId: data.pack_id, role: data.role },
      user_id: userData.user.id,
      page_path: '/app/invite',
    })

    return jsonResponse({ packId: data.pack_id, role: data.role })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return jsonResponse({ error: message }, { status: 500 })
  }
})
