-- ============================================
-- AI 채팅 평가 시스템 v2 - 초기 스키마
-- Supabase PostgreSQL Migration
-- ============================================

-- 1. profiles (사용자 프로필 - auth.users 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  school_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 2. classes (학급)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  school_year INTEGER NOT NULL,
  semester INTEGER CHECK (semester IN (1, 2)),
  subject TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active) WHERE is_active = true;

-- 3. students (학생 - 계정 없음, 교사가 관리)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_number TEXT NOT NULL,
  name TEXT NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_number)
);

CREATE INDEX idx_students_class ON students(class_id);

-- 4. rubrics (루브릭)
CREATE TABLE rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📋',
  is_template BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  source_template_id UUID REFERENCES rubrics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rubrics_teacher ON rubrics(teacher_id);
CREATE INDEX idx_rubrics_template ON rubrics(is_template) WHERE is_template = true;

-- 5. rubric_criteria (평가 기준)
CREATE TABLE rubric_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  criterion_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 25 CHECK (weight >= 0 AND weight <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_criteria_rubric ON rubric_criteria(rubric_id);

-- 6. criteria_levels (수준별 설명)
CREATE TABLE criteria_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_id UUID NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  description TEXT NOT NULL,
  UNIQUE(criterion_id, score)
);

CREATE INDEX idx_levels_criterion ON criteria_levels(criterion_id);

-- 7. evaluations (평가 결과 - 핵심)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  rubric_id UUID REFERENCES rubrics(id) ON DELETE SET NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  grade TEXT NOT NULL,
  rubric_name TEXT NOT NULL,
  criteria_scores JSONB NOT NULL DEFAULT '[]',
  characteristics JSONB DEFAULT '[]',
  qualitative_evaluation TEXT,
  suggestions JSONB DEFAULT '[]',
  student_record_draft TEXT,
  interaction_mode TEXT,
  self_eval_scores JSONB,
  chat_content_hash TEXT,
  ai_provider TEXT,
  ai_model TEXT,
  evaluation_runs INTEGER DEFAULT 1,
  evaluation_meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evaluations_teacher ON evaluations(teacher_id);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_evaluations_class ON evaluations(class_id);
CREATE INDEX idx_evaluations_rubric ON evaluations(rubric_id);
CREATE INDEX idx_evaluations_created ON evaluations(created_at DESC);
CREATE INDEX idx_evaluations_teacher_class ON evaluations(teacher_id, class_id);
CREATE INDEX idx_evaluations_criteria_gin ON evaluations USING GIN (criteria_scores);

-- 8. api_settings (교사별 API 설정)
CREATE TABLE api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gemini',
  models JSONB NOT NULL DEFAULT '{"gemini": "gemini-2.5-flash", "openai": "gpt-4o", "claude": "claude-3-5-sonnet-20241022"}',
  evaluation_runs INTEGER NOT NULL DEFAULT 1,
  use_server_side BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. global_config (시스템 전역 설정)
CREATE TABLE global_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Auth Trigger: 새 사용자 등록 시 profiles 자동 생성
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'teacher'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rubrics_updated_at BEFORE UPDATE ON rubrics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER api_settings_updated_at BEFORE UPDATE ON api_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_config ENABLE ROW LEVEL SECURITY;

-- profiles RLS
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- classes RLS
CREATE POLICY "classes_all_own" ON classes FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- students RLS
CREATE POLICY "students_select_own" ON students FOR SELECT
  USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));
CREATE POLICY "students_insert_own" ON students FOR INSERT
  WITH CHECK (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));
CREATE POLICY "students_update_own" ON students FOR UPDATE
  USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()))
  WITH CHECK (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));
CREATE POLICY "students_delete_own" ON students FOR DELETE
  USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));

-- rubrics RLS
CREATE POLICY "rubrics_select" ON rubrics FOR SELECT
  USING (teacher_id = auth.uid() OR is_template = true OR is_shared = true);
CREATE POLICY "rubrics_insert_own" ON rubrics FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "rubrics_update_own" ON rubrics FOR UPDATE USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "rubrics_delete_own" ON rubrics FOR DELETE USING (teacher_id = auth.uid());

-- rubric_criteria RLS
CREATE POLICY "criteria_select" ON rubric_criteria FOR SELECT
  USING (rubric_id IN (SELECT id FROM rubrics WHERE teacher_id = auth.uid() OR is_template = true OR is_shared = true));
CREATE POLICY "criteria_insert" ON rubric_criteria FOR INSERT
  WITH CHECK (rubric_id IN (SELECT id FROM rubrics WHERE teacher_id = auth.uid()));
CREATE POLICY "criteria_update" ON rubric_criteria FOR UPDATE
  USING (rubric_id IN (SELECT id FROM rubrics WHERE teacher_id = auth.uid()));
CREATE POLICY "criteria_delete" ON rubric_criteria FOR DELETE
  USING (rubric_id IN (SELECT id FROM rubrics WHERE teacher_id = auth.uid()));

