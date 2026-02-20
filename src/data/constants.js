export const API_TIMEOUT_MS = 30000
export const MAX_RETRIES = 2

export const GRADE_COLORS = {
    'A+': { color: '#10b981', bg: '#ecfdf5' },
    'A':  { color: '#10b981', bg: '#ecfdf5' },
    'B+': { color: '#6366f1', bg: '#eef2ff' },
    'B':  { color: '#6366f1', bg: '#eef2ff' },
    'C+': { color: '#f59e0b', bg: '#fffbeb' },
    'C':  { color: '#f59e0b', bg: '#fffbeb' },
    'D+': { color: '#ef4444', bg: '#fef2f2' },
    'D':  { color: '#ef4444', bg: '#fef2f2' },
    'F':  { color: '#ef4444', bg: '#fef2f2' },
}

export function getGradeColor(grade) {
    return GRADE_COLORS[grade] || { color: '#6b7280', bg: '#f9fafb' }
}

export const GRADE_THRESHOLDS = [
    { min: 95, grade: 'A+' },
    { min: 90, grade: 'A' },
    { min: 85, grade: 'B+' },
    { min: 80, grade: 'B' },
    { min: 75, grade: 'C+' },
    { min: 70, grade: 'C' },
    { min: 65, grade: 'D+' },
    { min: 60, grade: 'D' },
    { min: 0, grade: 'F' }
]

export function calculateGrade(score) {
    const entry = GRADE_THRESHOLDS.find(t => score >= t.min)
    return entry ? entry.grade : 'F'
}

export const PROVIDER_MODELS = {
    gemini: {
        defaults: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
        labels: { 'gemini-2.5-flash': 'Gemini 2.5 Flash', 'gemini-2.5-pro': 'Gemini 2.5 Pro', 'gemini-2.0-flash': 'Gemini 2.0 Flash' },
        emoji: '🟦', label: 'Google Gemini', placeholder: 'AIza...', helpUrl: 'https://aistudio.google.com/apikey'
    },
    openai: {
        defaults: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
        labels: { 'gpt-4o': 'GPT-4o', 'gpt-4o-mini': 'GPT-4o Mini', 'o3-mini': 'o3-mini' },
        emoji: '🟩', label: 'OpenAI GPT', placeholder: 'sk-proj-...', helpUrl: 'https://platform.openai.com/api-keys'
    },
    claude: {
        defaults: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
        labels: { 'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet', 'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku', 'claude-3-opus-20240229': 'Claude 3 Opus' },
        emoji: '🟧', label: 'Anthropic Claude', placeholder: 'sk-ant-...', helpUrl: 'https://console.anthropic.com/'
    }
}

export const EVALUATION_RUNS_OPTIONS = [
    { value: 1, label: '1회 (기본)' },
    { value: 2, label: '2회 (평균)' },
    { value: 3, label: '3회 (권장)' },
    { value: 5, label: '5회 (고신뢰도)' }
]
