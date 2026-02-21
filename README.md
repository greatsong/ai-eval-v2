# AI 채팅 평가 시스템 v2 — 과정의 증명 (Proof of Process)

학생의 AI 채팅 활용 능력을 루브릭 기반으로 평가하는 교육용 웹 애플리케이션입니다.

**배포 URL**: https://pro-of-ai.vercel.app

## 핵심 기능

- **학생 자기 평가**: 학생이 초대코드로 접속 → 채팅 붙여넣기 → 즉시 결과 확인 + PDF 다운로드 (로그인 불필요)
- **평가 세션**: 하나의 학급에서 과목/활동별로 서로 다른 루브릭으로 동시 평가 가능
- **교사 직접 평가**: 교사가 학생의 채팅을 직접 평가 (K-run 지원)
- **루브릭 관리**: 교사가 직접 루브릭 생성/복제/삭제 + AI 코치가 평가 항목·수준 자동 제안
- **통계 대시보드**: 등급 분포, 항목별 평균, 월별 점수 추이, 최근 평가 이력
- **생활기록부 초안**: AI가 생성한 생활기록부 문구 자동 생성
- **PDF 보고서**: 레이더 차트 + 항목별 바 차트 포함 보고서 다운로드
- **다중 교사 지원**: 이메일 인증 + 접근코드 기반 교사 가입, RLS로 데이터 격리
- **학생 프라이버시**: 번호 입력 → 이름 확인 방식 (다른 학생 명단 노출 없음)

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19 + Vite |
| Router | React Router v7 |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS + RPC) |
| PDF 출력 | html2pdf.js |
| AI 제공자 | Google Gemini, OpenAI, Anthropic Claude |
| 배포 | Vercel |

## 프로젝트 구조

```
src/
├── main.jsx                     # 앱 진입점
├── App.jsx                      # 라우터 설정
├── lib/supabase.js              # Supabase 클라이언트
├── hooks/                       # Custom Hooks
│   ├── useSupabaseAuth.js       # 인증 + 접근코드 검증
│   ├── useClasses.js            # 학급 CRUD
│   ├── useStudents.js           # 학생 CRUD
│   ├── useRubrics.js            # 루브릭 CRUD
│   ├── useEvaluations.js        # 평가 CRUD
│   └── useDashboard.js          # 통계 RPC
├── context/                     # React Context
│   ├── AuthContext.jsx
│   ├── ClassContext.jsx
│   └── EvaluationContext.jsx
├── pages/
│   ├── Login.jsx                # 로그인/회원가입 (접근코드 인증)
│   ├── Home.jsx                 # 교사 직접 평가
│   ├── ClassManagement.jsx      # 학급/학생/세션 관리
│   ├── Dashboard.jsx            # 통계 대시보드
│   ├── RubricManagement.jsx     # 루브릭 관리 + AI 코치
│   ├── StudentEval.jsx          # 학생 자기 평가 (공개 라우트)
│   ├── Guide.jsx                # 사용 안내
│   └── AdminSettings.jsx        # 관리자: 접근코드 관리
├── components/
│   ├── auth/ProtectedRoute.jsx
│   ├── common/Navbar.jsx
│   ├── evaluation/              # 평가 UI 컴포넌트
│   └── pdf/                     # PDF 보고서 레이아웃
├── services/                    # 비즈니스 로직
│   ├── evaluator.js             # 평가 오케스트레이터
│   ├── prompts.js               # 프롬프트 생성
│   ├── responseParser.js        # AI 응답 파싱
│   ├── synthesis.js             # K-run 결과 합성
│   ├── rubricGenerator.js       # AI 루브릭 생성 서비스
│   ├── pdfGenerator.js          # PDF 생성
│   └── providers/               # AI API 호출 (Gemini, OpenAI, Claude)
└── data/constants.js            # 상수 정의

supabase/migrations/
├── 001_initial_schema.sql       # 테이블 + RLS + Trigger + RPC
├── 002_seed_data.sql            # 기본 루브릭 템플릿 4개
├── 003_teacher_access_code.sql  # 교사 접근코드 인증
├── 004_student_self_eval.sql    # 학생 평가 RPC (get_class_for_student, save_student_evaluation)
├── 005_demo_class.sql           # 데모 학급 + 학생 25명
├── 006_demo_class_to_admin.sql  # 데모 학급 관리자 이전
├── 007_demo_evaluations.sql     # 시간별 성장 데모 평가 데이터
├── 008_fix_admin_display_name.sql
├── 009_eval_sessions.sql        # 평가 세션 테이블 + RPC 업데이트
└── 010_fix_criteria_averages.sql # 대시보드 항목별 평균 쿼리 수정
```

