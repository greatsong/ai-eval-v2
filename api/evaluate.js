export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, provider, model } = req.body

  if (!prompt || !provider || !model) {
    return res.status(400).json({ error: 'prompt, provider, model are required' })
  }

  const SERVER_KEYS = {
    gemini: process.env.GEMINI_API_KEY || '',
    claude: process.env.CLAUDE_API_KEY || '',
    openai: process.env.OPENAI_API_KEY || ''
  }

  const apiKey = SERVER_KEYS[provider]
  if (!apiKey) {
    return res.status(400).json({ error: `서버에 ${provider} API 키가 설정되지 않았습니다.` })
  }

  try {
    let text = ''

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Gemini API error: ${response.status}`)
      }
      const data = await response.json()
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `OpenAI API error: ${response.status}`)
      }
      const data = await response.json()
      text = data.choices?.[0]?.message?.content || ''

    } else if (provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Claude API error: ${response.status}`)
      }
      const data = await response.json()
      text = data.content?.[0]?.text || ''

    } else {
      return res.status(400).json({ error: `지원하지 않는 provider: ${provider}` })
    }

    return res.status(200).json({ text })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
