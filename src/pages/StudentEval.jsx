import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { evaluateChat } from '../services/evaluator'
import { getGradeColor } from '../data/constants'
import { generatePdfReport } from '../services/pdfGenerator'
import PdfReportLayout from '../components/pdf/PdfReportLayout'
import './StudentEval.css'

const STEPS = { CODE: 0, STUDENT: 1, CHAT: 2, RESULT: 3 }

export default function StudentEval() {
  const [step, setStep] = useState(STEPS.CODE)
  const [inviteCode, setInviteCode] = useState('')
  const [classInfo, setClassInfo] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentNumber, setStudentNumber] = useState('')
  const [matchedStudent, setMatchedStudent] = useState(null)
  const [chatContent, setChatContent] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const pdfRef = useRef(null)

  // Step 1: 초대코드 검증
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    const code = inviteCode.trim().toUpperCase()
    if (!code) return

    setError('')
    setIsLoading(true)

    try {
      const { data, error: rpcError } = await supabase.rpc('get_class_for_student', {
        p_invite_code: code
      })

      if (rpcError) throw rpcError
      if (!data) {
        setError('유효하지 않은 초대코드입니다. 선생님께 확인해주세요.')
        return
      }
      if (!data.api_key) {
        setError('이 학급은 아직 평가 설정이 완료되지 않았습니다. 선생님께 문의하세요.')
        return
      }
      if (!data.rubric) {
        setError('이 학급에 평가 루브릭이 설정되지 않았습니다. 선생님께 문의하세요.')
        return
      }

      setClassInfo(data)
      setStep(STEPS.STUDENT)
    } catch (err) {
      setError(err.message || '코드 확인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: 번호로 학생 찾기
  const handleLookupStudent = (e) => {
    e.preventDefault()
    const num = studentNumber.trim()
    if (!num || !classInfo) return

    const found = classInfo.students.find(s => String(s.student_number) === num)
    if (found) {
      setMatchedStudent(found)
      setError('')
    } else {
      setMatchedStudent(null)
      setError('해당 번호의 학생을 찾을 수 없습니다. 다시 확인해주세요.')
    }
  }

  const handleConfirmStudent = () => {
    if (!matchedStudent) return
    setSelectedStudent(matchedStudent)
    setStep(STEPS.CHAT)
  }

  // Step 3: 평가 실행
  const handleEvaluate = async () => {
    if (!chatContent.trim()) {
      setError('채팅 내용을 붙여넣기 해주세요.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const apiSettings = {
        provider: classInfo.api_provider,
        apiKeys: { [classInfo.api_provider]: classInfo.api_key },
        models: { [classInfo.api_provider]: classInfo.api_model },
        evaluationRuns: 1
      }

      const evalResult = await evaluateChat({
        chatContent,
        reflection: null,
        rubric: classInfo.rubric,
        apiSettings
      })

      setResult(evalResult)

      // DB에 결과 저장
      await supabase.rpc('save_student_evaluation', {
        p_invite_code: inviteCode.trim().toUpperCase(),
        p_student_id: selectedStudent.id,
        p_evaluation: {
          total_score: evalResult.totalScore,
          grade: evalResult.grade,
          criteria_scores: evalResult.criteriaScores,
          characteristics: evalResult.characteristics || [],
          qualitative_evaluation: evalResult.qualitativeEvaluation || '',
          suggestions: evalResult.suggestions || [],
          student_record_draft: evalResult.studentRecordDraft || '',
          ai_provider: classInfo.api_provider,
          ai_model: classInfo.api_model,
          evaluation_runs: 1,
          evaluation_meta: evalResult.evaluationMeta || null
        }
      })

      setStep(STEPS.RESULT)
    } catch (err) {
      setError(err.message || '평가 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // PDF 다운로드
  const handleDownloadPdf = useCallback(async () => {
    if (!pdfRef.current || !result) return
    setIsGeneratingPdf(true)
    try {
      const name = selectedStudent?.name || '학생'
      const cls = classInfo?.class_name || ''
      const date = new Date().toISOString().slice(0, 10)
      const filename = `AI역량진단_${name}_${cls}_${date}`
      await new Promise(resolve => setTimeout(resolve, 500))
      await generatePdfReport(pdfRef.current, filename)
    } catch (err) {
      console.error('PDF 생성 오류:', err)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }, [result, selectedStudent, classInfo])

  // 새 평가
  const handleReset = () => {
    setChatContent('')
    setResult(null)
    setError('')
    setStep(STEPS.CHAT)
  }

  // 처음부터
  const handleStartOver = () => {
    setStep(STEPS.CODE)
    setInviteCode('')
    setClassInfo(null)
    setSelectedStudent(null)
    setStudentNumber('')
    setMatchedStudent(null)
    setChatContent('')
    setResult(null)
    setError('')
  }

  const gradeColor = result ? getGradeColor(result.grade) : null

  return (
    <div className="student-eval-page">
      <div className="student-eval-header">
        <h1>AI 채팅 평가</h1>
        <p className="student-eval-subtitle">과정의 증명 (Proof of Process)</p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="step-indicator">
        {['초대코드', '학생 선택', '채팅 입력', '결과 확인'].map((label, i) => (
          <div key={i} className={`step-dot ${step >= i ? 'active' : ''} ${step === i ? 'current' : ''}`}>
            <span className="step-dot-number">{i + 1}</span>
            <span className="step-dot-label">{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="student-error">{error}</div>}

      {/* Step 1: 초대코드 입력 */}
      {step === STEPS.CODE && (
        <div className="student-card step-card">
          <h2>학급 초대코드 입력</h2>
          <p>선생님에게 받은 초대코드를 입력하세요.</p>
          <form onSubmit={handleVerifyCode} className="code-form">
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="예: ABC-1234"
              className="code-input"
              autoFocus
              required
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading || !inviteCode.trim()}>
              {isLoading ? '확인 중...' : '확인'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: 학생 확인 */}
      {step === STEPS.STUDENT && classInfo && (
        <div className="student-card step-card">
          <div className="class-info-banner">
            <span className="class-info-name">{classInfo.class_name}</span>
            {classInfo.session_name && <span className="class-info-session">{classInfo.session_name}</span>}
            {classInfo.subject && <span className="class-info-subject">{classInfo.subject}</span>}
            <span className="class-info-teacher">{classInfo.teacher_name} 선생님</span>
          </div>
          {/* 루브릭 정보 */}
          {classInfo.rubric && (
            <div className="rubric-info-banner">
              <div className="rubric-info-title">
                <span>{classInfo.rubric.icon}</span> 평가 기준: <strong>{classInfo.rubric.name}</strong>
              </div>
              <div className="rubric-criteria-tags">
                {classInfo.rubric.criteria?.map((c, i) => (
                  <span key={i} className="rubric-tag">{c.name} ({c.weight}%)</span>
                ))}
              </div>
            </div>
          )}

          <h2>본인 확인</h2>
          <p>출석 번호를 입력하고 본인 이름을 확인하세요.</p>
          <form onSubmit={handleLookupStudent} className="student-lookup-form">
            <input
              type="number"
              value={studentNumber}
              onChange={e => { setStudentNumber(e.target.value); setMatchedStudent(null) }}
              placeholder="출석 번호"
              className="student-number-input"
              min="1"
              autoFocus
              required
            />
            <button type="submit" className="btn btn-primary">확인</button>
          </form>

          {/* 매칭된 학생 확인 카드 */}
          {matchedStudent && (
            <div className="student-confirm-card">
              <div className="student-confirm-info">
                <span className="student-confirm-number">{matchedStudent.student_number}번</span>
                <span className="student-confirm-name">{matchedStudent.name}</span>
              </div>
              <p className="student-confirm-question">본인이 맞나요?</p>
              <div className="student-confirm-actions">
                <button className="btn btn-primary" onClick={handleConfirmStudent}>
                  네, 맞습니다
                </button>
                <button className="btn btn-secondary" onClick={() => { setMatchedStudent(null); setStudentNumber('') }}>
                  아닙니다
                </button>
              </div>
            </div>
          )}

          <button className="btn btn-secondary btn-back" onClick={handleStartOver}>
            뒤로
          </button>
        </div>
      )}

      {/* Step 3: 채팅 입력 + 평가 */}
      {step === STEPS.CHAT && classInfo && selectedStudent && (
        <div className="student-card step-card">
          <div className="class-info-banner">
            <span className="class-info-name">{classInfo.class_name}</span>
            {classInfo.session_name && <span className="class-info-session">{classInfo.session_name}</span>}
            <span className="class-info-student">{selectedStudent.student_number}번 {selectedStudent.name}</span>
          </div>
          <h2>AI 채팅 내용 붙여넣기</h2>
          <p>AI와 나눈 채팅 화면에서 <strong>전체 선택(Ctrl+A) → 복사(Ctrl+C)</strong> 후 아래에 붙여넣기 하세요.</p>
          <textarea
            className="chat-textarea"
            value={chatContent}
            onChange={e => setChatContent(e.target.value)}
            placeholder="여기에 AI 채팅 내용을 붙여넣으세요..."
            rows={12}
          />
          <div className="chat-actions">
            <button className="btn btn-secondary" onClick={() => setStep(STEPS.STUDENT)}>
              뒤로
            </button>
            <button
              className="btn btn-primary btn-evaluate"
              onClick={handleEvaluate}
              disabled={isLoading || !chatContent.trim()}
            >
              {isLoading ? '평가 중...' : '평가 시작'}
            </button>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && step === STEPS.CHAT && (
        <div className="student-loading-overlay">
          <div className="loading-spinner" />
          <p>AI가 채팅을 분석하고 있습니다...</p>
          <p className="loading-sub">잠시만 기다려주세요.</p>
        </div>
      )}

      {/* Step 4: 결과 표시 */}
      {step === STEPS.RESULT && result && (
        <div className="student-card result-step-card">
          <h2>평가 완료!</h2>

          {/* PDF 다운로드 안내 */}
          <div className="result-action-bar">
            <button
              className="btn btn-primary btn-download"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? 'PDF 생성 중...' : 'PDF 보고서 다운로드'}
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              다시 평가하기
            </button>
          </div>

          {/* 점수 요약 */}
          <div className="result-summary-card" style={{ borderColor: gradeColor?.color }}>
            <div className="result-grade" style={{ background: gradeColor?.bg, color: gradeColor?.color }}>
              {result.grade}
            </div>
            <div className="result-score">
              <span className="score-value">{result.totalScore}</span>
              <span className="score-max">/ 100</span>
            </div>
          </div>

          {/* 항목별 점수 */}
          {result.criteriaScores?.length > 0 && (
            <div className="result-criteria-list">
              <h3>항목별 점수</h3>
              {result.criteriaScores.map((cs, i) => {
                const pct = cs.percentage ?? Math.round((cs.score / cs.maxScore) * 100)
                return (
                  <div key={i} className="result-criterion-row">
                    <span className="criterion-name">{cs.name}</span>
                    <div className="criterion-bar-wrapper">
                      <div className="criterion-bar-bg">
                        <div
                          className="criterion-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 80 ? '#10b981' : pct >= 60 ? '#6366f1' : '#f59e0b'
                          }}
                        />
                      </div>
                      <span className="criterion-pct">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 특성 */}
          {result.characteristics?.length > 0 && (
            <div className="result-section">
              <h3>AI 활용 특징</h3>
              <ul>{result.characteristics.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}

          {/* 종합 소견 */}
          {result.qualitativeEvaluation && (
            <div className="result-section">
              <h3>종합 소견</h3>
              <p>{result.qualitativeEvaluation}</p>
            </div>
          )}

          {/* 개선 제안 */}
          {result.suggestions?.length > 0 && (
            <div className="result-section">
              <h3>개선 제안</h3>
              <ul>{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}

          <div className="result-footer-note">
            PDF 보고서를 다운로드하여 선생님께 제출하세요.
          </div>

          {/* PDF 전용 hidden 레이아웃 */}
          <div className="pdf-hidden-container">
            <PdfReportLayout
              result={result}
              studentName={selectedStudent?.name || '학생'}
              className={classInfo?.class_name || ''}
              rubricName={classInfo?.rubric?.name || '평가 루브릭'}
              evaluationDate={new Date().toLocaleDateString('ko-KR')}
              gradeColor={gradeColor || { bg: '#f9fafb', color: '#6b7280' }}
              containerRef={pdfRef}
            />
          </div>
        </div>
      )}

      {/* 하단 푸터 */}
      <footer className="student-eval-footer">
        <p>과정의 증명 (Proof of Process) · AI 채팅 평가 시스템 v2</p>
      </footer>
    </div>
  )
}
