/**
 * 평가 결과 종합 모듈
 * K-run 및 앙상블 결과 합성
 */
import { calculateGrade } from '../data/constants'

export function synthesizeKRunResults(results) {
    const n = results.length
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / n)
    const scores = results.map(r => r.totalScore)
    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)
    const grade = calculateGrade(avgScore)

    const criteriaScoresMap = {}
    results.forEach(result => {
        result.criteriaScores?.forEach(cs => {
            if (!criteriaScoresMap[cs.name]) {
                criteriaScoresMap[cs.name] = { ...cs, scoreSum: 0, count: 0, allDetails: [] }
            }
            criteriaScoresMap[cs.name].scoreSum += cs.score
            criteriaScoresMap[cs.name].count++
            // 각 run의 전체 데이터를 보존 (details가 아닌 cs 자체)
            criteriaScoresMap[cs.name].allDetails.push(cs)
        })
    })

    const criteriaScores = Object.values(criteriaScoresMap).map(cs => {
        const avgCriteriaScore = Math.round(cs.scoreSum / cs.count)
        const allEvidence = cs.allDetails.map(d => d.evidence).filter(Boolean)
        const allStrengths = cs.allDetails.map(d => d.strengths).filter(Boolean)
        const allWeaknesses = cs.allDetails.map(d => d.weaknesses).filter(Boolean)
        const allImprovement = cs.allDetails.map(d => d.improvement).filter(Boolean)

        return {
            criterionId: cs.criterionId,
            name: cs.name,
            score: avgCriteriaScore,
            maxScore: cs.maxScore,
            percentage: Math.round((avgCriteriaScore / cs.maxScore) * 100),
            weight: cs.weight || 0,
            evidence: allEvidence.sort((a, b) => b.length - a.length)[0] || '',
            strengths: [...new Set(allStrengths)].join(' '),
            weaknesses: [...new Set(allWeaknesses)].join(' '),
            improvement: allImprovement.sort((a, b) => b.length - a.length)[0] || '',
            nextSteps: cs.allDetails.map(d => d.nextSteps).filter(Boolean)[0] || '',
            feedback: cs.allDetails.map(d => d.feedback).filter(Boolean)[0] || ''
        }
    })

    const allCharacteristics = results.flatMap(r => r.characteristics || [])
    const characteristics = [...new Set(allCharacteristics)].slice(0, 5)
    const allSuggestions = results.flatMap(r => r.suggestions || [])
    const suggestions = [...new Set(allSuggestions)].slice(0, 4)

    const allDrafts = results.map(r => r.studentRecordDraft || '').filter(Boolean)
    const studentRecordDraft = allDrafts.sort((a, b) => b.length - a.length)[0] || ''

    const allQualitative = results.map(r => r.qualitativeEvaluation || '').filter(Boolean)
    const qualitativeEvaluation = allQualitative.sort((a, b) => b.length - a.length)[0] || ''

    return {
        totalScore: avgScore,
        grade,
        criteriaScores,
        characteristics,
        qualitativeEvaluation,
        suggestions,
        studentRecordDraft,
        evaluationMeta: { runs: n, scoreRange: { min: minScore, max: maxScore }, variance: maxScore - minScore }
    }
}
