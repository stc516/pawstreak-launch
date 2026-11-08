const NATIVE_INVITE_PATH = 'auth/invite'

// OAuth redirect credentials belong only in the session exchange, never in
// the WebView's visible app URL, history, or subsequent navigation.
const AUTH_CALLBACK_KEYS = [
  'code',
  'access_token',
  'refresh_token',
  'id_token',
  'provider_token',
  'provider_refresh_token',
] as const

function isNativeInviteUrl(urlString: string, nativeScheme: string): boolean {
  const invitePrefix = `${nativeScheme}://${NATIVE_INVITE_PATH}`
  if (!urlString.toLowerCase().startsWith(invitePrefix.toLowerCase())) return false

  const boundary = urlString.charAt(invitePrefix.length)
  return boundary === '' || boundary === '?' || boundary === '#'
}

function getSafeAppSuffix(url: URL): string {
  const query = new URLSearchParams(url.search)
  for (const key of AUTH_CALLBACK_KEYS) query.delete(key)

  let hash = url.hash
  if (hash.startsWith('#') && hash.includes('=')) {
    const hashParams = new URLSearchParams(hash.slice(1))
    // Only parse key=value fragments when they actually contain OAuth
    // credential keys. Keep ordinary deep-link anchors untouched.
    if (AUTH_CALLBACK_KEYS.some((key) => hashParams.has(key))) {
      for (const key of AUTH_CALLBACK_KEYS) hashParams.delete(key)
      hash = hashParams.size > 0 ? `#${hashParams.toString()}` : ''
    }
  }

  const search = query.toString()
  return `${search ? `?${search}` : ''}${hash}`
}

export function getInternalPathFromNativeUrl(
  urlString: string,
  nativeScheme: string,
): string | null {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return null
  }

  if (url.protocol.toLowerCase() !== `${nativeScheme.toLowerCase()}:`) return null

  const suffix = getSafeAppSuffix(url)
  // Android WebView can surface a custom-scheme invite while its URL parser
  // reports a generic host/path pair. Preserve the exact, boundary-checked
  // native invite route from the raw Capacitor appUrlOpen payload.
  if (
    isNativeInviteUrl(urlString, nativeScheme) ||
    (url.hostname.toLowerCase() === 'auth' && url.pathname === '/invite')
  ) {
    return `/app/invite${suffix}`
  }

  return `/app${suffix}`
}
