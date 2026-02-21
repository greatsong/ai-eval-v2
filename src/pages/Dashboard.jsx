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
  useEffect(() => { fetchDashboard() }, [selectedClassId, fetchDashboard])
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

          {/* 월별 점수 추이 */}
          {dashboard.monthlyTrend?.length > 1 && (() => {
            const data = dashboard.monthlyTrend
            const scores = data.map(d => d.avgScore)
            const minS = Math.min(...scores)
            const maxS = Math.max(...scores)
            const range = maxS - minS || 10
            const padMin = Math.max(0, minS - range * 0.15)
            const padMax = Math.min(100, maxS + range * 0.15)
            const padRange = padMax - padMin || 10
            const W = 500, H = 180, PX = 50, PY = 20
            const chartW = W - PX * 2, chartH = H - PY * 2
            const points = data.map((d, i) => ({
              x: PX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
              y: PY + chartH - ((d.avgScore - padMin) / padRange) * chartH,
              ...d
            }))
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
            // Y축 눈금 (3개)
            const yTicks = [padMin, (padMin + padMax) / 2, padMax].map(v => ({
              v: Math.round(v),
              y: PY + chartH - ((v - padMin) / padRange) * chartH
            }))
            return (
              <div className="result-card">
                <h3>월별 평균 점수 추이</h3>
                <svg viewBox={`0 0 ${W} ${H}`} className="trend-chart">
                  {/* Y축 눈금선 */}
                  {yTicks.map((t, i) => (
                    <g key={i}>
                      <line x1={PX} y1={t.y} x2={W - PX} y2={t.y} stroke="#e5e7eb" strokeWidth="1" />
                      <text x={PX - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t.v}</text>
                    </g>
                  ))}
                  {/* 선 */}
                  <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* 포인트 + 라벨 */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#6366f1" stroke="white" strokeWidth="2" />
                      <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1f2937">{p.avgScore}</text>
                      <text x={p.x} y={H - 2} textAnchor="middle" fontSize="10" fill="#6b7280">
                        {p.month.slice(5)}월
                      </text>
                      <text x={p.x} y={p.y + 18} textAnchor="middle" fontSize="9" fill="#9ca3af">({p.count}건)</text>
                    </g>
                  ))}
                </svg>
              </div>
            )
          })()}

          {/* 항목별 평균 */}
          {dashboard.criteriaAverages?.length > 0 && (
            <div className="result-card">
              <h3>항목별 평균</h3>
              <div className="criteria-bars">
                {dashboard.criteriaAverages.map((c, i) => {
                  const pct = Math.round(c.avgPercentage || 0)
                  return (
                    <div key={i} className="criteria-bar-item">
                      <span className="criteria-label">{c.name}</span>
                      <div className="criteria-bar">
                        <div
                          className="criteria-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="criteria-pct">{pct}%</span>
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
