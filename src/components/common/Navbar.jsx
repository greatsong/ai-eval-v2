import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { profile, signOut, isAdmin } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">AI 채팅 평가 v2</div>
        <div className="navbar-links">
          <NavLink to="/" end>평가</NavLink>
          <NavLink to="/classes">학급</NavLink>
          <NavLink to="/dashboard">대시보드</NavLink>
          {isAdmin && <NavLink to="/admin">관리</NavLink>}
        </div>
        <div className="navbar-user">
          <span className="user-name">{profile?.display_name || '선생님'}</span>
          <button className="btn btn-secondary btn-sm" onClick={signOut}>로그아웃</button>
        </div>
      </div>
    </nav>
  )
}
