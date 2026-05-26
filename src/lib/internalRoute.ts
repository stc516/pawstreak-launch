export function isContentStudioRoute(pathname = window.location.pathname): boolean {
  return (
    pathname === '/internal/content-studio' ||
    pathname.startsWith('/internal/content-studio/')
  )
}
