/**
 * 평가 응답 파싱 모듈
 */
import { calculateGrade } from '../data/constants'

export function parseEvaluationResponse(response, rubric) {
    let jsonStr = response
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
        jsonStr = jsonMatch[1]
    }
    jsonStr = jsonStr.trim()

    try {
        if (!jsonStr) throw new Error('Empty JSON string')
        const result = JSON.parse(jsonStr)

        const criteriaScores = (result.criteriaScores || []).map((cs) => {
            const safeScore = cs.score || 0
            const safeMax = cs.maxScore || 5
            const calculatedPercentage = Math.round((safeScore / safeMax) * 100)
            return {
                criterionId: cs.criterionId || '',
                name: cs.name || '',
                score: safeScore,
                maxScore: safeMax,
                percentage: cs.percentage !== undefined ? cs.percentage : calculatedPercentage,
                weight: cs.weight || 0,
                evidence: (cs.evidence && cs.evidence.trim()) || (cs.feedback && cs.feedback.trim()) || '근거가 제공되지 않았습니다.',
                strengths: (cs.strengths && cs.strengths.trim()) || '강점 정보가 없습니다.',
                weaknesses: (cs.weaknesses && cs.weaknesses.trim()) || '개선점 정보가 없습니다.',
                improvement: (cs.improvement && cs.improvement.trim()) || '추가적인 개선 제안이 없습니다.',
                nextSteps: cs.nextSteps || '',
                feedback: cs.feedback || ''
            }
        })

        // 가중치 기반 totalScore 검증 및 재계산
        let totalScore = result.totalScore || 0
        const hasWeights = rubric.criteria.some(c => c.weight > 0)
        if (hasWeights && criteriaScores.length === rubric.criteria.length) {
            const calculatedTotal = Math.round(
                criteriaScores.reduce((sum, cs, i) => {
                    const weight = rubric.criteria[i]?.weight || cs.weight || 0
                    return sum + (cs.score / cs.maxScore) * weight
                }, 0)
            )
            // AI가 계산한 점수와 실제 계산 점수가 5점 이상 차이나면 재계산 값 사용
            if (Math.abs(totalScore - calculatedTotal) > 5) {
                console.warn(`totalScore 재계산: AI=${totalScore}, 실제=${calculatedTotal}`)
                totalScore = calculatedTotal
            }
        }

        const grade = calculateGrade(totalScore)

        return {
            totalScore,
            grade,
            criteriaScores,
            characteristics: result.characteristics || [],
            qualitativeEvaluation: result.qualitativeEvaluation || '',
            suggestions: result.suggestions || [],
            studentRecordDraft: result.studentRecordDraft || ''
        }
    } catch (error) {
        console.error('JSON 파싱 오류:', error)
        return {
            totalScore: 0,
            grade: 'N/A',
            criteriaScores: rubric.criteria.map(c => ({
                criterionId: c.id,
                name: c.name,
                score: 0,
                maxScore: 5,
                percentage: 0,
                feedback: '평가 결과를 파싱할 수 없습니다.'
            })),
            characteristics: ['평가 결과 파싱 오류'],
            qualitativeEvaluation: `AI 응답을 파싱하는 중 오류가 발생했습니다.\n\n원본 응답:\n${response.substring(0, 500)}...`,
            suggestions: ['다시 평가를 시도해 주세요.'],
            studentRecordDraft: ''
        }
    }
}
