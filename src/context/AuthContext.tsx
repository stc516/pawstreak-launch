import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import {
  sendMagicLink,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from '../lib/auth'
import {
  clearNativePushAfterAuthLoss,
  initializeNativePushForAuthenticatedUser,
} from '../lib/nativePushNotifications'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signUpWithEmail: typeof signUpWithEmail
  signInWithEmail: typeof signInWithEmail
  sendMagicLink: typeof sendMagicLink
  signInWithGoogle: typeof signInWithGoogle
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured())

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) {
        void initializeNativePushForAuthenticatedUser().catch((error) => {
          console.warn('[Native push] Could not restore registration.', error)
        })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      if (nextSession) {
        void initializeNativePushForAuthenticatedUser().catch((error) => {
          console.warn('[Native push] Could not initialize registration.', error)
        })
      } else if (event === 'SIGNED_OUT') {
        void clearNativePushAfterAuthLoss()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured(),
      signUpWithEmail,
      signInWithEmail,
      sendMagicLink,
      signInWithGoogle,
      signOut: async () => {
        await signOut()
        setSession(null)
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
