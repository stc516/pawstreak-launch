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

export function registerNativeDeepLinks(): void {
  if (!isNativeAppRuntime()) return

  void CapacitorApp.addListener('appUrlOpen', (event) => {
    const internalPath = getInternalPathFromNativeUrl(event.url)
    if (!internalPath) return

    void finishSupabaseCodeExchange(event.url).finally(() => {
      window.history.replaceState({}, '', internalPath)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
  })
}
