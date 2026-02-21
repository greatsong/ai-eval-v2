import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// 번호를 숫자 우선으로 정렬 (1, 2, 3, 10, 11...)
function compareStudentNumber(a, b) {
  const numA = parseInt(a, 10)
  const numB = parseInt(b, 10)
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB
  return a.localeCompare(b)
}

export function useStudents(classId) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const prevClassIdRef = useRef(classId)

  const fetchStudents = useCallback(async () => {
    // classId 변경 시 이전 학생 목록 즉시 초기화
    if (prevClassIdRef.current !== classId) {
      setStudents([])
      prevClassIdRef.current = classId
    }
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
    if (!error) setStudents(prev => [...prev, data].sort((a, b) => compareStudentNumber(a.student_number, b.student_number)))
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
    if (!error && data) setStudents(data.sort((a, b) => compareStudentNumber(a.student_number, b.student_number)))
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
