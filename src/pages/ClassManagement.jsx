import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClassContext } from '../context/ClassContext'
import { useStudents } from '../hooks/useStudents'
import './ClassManagement.css'

export default function ClassManagement() {
  const { user } = useAuth()
  const { classes, fetchClasses, createClass, deleteClass } = useClassContext()
  const [selectedClassId, setSelectedClassId] = useState(null)
  const { students, fetchStudents, addStudent, bulkImportStudents, deleteStudent } = useStudents(selectedClassId)
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', school_year: new Date().getFullYear(), semester: 1, subject: '' })
  const [newStudent, setNewStudent] = useState({ student_number: '', name: '' })
  const [bulkInput, setBulkInput] = useState('')
  const [showBulkImport, setShowBulkImport] = useState(false)

  useEffect(() => {
    if (selectedClassId) fetchStudents()
  }, [selectedClassId, fetchStudents])

  const handleCreateClass = async (e) => {
    e.preventDefault()
    await createClass(newClass)
    setNewClass({ name: '', school_year: new Date().getFullYear(), semester: 1, subject: '' })
    setShowNewClass(false)
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    await addStudent(newStudent)
    setNewStudent({ student_number: '', name: '' })
  }

  const handleBulkImport = async () => {
    const lines = bulkInput.trim().split('\n').filter(l => l.trim())
    const list = lines.map(line => {
      const parts = line.split(/[,\t]/).map(p => p.trim())
      return { studentNumber: parts[0], name: parts[1] || '' }
    }).filter(s => s.studentNumber && s.name)

    if (list.length > 0) {
      await bulkImportStudents(list)
      setBulkInput('')
      setShowBulkImport(false)
    }
  }

  const selectedClass = classes.find(c => c.id === selectedClassId)

  return (
    <div className="class-management">
      <div className="page-header">
        <h1>학급 관리</h1>
        <button className="btn btn-primary" onClick={() => setShowNewClass(true)}>
          + 새 학급
        </button>
      </div>

      {showNewClass && (
        <form className="result-card new-class-form" onSubmit={handleCreateClass}>
          <h3>새 학급 만들기</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label>학급명</label>
              <input value={newClass.name} onChange={e => setNewClass(p => ({ ...p, name: e.target.value }))} placeholder="예: 2026-1-3반" required />
            </div>
            <div className="form-group">
              <label>학년도</label>
              <input type="number" value={newClass.school_year} onChange={e => setNewClass(p => ({ ...p, school_year: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>학기</label>
              <select value={newClass.semester} onChange={e => setNewClass(p => ({ ...p, semester: Number(e.target.value) }))}>
                <option value={1}>1학기</option>
                <option value={2}>2학기</option>
              </select>
            </div>
            <div className="form-group">
              <label>교과</label>
              <input value={newClass.subject} onChange={e => setNewClass(p => ({ ...p, subject: e.target.value }))} placeholder="예: 정보" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">만들기</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowNewClass(false)}>취소</button>
          </div>
        </form>
      )}

      <div className="class-layout">
        <div className="class-list">
          <h3>학급 목록</h3>
          {classes.length === 0 ? (
            <p className="empty-state">학급이 없습니다. 새 학급을 만들어보세요.</p>
          ) : (
            classes.map(c => (
              <div
                key={c.id}
                className={`class-item ${selectedClassId === c.id ? 'active' : ''}`}
                onClick={() => setSelectedClassId(c.id)}
              >
                <div className="class-item-name">{c.name}</div>
                <div className="class-item-meta">
                  {c.subject && <span>{c.subject}</span>}
                  <span>{c.school_year}-{c.semester}학기</span>
                  <span>{c.students?.[0]?.count || 0}명</span>
                </div>
                <button
                  className="btn-icon-delete"
                  onClick={(e) => { e.stopPropagation(); deleteClass(c.id) }}
                  title="삭제"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div className="student-panel">
          {selectedClass ? (
            <>
              <div className="student-header">
                <h3>{selectedClass.name} - 학생 목록</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkImport(!showBulkImport)}>
                  {showBulkImport ? '닫기' : '일괄 등록'}
                </button>
              </div>

              {showBulkImport && (
                <div className="bulk-import">
                  <textarea
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    placeholder="번호, 이름 (한 줄에 하나)&#10;예:&#10;1, 홍길동&#10;2, 김철수&#10;3, 이영희"
                    rows={5}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleBulkImport}>등록</button>
                </div>
              )}

              <form className="add-student-form" onSubmit={handleAddStudent}>
                <input
                  value={newStudent.student_number}
                  onChange={e => setNewStudent(p => ({ ...p, student_number: e.target.value }))}
                  placeholder="번호"
                  style={{ width: '80px' }}
                  required
                />
                <input
                  value={newStudent.name}
                  onChange={e => setNewStudent(p => ({ ...p, name: e.target.value }))}
                  placeholder="이름"
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">추가</button>
              </form>

              <div className="student-list">
                {students.length === 0 ? (
                  <p className="empty-state">등록된 학생이 없습니다.</p>
                ) : (
                  students.map(s => (
                    <div key={s.id} className="student-item">
                      <span className="student-number">{s.student_number}</span>
                      <span className="student-name">{s.name}</span>
                      <button
                        className="btn-icon-delete"
                        onClick={() => deleteStudent(s.id)}
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="empty-state">학급을 선택하세요</p>
          )}
        </div>
      </div>
    </div>
  )
}
