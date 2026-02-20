export default function PdfRadarChart({ criteriaScores }) {
  const cx = 150, cy = 140, r = 80
  const N = criteriaScores.length
  const levels = [20, 40, 60, 80, 100]

  // 각도 계산 (12시 방향부터 시계 방향)
  const getAngle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2
  const getPoint = (i, pct) => ({
    x: cx + r * (pct / 100) * Math.cos(getAngle(i)),
    y: cy + r * (pct / 100) * Math.sin(getAngle(i)),
  })

  // 데이터 포인트
  const values = criteriaScores.map(cs => cs.percentage ?? Math.round((cs.score / cs.maxScore) * 100))
  const dataPoints = values.map((v, i) => getPoint(i, v))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  // 라벨 위치 (차트 바깥)
  const labelOffset = 22
  const getLabelPos = (i) => {
    const angle = getAngle(i)
    return {
      x: cx + (r + labelOffset) * Math.cos(angle),
      y: cy + (r + labelOffset) * Math.sin(angle),
    }
  }

  // 텍스트 앵커 결정
  const getAnchor = (i) => {
    const angle = getAngle(i)
    const deg = (angle * 180) / Math.PI
    if (deg > -100 && deg < -80) return 'middle'   // 상단
    if (deg > 80 && deg < 100) return 'middle'      // 하단
    if (Math.cos(angle) > 0.1) return 'start'       // 우측
    if (Math.cos(angle) < -0.1) return 'end'        // 좌측
    return 'middle'
  }

  const getDy = (i) => {
    const angle = getAngle(i)
    const deg = (angle * 180) / Math.PI
    if (deg > -100 && deg < -80) return '-4'    // 상단: 위로
    if (deg > 80 && deg < 100) return '12'      // 하단: 아래로
    return '4'
  }

  return (
    <svg width="300" height="280" viewBox="0 0 300 280" style={{ display: 'block' }}>
      {/* 배경 격자 */}
      {levels.map((lv) => {
        const points = Array.from({ length: N }, (_, i) => {
          const p = getPoint(i, lv)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <polygon
            key={lv}
            points={points}
            fill={lv === 100 ? 'none' : 'rgba(99,102,241,0.03)'}
            stroke="#e5e7eb"
            strokeWidth="0.8"
          />
        )
      })}

      {/* 축선 */}
      {Array.from({ length: N }, (_, i) => {
        const p = getPoint(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.8" />
      })}

      {/* 데이터 영역 */}
      <polygon
        points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(99,102,241,0.12)"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 데이터 포인트 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
      ))}

      {/* 퍼센트 레이블 */}
      {dataPoints.map((p, i) => {
        const angle = getAngle(i)
        const offsetX = 14 * Math.cos(angle)
        const offsetY = 14 * Math.sin(angle)
        return (
          <text
            key={`pct-${i}`}
            x={p.x + offsetX}
            y={p.y + offsetY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#4f46e5"
            fontSize="10"
            fontWeight="700"
            fontFamily="'Apple SD Gothic Neo', sans-serif"
          >
            {values[i]}%
          </text>
        )
      })}

      {/* 항목명 라벨 */}
      {criteriaScores.map((cs, i) => {
        const pos = getLabelPos(i)
        return (
          <text
            key={`label-${i}`}
            x={pos.x}
            y={pos.y}
            textAnchor={getAnchor(i)}
            dy={getDy(i)}
            fill="#374151"
            fontSize="11"
            fontWeight="700"
            fontFamily="'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
          >
            {cs.name}
          </text>
        )
      })}
    </svg>
  )
}
