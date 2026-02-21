-- ============================================
-- 평가 세션: 하나의 학급에서 여러 루브릭/초대코드 운영
-- 학급 = 학생 명단, 세션 = 루브릭 + 초대코드
-- ============================================

-- 1. eval_sessions 테이블
CREATE TABLE eval_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 예: "정보 AI 활용 평가", "국어 글쓰기 평가"
  invite_code TEXT UNIQUE,               -- 세션별 고유 초대코드
  invite_code_active BOOLEAN NOT NULL DEFAULT false,
  rubric_id UUID REFERENCES rubrics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eval_sessions_class ON eval_sessions(class_id);
CREATE INDEX idx_eval_sessions_code ON eval_sessions(invite_code) WHERE invite_code IS NOT NULL;

-- 2. 기존 함수 DROP 후 재생성 (반환 타입 변경)
DROP FUNCTION IF EXISTS get_class_for_student(TEXT);
CREATE FUNCTION get_class_for_student(p_invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_class RECORD;
  v_session RECORD;
  v_rubric_id UUID;
  v_rubric JSONB;
  v_students JSONB;
  v_session_name TEXT;
BEGIN
  -- 먼저 eval_sessions에서 찾기
  SELECT es.*, c.id AS c_id, c.name AS c_name, c.subject, c.is_active,
         c.student_api_provider, c.student_api_key, c.student_api_model,
         p.display_name AS teacher_name
  INTO v_session
  FROM eval_sessions es
  JOIN classes c ON c.id = es.class_id
  JOIN profiles p ON p.id = c.teacher_id
  WHERE es.invite_code = p_invite_code
    AND es.invite_code_active = true
    AND c.is_active = true;

  IF v_session IS NOT NULL THEN
    v_rubric_id := v_session.rubric_id;
    v_session_name := v_session.name;

    -- 학생 목록
    SELECT jsonb_agg(jsonb_build_object(
      'id', s.id, 'student_number', s.student_number, 'name', s.name
    ) ORDER BY s.student_number)
    INTO v_students
    FROM students s WHERE s.class_id = v_session.c_id;

    -- 루브릭
    IF v_rubric_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'id', r.id, 'name', r.name, 'description', r.description, 'icon', r.icon,
        'criteria', (
          SELECT jsonb_agg(jsonb_build_object(
            'id', rc.criterion_key, 'name', rc.name, 'description', rc.description,
            'weight', rc.weight, 'sort_order', rc.sort_order,
            'levels', (
              SELECT jsonb_agg(jsonb_build_object('score', cl.score, 'description', cl.description) ORDER BY cl.score DESC)
              FROM criteria_levels cl WHERE cl.criterion_id = rc.id
            )
          ) ORDER BY rc.sort_order)
          FROM rubric_criteria rc WHERE rc.rubric_id = r.id
        )
      ) INTO v_rubric FROM rubrics r WHERE r.id = v_rubric_id;
    END IF;

    RETURN jsonb_build_object(
      'class_id', v_session.c_id,
      'class_name', v_session.c_name,
      'session_name', v_session_name,
      'subject', v_session.subject,
      'teacher_name', v_session.teacher_name,
      'api_provider', v_session.student_api_provider,
      'api_key', v_session.student_api_key,
      'api_model', v_session.student_api_model,
      'rubric_id', v_rubric_id,
      'students', COALESCE(v_students, '[]'::jsonb),
      'rubric', v_rubric
    );
  END IF;

  -- 기존 classes.invite_code 폴백
  SELECT c.*, p.display_name AS teacher_name
  INTO v_class
  FROM classes c
  JOIN profiles p ON p.id = c.teacher_id
  WHERE c.invite_code = p_invite_code
    AND c.invite_code_active = true
    AND c.is_active = true;

  IF v_class IS NULL THEN RETURN NULL; END IF;

  v_rubric_id := v_class.default_rubric_id;

  SELECT jsonb_agg(jsonb_build_object(
    'id', s.id, 'student_number', s.student_number, 'name', s.name
  ) ORDER BY s.student_number)
  INTO v_students
  FROM students s WHERE s.class_id = v_class.id;

  IF v_rubric_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', r.id, 'name', r.name, 'description', r.description, 'icon', r.icon,
      'criteria', (
        SELECT jsonb_agg(jsonb_build_object(
          'id', rc.criterion_key, 'name', rc.name, 'description', rc.description,
          'weight', rc.weight, 'sort_order', rc.sort_order,
          'levels', (
            SELECT jsonb_agg(jsonb_build_object('score', cl.score, 'description', cl.description) ORDER BY cl.score DESC)
            FROM criteria_levels cl WHERE cl.criterion_id = rc.id
          )
        ) ORDER BY rc.sort_order)
        FROM rubric_criteria rc WHERE rc.rubric_id = r.id
      )
    ) INTO v_rubric FROM rubrics r WHERE r.id = v_rubric_id;
  END IF;

  RETURN jsonb_build_object(
    'class_id', v_class.id,
    'class_name', v_class.name,
    'session_name', NULL,
    'subject', v_class.subject,
    'teacher_name', v_class.teacher_name,
    'api_provider', v_class.student_api_provider,
    'api_key', v_class.student_api_key,
    'api_model', v_class.student_api_model,
    'rubric_id', v_rubric_id,
    'students', COALESCE(v_students, '[]'::jsonb),
    'rubric', v_rubric
  );
