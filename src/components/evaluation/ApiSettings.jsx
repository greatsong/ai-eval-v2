import { useEvaluation } from '../../context/EvaluationContext'
import { PROVIDER_MODELS, EVALUATION_RUNS_OPTIONS } from '../../data/constants'

export default function ApiSettings() {
  const { apiSettings, setApiSettings } = useEvaluation()

  const updateSetting = (key, value) => {
    setApiSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateApiKey = (provider, key) => {
    setApiSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: key }
    }))
  }

  const updateModel = (provider, model) => {
    setApiSettings(prev => ({
      ...prev,
      models: { ...prev.models, [provider]: model }
    }))
  }

  const currentProvider = PROVIDER_MODELS[apiSettings.provider]

  return (
    <div className="result-card" style={{ marginBottom: '1.5rem' }}>
      <h3>API 설정</h3>

      <div className="settings-grid">
        <div className="form-group">
          <label>AI 제공업체</label>
          <select
            value={apiSettings.provider}
            onChange={e => updateSetting('provider', e.target.value)}
          >
            {Object.entries(PROVIDER_MODELS).map(([key, p]) => (
              <option key={key} value={key}>{p.emoji} {p.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>모델</label>
          <select
            value={apiSettings.models?.[apiSettings.provider] || ''}
            onChange={e => updateModel(apiSettings.provider, e.target.value)}
          >
            {currentProvider?.defaults.map(m => (
              <option key={m} value={m}>{currentProvider.labels[m] || m}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            API 키
            {currentProvider?.helpUrl && (
              <a href={currentProvider.helpUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                발급받기
              </a>
            )}
          </label>
          <input
            type="password"
            value={apiSettings.apiKeys?.[apiSettings.provider] || ''}
            onChange={e => updateApiKey(apiSettings.provider, e.target.value)}
            placeholder={currentProvider?.placeholder || 'API 키 입력'}
          />
        </div>

        <div className="form-group">
          <label>평가 횟수</label>
          <select
            value={apiSettings.evaluationRuns}
            onChange={e => updateSetting('evaluationRuns', Number(e.target.value))}
          >
            {EVALUATION_RUNS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
