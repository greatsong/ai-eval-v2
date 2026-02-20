import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useRubrics } from '../hooks/useRubrics'
import { useEvaluations } from '../hooks/useEvaluations'

const EvaluationContext = createContext(null)

export function EvaluationProvider({ children }) {
  const { user } = useAuth()
  const rubricState = useRubrics(user?.id)
  const evalState = useEvaluations(user?.id)
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // API 설정 (API 키는 localStorage에 유지)
  const [apiSettings, setApiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ai-eval-v2-api-settings')
      return saved ? JSON.parse(saved) : {
        provider: 'gemini',
        apiKeys: { gemini: '', openai: '', claude: '' },
        models: { gemini: 'gemini-2.5-flash', openai: 'gpt-4o', claude: 'claude-3-5-sonnet-20241022' },
        evaluationRuns: 1
      }
    } catch { return { provider: 'gemini', apiKeys: { gemini: '', openai: '', claude: '' }, models: { gemini: 'gemini-2.5-flash', openai: 'gpt-4o', claude: 'claude-3-5-sonnet-20241022' }, evaluationRuns: 1 } }
  })

  useEffect(() => {
    localStorage.setItem('ai-eval-v2-api-settings', JSON.stringify(apiSettings))
  }, [apiSettings])

  useEffect(() => {
    if (user?.id) rubricState.fetchRubrics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <EvaluationContext.Provider value={{
      ...rubricState,
      ...evalState,
      evaluationResult, setEvaluationResult,
      isLoading, setIsLoading,
      apiSettings, setApiSettings
    }}>
      {children}
    </EvaluationContext.Provider>
  )
}

export function useEvaluation() {
  const context = useContext(EvaluationContext)
  if (!context) throw new Error('useEvaluation must be used within EvaluationProvider')
  return context
}
