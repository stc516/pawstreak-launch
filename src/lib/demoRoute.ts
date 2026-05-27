import { isDemoPath } from './routes'

export type DemoRoute = 'launcher' | 'app' | 'onboarding'

export function getDemoRoute(pathname = window.location.pathname): DemoRoute | null {
  if (!isDemoPath(pathname)) return null

  if (pathname === '/demo/launch' || pathname.startsWith('/demo/launch/')) {
    return 'launcher'
  }
  if (pathname === '/demo/onboarding' || pathname.startsWith('/demo/onboarding/')) {
    return 'onboarding'
  }
  if (
    pathname === '/demo' ||
    pathname === '/demo/' ||
    pathname === '/demo/app' ||
    pathname.startsWith('/demo/app/')
  ) {
    return 'app'
  }

  return null
}

export function navigateTo(path: string): void {
  if (window.location.pathname === path) {
    window.dispatchEvent(new PopStateEvent('popstate'))
    return
  }
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
