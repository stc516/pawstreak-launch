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
export function getAuthRedirectUrl(): string {
  return `${window.location.origin}${ROUTES.app}`
}
