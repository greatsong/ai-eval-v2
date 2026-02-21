-- ============================================
-- get_class_dashboard 함수 수정
-- criteriaAverages 서브쿼리의 중첩 집계 함수 문제 해결
-- GROUP BY + json_agg(AVG()) → 서브쿼리로 분리
-- ============================================

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
        'name', sub.cname,
        'avgPercentage', sub.avg_pct
      ) ORDER BY sub.cname), '[]'::json)
      FROM (
        SELECT criterion->>'name' AS cname,
               ROUND(AVG((criterion->>'percentage')::numeric), 1) AS avg_pct
        FROM evaluations e,
          jsonb_array_elements(e.criteria_scores) AS criterion
        WHERE e.class_id = p_class_id
          AND criterion->>'percentage' IS NOT NULL
        GROUP BY criterion->>'name'
      ) sub
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
