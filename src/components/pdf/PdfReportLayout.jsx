import PdfRadarChart from './PdfRadarChart'
import PdfBarChart from './PdfBarChart'
import './PdfReportLayout.css'

export default function PdfReportLayout({
  result,
  studentName,
  className,
  rubricName,
  evaluationDate,
  gradeColor,
  containerRef,
}) {
  const { grade, totalScore, evaluationMeta, criteriaScores, characteristics, qualitativeEvaluation, suggestions, studentRecordDraft } = result

  const getScoreColor = (pct) => {
    if (pct >= 80) return '#10b981'
    if (pct >= 60) return '#6366f1'
    return '#f59e0b'
  }

  return (
    <div className="pdf-report" ref={containerRef}>

      {/* ═══════════ PAGE 1: 표지 + 종합 ═══════════ */}
      <div className="pdf-accent-bar" />

      <div className="pdf-header">
        <h1 className="pdf-title">AI 리터러시 역량 진단 보고서</h1>
        <p className="pdf-subtitle">자기주도적 AI 활용 학습 능력에 대한 다면적 진단 결과</p>
      </div>

      {/* 학생 정보 + 점수 카드 */}
      <div className="pdf-info-card">
        <div className="pdf-info-row">
          학생: {studentName}  |  학급: {className}  |  평가일: {evaluationDate}  |  루브릭: {rubricName}
        </div>
        <div className="pdf-score-row">
          <div
            className="pdf-grade-badge"
            style={{ background: gradeColor.bg, color: gradeColor.color }}
          >
            {grade}
          </div>
          <div className="pdf-score-display">
            <span className="pdf-score-value">{totalScore}</span>
            <span className="pdf-score-max">/ 100</span>
          </div>
          {evaluationMeta && (
            <div className="pdf-eval-meta">
              {evaluationMeta.runs}회 반복 평가 · 점수 범위 {evaluationMeta.scoreRange?.min}~{evaluationMeta.scoreRange?.max} · 편차 {(evaluationMeta.scoreRange?.max || 0) - (evaluationMeta.scoreRange?.min || 0)}점
            </div>
          )}
        </div>
      </div>

      {/* 역량 프로파일 */}
      {criteriaScores?.length > 0 && (
        <div className="pdf-section">
          <h3 className="pdf-section-title">역량 프로파일</h3>
          <div className="pdf-charts-row">
            <div className="pdf-chart-radar">
              <PdfRadarChart criteriaScores={criteriaScores} />
            </div>
            <div className="pdf-chart-bar">
              <PdfBarChart criteriaScores={criteriaScores} />
            </div>
          </div>
        </div>
      )}

      {/* 항목별 점수 요약 카드 */}
      {criteriaScores?.length > 0 && (
        <div className="pdf-section">
          <h3 className="pdf-section-title">항목별 점수 요약</h3>
          <div className="pdf-score-cards">
            {criteriaScores.map((cs, i) => {
              const pct = cs.percentage ?? Math.round((cs.score / cs.maxScore) * 100)
              const color = getScoreColor(pct)
              return (
                <div key={i} className="pdf-score-card" style={{ borderTopColor: color }}>
                  <div className="pdf-score-card-name">{cs.name}</div>
                  <div className="pdf-score-card-value" style={{ color }}>{pct}%</div>
                  <div className="pdf-score-card-bar">
                    <div className="pdf-score-card-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="pdf-score-card-detail">
                    {cs.score}/{cs.maxScore}점 · 가중치 {cs.weight || 25}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 학습자 AI 활용 특성 */}
      {characteristics?.length > 0 && (
        <div className="pdf-section">
          <h3 className="pdf-section-title">학습자 AI 활용 특성</h3>
          <ul className="pdf-char-list">
            {characteristics.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* 종합 소견 */}
      {qualitativeEvaluation && (
        <div className="pdf-section">
          <h3 className="pdf-section-title">종합 소견</h3>
          <p className="pdf-body-text">{qualitativeEvaluation}</p>
        </div>
      )}


      {/* ═══════════ PAGE 2~3: 항목별 상세 진단 ═══════════ */}
      <div className="pdf-page-break" />

      <div className="pdf-page-header">
        <span className="pdf-page-header-title">AI 리터러시 역량 진단 보고서</span>
        <span className="pdf-page-header-student">{studentName} · {className}</span>
      </div>
      <div className="pdf-page-header-line" />

      <div className="pdf-criteria-section">
        <h2 className="pdf-section-title-large">항목별 상세 진단</h2>

        {criteriaScores?.map((cs, i) => {
          const pct = cs.percentage ?? Math.round((cs.score / cs.maxScore) * 100)
          const scoreColor = getScoreColor(pct)

          return (
            <div key={i} className="pdf-criterion">
              <div className="pdf-criterion-header">
                <span className="pdf-criterion-name">{cs.name}</span>
                <span className="pdf-criterion-score" style={{ color: scoreColor }}>
                  {cs.score}/{cs.maxScore} ({pct}%)
                </span>
              </div>

              <div className="pdf-progress-bar">
                <div
                  className="pdf-progress-fill"
                  style={{ width: `${pct}%`, background: scoreColor }}
                />
              </div>

              <div className="pdf-criterion-weight">가중치: {cs.weight || 25}%</div>

              {cs.evidence && (
                <div className="pdf-detail-item evidence">
                  <span className="pdf-detail-label">[근거]</span>
                  <p className="pdf-detail-text">{cs.evidence}</p>
                </div>
              )}

              {cs.strengths && (
                <div className="pdf-detail-item strength">
                  <span className="pdf-detail-label">[강점]</span>
                  <p className="pdf-detail-text">{cs.strengths}</p>
                </div>
              )}

              {cs.weaknesses && (
                <div className="pdf-detail-item weakness">
                  <span className="pdf-detail-label">[보완점]</span>
                  <p className="pdf-detail-text">{cs.weaknesses}</p>
                </div>
              )}

              {cs.improvement && (
                <div className="pdf-detail-item improvement">
                  <span className="pdf-detail-label">[개선 예시]</span>
                  <p className="pdf-detail-text">{cs.improvement}</p>
                </div>
              )}

              {cs.nextSteps && (
                <div className="pdf-detail-item next-steps">
                  <span className="pdf-detail-label">[다음 단계]</span>
                  <p className="pdf-detail-text">{cs.nextSteps}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>


      {/* ═══════════ 성장 제안 + 생기부 초안 ═══════════ */}

      {suggestions?.length > 0 && (
        <div className="pdf-suggestions-section">
          <h2 className="pdf-section-title-large">성장을 위한 실천 제안</h2>
          {suggestions.map((s, i) => (
            <div key={i} className="pdf-suggestion-card">
              <span className="pdf-suggestion-number">{i + 1}</span>
              <p className="pdf-suggestion-text">{s}</p>
            </div>
          ))}
        </div>
      )}

      {studentRecordDraft && (
        <div className="pdf-record-section">
          <h2 className="pdf-section-title-large">학생 활동 관찰 기록 초안</h2>
          <div className="pdf-record-box">
            <p className="pdf-record-text">{studentRecordDraft}</p>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <div className="pdf-footer">
        <p className="pdf-footer-text">
          본 보고서는 AI 채팅 평가 시스템 v2에 의해 자동 생성되었습니다. 평가 결과는 학생의 AI 활용 역량에 대한 참고 자료이며, 교사의 종합적 판단과 함께 활용하시기 바랍니다.
        </p>
      </div>
    </div>
  )
}
