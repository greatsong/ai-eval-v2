export default function PdfBarChart({ criteriaScores }) {
  const getBarColor = (pct) => {
    if (pct >= 80) return '#6366f1'
    if (pct >= 60) return '#818cf8'
    return '#c7d2fe'
  }

  return (
    <div className="pdf-bar-labels">
      {criteriaScores.map((cs, i) => {
        const pct = cs.percentage ?? Math.round((cs.score / cs.maxScore) * 100)
        return (
          <div key={i} className="pdf-bar-label-row">
            <span className="pdf-bar-label-name">{cs.name}</span>
            <div className="pdf-bar-track">
              <div
                className="pdf-bar-fill"
                style={{ width: `${pct}%`, background: getBarColor(pct) }}
              />
            </div>
            <span className="pdf-bar-label-pct">
              {pct}% (가중치 {cs.weight || 25}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}
