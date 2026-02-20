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
            if (cs.details) criteriaScoresMap[cs.name].allDetails.push(cs.details)
        })
    })

    const criteriaScores = Object.values(criteriaScoresMap).map(cs => {
        const allEvidence = cs.allDetails.map(d => d.evidence || d?.details?.evidence).filter(Boolean)
        const evidence = allEvidence.sort((a, b) => b.length - a.length)[0] || ''
        return {
            name: cs.name,
            score: Math.round(cs.scoreSum / cs.count),
            maxScore: cs.maxScore,
            evidence,
            details: cs.allDetails[0]
        }
    })

    const allCharacteristics = results.flatMap(r => r.characteristics || [])
    const characteristics = [...new Set(allCharacteristics)].slice(0, 5)
    const allSuggestions = results.flatMap(r => r.suggestions || [])
    const suggestions = [...new Set(allSuggestions)].slice(0, 4)
    const studentRecordDraft = results.map(r => r.studentRecordDraft || '').sort((a, b) => b.length - a.length)[0] || ''

    return {
        totalScore: avgScore,
        grade,
        criteriaScores,
        characteristics,
        suggestions,
        studentRecordDraft,
        evaluationMeta: { runs: n, scoreRange: { min: minScore, max: maxScore }, variance: maxScore - minScore }
    }
}
