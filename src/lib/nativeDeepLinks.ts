import { App as CapacitorApp } from '@capacitor/app'
import { getSupabaseClient } from './supabase'
import { NATIVE_APP_SCHEME, isNativeAppRuntime } from './nativeRuntime'

function getInternalPathFromNativeUrl(urlString: string): string | null {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return null
  }

  if (url.protocol !== `${NATIVE_APP_SCHEME}:`) return null

  const suffix = `${url.search}${url.hash}`
  if (url.hostname === 'auth' && url.pathname === '/invite') {
    return `/app/invite${suffix}`
  }

  return `/app${suffix}`
}

async function finishSupabaseCodeExchange(urlString: string): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const url = new URL(urlString)
  const code = url.searchParams.get('code')
  if (!code) return

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[Native] Supabase deep-link auth exchange failed', error)
  }
}

let lastHandledUrl = ''
let lastHandledAt = 0

async function handleNativeUrl(urlString: string): Promise<void> {
  const internalPath = getInternalPathFromNativeUrl(urlString)
  if (!internalPath) return

  // Capacitor can surface the same cold-start URL through both getLaunchUrl()
  // and appUrlOpen. Keep a real second tap working while suppressing that pair.
  const now = Date.now()
  if (urlString === lastHandledUrl && now - lastHandledAt < 5_000) return
  lastHandledUrl = urlString
  lastHandledAt = now

  await finishSupabaseCodeExchange(urlString)
  window.history.replaceState({}, '', internalPath)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function registerNativeDeepLinks(): void {
  if (!isNativeAppRuntime()) return

  void CapacitorApp.addListener('appUrlOpen', (event) => {
    void handleNativeUrl(event.url)
  }).then(() => {
    // appUrlOpen covers a running/backgrounded app. getLaunchUrl covers a
    // terminated app opened directly from OAuth, an invite, or another link.
    void CapacitorApp.getLaunchUrl().then((launch) => {
      if (launch?.url) void handleNativeUrl(launch.url)
    })
  })
}
