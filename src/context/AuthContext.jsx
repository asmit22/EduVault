import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)

  useEffect(() => {
    // Safety net: never stay loading more than 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchProfile(u.id).finally(() => {
          clearTimeout(timeout)
          setLoading(false)
        })
      } else {
        clearTimeout(timeout)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchProfile(u.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function fetchProfile(userId) {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('fetchProfile error:', error.message)
        setProfile({ id: userId, role: 'student' })
        return
      }
      setProfile(data ?? { id: userId, role: 'student' })
    } catch (err) {
      console.error('fetchProfile threw:', err)
      setProfile({ id: userId, role: 'student' })
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }

  async function signUp(email, password, fullName, rollNumber) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, roll_number: rollNumber } },
    })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    setProfile(null)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
