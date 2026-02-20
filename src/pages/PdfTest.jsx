import { useRef, useState } from 'react'
import { getGradeColor } from '../data/constants'
import { generatePdfReport } from '../services/pdfGenerator'
import PdfReportLayout from '../components/pdf/PdfReportLayout'

// test_pdf_gen.py의 샘플 데이터 그대로 사용
const SAMPLE_RESULT = {
  totalScore: 82,
  grade: 'B',
  evaluationMeta: { runs: 3, scoreRange: { min: 78, max: 86 } },
  criteriaScores: [
    {
      name: '질문의 명확성',
      weight: 20,
      score: 4, maxScore: 5, percentage: 80,
      evidence: '「조선시대 과거 시험의 종류와 각각의 특징을 알려줘」라고 구체적으로 질문하여, 주제와 요구사항을 명확히 구분함',
      strengths: '프롬프트에 주제(조선시대 과거 시험)와 요구 형식(종류 + 특징)을 함께 제시하여 AI가 정확한 답변을 생성할 수 있도록 함',
      weaknesses: '후속 질문에서 「더 알려줘」와 같이 맥락 연결 없이 포괄적으로 요청하는 경향이 있음',
      improvement: 'Before: 「더 알려줘」\nAfter: 「과거 시험 중 문과의 시험 과목과 출제 경향을 자세히 설명해줘」',
    },
    {
      name: '반복적 개선',
      weight: 25,
      score: 4, maxScore: 5, percentage: 80,
      evidence: '총 5턴의 대화에서 점진적으로 주제를 심화시키며 「그렇다면 현대 시험 제도와 비교하면 어떤 차이가 있어?」라고 연결 질문함',
      strengths: '대화의 흐름을 유지하며 이전 응답을 기반으로 새로운 관점을 탐색하는 전략이 우수함',
      weaknesses: '중간에 주제가 약간 분산되는 구간이 있어, 탐구의 일관성이 다소 흐려짐',
      improvement: 'Before: 갑자기 다른 주제로 전환\nAfter: 「앞서 말한 과거 시험의 특징을 바탕으로, 현대 수능과 비교해보자」와 같이 연결어 활용',
    },
    {
      name: '비판적 사고',
      weight: 25,
      score: 3, maxScore: 5, percentage: 60,
      evidence: 'AI 응답을 그대로 수용하며 「고마워, 잘 알겠어」라고 반응함',
      strengths: 'AI 답변을 정리하여 자신의 언어로 재구성하려는 시도가 일부 관찰됨',
      weaknesses: 'AI 응답의 정확성을 검증하거나 추가 근거를 요청하지 않아, 정보의 신뢰성을 판단하는 과정이 부족함',
      improvement: 'Before: 「고마워」\nAfter: 「이 정보가 정확한지 확인하고 싶어. 과거 시험에서 장원급제한 유명 인물과 그 시대적 배경도 알려줘」',
      nextSteps: 'AI 응답을 받은 후, 반드시 하나 이상의 \'왜?\' 또는 \'정말?\' 질문을 해보세요',
    },
    {
      name: '실제 적용',
      weight: 30,
      score: 4, maxScore: 5, percentage: 80,
      evidence: 'AI 응답을 바탕으로 「이 내용을 표로 정리해줘」라고 요청하여 학습 자료로 변환함',
      strengths: 'AI의 응답을 단순히 읽는 것에 그치지 않고, 표 정리를 요청하여 실제 학습에 활용 가능한 형태로 가공함',
      weaknesses: '정리된 내용에 자신의 의견이나 추가 분석을 더하지 않아, 능동적 지식 구성이 부족함',
      improvement: 'Before: 표 정리만 요청\nAfter: 표 정리 후 「이 중에서 가장 공정했던 시험 방식은 무엇이라고 생각해? 나는 ~라고 생각하는데」와 같이 자기 의견 추가',
    },
  ],
  characteristics: [
    '주제에 대한 호기심이 높고, 단계적으로 탐구하며 학습을 심화하는 스타일',
    'AI를 정보 수집 도구로 적절히 활용하지만, 비판적 검증 습관은 아직 성장 중',
    '대화를 구조화하고 정보를 정리하는 능력이 또래 대비 우수함',
  ],
  qualitativeEvaluation:
    '김민수 학생은 AI 채팅을 통해 역사 주제를 체계적으로 탐구하는 모습을 보였습니다. 특히 질문을 점진적으로 심화시키고, AI 응답을 표로 정리하여 학습에 활용하는 전략이 돋보입니다. 다만 AI 응답을 비판적으로 검증하는 습관을 기르면 더욱 깊이 있는 학습이 가능할 것입니다.\n\n전반적으로 AI를 학습 도구로 활용하는 기본 역량이 잘 갖추어져 있으며, 앞으로 비판적 사고력을 더 발전시킨다면 매우 우수한 AI 리터러시 역량을 갖추게 될 것으로 기대됩니다.',
  suggestions: [
    'AI 응답을 받은 후 \'이 정보가 정확한지 다른 출처에서도 확인해볼까?\'라고 물어보는 습관을 들이세요',
    'AI와 대화할 때 자신의 의견이나 가설을 먼저 제시한 후, AI의 피드백을 요청해보세요',
    '학습한 내용을 친구에게 설명하듯 AI에게 다시 정리해 말하고, AI가 빠진 부분을 보완해달라고 요청해보세요',
  ],
  studentRecordDraft:
    'AI 채팅을 활용하여 역사 주제를 단계적으로 탐구하며, 명확한 질문 구성과 정보 정리 능력이 우수함. 대화 전략을 통해 주제를 심화·확장하는 학습 역량을 보였으며, 향후 비판적 사고력 강화를 통해 더욱 깊이 있는 AI 활용 학습이 기대됨.',
}

export default function PdfTest() {
  const pdfRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const gradeColor = getGradeColor(SAMPLE_RESULT.grade)

  const handleDownload = async () => {
    if (!pdfRef.current) return
    setGenerating(true)
    try {
      await new Promise(r => setTimeout(r, 500))
      await generatePdfReport(pdfRef.current, 'AI역량진단_김민수_6학년2반_테스트')
    } catch (err) {
      console.error(err)
      alert('PDF 생성 오류: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>PDF 보고서 테스트</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        test_pdf_gen.py 샘플 데이터로 PDF를 생성합니다.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={handleDownload}
          disabled={generating}
          style={{
            padding: '0.75rem 1.5rem',
            background: generating ? '#a5b4fc' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: generating ? 'wait' : 'pointer',
          }}
        >
          {generating ? 'PDF 생성 중...' : 'PDF 다운로드'}
        </button>

        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showPreview ? '미리보기 숨기기' : '레이아웃 미리보기'}
        </button>
      </div>

      {/* 미리보기 (visible) */}
      {showPreview && (
        <div style={{ border: '2px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: '2rem' }}>
          <PdfReportLayout
            result={SAMPLE_RESULT}
            studentName="김민수"
            className="6학년 2반"
            rubricName="일반 AI 활용 역량 평가"
            evaluationDate="2026. 2. 20."
            gradeColor={gradeColor}
            containerRef={null}
          />
        </div>
      )}

      {/* PDF 캡처용 hidden */}
      <div className="pdf-hidden-container">
        <PdfReportLayout
          result={SAMPLE_RESULT}
          studentName="김민수"
          className="6학년 2반"
          rubricName="일반 AI 활용 역량 평가"
          evaluationDate="2026. 2. 20."
          gradeColor={gradeColor}
          containerRef={pdfRef}
        />
      </div>
    </div>
  )
}
