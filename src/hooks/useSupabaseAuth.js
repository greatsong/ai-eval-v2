import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id)
        else setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const verifyAccessCode = useCallback(async (code) => {
    const { data, error } = await supabase.rpc('verify_teacher_access_code', { code })
    if (error) return { valid: false, error }
    return { valid: data === true, error: null }
  }, [])

  const signUp = useCallback(async (email, password, displayName, accessCode) => {
    // 접근코드 검증
    const { valid, error: codeError } = await verifyAccessCode(accessCode)
    if (codeError) return { data: null, error: { message: '접근코드 확인 중 오류가 발생했습니다.' } }
    if (!valid) return { data: null, error: { message: '유효하지 않은 교사 인증 코드입니다.' } }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    })
    return { data, error }
  }, [verifyAccessCode])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }, [user])

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user
  }
}
