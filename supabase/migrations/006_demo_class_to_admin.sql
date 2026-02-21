-- ============================================
-- 데모 학급을 관리자(greatsong21@gmail.com)에게 이전
-- 관리자 로그인 시 학급 관리에서 데모 학급이 보임
-- ============================================

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- 관리자 auth 유저 찾기
  SELECT id INTO admin_id FROM auth.users WHERE email = 'greatsong21@gmail.com';

  IF admin_id IS NOT NULL THEN
    -- 프로필이 없으면 생성, 있으면 admin으로 업데이트
    INSERT INTO profiles (id, email, display_name, role)
    VALUES (admin_id, 'greatsong21@gmail.com', '관리자', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';

    -- 데모 학급 소유자를 관리자로 변경
    UPDATE classes
    SET teacher_id = admin_id
    WHERE id = 'dddddddd-0000-0000-0000-000000000001';

    RAISE NOTICE 'Demo class transferred to admin: %', admin_id;
  ELSE
    RAISE NOTICE 'Admin user not found. Demo class stays with demo teacher.';
  END IF;
END $$;

-- 관리자가 나중에 가입하는 경우를 대비한 함수
-- 가입 후 /admin에서 "데모 학급 가져오기" 가능
CREATE OR REPLACE FUNCTION claim_demo_class()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
  result JSONB;
BEGIN
  -- 관리자만 호출 가능
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', '관리자만 사용할 수 있습니다.');
  END IF;

  -- 데모 학급을 현재 사용자에게 이전
  UPDATE classes
  SET teacher_id = auth.uid()
  WHERE id = 'dddddddd-0000-0000-0000-000000000001';

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', '데모 학급이 내 학급 목록에 추가되었습니다.');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', '데모 학급을 찾을 수 없습니다.');
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION claim_demo_class() TO authenticated;
