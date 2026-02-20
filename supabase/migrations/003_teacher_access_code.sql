-- ============================================
-- 교사 접근코드 인증 시스템
-- ============================================

-- 1. global_config에 초기 접근코드 저장
INSERT INTO global_config (key, value) VALUES (
  'teacher_access_code',
  '{"codes": ["TEACH2024"], "updated_at": "2026-02-20"}'
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- 2. 접근코드 검증 RPC 함수 (인증 없이 호출 가능 — 가입 전이므로)
CREATE OR REPLACE FUNCTION verify_teacher_access_code(code TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM global_config
    WHERE key = 'teacher_access_code'
    AND value->'codes' ? code
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. 비인증 사용자도 RPC 호출 가능하도록 권한 부여
GRANT EXECUTE ON FUNCTION verify_teacher_access_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_teacher_access_code(TEXT) TO authenticated;
