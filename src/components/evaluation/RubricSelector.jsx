import { useEvaluation } from '../../context/EvaluationContext'

export default function RubricSelector() {
  const { rubrics, currentRubric, setCurrentRubric } = useEvaluation()

  return (
    <div className="form-group">
      <label htmlFor="rubric">평가 루브릭</label>
      <select
        id="rubric"
        value={currentRubric?.id || ''}
        onChange={e => {
          const selected = rubrics.find(r => r.id === e.target.value)
          setCurrentRubric(selected || null)
        }}
      >
        <option value="">루브릭을 선택하세요</option>
        {rubrics.filter(r => r.isTemplate).length > 0 && (
          <optgroup label="시스템 템플릿">
            {rubrics.filter(r => r.isTemplate).map(r => (
              <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
            ))}
          </optgroup>
        )}
        {rubrics.filter(r => !r.isTemplate).length > 0 && (
          <optgroup label="내 루브릭">
            {rubrics.filter(r => !r.isTemplate).map(r => (
              <option key={r.id} value={r.id}>{r.icon || '📋'} {r.name}</option>
            ))}
          </optgroup>
        )}
      </select>
      {currentRubric && (
        <p className="rubric-desc">{currentRubric.description}</p>
      )}
    </div>
  )
}
