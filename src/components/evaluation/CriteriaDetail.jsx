export default function CriteriaDetail({ criteriaScores }) {
  if (!criteriaScores?.length) return null

  return (
    <div className="result-card">
      <h3>항목별 상세 평가</h3>
      <div className="criteria-list">
        {criteriaScores.map((cs, i) => (
          <div key={i} className="criterion-item">
            <div className="criterion-header">
              <span className="criterion-name">{cs.name}</span>
              <span className="criterion-score">
                {cs.score}/{cs.maxScore} ({cs.percentage || Math.round((cs.score / cs.maxScore) * 100)}%)
              </span>
            </div>
            <div className="criterion-bar">
              <div
                className="criterion-bar-fill"
                style={{ width: `${(cs.score / cs.maxScore) * 100}%` }}
              />
            </div>
            {cs.evidence && (
              <div className="criterion-section">
                <strong>근거:</strong> <span>{cs.evidence}</span>
              </div>
            )}
            {cs.strengths && (
              <div className="criterion-section positive">
                <strong>강점:</strong> <span>{cs.strengths}</span>
              </div>
            )}
            {cs.weaknesses && (
              <div className="criterion-section negative">
                <strong>약점:</strong> <span>{cs.weaknesses}</span>
              </div>
            )}
            {cs.improvement && (
              <div className="criterion-section">
                <strong>개선:</strong> <span>{cs.improvement}</span>
              </div>
            )}
            {cs.nextSteps && (
              <div className="criterion-section next-steps">
                <strong>다음 단계:</strong> <span>{cs.nextSteps}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
