import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

interface SubscriptionRequest {
  action?: 'upsert' | 'disable'
  subscription?: {
    endpoint?: string
    expirationTime?: number | null
    keys?: { p256dh?: string; auth?: string }
  }
  preferences?: {
    timezone?: string
    morningEnabled?: boolean
    morningTime?: string
    eveningEnabled?: boolean
    eveningTime?: string
  }
}

function validTime(value: string | undefined, fallback: string): string {
  return value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback
}

function validTimezone(value: string | undefined): string {
  if (!value) return 'UTC'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format()
    return value
  } catch {
    return 'UTC'
  }
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
      return jsonResponse({ error: 'Push notifications are not configured.' }, { status: 503 })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await req.json() as SubscriptionRequest
    const endpoint = body.subscription?.endpoint?.trim()
    if (!endpoint || !endpoint.startsWith('https://')) {
      return jsonResponse({ error: 'A valid push subscription is required.' }, { status: 400 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    if (body.action === 'disable') {
      const { error } = await admin
        .from('push_subscriptions')
        .update({ morning_enabled: false, evening_enabled: false, updated_at: new Date().toISOString() })
        .eq('endpoint', endpoint)
        .eq('user_id', userData.user.id)
      if (error) throw error
      return jsonResponse({ saved: true })
    }

    const p256dh = body.subscription?.keys?.p256dh?.trim()
    const authKey = body.subscription?.keys?.auth?.trim()
    if (!p256dh || !authKey) {
      return jsonResponse({ error: 'Push subscription keys are missing.' }, { status: 400 })
    }

    const preferences = body.preferences ?? {}
    const { error } = await admin.from('push_subscriptions').upsert({
      user_id: userData.user.id,
      endpoint,
      p256dh,
      auth_key: authKey,
      expiration_time: body.subscription?.expirationTime ?? null,
      timezone: validTimezone(preferences.timezone),
      morning_enabled: preferences.morningEnabled ?? true,
      morning_time: validTime(preferences.morningTime, '08:00'),
      evening_enabled: preferences.eveningEnabled ?? true,
      evening_time: validTime(preferences.eveningTime, '19:00'),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })
    if (error) throw error

    return jsonResponse({ saved: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save notification settings.'
    return jsonResponse({ error: message }, { status: 500 })
  }
})

