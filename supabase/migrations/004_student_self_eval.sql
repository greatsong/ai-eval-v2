-- ============================================
-- 학생 자기평가 시스템 — 학급 초대코드 방식
-- ============================================

-- 1. classes 테이블에 학생 평가용 컬럼 추가
ALTER TABLE classes ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS invite_code_active BOOLEAN DEFAULT false;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS default_rubric_id UUID REFERENCES rubrics(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS student_api_provider TEXT DEFAULT 'gemini';
ALTER TABLE classes ADD COLUMN IF NOT EXISTS student_api_key TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS student_api_model TEXT DEFAULT 'gemini-2.5-flash';

-- 2. 초대코드로 학급 정보 조회 (인증 불필요 — 학생은 비로그인 상태)
CREATE OR REPLACE FUNCTION get_class_for_student(p_invite_code TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'class_id', c.id,
    'class_name', c.name,
    'subject', c.subject,
    'teacher_name', p.display_name,
    'api_provider', c.student_api_provider,
    'api_key', c.student_api_key,
    'api_model', c.student_api_model,
    'rubric_id', c.default_rubric_id,
    'students', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', s.id, 'student_number', s.student_number, 'name', s.name
      ) ORDER BY s.student_number), '[]'::json)
      FROM students s WHERE s.class_id = c.id
    ),
    'rubric', CASE WHEN c.default_rubric_id IS NOT NULL THEN (
      SELECT json_build_object(
        'id', r.id, 'name', r.name, 'description', r.description, 'icon', r.icon,
        'criteria', (
          SELECT COALESCE(json_agg(json_build_object(
            'id', rc.criterion_key, 'name', rc.name,
            'description', rc.description, 'weight', rc.weight, 'sort_order', rc.sort_order,
            'levels', (
              SELECT COALESCE(json_agg(json_build_object(
                'score', cl.score, 'description', cl.description
              ) ORDER BY cl.score DESC), '[]'::json)
              FROM criteria_levels cl WHERE cl.criterion_id = rc.id
            )
          ) ORDER BY rc.sort_order), '[]'::json)
          FROM rubric_criteria rc WHERE rc.rubric_id = r.id
        )
      )
      FROM rubrics r WHERE r.id = c.default_rubric_id
    ) ELSE NULL END
  )
  INTO result
  FROM classes c
  JOIN profiles p ON p.id = c.teacher_id
  WHERE c.invite_code = p_invite_code
    AND c.invite_code_active = true
    AND c.is_active = true;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 학생 평가 결과 저장 (인증 불필요)
CREATE OR REPLACE FUNCTION save_student_evaluation(
  p_invite_code TEXT,
  p_student_id UUID,
  p_evaluation JSONB
)
RETURNS JSON AS $$
DECLARE
  v_class RECORD;
  v_eval_id UUID;
BEGIN
  SELECT c.id, c.teacher_id, c.default_rubric_id, r.name as rubric_name
  INTO v_class
  FROM classes c
  LEFT JOIN rubrics r ON r.id = c.default_rubric_id
  WHERE c.invite_code = p_invite_code
    AND c.invite_code_active = true
    AND c.is_active = true;

  IF v_class IS NULL THEN
    RETURN json_build_object('success', false, 'error', '유효하지 않은 초대코드입니다.');
  END IF;

  INSERT INTO evaluations (
    teacher_id, student_id, class_id, rubric_id, rubric_name,
    total_score, grade, criteria_scores, characteristics,
    qualitative_evaluation, suggestions, student_record_draft,
    ai_provider, ai_model, evaluation_runs, evaluation_meta
  ) VALUES (
    v_class.teacher_id,
    p_student_id,
    v_class.id,
    v_class.default_rubric_id,
    COALESCE(v_class.rubric_name, ''),
    (p_evaluation->>'total_score')::INTEGER,
    p_evaluation->>'grade',
    p_evaluation->'criteria_scores',
    p_evaluation->'characteristics',
    p_evaluation->>'qualitative_evaluation',
    p_evaluation->'suggestions',
    p_evaluation->>'student_record_draft',
    p_evaluation->>'ai_provider',
    p_evaluation->>'ai_model',
    COALESCE((p_evaluation->>'evaluation_runs')::INTEGER, 1),
    p_evaluation->'evaluation_meta'
  )
  RETURNING id INTO v_eval_id;

  RETURN json_build_object('success', true, 'id', v_eval_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 비인증 사용자(학생)도 RPC 호출 가능하도록 권한 부여
GRANT EXECUTE ON FUNCTION get_class_for_student(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_class_for_student(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION save_student_evaluation(TEXT, UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION save_student_evaluation(TEXT, UUID, JSONB) TO authenticated;
