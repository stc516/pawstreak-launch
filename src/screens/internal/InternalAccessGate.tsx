import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAppSignInUrl, ROUTES } from '../../lib/routes'

export function InternalAccessGate({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const permitted = auth.user?.app_metadata?.internal === true

  if (auth.loading) return <div className="internal-access">Checking access…</div>
  if (!auth.user) {
    return <div className="internal-access"><h1>Sign in required</h1><p>This PawStreak tool is restricted.</p><a href={getAppSignInUrl()}>Sign in</a></div>
  }
  if (!permitted) {
    return <div className="internal-access"><h1>Access denied</h1><p>Your account is not authorized for internal tools.</p><a href={ROUTES.landing}>Return home</a></div>
  }
  return children
}
