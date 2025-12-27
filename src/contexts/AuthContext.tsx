import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const DEV_MODE_KEY = 'sprite-slicer-dev-mode'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isDevMode: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  devBypass: () => void
  clearDevMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    // Check for dev mode on mount
    const devModeStored = localStorage.getItem(DEV_MODE_KEY) === 'true'
    if (devModeStored) {
      setIsDevMode(true)
      const fakeUser = createDevUser()
      setUser(fakeUser)
      setSession({ user: fakeUser } as Session)
      setLoading(false)
      return
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const createDevUser = (): User => ({
    id: 'dev-user-bypass',
    email: 'dev@localhost',
    app_metadata: {},
    user_metadata: { user_name: 'Developer' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User)

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: redirectUrl }
    })
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })
    if (error) throw error
  }

  const signOut = async () => {
    localStorage.removeItem(DEV_MODE_KEY)
    setIsDevMode(false)
    await supabase.auth.signOut()
  }

  const devBypass = () => {
    localStorage.setItem(DEV_MODE_KEY, 'true')
    setIsDevMode(true)
    const fakeUser = createDevUser()
    setUser(fakeUser)
    setSession({ user: fakeUser } as Session)
  }

  const clearDevMode = () => {
    localStorage.removeItem(DEV_MODE_KEY)
    setIsDevMode(false)
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isDevMode,
      signInWithGoogle, 
      signInWithGithub, 
      signInWithDiscord, 
      signInWithEmail, 
      signUpWithEmail, 
      resetPassword,
      signOut, 
      devBypass,
      clearDevMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
