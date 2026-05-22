export type DemoRoute = 'launcher' | 'app' | 'onboarding'

export function getDemoRoute(pathname = window.location.pathname): DemoRoute | null {
  if (pathname === '/demo' || pathname === '/demo/') return 'launcher'
  if (pathname === '/demo/app' || pathname.startsWith('/demo/app/')) return 'app'
  if (pathname === '/demo/onboarding' || pathname.startsWith('/demo/onboarding/')) {
    return 'onboarding'
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
