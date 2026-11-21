import { loadEnv } from 'vite'
import { pathToFileURL } from 'node:url'

// Structural checks only: never print credentials or claim live auth is verified.
export function checkReleaseEnvironment(env) {
  const failures = []
  const warnings = []
  const value = name => (env[name] || '').trim()
  const httpsUrl = raw => {
    try { const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password && !['localhost', '127.0.0.1'].includes(u.hostname) } catch { return false }
  }
  if (!httpsUrl(value('VITE_SUPABASE_URL'))) failures.push('VITE_SUPABASE_URL must be a configured HTTPS backend URL.')
  const key = value('VITE_SUPABASE_ANON_KEY')
  let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key)
  if (!publicKey) {
    try {
      const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString())
      publicKey = key.split('.').length === 3 && claims.role === 'anon' && (!claims.exp || claims.exp * 1000 > Date.now())
    } catch { /* Missing, secret or malformed keys fail below. */ }
  }
  if (!publicKey) failures.push('VITE_SUPABASE_ANON_KEY must contain a publishable key or unexpired legacy anon JWT, never a secret/service-role key.')
  if (value('VITE_SITE_URL') !== 'https://pawstreakapp.com') failures.push('VITE_SITE_URL must be https://pawstreakapp.com for this release.')
  const map = value('VITE_MAPBOX_TOKEN')
  if (!map) warnings.push('Mapbox token absent: verify the intended list/map fallback; maps are not ready.')
  else if (!map.startsWith('pk.')) failures.push('VITE_MAPBOX_TOKEN must be a public pk. token.')
  for (const [name, raw] of Object.entries(env)) {
    if (!name.startsWith('VITE_') || !raw) continue
    let privileged = /^(sb_secret_|sk\.)/.test(raw)
    try { privileged ||= JSON.parse(Buffer.from(raw.split('.')[1], 'base64url').toString()).role === 'service_role' } catch { /* Not a JWT. */ }
    if (privileged || /PRIVATE|SERVICE_ROLE|SECRET/.test(name)) failures.push('A VITE_ variable contains privileged credentials or uses a secret-variable name; remove it from client build configuration.')
  }
  return { failures, warnings }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env }
  const { failures, warnings } = checkReleaseEnvironment(env)
  for (const message of failures) console.error(`FAIL: ${message}`)
  for (const message of warnings) console.warn(`WARN: ${message}`)
  if (failures.length) process.exitCode = 1
  else console.log('PASS: release configuration shape. Live auth, storage, privacy and device acceptance remain separate checks.')
}
