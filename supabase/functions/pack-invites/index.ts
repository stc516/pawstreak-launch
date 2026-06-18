import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { sendPackInviteEmail } from '../_shared/email.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, { status: 405 })

  try {
    const { email, role } = await req.json()
    const normalizedEmail = String(email ?? '').trim().toLowerCase()
    const inviteRole = role === 'viewer' ? 'viewer' : 'member'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return jsonResponse({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://pawstreakapp.com').replace(/\/$/, '')
    const authHeader = req.headers.get('Authorization') ?? ''

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: invite, error } = await supabase
      .rpc('create_pack_invite', {
        invite_email: normalizedEmail,
        invite_role: inviteRole,
      })
      .single()

    if (error || !invite) {
      return jsonResponse({ error: error?.message ?? 'Could not create invite.' }, { status: 400 })
    }

    const inviteUrl = `${siteUrl}/app/invite?token=${encodeURIComponent(invite.token)}`
    await sendPackInviteEmail({ to: normalizedEmail, role: inviteRole, inviteUrl })

    await supabase.from('user_events').insert({
      event_name: 'pack_invite_sent',
      metadata: { role: inviteRole, inviteId: invite.id },
      user_id: null,
      page_path: '/app',
    })

    return jsonResponse({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expires_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return jsonResponse({ error: message }, { status: 500 })
  }
})
