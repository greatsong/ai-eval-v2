import { fetchWithTimeout } from '../utils'

export async function callClaudeAPI(prompt, apiKey, model = 'claude-haiku-4-5-20251001') {
    // Claude API는 CORS 제한으로 브라우저 직접 호출 불가 → 항상 서버 프록시 경유
    const response = await fetchWithTimeout('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider: 'claude', model })
    }, 60000)

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Claude API 오류: ${response.status}`)
    }
    const data = await response.json()
    return data.text || ''
}
