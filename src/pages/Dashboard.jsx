import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClassContext } from '../context/ClassContext'
import { useClassDashboard, useTeacherOverview } from '../hooks/useDashboard'
import { useEvaluations } from '../hooks/useEvaluations'
import { getGradeColor } from '../data/constants'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { classes } = useClassContext()
  const [selectedClassId, setSelectedClassId] = useState(null)
  const { overview, fetchOverview } = useTeacherOverview(user?.id)
  const { dashboard, fetchDashboard } = useClassDashboard(selectedClassId)
  const { evaluations, fetchEvaluations } = useEvaluations(user?.id)

  useEffect(() => { fetchOverview() }, [fetchOverview])
  useEffect(() => { if (selectedClassId) fetchDashboard() }, [selectedClassId, fetchDashboard])
  useEffect(() => { if (user?.id) fetchEvaluations({ limit: 20 }) }, [user?.id, fetchEvaluations])

  return (
    <div className="dashboard">
      <h1>대시보드</h1>

      {/* 교사 전체 개요 */}
      {overview && (
        <div className="overview-cards">
          <div className="stat-card">
            <div className="stat-value">{overview.totalClasses}</div>
            <div className="stat-label">활성 학급</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.totalStudents}</div>
            <div className="stat-label">전체 학생</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.totalEvaluations}</div>
            <div className="stat-label">총 평가 수</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.avgScore || '-'}</div>
            <div className="stat-label">전체 평균</div>
          </div>
        </div>
      )}

      {/* 학급 선택 */}
      <div className="dashboard-section">
        <h2>학급별 통계</h2>
        <select
          value={selectedClassId || ''}
          onChange={e => setSelectedClassId(e.target.value || null)}
          className="class-select"
        >
          <option value="">학급을 선택하세요</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.subject || ''})</option>
          ))}
        </select>
      </div>

      {/* 학급 대시보드 */}
      {dashboard && (
        <div className="class-dashboard">
          <div className="overview-cards">
            <div className="stat-card">
              <div className="stat-value">{dashboard.summary?.totalStudents || 0}</div>
              <div className="stat-label">학생 수</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.summary?.totalEvaluations || 0}</div>
              <div className="stat-label">평가 수</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.summary?.avgScore || '-'}</div>
              <div className="stat-label">평균 점수</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {dashboard.summary?.minScore || '-'} ~ {dashboard.summary?.maxScore || '-'}
              </div>
              <div className="stat-label">점수 범위</div>
            </div>
          </div>

          {/* 등급 분포 */}
          {dashboard.gradeDistribution?.length > 0 && (
            <div className="result-card">
              <h3>등급 분포</h3>
              <div className="grade-bars">
                {dashboard.gradeDistribution.map(g => {
                  const color = getGradeColor(g.grade)
                  return (
                    <div key={g.grade} className="grade-bar-item">
                      <span className="grade-label" style={{ color: color.color }}>{g.grade}</span>
                      <div className="grade-bar">
                        <div
                          className="grade-bar-fill"
                          style={{
                            width: `${(g.count / dashboard.summary.totalEvaluations) * 100}%`,
                            background: color.color
                          }}
                        />
                      </div>
                      <span className="grade-count">{g.count}명</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 항목별 평균 */}
          {dashboard.criteriaAverages?.length > 0 && (
            <div className="result-card">
              <h3>항목별 평균</h3>
              <div className="criteria-bars">
                {dashboard.criteriaAverages.map((c, i) => {
                  const pct = Math.round((c.avgScore / 5) * 100)
                  return (
                    <div key={i} className="criteria-bar-item">
                      <span className="criteria-label">{c.name}</span>
                      <div className="criteria-bar">
                        <div
                          className="criteria-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="criteria-pct">{c.avgScore}/5</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 최근 평가 */}
          {dashboard.recentEvaluations?.length > 0 && (
            <div className="result-card">
              <h3>최근 평가</h3>
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>학생</th>
                    <th>루브릭</th>
                    <th>점수</th>
                    <th>등급</th>
                    <th>날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentEvaluations.map(e => (
                    <tr key={e.id}>
                      <td>{e.student_name || '-'} {e.student_number ? `(${e.student_number})` : ''}</td>
                      <td>{e.rubric_name}</td>
                      <td>{e.total_score}</td>
                      <td>
                        <span className="grade-tag" style={{ color: getGradeColor(e.grade).color }}>
                          {e.grade}
                        </span>
                      </td>
                      <td>{new Date(e.created_at).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 최근 전체 평가 이력 */}
      {!selectedClassId && evaluations.length > 0 && (
        <div className="result-card" style={{ marginTop: '1.5rem' }}>
          <h3>최근 평가 이력</h3>
          <table className="eval-table">
            <thead>
              <tr>
                <th>학생</th>
                <th>루브릭</th>
                <th>점수</th>
                <th>등급</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(e => (
                <tr key={e.id}>
                  <td>{e.students?.name || '-'}</td>
                  <td>{e.rubric_name}</td>
                  <td>{e.total_score}</td>
                  <td>
                    <span className="grade-tag" style={{ color: getGradeColor(e.grade).color }}>
                      {e.grade}
                    </span>
                  </td>
                  <td>{new Date(e.created_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
