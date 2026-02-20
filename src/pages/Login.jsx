import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName)
        if (error) throw error
        setSignUpSuccess(true)
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      setError(err.message || '인증에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (signUpSuccess) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>회원가입 완료</h1>
            <p>이메일로 전송된 인증 링크를 확인해주세요.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setIsSignUp(false); setSignUpSuccess(false) }}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>AI 채팅 평가 시스템</h1>
          <p>과정의 증명 (Proof of Process)</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="displayName">이름</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="홍길동 선생님"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teacher@school.ac.kr"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6자 이상"
              minLength={6}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <button className="btn-link" onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  )
}
