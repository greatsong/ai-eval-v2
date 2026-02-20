import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEvaluations(userId, filters = {}) {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEvaluations = useCallback(async (overrideFilters) => {
    if (!userId) return
    setLoading(true)
    const f = overrideFilters || filters

    let query = supabase
      .from('evaluations')
      .select('*, students(name, student_number)')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false })

    if (f.classId) query = query.eq('class_id', f.classId)
    if (f.studentId) query = query.eq('student_id', f.studentId)
    if (f.rubricId) query = query.eq('rubric_id', f.rubricId)
    if (f.limit) query = query.limit(f.limit)

    const { data, error } = await query
    if (!error) setEvaluations(data || [])
    setLoading(false)
    return { data, error }
  }, [userId, filters])

  const saveEvaluation = useCallback(async (result, metadata) => {
    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        teacher_id: userId,
        student_id: metadata.studentId || null,
        class_id: metadata.classId || null,
        rubric_id: metadata.rubricId || null,
        total_score: result.totalScore,
        grade: result.grade,
        rubric_name: metadata.rubricName,
        criteria_scores: result.criteriaScores,
        characteristics: result.characteristics || [],
        qualitative_evaluation: result.qualitativeEvaluation || '',
        suggestions: result.suggestions || [],
        student_record_draft: result.studentRecordDraft || '',
        interaction_mode: result.interactionMode || null,
        self_eval_scores: metadata.selfEvalScores || null,
        ai_provider: metadata.provider,
        ai_model: metadata.model,
        evaluation_runs: metadata.evaluationRuns || 1,
        evaluation_meta: result.evaluationMeta || null
      })
      .select('*, students(name, student_number)')
      .single()

    if (!error) setEvaluations(prev => [data, ...prev])
    return { data, error }
  }, [userId])

  const deleteEvaluation = useCallback(async (id) => {
    const { error } = await supabase.from('evaluations').delete().eq('id', id)
    if (!error) setEvaluations(prev => prev.filter(e => e.id !== id))
    return { error }
  }, [])

  return { evaluations, loading, fetchEvaluations, saveEvaluation, deleteEvaluation }
}
