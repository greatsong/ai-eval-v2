// /api/evaluate 보호. 로그인 없이 쓰는 학생 화면도 호출하므로 인증 대신 같은 출처·횟수·크기를 제한한다.
// 같은 출처 검사는 다른 사이트의 브라우저 호출만 막는다. curl 처럼 Origin 을 위조하는 호출은 횟수 제한으로 줄인다.
// 횟수 제한은 함수 인스턴스별 메모리 기준이라 서비스 전체의 상한이 아니다.
// 학교 NAT 뒤 학급 전체가 한 IP 를 쓰므로 한도를 넉넉히 둔다.

const WINDOW_MS = 60_000
const MAX_KEYS = 5000
const counters = new Map(); // ip → { count, resetAt }

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return fwd || req.socket?.remoteAddress || 'unknown'
}

export function isSameOrigin(req) {
  const origin = req.headers.origin
  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (!origin || !host) return false
  try {
    return new URL(origin).host === String(host).split(',')[0].trim()
  } catch {
    return false
  }
}

function dropExpired(now) {
  for (const [ip, c] of counters) {
    if (c.resetAt <= now) counters.delete(ip)
  }
}

export function overLimit(ip, limit, now = Date.now()) {
  let c = counters.get(ip)
  if (!c || c.resetAt <= now) {
    if (counters.size >= MAX_KEYS) dropExpired(now)
    c = { count: 0, resetAt: now + WINDOW_MS }
    counters.set(ip, c)
  }
  c.count += 1
  return c.count > limit
}

/** 통과하면 true. 막으면 응답을 보내고 false 를 돌려준다. */
export function guardRequest(req, res, { limit = 300, maxBytes = 4_000_000 } = {}) {
  if (!isSameOrigin(req)) {
    res.status(403).json({ error: '허용되지 않은 요청입니다.' })
    return false
  }
  if (overLimit(clientIp(req), limit)) {
    res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' })
    return false
  }
  if (Buffer.byteLength(JSON.stringify(req.body ?? ''), 'utf8') > maxBytes) {
    res.status(413).json({ error: '요청이 너무 큽니다.' })
    return false
  }
  return true
}