## 평가 흐름

### 학생 자기 평가 (주요 흐름)

```
학생 → /proofai 접속 (로그인 불필요)
  → 초대코드 입력
  → 출석번호 입력 → 이름 확인
  → AI 채팅 내용 붙여넣기
  → 평가 결과 확인 + PDF 다운로드
  → 결과 자동 저장 (교사 대시보드에 반영)
```

### 교사 직접 평가

```
교사 → 로그인 → 평가 페이지
  → 루브릭 선택 + 학생 선택
  → 채팅 내용 붙여넣기
  → K-run 설정 (1~5회)
  → 평가 결과 확인/저장
```

## 시작하기

### 1. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 마이그레이션 파일 순서대로 적용:
   ```bash
   npx supabase db push
   ```
3. **Project Settings > API**에서 `Project URL`과 `anon public` key 확인

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일 편집:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 3. 로컬 개발

```bash
npm install
npm run dev
```

`http://localhost:4002` 접속

### 4. 첫 사용

1. 회원가입 (이름 + **교사 인증 코드** + 이메일 + 비밀번호)
2. 이메일 인증 확인
3. 로그인 → **학급 관리**에서 학급 생성 + 학생 등록
4. **학생 평가 설정**에서 AI 제공자/API 키/모델 설정
5. **평가 세션** 추가 (과목별 루브릭 + 초대코드 자동 생성)
6. 학생에게 URL(`/proofai`) + 초대코드 안내
7. **대시보드**에서 학급 통계 확인

> 초기 교사 인증 코드는 `TEACH2024`입니다. 관리자는 `/admin` 페이지에서 코드를 변경할 수 있습니다.

## 데이터베이스

### 테이블 (10개)

| 테이블 | 용도 |
|--------|------|
| `profiles` | 교사 프로필 (auth.users 확장) |
| `classes` | 학급 (학년도, 학기, 교과, API 설정) |
| `students` | 학생 (계정 없음, 교사 관리) |
| `eval_sessions` | 평가 세션 (학급별 루브릭 + 초대코드) |
| `rubrics` | 루브릭 (템플릿 + 커스텀) |
| `rubric_criteria` | 평가 기준 (가중치, 순서) |
| `criteria_levels` | 수준별 설명 (1~5점) |
| `evaluations` | 평가 결과 (JSONB criteria_scores) |
| `api_settings` | 교사별 API 설정 |
| `global_config` | 시스템 전역 설정 (접근코드 등) |

### Database Functions (RPC)

| 함수 | 용도 |
|------|------|
| `get_class_for_student(invite_code)` | 초대코드로 학급/세션 정보 조회 (학생용) |
| `save_student_evaluation(invite_code, student_id, evaluation)` | 학생 평가 결과 저장 |
| `get_class_dashboard(class_id)` | 학급별 통계 (등급 분포, 항목별 평균, 월별 추이) |
| `get_teacher_overview(teacher_id)` | 교사 전체 개요 |
| `verify_teacher_access_code(code)` | 교사 접근코드 검증 |

### 보안

- **RLS**: 모든 테이블에 적용. 교사는 자기 데이터만 접근 가능
- **접근코드**: 회원가입 시 교사 인증 코드 필수
- **학생 프라이버시**: 번호 입력 → 이름 확인 (다른 학생 명단 미노출)
- **채팅 원문**: 서버에 저장하지 않음 (개인정보 보호)

## 루브릭 시스템

### 기본 템플릿 (4개)

| 템플릿 | 평가 항목 |
|--------|-----------|
| 일반 AI 활용 | 질문 명확성, 반복적 개선, 비판적 사고, 실제 적용 |
| 글쓰기/국어 | 주제 탐색, 자기 목소리, 수정 과정, 자료 검증 |
| 과학 탐구 | 가설 설정, 데이터 분석, 과학적 추론, 보고서 작성 |
| 코딩/프로그래밍 | 문제 분해, 코드 이해, 디버깅, 코드 개선 |

### 커스텀 루브릭 관리

교사가 직접 루브릭을 만들 수 있습니다:
- **AI 코치**: 주제만 입력하면 AI가 평가 항목 4개 + 5단계 수준별 기준을 자동 생성
- **템플릿 복제**: 기존 시스템 템플릿을 복제하여 수정
- **수동 생성**: 항목 추가/삭제, 가중치 설정, 아이콘 선택
- **가중치 검증**: 합계 100% 실시간 검증

## 배포

```bash
npm run build
npx vercel --prod
```

환경 변수:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 라이선스

교육 목적으로 자유롭게 사용 가능합니다.
