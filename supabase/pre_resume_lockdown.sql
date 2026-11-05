-- 재개 전 보강 (아직 적용하지 않았습니다)
-- supabase/migrations 밖에 둔 이유: db push 로 자동 적용되지 않게 하기 위해서입니다.
-- 프로젝트를 재개한 직후 SQL Editor 에서 실행합니다.
--
-- 바꾸는 것: save_student_evaluation 이 학생이 그 학급 소속인지 검사하고, 비활성 학급을 조회 함수와 같이 거부합니다(009 판 기준).
-- 앱과의 대조: 학생 화면은 get_class_for_student 로 받은 학생 id 를 그대로 보내므로 정상 흐름은 통과합니다.
--
-- 재개 전 사용자가 할 일: global_config 의 teacher_access_code 를 새 값으로 바꿉니다.
-- 초기값이 공개 저장소의 마이그레이션 003 에 있습니다.
--
-- 남는 위험: 초대코드를 아는 사람은 같은 학급의 다른 학생을 골라 임의 점수를 저장할 수 있습니다.
-- 학생 로그인이 없고 점수를 브라우저가 보내기 때문입니다. 공식 성적의 근거로 쓰지 않습니다.
-- /api/evaluate 는 인증이 없어 Origin 을 위조한 호출을 막지 못합니다. 제공사 지출 한도를 둡니다.
-- get_class_for_student 는 초대코드만 있으면 학급 학생의 번호·이름을 돌려줍니다.
-- 학생이 자기 이름을 고르는 화면에 필요합니다. 수업 뒤에는 초대코드를 꺼 둡니다(invite_code_active).
--
-- 되돌리기: 009_eval_sessions.sql 의 save_student_evaluation 정의를 다시 실행합니다.

CREATE OR REPLACE FUNCTION save_student_evaluation(p_invite_code TEXT, p_student_id UUID, p_evaluation JSONB)
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
  WHERE es.invite_code = p_invite_code AND es.invite_code_active = true AND c.is_active = true;

  -- 없으면 classes에서 찾기
  IF v_class_id IS NULL THEN
    SELECT c.id, c.teacher_id, c.default_rubric_id
    INTO v_class_id, v_teacher_id, v_rubric_id
    FROM classes c
    WHERE c.invite_code = p_invite_code AND c.invite_code_active = true AND c.is_active = true;
  END IF;

  -- 초대코드의 학급에 속한 학생인지 확인한다. 이 검사가 없으면 다른 학급 학생의 평가를 넣을 수 있다
  IF p_student_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM students s WHERE s.id = p_student_id AND s.class_id = v_class_id
  ) THEN
    RETURN json_build_object('success', false, 'error', '이 학급의 학생이 아닙니다.');
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
