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
        labels: { 'gemini-2.5-flash': 'Gemini 2.5 Flash (추천)', 'gemini-2.5-pro': 'Gemini 2.5 Pro', 'gemini-2.0-flash': 'Gemini 2.0 Flash' },
        emoji: '🟦', label: 'Google Gemini', placeholder: 'AIza...', helpUrl: 'https://aistudio.google.com/apikey'
    },
    openai: {
        defaults: ['gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o-mini'],
        labels: { 'gpt-4.1-mini': 'GPT-4.1 Mini (추천)', 'gpt-4.1-nano': 'GPT-4.1 Nano (저렴)', 'gpt-4o-mini': 'GPT-4o Mini' },
        emoji: '🟩', label: 'OpenAI GPT', placeholder: 'sk-proj-...', helpUrl: 'https://platform.openai.com/api-keys'
    },
    claude: {
        defaults: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6-20250514', 'claude-3-5-sonnet-20241022'],
        labels: { 'claude-haiku-4-5-20251001': 'Claude Haiku 4.5 (추천)', 'claude-sonnet-4-6-20250514': 'Claude Sonnet 4.6', 'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet' },
        emoji: '🟧', label: 'Anthropic Claude', placeholder: 'sk-ant-...', helpUrl: 'https://console.anthropic.com/'
    }
}

export const EVALUATION_RUNS_OPTIONS = [
    { value: 1, label: '1회 (기본)' },
    { value: 2, label: '2회 (평균)' },
    { value: 3, label: '3회 (권장)' },
    { value: 5, label: '5회 (고신뢰도)' }
]

// PDF 보고서 디자인 토큰
export const PDF_COLORS = {
    primary:       '#6366f1',
    primaryLight:  '#eef2ff',
    primaryDark:   '#4f46e5',
    accent:        '#f0abfc',
    accentLight:   '#fdf4ff',
    textDark:      '#1f2937',
    textMedium:    '#4b5563',
    textLight:     '#9ca3af',
    bgSection:     '#f9fafb',
    bgCard:        '#f3f4f6',
    strengthBg:    '#ecfdf5',
    strengthBorder:'#a7f3d0',
    weaknessBg:    '#fef3c7',
    weaknessBorder:'#fcd34d',
    improvementBg: '#eef2ff',
    improvementBorder: '#c7d2fe',
    nextStepsBg:   '#fdf4ff',
    nextStepsBorder: '#f0abfc',
}
