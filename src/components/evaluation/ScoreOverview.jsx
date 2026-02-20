export default function ScoreOverview({ result, gradeColor }) {
  return (
    <div className="result-card score-overview">
      <div className="score-main">
        <div className="grade-badge" style={{ background: gradeColor.bg, color: gradeColor.color }}>
          {result.grade}
        </div>
        <div className="score-number">
          <span className="score-value">{result.totalScore}</span>
          <span className="score-max">/100</span>
        </div>
      </div>
      {result.evaluationMeta && (
        <div className="eval-meta">
          {result.evaluationMeta.runs}회 평가 | 점수 범위: {result.evaluationMeta.scoreRange?.min} ~ {result.evaluationMeta.scoreRange?.max}
        </div>
      )}
    </div>
  )
}
