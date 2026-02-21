-- ============================================
-- 데모 학급 가상 평가 데이터
-- 시간 흐름에 따른 성장 추이를 보여주기 위한 데이터
-- ============================================

-- 관리자 teacher_id
DO $$
DECLARE
  tid UUID;
  cid UUID := 'dddddddd-0000-0000-0000-000000000001';
  rid UUID := '00000000-0000-0000-0000-000000000001';
  s1 UUID; s2 UUID; s3 UUID; s5 UUID; s7 UUID; s10 UUID; s14 UUID; s20 UUID;
BEGIN
  -- 관리자 ID
  SELECT teacher_id INTO tid FROM classes WHERE id = cid;

  -- 학생 ID 가져오기 (일부만)
  SELECT id INTO s1  FROM students WHERE class_id = cid AND student_number = '1';
  SELECT id INTO s2  FROM students WHERE class_id = cid AND student_number = '2';
  SELECT id INTO s3  FROM students WHERE class_id = cid AND student_number = '3';
  SELECT id INTO s5  FROM students WHERE class_id = cid AND student_number = '5';
  SELECT id INTO s7  FROM students WHERE class_id = cid AND student_number = '7';
  SELECT id INTO s10 FROM students WHERE class_id = cid AND student_number = '10';
  SELECT id INTO s14 FROM students WHERE class_id = cid AND student_number = '14';
  SELECT id INTO s20 FROM students WHERE class_id = cid AND student_number = '20';

  -- ========================================
  -- 1번 강민준: 3회 평가, 꾸준히 성장 (62→75→88)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s1, cid, rid, 62, 'D', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":3,"maxScore":5,"weight":20,"percentage":60},
      {"name":"반복적 개선","score":2,"maxScore":5,"weight":25,"percentage":40},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["단순한 질문 위주","AI 응답을 그대로 수용하는 경향"]'::jsonb,
    '기본적인 질문 능력은 있으나 후속 질문이나 비판적 검토가 부족합니다. AI 응답을 그대로 받아들이는 경향이 강합니다.',
    '["AI 응답에 대해 왜?라고 물어보는 습관을 기르세요","후속 질문으로 대화를 발전시켜 보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-13 10:30:00+09'),

  (tid, s1, cid, rid, 75, 'C+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":4,"maxScore":5,"weight":20,"percentage":80},
      {"name":"반복적 개선","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["이전보다 구체적인 질문","후속 질문 시도가 보임"]'::jsonb,
    '질문의 명확성이 크게 향상되었습니다. 후속 질문을 통해 대화를 발전시키려는 시도가 보입니다.',
    '["비판적 사고를 더 발휘해 AI 응답을 검증해보세요","자신만의 관점을 추가해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-03 14:20:00+09'),

  (tid, s1, cid, rid, 88, 'B+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":5,"maxScore":5,"weight":20,"percentage":100},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["체계적인 질문 전략","AI 응답 검증 시도","실제 문제에 효과적 적용"]'::jsonb,
    '매우 큰 성장을 보였습니다. 질문이 명확하고, AI 응답을 검증하며, 실제 문제 해결에 효과적으로 활용하고 있습니다.',
    '["더 창의적인 활용 방법을 탐색해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-17 11:00:00+09');

  -- ========================================
  -- 2번 김서윤: 2회 평가, 높은 수준 유지 (90→93)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s2, cid, rid, 90, 'A', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":5,"maxScore":5,"weight":20,"percentage":100},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":5,"maxScore":5,"weight":30,"percentage":100}]'::jsonb,
    '["명확하고 구조화된 질문","창의적인 활용"]'::jsonb,
    '질문이 명확하고 구조적이며, AI를 실제 문제 해결에 창의적으로 활용합니다.',
    '["반복적 개선 과정을 더 체계적으로 발전시켜보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-20 09:15:00+09'),

  (tid, s2, cid, rid, 93, 'A', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":5,"maxScore":5,"weight":20,"percentage":100},
      {"name":"반복적 개선","score":5,"maxScore":5,"weight":25,"percentage":100},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":5,"maxScore":5,"weight":30,"percentage":100}]'::jsonb,
    '["체계적 반복 개선","높은 수준의 AI 활용 역량"]'::jsonb,
    '이전 평가 대비 반복적 개선 영역이 크게 향상되었습니다. 전반적으로 우수한 AI 활용 역량을 보여줍니다.',
    '["비판적 사고를 한 단계 더 발전시켜 A+ 수준에 도달해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-14 10:30:00+09');

  -- ========================================
  -- 3번 김예준: 2회 평가, 초반 낮음→큰 성장 (55→78)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s3, cid, rid, 55, 'F', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":2,"maxScore":5,"weight":20,"percentage":40},
      {"name":"반복적 개선","score":2,"maxScore":5,"weight":25,"percentage":40},
      {"name":"비판적 사고","score":2,"maxScore":5,"weight":25,"percentage":40},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["한 번에 답을 요청하는 경향","검증 없이 수용"]'::jsonb,
    'AI에게 직접적으로 답을 요청하는 패턴이 반복됩니다. 질문을 구체화하고 대화를 발전시키는 연습이 필요합니다.',
    '["질문을 단계별로 나누어 보세요","AI 응답이 정확한지 확인하는 습관을 기르세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-15 13:45:00+09'),

  (tid, s3, cid, rid, 78, 'C+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":4,"maxScore":5,"weight":20,"percentage":80},
      {"name":"반복적 개선","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":5,"maxScore":5,"weight":30,"percentage":100}]'::jsonb,
    '["질문이 구체적으로 변화","실제 적용 우수"]'::jsonb,
    '놀라운 성장입니다! 질문의 구체성이 크게 향상되었고, 특히 실제 적용 영역에서 매우 우수한 결과를 보여줍니다.',
    '["반복적 개선과 비판적 사고도 같은 수준으로 끌어올리세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-12 15:00:00+09');

  -- ========================================
  -- 5번 나하린: 1회 평가 (아직 추이 없음)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s5, cid, rid, 82, 'B', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":4,"maxScore":5,"weight":20,"percentage":80},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["균형 잡힌 AI 활용","안정적인 역량"]'::jsonb,
    '모든 영역에서 고르게 양호한 성과를 보이고 있습니다. 특별히 약한 영역이 없는 것이 강점입니다.',
    '["한 가지 영역이라도 탁월한 수준으로 끌어올려 보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-05 11:30:00+09');

  -- ========================================
  -- 7번 박서연: 3회 평가, 안정적 고수준 (85→87→91)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s7, cid, rid, 85, 'B+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":4,"maxScore":5,"weight":20,"percentage":80},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":5,"maxScore":5,"weight":30,"percentage":100}]'::jsonb,
    '["실제 적용 능력 우수","꾸준한 성장 의지"]'::jsonb,
    '실제 적용 영역에서 특히 우수하며, 전반적으로 높은 수준의 AI 활용 역량을 보여줍니다.',
    '["비판적 사고를 더 강화해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-10 10:00:00+09'),

  (tid, s7, cid, rid, 87, 'B+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":5,"maxScore":5,"weight":20,"percentage":100},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["질문 명확성 향상","고른 실력"]'::jsonb,
    '질문의 명확성이 최고 수준으로 향상되었습니다. 꾸준한 성장이 인상적입니다.',
    '["반복적 개선 전략을 체계화해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-31 14:00:00+09'),

  (tid, s7, cid, rid, 91, 'A', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":5,"maxScore":5,"weight":20,"percentage":100},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":5,"maxScore":5,"weight":25,"percentage":100},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["비판적 사고 대폭 향상","A등급 진입"]'::jsonb,
    '비판적 사고가 크게 향상되어 A등급에 진입했습니다. 지속적인 성장이 매우 인상적입니다.',
    '["모든 영역에서 5점을 목표로 도전해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-18 09:30:00+09');

  -- ========================================
  -- 10번 손하은: 2회 평가, 소폭 하락 후 회복 필요 (72→68)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s10, cid, rid, 72, 'C', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":4,"maxScore":5,"weight":20,"percentage":80},
      {"name":"반복적 개선","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":3,"maxScore":5,"weight":30,"percentage":60}]'::jsonb,
    '["질문은 명확하나 활용이 제한적"]'::jsonb,
    '질문 능력은 좋으나, AI 응답을 실제 문제에 적용하는 부분에서 아쉬움이 있습니다.',
    '["AI 응답을 자신의 상황에 맞게 변형해서 적용해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-22 11:15:00+09'),

  (tid, s10, cid, rid, 68, 'D+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":3,"maxScore":5,"weight":20,"percentage":60},
      {"name":"반복적 개선","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":3,"maxScore":5,"weight":30,"percentage":60}]'::jsonb,
    '["전반적으로 정체 상태","동기부여 필요"]'::jsonb,
    '이전 평가보다 소폭 하락했습니다. 질문의 구체성이 줄어든 점이 아쉽습니다. 동기부여가 필요한 시점입니다.',
    '["관심 있는 주제로 AI와 깊이 있는 대화를 시도해보세요","친구들의 좋은 사례를 참고해보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-10 13:00:00+09');

  -- ========================================
  -- 14번 이건우: 2회 평가, 큰 도약 (58→85)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s14, cid, rid, 58, 'F', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":2,"maxScore":5,"weight":20,"percentage":40},
      {"name":"반복적 개선","score":2,"maxScore":5,"weight":25,"percentage":40},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":3,"maxScore":5,"weight":30,"percentage":60}]'::jsonb,
    '["모호한 질문","대화 발전 부족"]'::jsonb,
    '질문이 모호하고, 대화를 발전시키는 능력이 부족합니다. 비판적 사고는 있지만 아직 미약합니다.',
    '["질문 전에 무엇을 알고 싶은지 정리해보세요","단계적으로 질문하는 연습을 하세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-01-17 14:30:00+09'),

  (tid, s14, cid, rid, 85, 'B+', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":4,"maxScore":5,"weight":20,"percentage":80},
      {"name":"반복적 개선","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"비판적 사고","score":4,"maxScore":5,"weight":25,"percentage":80},
      {"name":"실제 적용","score":5,"maxScore":5,"weight":30,"percentage":100}]'::jsonb,
    '["극적인 성장","체계적 질문 전략 습득","우수한 실제 적용"]'::jsonb,
    '한 달 만에 놀라운 성장을 보였습니다! 질문이 구체적이고, 반복적으로 개선하며, 실제 문제에 탁월하게 적용합니다.',
    '["이 성장세를 유지하면 A등급도 가능합니다"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-14 10:00:00+09');

  -- ========================================
  -- 20번 정우진: 1회 평가 (첫 평가)
  -- ========================================
  INSERT INTO evaluations (teacher_id, student_id, class_id, rubric_id, total_score, grade, rubric_name,
    criteria_scores, characteristics, qualitative_evaluation, suggestions,
    ai_provider, ai_model, evaluation_runs, created_at) VALUES
  (tid, s20, cid, rid, 70, 'C', '일반 AI 활용 역량 평가',
    '[{"name":"질문의 명확성","score":3,"maxScore":5,"weight":20,"percentage":60},
      {"name":"반복적 개선","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"비판적 사고","score":3,"maxScore":5,"weight":25,"percentage":60},
      {"name":"실제 적용","score":4,"maxScore":5,"weight":30,"percentage":80}]'::jsonb,
    '["평균적인 AI 활용 수준","실제 적용은 양호"]'::jsonb,
    '전반적으로 평균 수준의 AI 활용 역량을 보여줍니다. 실제 적용 영역이 상대적으로 좋습니다.',
    '["질문을 더 구체적으로 만들어보세요","AI 응답을 의심하고 검증하는 습관을 길러보세요"]'::jsonb,
    'gemini', 'gemini-2.5-flash', 1, '2026-02-07 15:30:00+09');

  RAISE NOTICE 'Demo evaluations inserted successfully';
END $$;
