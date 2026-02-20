import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStudents(classId) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchStudents = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('student_number')
    if (!error) setStudents(data || [])
    setLoading(false)
  }, [classId])

  const addStudent = useCallback(async (studentData) => {
    const { data, error } = await supabase
      .from('students')
      .insert({ ...studentData, class_id: classId })
      .select()
      .single()
    if (!error) setStudents(prev => [...prev, data].sort((a, b) => a.student_number.localeCompare(b.student_number)))
    return { data, error }
  }, [classId])

  const bulkImportStudents = useCallback(async (studentsList) => {
    const rows = studentsList.map(s => ({
      class_id: classId,
      student_number: s.studentNumber || s.student_number,
      name: s.name
    }))
    const { data, error } = await supabase
      .from('students')
      .upsert(rows, { onConflict: 'class_id,student_number' })
      .select()
    if (!error) setStudents(data.sort((a, b) => a.student_number.localeCompare(b.student_number)))
    return { data, error }
  }, [classId])

  const updateStudent = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setStudents(prev => prev.map(s => s.id === id ? data : s))
    return { data, error }
  }, [])

  const deleteStudent = useCallback(async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (!error) setStudents(prev => prev.filter(s => s.id !== id))
    return { error }
  }, [])

  return { students, loading, fetchStudents, addStudent, bulkImportStudents, updateStudent, deleteStudent }
}
