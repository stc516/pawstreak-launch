import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  try {
    const url = Deno.env.get('SUPABASE_URL')!, key = Deno.env.get('SUPABASE_ANON_KEY')!
    const client = createClient(url, key, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } })
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) return jsonResponse({ error: 'Sign in required.' }, { status: 401 })
    const body = await req.json()
    const token = typeof body.token === 'string' ? body.token.toLowerCase() : ''
    if (!/^[a-f0-9]{64,200}$/.test(token)) return jsonResponse({ error: 'Invalid device token.' }, { status: 400 })
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    if (body.action === 'disable') {
      const result = await admin.from('native_push_devices').delete().eq('user_id', data.user.id).eq('token', token)
      if (result.error) throw result.error
    } else if (body.action === 'upsert') {
      const prefs = body.preferences
      if (!prefs || !/^([01]\d|2[0-3]):[0-5]\d$/.test(prefs.morningTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(prefs.eveningTime) || typeof prefs.morningEnabled !== 'boolean' || typeof prefs.eveningEnabled !== 'boolean') return jsonResponse({ error: 'Invalid reminder settings.' }, { status: 400 })
      const timezone = String(body.timezone || 'UTC')
      new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
      const environment = Deno.env.get('APNS_ENVIRONMENT')
      if (!['production','sandbox'].includes(environment || '')) return jsonResponse({ error: 'Native push is not configured.' }, { status: 503 })
      const result = await admin.from('native_push_devices').upsert({ user_id: data.user.id, token, environment, timezone, morning_enabled: prefs.morningEnabled, evening_enabled: prefs.eveningEnabled, morning_time: prefs.morningTime, evening_time: prefs.eveningTime, updated_at: new Date().toISOString() }, { onConflict: 'token' })
      if (result.error) throw result.error
    } else return jsonResponse({ error: 'Invalid action.' }, { status: 400 })
    return jsonResponse({ saved: true })
  } catch { return jsonResponse({ error: 'Could not save notification settings.' }, { status: 500 }) }
})