END $$;

GRANT EXECUTE ON FUNCTION get_class_for_student(TEXT) TO anon, authenticated;

-- 3. save_student_evaluation도 재생성
DROP FUNCTION IF EXISTS save_student_evaluation(TEXT, UUID, JSONB);
CREATE FUNCTION save_student_evaluation(p_invite_code TEXT, p_student_id UUID, p_evaluation JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_class_id UUID;
  v_teacher_id UUID;
  v_rubric_id UUID;
  v_rubric_name TEXT;
BEGIN
  -- eval_sessions에서 먼저 찾기
  SELECT c.id, c.teacher_id, es.rubric_id
  INTO v_class_id, v_teacher_id, v_rubric_id
  FROM eval_sessions es
  JOIN classes c ON c.id = es.class_id
  WHERE es.invite_code = p_invite_code AND es.invite_code_active = true;

  -- 없으면 classes에서 찾기
  IF v_class_id IS NULL THEN
    SELECT c.id, c.teacher_id, c.default_rubric_id
    INTO v_class_id, v_teacher_id, v_rubric_id
    FROM classes c
    WHERE c.invite_code = p_invite_code AND c.invite_code_active = true;
  END IF;

  IF v_class_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid invite code');
  END IF;

  SELECT name INTO v_rubric_name FROM rubrics WHERE id = v_rubric_id;

  INSERT INTO evaluations (
    teacher_id, student_id, class_id, rubric_id,
    total_score, grade, rubric_name, criteria_scores,
    characteristics, qualitative_evaluation, suggestions,
    student_record_draft, ai_provider, ai_model,
    evaluation_runs, evaluation_meta
  ) VALUES (
    v_teacher_id, p_student_id, v_class_id, v_rubric_id,
    (p_evaluation->>'total_score')::int,
    p_evaluation->>'grade',
    COALESCE(v_rubric_name, 'Unknown'),
    COALESCE(p_evaluation->'criteria_scores', '[]'),
    COALESCE(p_evaluation->'characteristics', '[]'),
    p_evaluation->>'qualitative_evaluation',
    COALESCE(p_evaluation->'suggestions', '[]'),
    p_evaluation->>'student_record_draft',
    p_evaluation->>'ai_provider',
    p_evaluation->>'ai_model',
    COALESCE((p_evaluation->>'evaluation_runs')::int, 1),
    p_evaluation->'evaluation_meta'
  );

  RETURN jsonb_build_object('success', true);
END $$;

GRANT EXECUTE ON FUNCTION save_student_evaluation(TEXT, UUID, JSONB) TO anon, authenticated;

-- 4. 데모 세션 데이터 (기존 COMEDU01은 class-level로 유지)
DO $$
DECLARE
  cid UUID := 'dddddddd-0000-0000-0000-000000000001';
BEGIN
  -- 국어 세션
  INSERT INTO eval_sessions (class_id, name, invite_code, invite_code_active, rubric_id)
  VALUES (cid, '국어 글쓰기 AI 활용 평가', 'COMEDU02', true, '00000000-0000-0000-0000-000000000002')
  ON CONFLICT (invite_code) DO NOTHING;

  -- 과학 세션
  INSERT INTO eval_sessions (class_id, name, invite_code, invite_code_active, rubric_id)
  VALUES (cid, '과학 탐구 AI 활용 평가', 'COMEDU03', true, '00000000-0000-0000-0000-000000000003')
  ON CONFLICT (invite_code) DO NOTHING;

  -- 코딩 세션
  INSERT INTO eval_sessions (class_id, name, invite_code, invite_code_active, rubric_id)
  VALUES (cid, '코딩 AI 활용 평가', 'COMEDU04', true, '00000000-0000-0000-0000-000000000004')
  ON CONFLICT (invite_code) DO NOTHING;
END $$;
