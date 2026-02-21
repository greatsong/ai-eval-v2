import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClassDashboard(classId) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDashboard = useCallback(async () => {
    if (!classId) {
      setDashboard(null)
      return
    }
    setLoading(true)
    const { data, error } = await supabase.rpc('get_class_dashboard', { p_class_id: classId })
    if (!error) setDashboard(data)
    else setDashboard(null)
    setLoading(false)
    return { data, error }
  }, [classId])

  return { dashboard, loading, fetchDashboard }
}

export function useTeacherOverview(userId) {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchOverview = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase.rpc('get_teacher_overview', { p_teacher_id: userId })
    if (!error) setOverview(data)
    setLoading(false)
    return { data, error }
  }, [userId])

  return { overview, loading, fetchOverview }
}
