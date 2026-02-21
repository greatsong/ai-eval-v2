import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClassContext } from '../context/ClassContext'
import { useStudents } from '../hooks/useStudents'
import { useRubrics } from '../hooks/useRubrics'
import { supabase } from '../lib/supabase'
import { PROVIDER_MODELS } from '../data/constants'
import './ClassManagement.css'

function generateInviteCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)]
  code += '-'
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)]
  return code
}

export default function ClassManagement() {
  const { user } = useAuth()
  const { classes, createClass, updateClass, deleteClass } = useClassContext()
  const [selectedClassId, setSelectedClassId] = useState(null)
  const { students, fetchStudents, addStudent, bulkImportStudents, deleteStudent } = useStudents(selectedClassId)
  const { rubrics, fetchRubrics } = useRubrics(user?.id)
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', school_year: new Date().getFullYear(), semester: 1, subject: '' })
  const [newStudent, setNewStudent] = useState({ student_number: '', name: '' })
  const [bulkInput, setBulkInput] = useState('')
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showEvalSettings, setShowEvalSettings] = useState(false)
  const [evalSaving, setEvalSaving] = useState(false)
  const [evalMessage, setEvalMessage] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

  // 평가 세션 관리
  const [sessions, setSessions] = useState([])
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [newSessionRubric, setNewSessionRubric] = useState('')

  const fetchSessions = useCallback(async () => {
    if (!selectedClassId) { setSessions([]); return }
    const { data } = await supabase.from('eval_sessions')
      .select('*, rubrics(name, icon)')
      .eq('class_id', selectedClassId)
      .order('created_at')
    if (data) setSessions(data)
  }, [selectedClassId])

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents()
      fetchSessions() // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [selectedClassId, fetchStudents, fetchSessions])

  useEffect(() => {
    if (user?.id) fetchRubrics()
  }, [user?.id, fetchRubrics])

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

  // 초대코드 생성
  const handleGenerateCode = async () => {
    if (!selectedClass) return
    const code = generateInviteCode()
    setEvalSaving(true)
    const { error } = await updateClass(selectedClassId, { invite_code: code })
    if (error) {
      setEvalMessage('코드 생성 실패. 다시 시도해주세요.')
    } else {
      setEvalMessage('초대코드가 생성되었습니다.')
    }
    setEvalSaving(false)
    setTimeout(() => setEvalMessage(''), 2000)
  }

  // 초대코드 활성/비활성
  const handleToggleCode = async () => {
    if (!selectedClass) return
    setEvalSaving(true)
    await updateClass(selectedClassId, { invite_code_active: !selectedClass.invite_code_active })
    setEvalSaving(false)
  }

  // API 설정 저장
  const handleSaveApiSettings = async (field, value) => {
    if (!selectedClass) return
    setEvalSaving(true)
    await updateClass(selectedClassId, { [field]: value })
    setEvalSaving(false)
  }

  // 루브릭 선택
  const handleSelectRubric = async (rubricId) => {
    if (!selectedClass) return
    setEvalSaving(true)
    await updateClass(selectedClassId, { default_rubric_id: rubricId || null })
    setEvalSaving(false)
  }

  // 초대코드 복사
  const handleCopyCode = () => {
    if (!selectedClass?.invite_code) return
    navigator.clipboard.writeText(selectedClass.invite_code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 1500)
  }

  // 학생 평가 URL 복사
  const handleCopyUrl = () => {
    const url = `${window.location.origin}/proofai`
    navigator.clipboard.writeText(url)
    setEvalMessage('URL이 복사되었습니다.')
    setTimeout(() => setEvalMessage(''), 2000)
  }

  // 세션 생성
  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (!newSessionName.trim() || !newSessionRubric || !selectedClassId) return
    setEvalSaving(true)
    const code = generateInviteCode()
    await supabase.from('eval_sessions').insert({
      class_id: selectedClassId,
      name: newSessionName.trim(),
      invite_code: code,
      invite_code_active: true,
      rubric_id: newSessionRubric
    })
    setNewSessionName('')
    setNewSessionRubric('')
    setShowNewSession(false)
    await fetchSessions()
    setEvalSaving(false)
  }

  // 세션 활성/비활성 토글
  const handleToggleSession = async (session) => {
    setEvalSaving(true)
    await supabase.from('eval_sessions')
      .update({ invite_code_active: !session.invite_code_active })
      .eq('id', session.id)
    await fetchSessions()
    setEvalSaving(false)
  }

  // 세션 삭제
  const handleDeleteSession = async (session) => {
    if (!window.confirm(`'${session.name}' 평가 세션을 삭제하시겠습니까?`)) return
    await supabase.from('eval_sessions').delete().eq('id', session.id)
    await fetchSessions()
  }

  // 세션 코드 복사
  const handleCopySessionCode = (code) => {
    navigator.clipboard.writeText(code)
    setEvalMessage('초대코드가 복사되었습니다.')
    setTimeout(() => setEvalMessage(''), 1500)
  }

  const providerInfo = selectedClass?.student_api_provider
    ? PROVIDER_MODELS[selectedClass.student_api_provider]
    : PROVIDER_MODELS.gemini

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
                onClick={() => { setSelectedClassId(c.id); setShowEvalSettings(false) }}
              >
                <div className="class-item-name">
                  {c.name}
                  {c.invite_code_active && <span className="invite-badge">공개</span>}
                </div>
                <div className="class-item-meta">
                  {c.subject && <span>{c.subject}</span>}
                  <span>{c.school_year}-{c.semester}학기</span>
                  <span>{c.students?.[0]?.count || 0}명</span>
                </div>
                <button
                  className="btn-icon-delete"
                  onClick={(e) => { e.stopPropagation(); if (window.confirm(`'${c.name}' 학급을 삭제하시겠습니까? 소속 학생과 평가 데이터가 모두 삭제됩니다.`)) deleteClass(c.id) }}
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
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkImport(!showBulkImport)}>
                    {showBulkImport ? '닫기' : '일괄 등록'}
                  </button>
                  <button
                    className={`btn btn-sm ${showEvalSettings ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowEvalSettings(!showEvalSettings)}
                  >
                    {showEvalSettings ? '설정 닫기' : '학생 평가 설정'}
                  </button>
                </div>
              </div>

              {/* 학생 평가 설정 */}
              {showEvalSettings && (
                <div className="eval-settings-panel">
                  <h4>학생 평가 설정</h4>
                  <p className="eval-settings-desc">과목/활동별로 평가 세션을 만들어 각기 다른 루브릭으로 평가할 수 있습니다.</p>

                  {/* 학생 평가 URL */}
                  <div className="eval-setting-group">
                    <label>학생 평가 페이지</label>
                    <div className="invite-url-row">
                      <span className="invite-url">{window.location.origin}/proofai</span>
                      <button className="btn btn-sm btn-secondary" onClick={handleCopyUrl}>URL 복사</button>
                    </div>
                    <span className="eval-setting-hint">이 URL과 아래 초대코드를 학생들에게 안내하세요.</span>
                  </div>

                  {/* AI 설정 (학급 공통) */}
                  <div className="eval-setting-group">
                    <label>AI 제공자 (학급 공통)</label>
                    <select
                      value={selectedClass.student_api_provider || 'gemini'}
                      onChange={e => handleSaveApiSettings('student_api_provider', e.target.value)}
                    >
                      {Object.entries(PROVIDER_MODELS).map(([key, info]) => (
                        <option key={key} value={key}>{info.emoji} {info.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="eval-setting-group">
                    <label>API 키</label>
                    <input
                      type="password"
                      value={selectedClass.student_api_key || ''}
                      onChange={e => handleSaveApiSettings('student_api_key', e.target.value)}
                      placeholder={providerInfo?.placeholder || 'API 키 입력'}
                    />
                    <span className="eval-setting-hint">
                      모든 평가 세션에서 공통으로 사용됩니다.
                      {providerInfo?.helpUrl && (
                        <> <a href={providerInfo.helpUrl} target="_blank" rel="noopener noreferrer">발급 안내</a></>
                      )}
                    </span>
                  </div>
                  <div className="eval-setting-group">
                    <label>모델</label>
                    <select
                      value={selectedClass.student_api_model || 'gemini-2.5-flash'}
                      onChange={e => handleSaveApiSettings('student_api_model', e.target.value)}
                    >
                      {providerInfo?.defaults?.map(model => (
                        <option key={model} value={model}>{providerInfo.labels?.[model] || model}</option>
                      ))}
                    </select>
                  </div>

                  {/* 기존 학급 초대코드 (하위호환) */}
                  {selectedClass.invite_code && (
                    <div className="eval-setting-group">
                      <label>기본 초대코드</label>
                      <div className="invite-code-row">
                        <code className="invite-code-display">{selectedClass.invite_code}</code>
                        <button className="btn btn-sm btn-secondary" onClick={handleCopyCode}>
                          {copiedCode ? '복사됨' : '복사'}
                        </button>
                        <button
                          className={`btn btn-sm ${selectedClass.invite_code_active ? 'btn-active-toggle' : 'btn-secondary'}`}
                          onClick={handleToggleCode}
                          disabled={evalSaving}
                        >
                          {selectedClass.invite_code_active ? '활성' : '비활성'}
                        </button>
                      </div>
                      <span className="eval-setting-hint">
                        루브릭: {rubrics.find(r => r.id === selectedClass.default_rubric_id)?.name || '미지정'}
                        {' · '}
                        <select
                          style={{ display: 'inline', width: 'auto', fontSize: '0.8rem', padding: '0.1rem 0.3rem' }}
                          value={selectedClass.default_rubric_id || ''}
                          onChange={e => handleSelectRubric(e.target.value)}
                        >
                          <option value="">루브릭 변경...</option>
                          {rubrics.map(r => (
                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                          ))}
                        </select>
                      </span>
                    </div>
                  )}
                  {!selectedClass.invite_code && (
                    <div className="eval-setting-group">
                      <button className="btn btn-sm btn-secondary" onClick={handleGenerateCode} disabled={evalSaving}>
                        기본 초대코드 생성
                      </button>
                    </div>
                  )}

                  {/* 평가 세션 목록 */}
                  <div className="eval-setting-group">
                    <label>평가 세션</label>
                    <span className="eval-setting-hint" style={{ marginBottom: '0.5rem', display: 'block' }}>
                      과목/활동별로 세션을 만들면 같은 학생 명단에 서로 다른 루브릭을 적용할 수 있습니다.
                    </span>

                    {sessions.length === 0 && !showNewSession && (
                      <p className="empty-state" style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>
                        아직 평가 세션이 없습니다.
                      </p>
                    )}

                    {sessions.map(s => (
                      <div key={s.id} className="session-item">
                        <div className="session-info">
                          <span className="session-name">
                            {s.rubrics?.icon} {s.name}
                          </span>
                          <span className="session-rubric">{s.rubrics?.name || '루브릭 미지정'}</span>
                        </div>
                        <div className="session-actions">
                          <code className="session-code">{s.invite_code}</code>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleCopySessionCode(s.invite_code)}>
                            복사
                          </button>
                          <button
                            className={`btn btn-sm ${s.invite_code_active ? 'btn-active-toggle' : 'btn-secondary'}`}
                            onClick={() => handleToggleSession(s)}
                            disabled={evalSaving}
                          >
                            {s.invite_code_active ? '활성' : '비활성'}
                          </button>
                          <button className="btn-icon-delete" onClick={() => handleDeleteSession(s)}>&times;</button>
                        </div>
                      </div>
                    ))}

                    {/* 새 세션 추가 폼 */}
                    {showNewSession ? (
                      <form className="new-session-form" onSubmit={handleCreateSession}>
                        <input
                          value={newSessionName}
                          onChange={e => setNewSessionName(e.target.value)}
                          placeholder="세션명 (예: 국어 글쓰기 평가)"
                          required
                        />
                        <select value={newSessionRubric} onChange={e => setNewSessionRubric(e.target.value)} required>
                          <option value="">루브릭 선택</option>
                          {rubrics.map(r => (
                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button type="submit" className="btn btn-sm btn-primary" disabled={evalSaving}>추가</button>
                          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowNewSession(false)}>취소</button>
                        </div>
                      </form>
                    ) : (
                      <button className="btn btn-sm btn-primary" onClick={() => setShowNewSession(true)} style={{ marginTop: '0.5rem' }}>
                        + 평가 세션 추가
                      </button>
                    )}
                  </div>

                  {evalMessage && <div className="eval-settings-message">{evalMessage}</div>}
                </div>
              )}

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
