import { getGradeColor } from '../../data/constants'
import ScoreOverview from './ScoreOverview'
import CriteriaDetail from './CriteriaDetail'

export default function EvaluationResult({ result }) {
  if (!result) return null

  const gradeColor = getGradeColor(result.grade)

  return (
    <div className="evaluation-result" style={{ marginTop: '2rem' }}>
      <ScoreOverview result={result} gradeColor={gradeColor} />
      <CriteriaDetail criteriaScores={result.criteriaScores} />

      {result.characteristics?.length > 0 && (
        <div className="result-card">
          <h3>AI 활용 특징</h3>
          <ul>
            {result.characteristics.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {result.qualitativeEvaluation && (
        <div className="result-card">
          <h3>정성 평가</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{result.qualitativeEvaluation}</p>
        </div>
      )}

      {result.suggestions?.length > 0 && (
        <div className="result-card">
          <h3>개선 제안</h3>
          <ul>
            {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {result.studentRecordDraft && (
        <div className="result-card">
          <h3>생활기록부 초안</h3>
          <p style={{ whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
            {result.studentRecordDraft}
          </p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.5rem' }}
            onClick={() => navigator.clipboard.writeText(result.studentRecordDraft)}
          >
            복사
          </button>
        </div>
      )}
    </div>
  )
}
