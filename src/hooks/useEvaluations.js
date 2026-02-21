import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEvaluations(userId) {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEvaluations = useCallback(async (filters = {}) => {
    if (!userId) return
    setLoading(true)

    let query = supabase
      .from('evaluations')
      .select('*, students(name, student_number)')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false })

    if (filters.classId) query = query.eq('class_id', filters.classId)
    if (filters.studentId) query = query.eq('student_id', filters.studentId)
    if (filters.rubricId) query = query.eq('rubric_id', filters.rubricId)
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (!error) setEvaluations(data || [])
    setLoading(false)
    return { data, error }
  }, [userId])

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
