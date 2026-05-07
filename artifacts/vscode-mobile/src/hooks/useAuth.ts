import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export type AuthUser = {
  id: string
  email?: string
  name?: string
  avatar?: string
  provider?: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'unauthenticated'

export type AuthState = {
  status: AuthStatus
  user: AuthUser | null
}

const GUEST_KEY = 'km-code-guest-v1'

export function getGuestSession(): boolean {
  try { return Boolean(localStorage.getItem(GUEST_KEY)) } catch { return false }
}

export function setGuestSession() {
  try { localStorage.setItem(GUEST_KEY, '1') } catch {}
}

export function clearGuestSession() {
  try { localStorage.removeItem(GUEST_KEY) } catch {}
}

function mapUser(raw: { id: string; email?: string; user_metadata?: Record<string, string> }): AuthUser {
  const meta = raw.user_metadata ?? {}
  return {
    id: raw.id,
    email: raw.email,
    name: meta['full_name'] ?? meta['name'] ?? meta['user_name'] ?? raw.email,
    avatar: meta['avatar_url'] ?? meta['picture'],
    provider: meta['provider_id'] ? 'github' : 'google',
  }
}

export function useAuth(): AuthState & {
  signOutUser: () => Promise<void>
  continueAsGuest: () => void
} {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  useEffect(() => {
    if (getGuestSession()) {
      setState({ status: 'guest', user: null })
      return
    }

    if (!isSupabaseConfigured) {
      setState({ status: 'unauthenticated', user: null })
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setState({ status: 'authenticated', user: mapUser(data.session.user as Parameters<typeof mapUser>[0]) })
      } else {
        setState({ status: 'unauthenticated', user: null })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        clearGuestSession()
        setState({ status: 'authenticated', user: mapUser(session.user as Parameters<typeof mapUser>[0]) })
      } else {
        if (!getGuestSession()) setState({ status: 'unauthenticated', user: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOutUser = async () => {
    clearGuestSession()
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setState({ status: 'unauthenticated', user: null })
  }

  const continueAsGuest = () => {
    setGuestSession()
    setState({ status: 'guest', user: null })
  }

  return { ...state, signOutUser, continueAsGuest }
}
