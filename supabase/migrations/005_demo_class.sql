-- ============================================
-- 데모/테스트 학급 데이터
-- 초대코드: COMEDU01
-- ============================================

-- 1. 데모 교사 auth 유저 생성 (고정 UUID)
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token
) VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'demo-teacher@proofai.app',
  '$2a$10$demopasswordhashnotforlogin000000000000000000000000000',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"김선생"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

-- 2. 데모 교사 프로필
INSERT INTO profiles (id, email, display_name, role) VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01', 'demo-teacher@proofai.app', '김선생', 'teacher')
ON CONFLICT (id) DO NOTHING;

-- 3. 기존 COMEDU01 학급이 있으면 삭제 (cascade로 학생도 삭제)
DELETE FROM classes WHERE invite_code = 'COMEDU01';

-- 4. 데모 학급 생성
INSERT INTO classes (
  id, teacher_id, name, description, school_year, semester, subject,
  invite_code, invite_code_active, default_rubric_id,
  student_api_provider, student_api_key, student_api_model
) VALUES (
  'dddddddd-0000-0000-0000-000000000001',
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01',
  '2026학년도 1학기 정보 3반',
  '데모/테스트용 학급입니다. 누구나 COMEDU01 코드로 체험할 수 있습니다.',
  2026, 1, '정보',
  'COMEDU01', true,
  '00000000-0000-0000-0000-000000000001',
  'gemini',
  'AIzaSyASNCxf5voz6Eq0Jj2lpydEv6nebc8GpPQ',
  'gemini-2.5-flash'
);

-- 5. 학생 25명 등록
INSERT INTO students (class_id, student_number, name) VALUES
  ('dddddddd-0000-0000-0000-000000000001', '1',  '강민준'),
  ('dddddddd-0000-0000-0000-000000000001', '2',  '김서윤'),
  ('dddddddd-0000-0000-0000-000000000001', '3',  '김예준'),
  ('dddddddd-0000-0000-0000-000000000001', '4',  '김지우'),
  ('dddddddd-0000-0000-0000-000000000001', '5',  '나하린'),
  ('dddddddd-0000-0000-0000-000000000001', '6',  '박도윤'),
  ('dddddddd-0000-0000-0000-000000000001', '7',  '박서연'),
  ('dddddddd-0000-0000-0000-000000000001', '8',  '박지호'),
  ('dddddddd-0000-0000-0000-000000000001', '9',  '서유진'),
  ('dddddddd-0000-0000-0000-000000000001', '10', '손하은'),
  ('dddddddd-0000-0000-0000-000000000001', '11', '신준서'),
  ('dddddddd-0000-0000-0000-000000000001', '12', '오시우'),
  ('dddddddd-0000-0000-0000-000000000001', '13', '윤지아'),
  ('dddddddd-0000-0000-0000-000000000001', '14', '이건우'),
  ('dddddddd-0000-0000-0000-000000000001', '15', '이다은'),
  ('dddddddd-0000-0000-0000-000000000001', '16', '이시현'),
  ('dddddddd-0000-0000-0000-000000000001', '17', '이하율'),
  ('dddddddd-0000-0000-0000-000000000001', '18', '장예은'),
  ('dddddddd-0000-0000-0000-000000000001', '19', '정수아'),
  ('dddddddd-0000-0000-0000-000000000001', '20', '정우진'),
  ('dddddddd-0000-0000-0000-000000000001', '21', '조은서'),
  ('dddddddd-0000-0000-0000-000000000001', '22', '최시윤'),
  ('dddddddd-0000-0000-0000-000000000001', '23', '한수빈'),
  ('dddddddd-0000-0000-0000-000000000001', '24', '홍채원'),
  ('dddddddd-0000-0000-0000-000000000001', '25', '황지민');
