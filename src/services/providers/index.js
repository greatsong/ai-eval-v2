import { callGeminiAPI } from './gemini'
import { callOpenAIAPI } from './openai'
import { callClaudeAPI } from './claude'

const providers = { gemini: callGeminiAPI, openai: callOpenAIAPI, claude: callClaudeAPI }

export function getProvider(name) {
    const provider = providers[name]
    if (!provider) throw new Error(`지원하지 않는 AI 제공업체입니다: ${name}`)
    return provider
}

export { callGeminiAPI, callOpenAIAPI, callClaudeAPI }
