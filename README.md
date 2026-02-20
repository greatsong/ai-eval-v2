# AI 채팅 평가 시스템 v2

학생의 AI 채팅 활용 능력을 루브릭 기반으로 평가하는 교육용 웹 애플리케이션입니다.

**v2 핵심 변경사항**: localStorage 기반에서 **Supabase(PostgreSQL)** 기반으로 전면 전환하여 다중 교사 지원, 영구 데이터 보존, 학급/학생 관리, 통계 대시보드를 제공합니다.

## 기능

- **AI 채팅 평가**: 학생의 AI 대화 내용을 루브릭 기준으로 자동 평가 (Gemini, OpenAI, Claude 지원)
- **다중 교사**: 이메일 기반 교사 계정, 개별 데이터 격리 (RLS)
- **학급/학생 관리**: 학급 생성, 학생 명단 등록 (CSV 일괄 등록), 학생별 평가 연결
- **루브릭 시스템**: 4개 기본 템플릿 + 커스텀 루브릭 생성/공유
- **통계 대시보드**: 학급별 평균, 등급 분포, 항목별 분석, 시간대별 추이
- **생활기록부 초안**: AI가 생성한 생활기록부 문구 자동 생성

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19 + Vite |
| Router | React Router v7 |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| 차트 | Chart.js + react-chartjs-2 |
| 배포 | Vercel |

## 프로젝트 구조

```
src/
├── lib/supabase.js              # Supabase 클라이언트
├── hooks/                       # Custom Hooks
│   ├── useSupabaseAuth.js       # 인증
│   ├── useClasses.js            # 학급 CRUD
│   ├── useStudents.js           # 학생 CRUD
│   ├── useRubrics.js            # 루브릭 CRUD
│   ├── useEvaluations.js        # 평가 CRUD
│   └── useDashboard.js          # 통계 RPC
├── context/                     # React Context
│   ├── AuthContext.jsx
│   ├── ClassContext.jsx
│   └── EvaluationContext.jsx
├── pages/                       # 페이지
│   ├── Login.jsx                # 로그인/회원가입
│   ├── Home.jsx                 # 평가 메인
│   ├── ClassManagement.jsx      # 학급/학생 관리
│   └── Dashboard.jsx            # 통계 대시보드
├── components/                  # 컴포넌트
│   ├── auth/ProtectedRoute.jsx
│   ├── common/Navbar.jsx
│   └── evaluation/              # 평가 UI 컴포넌트
├── services/                    # 비즈니스 로직 (v1에서 유지)
│   ├── evaluator.js             # 평가 오케스트레이터
│   ├── prompts.js               # 프롬프트 생성
│   ├── responseParser.js        # AI 응답 파싱
│   ├── synthesis.js             # K-run 결과 합성
│   └── providers/               # AI API 호출 (Gemini, OpenAI, Claude)
└── data/constants.js            # 상수 정의

supabase/migrations/             # DB 마이그레이션
├── 001_initial_schema.sql       # 테이블 9개 + RLS + Trigger + RPC
└── 002_seed_data.sql            # 기본 루브릭 템플릿 4개
```

## 시작하기

### 1. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. **SQL Editor**에서 마이그레이션 파일 순서대로 실행:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_seed_data.sql
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

`http://localhost:5173` 접속

### 4. 첫 사용

1. 회원가입 (이메일 + 비밀번호)
2. 이메일 인증 확인
3. 로그인 후 **API 설정**에서 AI API 키 입력 (Gemini/OpenAI/Claude 중 택 1)
4. **학급 관리**에서 학급 생성 + 학생 등록
5. **평가** 페이지에서 채팅 내용 붙여넣기 + 루브릭 선택 + 학생 지정 + 평가 시작
6. **대시보드**에서 학급 통계 확인

## Vercel 배포

1. GitHub 저장소에 push
2. [vercel.com](https://vercel.com)에서 프로젝트 import
3. **Environment Variables** 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy 클릭

또는 CLI로:

```bash
npm run build
npx vercel --prod
```

## 데이터베이스

### 테이블 (9개)

| 테이블 | 용도 |
|--------|------|
| `profiles` | 교사 프로필 (auth.users 확장) |
| `classes` | 학급 (학년도, 학기, 교과) |
| `students` | 학생 (계정 없음, 교사 관리) |
| `rubrics` | 루브릭 (템플릿 + 커스텀) |
| `rubric_criteria` | 평가 기준 (가중치, 순서) |
| `criteria_levels` | 수준별 설명 (1~5점) |
| `evaluations` | 평가 결과 (JSONB criteria_scores) |
| `api_settings` | 교사별 API 설정 |
| `global_config` | 시스템 전역 설정 |

### 보안

- **RLS**: 모든 테이블에 적용. 교사는 자기 데이터만 접근 가능
- **API 키**: 클라이언트 localStorage에만 저장 (DB 미저장)
- **채팅 원문**: 서버에 저장하지 않음 (개인정보 보호)

### Database Functions (RPC)

| 함수 | 용도 |
|------|------|
| `get_class_dashboard(class_id)` | 학급별 통계 (등급 분포, 항목별 평균, 월별 추이, 최근 평가) |
| `get_teacher_overview(teacher_id)` | 교사 전체 개요 (학급 수, 학생 수, 총 평가 수, 평균) |

## 루브릭 템플릿

| 템플릿 | 평가 항목 |
|--------|-----------|
| 일반 AI 활용 | 질문 명확성, 반복적 개선, 비판적 사고, 실제 적용 |
| 글쓰기/국어 | 주제 탐색, 자기 목소리, 수정 과정, 자료 검증 |
| 과학 탐구 | 가설 설정, 데이터 분석, 과학적 추론, 보고서 작성 |
| 코딩/프로그래밍 | 문제 분해, 코드 이해, 디버깅, 코드 개선 |

## v1 vs v2

| 항목 | v1 | v2 |
|------|----|----|
| 저장소 | localStorage | Supabase PostgreSQL |
| 사용자 | 단일 관리자 | 다중 교사 계정 |
| 평가 기록 | 50건 제한 | 무제한 |
| 학생 관리 | 없음 | 학급별 학생 관리 |
| 통계 | 기본 성장 차트 | 학급/학생별 대시보드 |
| 보안 | SHA-256 로컬 비밀번호 | Supabase Auth (JWT) |
| 데이터 공유 | 브라우저 한정 | 다기기 동기화, 루브릭 공유 |

## 라이선스

교육 목적으로 자유롭게 사용 가능합니다.
