import html2pdf from 'html2pdf.js'

/**
 * PDF 보고서 생성 및 다운로드
 * @param {HTMLElement} element - 캡처할 DOM 요소
 * @param {string} filename - 파일명 (.pdf 제외)
 */
export async function generatePdfReport(element, filename) {
  const opt = {
    margin:       [0, 0, 0, 0],
    filename:     `${filename}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      windowWidth: 794,
    },
    jsPDF:        {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak:    {
      mode: ['css', 'legacy'],
      avoid: ['.pdf-criterion', '.pdf-suggestion-card', '.pdf-record-box', '.pdf-info-card']
    }
  }

  await html2pdf().set(opt).from(element).save()
}
