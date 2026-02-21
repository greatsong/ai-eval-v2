import { fetchWithTimeout } from '../utils'

export async function callClaudeAPI(prompt, apiKey, model = 'claude-3-5-sonnet-20241022') {
    // Anthropic API는 브라우저에서 직접 호출 시 CORS 제한이 있음
    // CORS 프록시를 통해 호출 시도
    try {
        const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2024-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({ model, max_tokens: 8192, messages: [{ role: 'user', content: prompt }] })
        }, 60000)

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.error?.message || `Claude API 오류: ${response.status}`)
        }
        const data = await response.json()
        return data.content?.[0]?.text || ''
    } catch (error) {
        if (error.message?.includes('Failed to fetch') || error.message?.includes('CORS') || error.message?.includes('NetworkError')) {
            throw new Error(
                'Claude API는 브라우저에서 직접 호출이 제한됩니다. ' +
                'Gemini 또는 OpenAI를 사용하시거나, 서버 프록시 설정이 필요합니다.'
            )
        }
        throw error
    }
}
