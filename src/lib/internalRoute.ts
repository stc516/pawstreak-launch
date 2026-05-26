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

export function isEarlyAccessRoute(pathname = window.location.pathname): boolean {
  return pathname === '/early-access' || pathname.startsWith('/early-access/')
}

export function isInternalRoute(pathname = window.location.pathname): boolean {
  return isContentStudioRoute(pathname) || isFeedbackDashboardRoute(pathname)
}
