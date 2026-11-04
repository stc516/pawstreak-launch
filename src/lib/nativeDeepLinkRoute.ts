const NATIVE_INVITE_PATH = 'auth/invite'

function isNativeInviteUrl(urlString: string, nativeScheme: string): boolean {
  const invitePrefix = `${nativeScheme}://${NATIVE_INVITE_PATH}`
  if (!urlString.toLowerCase().startsWith(invitePrefix.toLowerCase())) return false

  const boundary = urlString.charAt(invitePrefix.length)
  return boundary === '' || boundary === '?' || boundary === '#'
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

  const suffix = `${url.search}${url.hash}`
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
