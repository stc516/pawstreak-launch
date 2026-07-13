import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

interface PushRow {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
  timezone: string
  morning_enabled: boolean
  morning_time: string
  evening_enabled: boolean
  evening_time: string
  last_morning_sent_on: string | null
  last_evening_sent_on: string | null
}

function localClock(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  }
}

function timeMinutes(value: string): number {
  const [hours, minutes] = value.slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
}

function isDue(nowMinutes: number, scheduled: string): boolean {
  const delta = nowMinutes - timeMinutes(scheduled)
  return delta >= 0 && delta < 30
}

const MORNING_COPY = [
  {
    title: 'Where will those paws take you today? 🐾',
    body: 'Open PawStreak and pick one small adventure for your dog.',
  },
  {
    title: "Your dog's next adventure starts here",
    body: 'Choose a walk, trail, or new sniff spot before the day fills up.',
  },
  {
    title: 'What would make today a good dog day?',
    body: 'Plan one simple outing in PawStreak—it can be closer than you think.',
  },
  {
    title: 'New day. New smells. New story.',
    body: 'See what PawStreak picked for you and your dog today.',
  },
  {
    title: 'Your dog is ready when you are',
    body: 'Pick today’s adventure now, even if it’s just a ten-minute walk.',
  },
] as const

const EVENING_COPY = [
  {
    title: 'Still time for one last-minute adventure 🐾',
    body: 'A ten-minute walk counts. Open PawStreak and make tonight a dog story.',
  },
  {
    title: 'One more little adventure before the day ends?',
    body: 'Let your dog pick the route—start a Quick Walk in PawStreak.',
  },
  {
    title: 'What adventures did your dog get into today?',
    body: 'Open PawStreak and save the walk, photo, or little moment before it slips away.',
  },
  {
    title: 'Where did those paws take you today? 🐾',
    body: 'Add today’s outing to your Journey while it’s still fresh.',
  },
  {
    title: 'Did your dog make a memory today?',
    body: 'A photo, funny moment, or quick walk is worth saving in PawStreak.',
  },
  {
    title: 'What was the best part of today’s walk?',
    body: 'Take ten seconds to save it to your dog’s story.',
  },
  {
    title: "Don't let today's dog story disappear",
    body: 'Open PawStreak and capture one thing you want to remember.',
  },
  {
    title: 'The couch will still be there in twenty minutes',
    body: 'Take your dog on one last sniff around the block and log it in PawStreak.',
  },
] as const

function rotatingCopy(period: 'morning' | 'evening', date: string, subscriptionId: string) {
  const options = period === 'morning' ? MORNING_COPY : EVENING_COPY
  const seed = `${date}-${subscriptionId}-${period}`
  const index = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0) % options.length
  return options[index]
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const publicKey = Deno.env.get('WEB_PUSH_VAPID_PUBLIC_KEY') ?? ''
  const privateKey = Deno.env.get('WEB_PUSH_VAPID_PRIVATE_KEY') ?? ''
  const subject = Deno.env.get('WEB_PUSH_VAPID_SUBJECT') ?? 'mailto:hello@pawstreakapp.com'
  if (!supabaseUrl || !serviceRoleKey || !publicKey || !privateKey) {
    return Response.json({ error: 'Push sender is not configured.' }, { status: 503 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const cronToken = req.headers.get('x-cron-token') ?? ''
  const { data: consumedToken } = await admin
    .from('push_cron_tokens')
    .delete()
    .eq('token', cronToken)
    .gt('expires_at', new Date().toISOString())
    .select('token')
    .maybeSingle()
  if (!consumedToken) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  webpush.setVapidDetails(subject, publicKey, privateKey)
  const { data, error } = await admin
    .from('push_subscriptions')
    .select('id,endpoint,p256dh,auth_key,timezone,morning_enabled,morning_time,evening_enabled,evening_time,last_morning_sent_on,last_evening_sent_on')
    .or('morning_enabled.eq.true,evening_enabled.eq.true')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const now = new Date()
  let sent = 0
  let removed = 0
  const failures: string[] = []

  for (const row of (data ?? []) as PushRow[]) {
    let clock
    try {
      clock = localClock(now, row.timezone)
    } catch {
      clock = localClock(now, 'UTC')
    }

    const period = row.morning_enabled && row.last_morning_sent_on !== clock.date && isDue(clock.minutes, row.morning_time)
      ? 'morning'
      : row.evening_enabled && row.last_evening_sent_on !== clock.date && isDue(clock.minutes, row.evening_time)
        ? 'evening'
        : null
    if (!period) continue

    const copy = rotatingCopy(period, clock.date, row.id)
    const payload = {
      ...copy,
      tag: `pawstreak-${period}-${clock.date}`,
      url: '/app',
    }

    try {
      await webpush.sendNotification({
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth_key },
      }, JSON.stringify(payload), { TTL: 60 * 60 * 3, urgency: 'high' })
      await admin.from('push_subscriptions').update(
        period === 'morning'
          ? { last_morning_sent_on: clock.date }
          : { last_evening_sent_on: clock.date },
      ).eq('id', row.id)
      sent += 1
    } catch (sendError) {
      const statusCode = typeof sendError === 'object' && sendError && 'statusCode' in sendError
        ? Number(sendError.statusCode)
        : 0
      if (statusCode === 404 || statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('id', row.id)
        removed += 1
      } else {
        failures.push(`${row.id}:${statusCode || 'send-error'}`)
      }
    }
  }

  return Response.json({ checked: data?.length ?? 0, sent, removed, failures })
})
