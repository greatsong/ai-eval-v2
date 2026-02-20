import { useRef, useState, useCallback } from 'react'
import { getGradeColor } from '../../data/constants'
import { useClassContext } from '../../context/ClassContext'
import { useEvaluation } from '../../context/EvaluationContext'
import { generatePdfReport } from '../../services/pdfGenerator'
import ScoreOverview from './ScoreOverview'
import CriteriaDetail from './CriteriaDetail'
import PdfReportLayout from '../pdf/PdfReportLayout'

export default function EvaluationResult({ result }) {
  const gradeColor = getGradeColor(result?.grade)
  const { currentStudent, currentClass } = useClassContext()
  const { currentRubric } = useEvaluation()
  const pdfRef = useRef(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleDownloadPdf = useCallback(async () => {
    if (!pdfRef.current) return
    setIsGeneratingPdf(true)
    try {
      const name = currentStudent?.name || '미지정'
      const cls = currentClass?.name || ''
      const date = new Date().toISOString().slice(0, 10)
      const filename = `AI역량진단_${name}_${cls}_${date}`

      // 차트 렌더 완료 대기
      await new Promise(resolve => setTimeout(resolve, 500))
      await generatePdfReport(pdfRef.current, filename)
    } catch (err) {
      console.error('PDF 생성 오류:', err)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }, [currentStudent, currentClass])

  if (!result) return null

  return (
    <div className="evaluation-result" style={{ marginTop: '2rem' }}>
      {/* PDF 다운로드 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: isGeneratingPdf ? 0.7 : 1,
          }}
        >
          {isGeneratingPdf ? 'PDF 생성 중...' : 'PDF 보고서 다운로드'}
        </button>
      </div>

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

      {/* PDF 전용 hidden 레이아웃 */}
      <div className="pdf-hidden-container">
        <PdfReportLayout
          result={result}
          studentName={currentStudent?.name || '미지정'}
          className={currentClass?.name || '미지정'}
          rubricName={currentRubric?.name || '평가 루브릭'}
          evaluationDate={new Date().toLocaleDateString('ko-KR')}
          gradeColor={gradeColor}
          containerRef={pdfRef}
        />
      </div>
    </div>
  )
}
