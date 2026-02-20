import { useCallback } from 'react'

export default function ChatInput({ value, onChange }) {
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange(ev.target.result)
    }
    reader.readAsText(file)
  }, [onChange])

  return (
    <div className="form-group">
      <label htmlFor="chatContent">
        채팅 내용
        <span className="label-hint"> (복사 붙여넣기 또는 파일 업로드)</span>
      </label>
      <textarea
        id="chatContent"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="학생의 AI 채팅 내용을 붙여넣으세요..."
        rows={10}
        style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
      />
      <div className="file-upload">
        <label className="btn btn-secondary btn-sm" htmlFor="fileInput">
          파일 업로드 (.txt, .md, .json)
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".txt,.md,.json,.html,.csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        {value && <span className="char-count">{value.length.toLocaleString()}자</span>}
      </div>
    </div>
  )
}
