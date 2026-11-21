import { importPKCS8, SignJWT } from 'npm:jose@6.1.0'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function sendNativeReminders(admin: SupabaseClient, now: Date) {
  if (Deno.env.get('NATIVE_PUSH_ENABLED') !== 'true') return { sent: 0, disabled: true }
  const keyId = Deno.env.get('APNS_KEY_ID'), teamId = Deno.env.get('APPLE_TEAM_ID'), privateKey = Deno.env.get('APNS_PRIVATE_KEY')
  if (!keyId || !teamId || !privateKey) throw new Error('APNs credentials missing')
  const key = await importPKCS8(privateKey.replace(/\\n/g, '\n'), 'ES256')
  const jwt = await new SignJWT({}).setProtectedHeader({ alg: 'ES256', kid: keyId }).setIssuer(teamId).setIssuedAt().sign(key)
  const { data: rows, error } = await admin.from('native_push_devices').select('*').or('morning_enabled.eq.true,evening_enabled.eq.true')
  if (error) throw error
  let sent = 0
  for (const row of rows || []) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: row.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
    const part = (key: string) => parts.find(p => p.type === key)?.value || '00'
    const date = `${part('year')}-${part('month')}-${part('day')}`
    const minutes = Number(part('hour')) * 60 + Number(part('minute'))
    for (const period of ['morning','evening'] as const) {
      const [h,m] = row[`${period}_time`].split(':').map(Number)
      const field = `last_${period}_sent_on`
      if (!row[`${period}_enabled`] || row[field] === date || minutes - (h*60+m) < 0 || minutes - (h*60+m) >= 30) continue
      // Claim before delivery. A crash can skip this reminder, but concurrent runs do not duplicate it.
      let claim = admin.from('native_push_devices').update({ [field]: date }).eq('id', row.id)
      claim = row[field] ? claim.eq(field, row[field]) : claim.is(field, null)
      const claimed = await claim.select('id').maybeSingle()
      if (claimed.error || !claimed.data) continue
      const host = row.environment === 'production' ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com'
      const response = await fetch(`${host}/3/device/${row.token}`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { authorization: `bearer ${jwt}`, 'apns-topic': 'com.pawstreak.app', 'apns-push-type': 'alert', 'apns-priority': '10', 'apns-collapse-id': `${period}-${date}`, 'content-type': 'application/json' }, body: JSON.stringify({ aps: { alert: { title: period === 'morning' ? 'A little outside time?' : 'Remember your dog’s day', body: period === 'morning' ? 'Find an adventure or take a Neighborhood Walk.' : 'Open PawStreak to save a memory or plan your next outing.' }, sound: 'default' }, route: '/app' }) })
      if (response.ok) { sent++; continue }
      const result = await response.json().catch(() => ({}))
      if (response.status === 410 || result.reason === 'BadDeviceToken' || result.reason === 'DeviceTokenNotForTopic') await admin.from('native_push_devices').delete().eq('id',row.id).eq('token',row.token)
      else console.error('APNs delivery failed', response.status, result.reason || 'unknown')
    }
  }
  return { sent }
}
