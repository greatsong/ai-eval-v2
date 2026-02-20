import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEvaluation } from '../context/EvaluationContext'
import { useClassContext } from '../context/ClassContext'
import { evaluateChat } from '../services/evaluator'
import ChatInput from '../components/evaluation/ChatInput'
import RubricSelector from '../components/evaluation/RubricSelector'
import StudentSelector from '../components/evaluation/StudentSelector'
import EvaluationResult from '../components/evaluation/EvaluationResult'
import ApiSettings from '../components/evaluation/ApiSettings'
import './Home.css'

export default function Home() {
  const { user, profile } = useAuth()
  const { currentRubric, evaluationResult, setEvaluationResult, isLoading, setIsLoading, apiSettings, saveEvaluation } = useEvaluation()
  const { currentClass, currentStudent } = useClassContext()
  const [chatContent, setChatContent] = useState('')
  const [reflection, setReflection] = useState('')
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const handleEvaluate = async () => {
    if (!chatContent.trim()) {
      setError('채팅 내용을 입력해주세요.')
      return
    }
    if (!currentRubric) {
      setError('루브릭을 선택해주세요.')
      return
    }
    const apiKey = apiSettings.apiKeys?.[apiSettings.provider]
    if (!apiKey && !apiSettings.useServerSide) {
      setError('API 키를 설정해주세요.')
      return
    }

    setError('')
    setIsLoading(true)
    setEvaluationResult(null)

    try {
      const result = await evaluateChat({
        chatContent,
        reflection: reflection || null,
        rubric: currentRubric,
        apiSettings
      })

      setEvaluationResult(result)

      await saveEvaluation(result, {
        studentId: currentStudent?.id || null,
        classId: currentClass?.id || null,
        rubricId: currentRubric.id,
        rubricName: currentRubric.name,
        provider: apiSettings.provider,
        model: apiSettings.models?.[apiSettings.provider],
        evaluationRuns: apiSettings.evaluationRuns
      })
    } catch (err) {
      setError(err.message || '평가 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <div>
          <h1>AI 채팅 평가</h1>
          <p>{profile?.display_name || user?.email} 선생님</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? '설정 닫기' : 'API 설정'}
        </button>
      </div>

      {showSettings && <ApiSettings />}

      <div className="eval-form">
        <div className="eval-selectors">
          <RubricSelector />
          <StudentSelector />
        </div>

        <ChatInput value={chatContent} onChange={setChatContent} />

        <div className="form-group">
          <label htmlFor="reflection">학생 자기평가 / 맥락 (선택)</label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="학생의 자기평가, 과제 맥락, 참고사항 등을 입력하세요..."
            rows={3}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="btn btn-primary btn-evaluate"
          onClick={handleEvaluate}
          disabled={isLoading || !chatContent.trim()}
        >
          {isLoading ? '평가 중...' : '평가 시작'}
        </button>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>AI가 채팅을 분석하고 있습니다...</p>
        </div>
      )}

      {evaluationResult && <EvaluationResult result={evaluationResult} rubric={currentRubric} />}
    </div>
  )
}
