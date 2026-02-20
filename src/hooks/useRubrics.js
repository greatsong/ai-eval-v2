import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function formatRubricFromDB(dbRubric) {
  return {
    id: dbRubric.id,
    name: dbRubric.name,
    description: dbRubric.description,
    icon: dbRubric.icon,
    isTemplate: dbRubric.is_template,
    isShared: dbRubric.is_shared,
    criteria: (dbRubric.rubric_criteria || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => ({
        id: c.criterion_key,
        name: c.name,
        description: c.description,
        weight: c.weight,
        levels: (c.criteria_levels || [])
          .sort((a, b) => b.score - a.score)
          .map(l => ({ score: l.score, description: l.description }))
      }))
  }
}

export function useRubrics(userId) {
  const [rubrics, setRubrics] = useState([])
  const [currentRubric, setCurrentRubric] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRubrics = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('rubrics')
      .select(`*, rubric_criteria(*, criteria_levels(*))`)
      .or(`teacher_id.eq.${userId},is_template.eq.true,is_shared.eq.true`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const formatted = data.map(formatRubricFromDB)
      setRubrics(formatted)
      if (!currentRubric && formatted.length > 0) {
        setCurrentRubric(formatted[0])
      }
    }
    setLoading(false)
  }, [userId, currentRubric])

  const createRubric = useCallback(async (rubricData) => {
    const { data: newRubric, error } = await supabase
      .from('rubrics')
      .insert({
        teacher_id: userId,
        name: rubricData.name,
        description: rubricData.description || '',
        icon: rubricData.icon || '📋'
      })
      .select()
      .single()

    if (error) return { error }

    for (let i = 0; i < rubricData.criteria.length; i++) {
      const c = rubricData.criteria[i]
      const { data: newCriterion, error: cError } = await supabase
        .from('rubric_criteria')
        .insert({
          rubric_id: newRubric.id,
          criterion_key: c.id || `criterion_${i}`,
          name: c.name,
          description: c.description,
          weight: c.weight,
          sort_order: i
        })
        .select()
        .single()

      if (cError) return { error: cError }

      if (c.levels?.length > 0) {
        const { error: lError } = await supabase
          .from('criteria_levels')
          .insert(c.levels.map(l => ({
            criterion_id: newCriterion.id,
            score: l.score,
            description: l.description
          })))
        if (lError) return { error: lError }
      }
    }

    await fetchRubrics()
    return { data: newRubric }
  }, [userId, fetchRubrics])

  const deleteRubric = useCallback(async (id) => {
    const { error } = await supabase.from('rubrics').delete().eq('id', id)
    if (!error) {
      setRubrics(prev => prev.filter(r => r.id !== id))
      if (currentRubric?.id === id) setCurrentRubric(null)
    }
    return { error }
  }, [currentRubric])

  return { rubrics, currentRubric, setCurrentRubric, loading, fetchRubrics, createRubric, deleteRubric }
}
