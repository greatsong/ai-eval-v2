import { useState, useEffect } from 'react'
import { useClassContext } from '../../context/ClassContext'
import { useStudents } from '../../hooks/useStudents'

export default function StudentSelector() {
  const { classes, currentClass, setCurrentClass, currentStudent, setCurrentStudent } = useClassContext()
  const { students, fetchStudents } = useStudents(currentClass?.id)

  useEffect(() => {
    if (currentClass?.id) fetchStudents()
  }, [currentClass?.id, fetchStudents])

  return (
    <div className="form-group">
      <label>학급 / 학생 (선택)</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select
          value={currentClass?.id || ''}
          onChange={e => {
            const cls = classes.find(c => c.id === e.target.value)
            setCurrentClass(cls || null)
            setCurrentStudent(null)
          }}
          style={{ flex: 1 }}
        >
          <option value="">학급 미지정</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={currentStudent?.id || ''}
          onChange={e => {
            const stu = students.find(s => s.id === e.target.value)
            setCurrentStudent(stu || null)
          }}
          disabled={!currentClass}
          style={{ flex: 1 }}
        >
          <option value="">학생 미지정</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.student_number} {s.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
