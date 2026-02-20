import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClasses(userId) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchClasses = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('classes')
      .select('*, students(count)')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setClasses(data || [])
    setLoading(false)
  }, [userId])

  const createClass = useCallback(async (classData) => {
    const { data, error } = await supabase
      .from('classes')
      .insert({ ...classData, teacher_id: userId })
      .select()
      .single()
    if (!error) setClasses(prev => [data, ...prev])
    return { data, error }
  }, [userId])

  const updateClass = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setClasses(prev => prev.map(c => c.id === id ? data : c))
    return { data, error }
  }, [])

  const deleteClass = useCallback(async (id) => {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (!error) setClasses(prev => prev.filter(c => c.id !== id))
    return { error }
  }, [])

  return { classes, loading, fetchClasses, createClass, updateClass, deleteClass }
}
