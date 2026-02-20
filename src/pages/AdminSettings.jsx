import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'
import './AdminSettings.css'

export default function AdminSettings() {
  const { isAdmin } = useAuth()
  const [codes, setCodes] = useState([])
  const [newCode, setNewCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('global_config')
      .select('value')
      .eq('key', 'teacher_access_code')
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setCodes(data.value.codes || [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const saveCodes = async (updatedCodes) => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('global_config')
      .update({
        value: { codes: updatedCodes, updated_at: new Date().toISOString().split('T')[0] }
      })
      .eq('key', 'teacher_access_code')

    if (error) {
      setMessage('저장에 실패했습니다.')
    } else {
      setCodes(updatedCodes)
      setMessage('저장되었습니다.')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 2000)
  }

  const handleAdd = async () => {
    const trimmed = newCode.trim().toUpperCase()
    if (!trimmed) return
    if (codes.includes(trimmed)) {
      setMessage('이미 존재하는 코드입니다.')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    await saveCodes([...codes, trimmed])
    setNewCode('')
  }

  const handleRemove = async (code) => {
    if (codes.length <= 1) {
      setMessage('최소 1개의 코드가 필요합니다.')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    await saveCodes(codes.filter(c => c !== code))
  }

  if (!isAdmin) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>교사 접근코드 관리</h2>
        <p className="admin-desc">
          회원가입 시 필요한 교사 인증 코드를 관리합니다. 코드를 주기적으로 변경하여 보안을 유지하세요.
        </p>

        <div className="code-list">
          <h3>활성 코드 목록</h3>
          {codes.length === 0 ? (
            <p className="empty-text">등록된 코드가 없습니다.</p>
          ) : (
            <ul>
              {codes.map(code => (
                <li key={code} className="code-item">
                  <code className="code-badge">{code}</code>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemove(code)}
                    disabled={saving}
                    title="삭제"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="code-add">
          <input
            type="text"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            placeholder="새 접근코드 입력"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={saving || !newCode.trim()}
          >
            추가
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}
      </div>
    </div>
  )
}
