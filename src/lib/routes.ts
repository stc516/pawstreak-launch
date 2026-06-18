/** Top-level URL paths — single source of truth for marketing vs app entry. */

export const ROUTES = {
  landing: '/',
  start: '/start',
  app: '/app',
  demo: '/demo',
  demoLaunch: '/demo/launch',
  demoApp: '/demo/app',
  demoOnboarding: '/demo/onboarding',
  earlyAccess: '/early-access',
} as const

export function isLandingRoute(pathname = window.location.pathname): boolean {
  return pathname === '/' || pathname === ''
}

export function isStartRoute(pathname = window.location.pathname): boolean {
  return pathname === ROUTES.start || pathname.startsWith(`${ROUTES.start}/`)
}

/** Marketing pages that use landing layout + document scroll. */
export function isMarketingRoute(pathname = window.location.pathname): boolean {
  return isLandingRoute(pathname) || isStartRoute(pathname)
}

export function isProductionAppRoute(pathname = window.location.pathname): boolean {
  return pathname === ROUTES.app || pathname.startsWith(`${ROUTES.app}/`)
}

export function isDemoPath(pathname = window.location.pathname): boolean {
  return pathname === ROUTES.demo || pathname.startsWith(`${ROUTES.demo}/`)
}

/** OAuth and email redirects should return users to the production app shell. */
function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  return window.location.origin
}

export function getAuthRedirectUrl(): string {
  if (
    typeof window !== 'undefined' &&
    isProductionAppRoute(window.location.pathname) &&
    window.location.pathname.startsWith(`${ROUTES.app}/invite`)
  ) {
    return `${getSiteOrigin()}${window.location.pathname}${window.location.search}`
  }
  return `${getSiteOrigin()}${ROUTES.app}`
}

export function getInviteToken(search = window.location.search): string | null {
  const token = new URLSearchParams(search).get('token')?.trim()
  return token || null
}

export function getAppSignInUrl(): string {
  return `${ROUTES.app}?signin=1`
}

export function getAppEntryAuthMode(
  search = window.location.search,
): 'signup' | 'signin' {
  const params = new URLSearchParams(search)
  if (params.has('signin') || params.get('mode') === 'signin') {
    return 'signin'
  }
  return 'signup'
}
