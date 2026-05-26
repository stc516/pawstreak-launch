export function isContentStudioRoute(pathname = window.location.pathname): boolean {
  return (
    pathname === '/internal/content-studio' ||
    pathname.startsWith('/internal/content-studio/')
  )
}

export function isFeedbackDashboardRoute(pathname = window.location.pathname): boolean {
  return (
    pathname === '/internal/feedback' ||
    pathname.startsWith('/internal/feedback/')
  )
}

export function isInternalRoute(pathname = window.location.pathname): boolean {
  return isContentStudioRoute(pathname) || isFeedbackDashboardRoute(pathname)
}
