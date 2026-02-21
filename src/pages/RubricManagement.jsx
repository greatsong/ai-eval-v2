import { useState } from 'react'
import { useEvaluation } from '../context/EvaluationContext'
import { generateRubricWithAI } from '../services/rubricGenerator'
import './RubricManagement.css'

const ICON_OPTIONS = ['📋', '🤖', '✍️', '🔬', '💻', '📊', '🎨', '🧮', '🌍', '📚', '🎵', '⚙️']

function createEmptyCriterion(index) {
  return {
    id: `criterion_${Date.now()}_${index}`,
    name: '',
    description: '',
    weight: 25,
    levels: [
      { score: 5, description: '' },
      { score: 4, description: '' },
      { score: 3, description: '' },
      { score: 2, description: '' },
      { score: 1, description: '' }
    ]
  }
}

function getWeightSum(criteria) {
  return criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
}

const INITIAL_FORM = {
  name: '',
  description: '',
  icon: '📋',
  criteria: [createEmptyCriterion(0)]
}

export default function RubricManagement() {
  const { rubrics, createRubric, deleteRubric, apiSettings } = useEvaluation()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedRubricId, setExpandedRubricId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)

  // AI 코치 상태
  const [aiTopic, setAiTopic] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)

  const templateRubrics = rubrics.filter(r => r.isTemplate)
  const customRubrics = rubrics.filter(r => !r.isTemplate && !r.isShared)

  // === 폼 핸들러 ===

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM,
      criteria: [createEmptyCriterion(0)]
    })
    setAiTopic('')
    setError('')
  }

  const handleStartCreate = () => {
    resetForm()
    setShowCreateForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
    resetForm()
  }

  const handleCriterionChange = (cIdx, field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === cIdx ? { ...c, [field]: value } : c
      )
    }))
  }

  const handleLevelChange = (cIdx, lIdx, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === cIdx ? {
          ...c,
          levels: c.levels.map((l, j) =>
            j === lIdx ? { ...l, description: value } : l
          )
        } : c
      )
    }))
  }

  const handleAddCriterion = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, createEmptyCriterion(prev.criteria.length)]
    }))
  }

  const handleRemoveCriterion = (index) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }))
  }

  // === AI 코치 ===

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      setError('어떤 평가 루브릭을 만들고 싶은지 입력해주세요.')
      return
    }

    setError('')
    setAiGenerating(true)

    try {
      const result = await generateRubricWithAI(aiTopic.trim(), apiSettings)
      setFormData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setAiGenerating(false)
    }
  }

  // === 저장 ===

  const handleCreateRubric = async () => {
    if (!formData.name.trim()) {
      setError('루브릭 이름을 입력해주세요.')
      return
    }
    if (formData.criteria.length === 0) {
      setError('최소 1개의 평가 항목이 필요합니다.')
      return
    }
    if (formData.criteria.some(c => !c.name.trim())) {
      setError('모든 항목의 이름을 입력해주세요.')
      return
    }
    if (getWeightSum(formData.criteria) !== 100) {
      setError('가중치 합계가 100%가 되어야 합니다.')
      return
    }
    for (const c of formData.criteria) {
      if (c.levels.some(l => !l.description.trim())) {
        setError(`'${c.name}' 항목의 모든 수준 기준을 입력해주세요.`)
        return
      }
    }

    setError('')
    setSaving(true)

    const { error: createError } = await createRubric({
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      criteria: formData.criteria
    })

    setSaving(false)

    if (createError) {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } else {
      setShowCreateForm(false)
      resetForm()
    }
  }

  // === 복제 ===

  const handleCloneTemplate = (rubric) => {
    setFormData({
      name: `${rubric.name} (복제)`,
      description: rubric.description,
      icon: rubric.icon,
      criteria: rubric.criteria.map((c, i) => ({
        id: `criterion_${Date.now()}_${i}`,
        name: c.name,
        description: c.description,
        weight: c.weight,
        levels: c.levels.map(l => ({ score: l.score, description: l.description }))
      }))
    })
    setShowCreateForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // === 삭제 ===

  const handleDeleteRubric = async (id, name) => {
    if (!window.confirm(`'${name}' 루브릭을 삭제하시겠습니까?`)) return
    const { error: delError } = await deleteRubric(id)
    if (delError) setError('삭제에 실패했습니다.')
  }

  // === 렌더링 ===

  const renderRubricCard = (rubric, isTemplate) => (
    <div key={rubric.id} className="rubric-card">
      <div className="rubric-card-header">
        <span className="rubric-icon">{rubric.icon}</span>
        <div className="rubric-card-info">
          <h3>{rubric.name}</h3>
          <p className="rubric-card-desc">{rubric.description}</p>
          <div className="rubric-card-meta">
            <span>평가 항목 {rubric.criteria.length}개</span>
            <span>가중치 합계 {getWeightSum(rubric.criteria)}%</span>
          </div>
        </div>
        <div className="rubric-card-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setExpandedRubricId(expandedRubricId === rubric.id ? null : rubric.id)}
          >
            {expandedRubricId === rubric.id ? '접기' : '자세히'}
          </button>
          {isTemplate && (
            <button className="btn btn-secondary btn-sm" onClick={() => handleCloneTemplate(rubric)}>
              복제
            </button>
          )}
          {!isTemplate && (
            <button
              className="rubric-delete-btn"
              onClick={() => handleDeleteRubric(rubric.id, rubric.name)}
              title="삭제"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {expandedRubricId === rubric.id && (
        <div className="rubric-card-detail">
          {rubric.criteria.map(c => (
            <div key={c.id} className="rubric-detail-criterion">
              <div className="rubric-detail-criterion-header">
                <strong>{c.name}</strong>
                <span className="rubric-weight-badge">{c.weight}%</span>
              </div>
              <p className="rubric-detail-criterion-desc">{c.description}</p>
              <table className="rubric-level-table">
                <thead>
                  <tr><th>점수</th><th>기준 설명</th></tr>
                </thead>
                <tbody>
                  {c.levels.map(l => (
                    <tr key={l.score}>
                      <td className="rubric-level-score">{l.score}</td>
                      <td>{l.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="rubric-management">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div>
          <h1>루브릭 관리</h1>
          <p>평가 루브릭을 만들고 관리합니다</p>
        </div>
        <button className="btn btn-primary" onClick={handleStartCreate}>
          + 새 루브릭 만들기
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* 생성 폼 */}
      {showCreateForm && (
        <div className="result-card rubric-form-card">
          <h3>새 루브릭 만들기</h3>

          {/* AI 코치 영역 */}
          <div className="ai-coach-section">
            <div className="ai-coach-header">
              <span className="ai-coach-icon">✨</span>
              <span>AI 코치</span>
            </div>
            <p className="ai-coach-desc">어떤 평가 루브릭을 만들고 싶은지 설명하면, AI가 초안을 생성해 드립니다.</p>
            <div className="ai-coach-input-row">
              <input
                type="text"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="예: 수학 문제풀이 AI 활용 평가, 영어 에세이 작성 평가"
                disabled={aiGenerating}
                onKeyDown={e => e.key === 'Enter' && !aiGenerating && handleAIGenerate()}
              />
              <button
                className="btn btn-primary"
                onClick={handleAIGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
              >
                {aiGenerating ? 'AI 생성 중...' : 'AI로 생성'}
              </button>
            </div>
            {aiGenerating && (
              <div className="ai-coach-loading">
                <div className="spinner-sm" />
                <span>AI가 루브릭을 생성하고 있습니다...</span>
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="rubric-form-basic">
            <div className="form-group">
              <label>아이콘</label>
              <div className="icon-picker">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-btn ${formData.icon === icon ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>루브릭 이름</label>
              <input
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="예: 수학 문제풀이 AI 활용 평가"
              />
            </div>
            <div className="form-group">
              <label>설명</label>
              <input
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="루브릭에 대한 간단한 설명"
              />
            </div>
          </div>

          {/* 평가 항목 */}
          <div className="rubric-form-criteria">
            <div className="criteria-form-header">
              <label>평가 항목</label>
              <span className={`weight-sum ${getWeightSum(formData.criteria) === 100 ? 'valid' : 'invalid'}`}>
                가중치 합계: {getWeightSum(formData.criteria)}%
                {getWeightSum(formData.criteria) === 100 ? ' ✓' : ' (100% 필요)'}
              </span>
            </div>

            {formData.criteria.map((criterion, cIdx) => (
              <div key={criterion.id} className="criterion-form-item">
                <div className="criterion-form-header">
                  <span className="criterion-form-number">항목 {cIdx + 1}</span>
                  {formData.criteria.length > 1 && (
                    <button
                      type="button"
                      className="rubric-delete-btn"
                      onClick={() => handleRemoveCriterion(cIdx)}
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="settings-grid">
                  <div className="form-group">
                    <label>항목명</label>
                    <input
                      value={criterion.name}
                      onChange={e => handleCriterionChange(cIdx, 'name', e.target.value)}
                      placeholder="예: 질문의 명확성"
                    />
                  </div>
                  <div className="form-group">
                    <label>가중치 (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={criterion.weight}
                      onChange={e => handleCriterionChange(cIdx, 'weight', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>설명</label>
                  <input
                    value={criterion.description}
                    onChange={e => handleCriterionChange(cIdx, 'description', e.target.value)}
                    placeholder="이 항목이 평가하는 내용"
                  />
                </div>

                {/* 5단계 수준 */}
                <div className="levels-form">
                  <label>수준별 기준 (5점~1점)</label>
                  {criterion.levels.map((level, lIdx) => (
                    <div key={level.score} className="level-form-row">
                      <span className="level-score">{level.score}점</span>
                      <input
                        value={level.description}
                        onChange={e => handleLevelChange(cIdx, lIdx, e.target.value)}
                        placeholder={`${level.score}점 기준 설명`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCriterion}>
              + 항목 추가
            </button>
          </div>

          {/* 폼 액션 */}
          <div className="rubric-form-actions">
            <button className="btn btn-primary" onClick={handleCreateRubric} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="btn btn-secondary" onClick={handleCancelCreate}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 시스템 템플릿 */}
      <section className="rubric-section">
        <h2>시스템 템플릿</h2>
        <div className="rubric-grid">
          {templateRubrics.map(r => renderRubricCard(r, true))}
        </div>
      </section>

      {/* 내 루브릭 */}
      <section className="rubric-section">
        <h2>내 루브릭</h2>
        {customRubrics.length === 0 ? (
          <p className="empty-state">
            직접 만든 루브릭이 없습니다. 새 루브릭을 만들거나 템플릿을 복제해보세요.
          </p>
        ) : (
          <div className="rubric-grid">
            {customRubrics.map(r => renderRubricCard(r, false))}
          </div>
        )}
      </section>
    </div>
  )
}
