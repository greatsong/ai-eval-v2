import { getProvider } from './providers'

const RUBRIC_GENERATION_PROMPT = (topic) => `당신은 교육 평가 전문가입니다. 다음 주제에 맞는 AI 활용 평가 루브릭을 만들어주세요.

주제: ${topic}

다음 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:

{
  "name": "루브릭 이름",
  "description": "루브릭에 대한 간단한 설명 (1~2문장)",
  "icon": "적절한 이모지 1개",
  "criteria": [
    {
      "name": "평가 항목 이름",
      "description": "이 항목이 평가하는 내용 (1문장)",
      "weight": 25,
      "levels": [
        { "score": 5, "description": "5점 기준 설명 (최우수)" },
        { "score": 4, "description": "4점 기준 설명 (우수)" },
        { "score": 3, "description": "3점 기준 설명 (보통)" },
        { "score": 2, "description": "2점 기준 설명 (미흡)" },
        { "score": 1, "description": "1점 기준 설명 (매우 미흡)" }
      ]
    }
  ]
}

규칙:
- 평가 항목은 정확히 4개
- 각 항목의 가중치(weight) 합계는 반드시 100
- 각 항목에 5단계 수준 설명 포함 (5점~1점)
- AI를 활용한 학습 과정 평가에 초점
- 수준 설명은 구체적이고 관찰 가능한 행동으로 작성
- 모든 텍스트는 한국어
- JSON만 출력 (마크다운 코드블록 없이)`

export async function generateRubricWithAI(topic, apiSettings) {
  const { provider, apiKeys, models } = apiSettings
  const apiKey = apiKeys?.[provider] || ''
  const model = models?.[provider] || ''

  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 평가 페이지의 API 설정에서 키를 입력해주세요.')
  }

  const prompt = RUBRIC_GENERATION_PROMPT(topic)
  const callAPI = getProvider(provider)
  const response = await callAPI(prompt, apiKey, model)

  if (!response || response.trim() === '') {
    throw new Error('AI로부터 빈 응답을 받았습니다.')
  }

  // JSON 파싱 (코드블록 제거 포함)
  let jsonStr = response.trim()
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  let rubricData
  try {
    rubricData = JSON.parse(jsonStr)
  } catch {
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.')
  }

  // 유효성 검증
  if (!rubricData.name || !rubricData.criteria || rubricData.criteria.length === 0) {
    throw new Error('AI가 올바른 형식의 루브릭을 생성하지 못했습니다. 다시 시도해주세요.')
  }

  // formData 형태로 변환
  return {
    name: rubricData.name,
    description: rubricData.description || '',
    icon: rubricData.icon || '📋',
    criteria: rubricData.criteria.map((c, i) => ({
      id: `criterion_${Date.now()}_${i}`,
      name: c.name || `항목 ${i + 1}`,
      description: c.description || '',
      weight: Number(c.weight) || 25,
      levels: (c.levels || []).map(l => ({
        score: Number(l.score),
        description: l.description || ''
      }))
    }))
  }
}