-- criteria_levels RLS
CREATE POLICY "levels_select" ON criteria_levels FOR SELECT
  USING (criterion_id IN (
    SELECT rc.id FROM rubric_criteria rc JOIN rubrics r ON rc.rubric_id = r.id
    WHERE r.teacher_id = auth.uid() OR r.is_template = true OR r.is_shared = true
  ));
CREATE POLICY "levels_insert" ON criteria_levels FOR INSERT
  WITH CHECK (criterion_id IN (
    SELECT rc.id FROM rubric_criteria rc JOIN rubrics r ON rc.rubric_id = r.id
    WHERE r.teacher_id = auth.uid()
  ));
CREATE POLICY "levels_update" ON criteria_levels FOR UPDATE
  USING (criterion_id IN (
    SELECT rc.id FROM rubric_criteria rc JOIN rubrics r ON rc.rubric_id = r.id
    WHERE r.teacher_id = auth.uid()
  ));
CREATE POLICY "levels_delete" ON criteria_levels FOR DELETE
  USING (criterion_id IN (
    SELECT rc.id FROM rubric_criteria rc JOIN rubrics r ON rc.rubric_id = r.id
    WHERE r.teacher_id = auth.uid()
  ));

-- evaluations RLS
CREATE POLICY "evaluations_all_own" ON evaluations FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- api_settings RLS
CREATE POLICY "api_settings_all_own" ON api_settings FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- global_config RLS
CREATE POLICY "global_config_select" ON global_config FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "global_config_modify" ON global_config FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- Database Functions (RPC)
-- ============================================

-- 학급 대시보드 통계
CREATE OR REPLACE FUNCTION get_class_dashboard(p_class_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'summary', (
      SELECT json_build_object(
        'totalStudents', (SELECT COUNT(*) FROM students WHERE class_id = p_class_id),
        'totalEvaluations', COUNT(*),
        'avgScore', ROUND(AVG(total_score), 1),
        'minScore', MIN(total_score),
        'maxScore', MAX(total_score)
      )
      FROM evaluations WHERE class_id = p_class_id
    ),
    'gradeDistribution', (
      SELECT COALESCE(json_agg(json_build_object('grade', grade, 'count', cnt)), '[]'::json)
      FROM (
        SELECT grade, COUNT(*) as cnt
        FROM evaluations WHERE class_id = p_class_id
        GROUP BY grade ORDER BY MIN(total_score) DESC
      ) sub
    ),
    'criteriaAverages', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', criterion->>'name',
        'avgPercentage', ROUND(AVG((criterion->>'percentage')::numeric), 1)
      )), '[]'::json)
      FROM evaluations e,
        jsonb_array_elements(e.criteria_scores) AS criterion
      WHERE e.class_id = p_class_id
      GROUP BY criterion->>'name'
    ),
    'monthlyTrend', (
      SELECT COALESCE(json_agg(json_build_object(
        'month', TO_CHAR(month, 'YYYY-MM'),
        'avgScore', avg_score,
        'count', eval_count
      ) ORDER BY month), '[]'::json)
      FROM (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          ROUND(AVG(total_score), 1) AS avg_score,
          COUNT(*) AS eval_count
        FROM evaluations WHERE class_id = p_class_id
        GROUP BY DATE_TRUNC('month', created_at)
      ) sub
    ),
    'recentEvaluations', (
      SELECT COALESCE(json_agg(sub), '[]'::json)
      FROM (
        SELECT e.id, e.total_score, e.grade, e.rubric_name, e.created_at,
               s.name as student_name, s.student_number
        FROM evaluations e
        LEFT JOIN students s ON e.student_id = s.id
        WHERE e.class_id = p_class_id
        ORDER BY e.created_at DESC LIMIT 10
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 교사 전체 통계
CREATE OR REPLACE FUNCTION get_teacher_overview(p_teacher_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalClasses', (SELECT COUNT(*) FROM classes WHERE teacher_id = p_teacher_id AND is_active = true),
    'totalStudents', (SELECT COUNT(*) FROM students s JOIN classes c ON s.class_id = c.id WHERE c.teacher_id = p_teacher_id),
    'totalEvaluations', (SELECT COUNT(*) FROM evaluations WHERE teacher_id = p_teacher_id),
    'avgScore', (SELECT ROUND(AVG(total_score), 1) FROM evaluations WHERE teacher_id = p_teacher_id),
    'classSummaries', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', c.id,
        'name', c.name,
        'subject', c.subject,
        'studentCount', (SELECT COUNT(*) FROM students WHERE class_id = c.id),
        'evalCount', (SELECT COUNT(*) FROM evaluations WHERE class_id = c.id),
        'avgScore', (SELECT ROUND(AVG(total_score), 1) FROM evaluations WHERE class_id = c.id)
      ) ORDER BY c.created_at DESC), '[]'::json)
      FROM classes c WHERE c.teacher_id = p_teacher_id AND c.is_active = true
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
