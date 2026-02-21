import './Guide.css'

export default function Guide() {
  return (
    <div className="guide-page">
      <div className="guide-container">
        <h1>사용 안내</h1>
        <p className="guide-subtitle">AI 채팅 평가 시스템 — 과정의 증명 (Proof of Process)</p>

        {/* 시스템 개요 */}
        <section className="guide-section">
          <h2>시스템 개요</h2>
          <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.7 }}>
            학생이 AI(ChatGPT, Gemini, Claude 등)와 나눈 대화를 <strong>루브릭 기반</strong>으로 자동 평가합니다.
            교사는 학급을 만들고 <strong>평가 세션</strong>을 구성한 뒤 초대코드를 학생에게 안내하면,
            학생은 별도 로그인 없이 채팅 내용을 제출하고 즉시 결과를 확인할 수 있습니다.
          </p>
        </section>

        {/* 교사 빠른 시작 */}
        <section className="guide-section">
          <h2>교사 빠른 시작 가이드</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>학급 생성 + 학생 등록</h3>
                <p><strong>학급 관리</strong> 메뉴에서 학급을 만들고 학생 명단을 등록합니다. CSV나 탭 구분 텍스트로 일괄 등록도 가능합니다.</p>
                <div className="step-hint">형식: 번호, 이름 (예: 1, 홍길동)</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>학생 평가 설정</h3>
                <p>학급 관리에서 <strong>학생 평가 설정</strong>을 열어 AI 제공자/API 키/모델을 설정합니다. 이 설정은 학급 내 모든 평가 세션에 공통 적용됩니다.</p>
                <div className="step-hint">API 키는 학급 단위로 저장되며, 학생이 평가할 때 사용됩니다.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>평가 세션 만들기</h3>
                <p>같은 학급에서 과목/활동별로 <strong>평가 세션</strong>을 만들 수 있습니다. 세션마다 다른 루브릭을 지정하고, 고유한 초대코드가 자동 생성됩니다.</p>
                <div className="step-hint">예: "국어 글쓰기 평가" → 글쓰기 루브릭, "과학 탐구 평가" → 과학 루브릭</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>초대코드 + URL 안내</h3>
                <p>학생에게 <strong>평가 페이지 URL</strong>과 <strong>초대코드</strong>를 알려줍니다. 학생은 로그인 없이 코드만으로 접속합니다.</p>
                <div className="step-hint">평가 URL: {window.location.origin}/proofai</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>대시보드에서 결과 확인</h3>
                <p><strong>대시보드</strong>에서 학급별 통계, 등급 분포, 항목별 평균, 월별 점수 추이, 최근 평가 이력을 확인합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 학생 평가 흐름 */}
        <section className="guide-section">
          <h2>학생 평가 흐름</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>초대코드 입력</h3>
                <p>선생님에게 받은 초대코드를 입력하면 학급과 평가 루브릭이 자동으로 연결됩니다.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>본인 확인</h3>
                <p>출석 번호를 입력하면 이름이 표시됩니다. 본인이 맞는지 확인 후 다음으로 진행합니다.</p>
                <div className="step-hint">다른 학생의 이름은 보이지 않아 개인정보가 보호됩니다.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>채팅 내용 제출</h3>
                <p>AI와 나눈 채팅 화면에서 <strong>전체 선택(Ctrl+A) → 복사(Ctrl+C)</strong> 후 붙여넣기합니다.</p>
                <div className="step-hint">사이드바, 버튼 등 불필요한 텍스트가 포함되어도 AI가 자동으로 걸러냅니다.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>결과 확인 + PDF 다운로드</h3>
                <p>평가 완료 후 점수, 등급, 항목별 분석, 개선 제안을 바로 확인합니다. PDF 보고서를 다운로드하여 선생님께 제출할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 평가 세션 */}
        <section className="guide-section">
          <h2>평가 세션이란?</h2>
          <div className="guide-card-grid cols-2">
            <div className="guide-card">
              <h3>하나의 학급, 여러 평가</h3>
              <p>같은 학급(같은 학생 명단)에서 과목/활동별로 서로 다른 루브릭을 적용해야 할 때, 평가 세션을 여러 개 만들면 됩니다.</p>
              <div className="step-hint" style={{ marginTop: '0.5rem' }}>
                학급 = 학생 명단, 세션 = 루브릭 + 초대코드
              </div>
            </div>
            <div className="guide-card">
              <h3>초대코드 분리</h3>
              <p>세션마다 고유한 초대코드가 생성됩니다. 학생에게 해당 과목의 초대코드만 안내하면 자동으로 맞는 루브릭이 적용됩니다.</p>
              <div className="code-example">
                정보 AI 평가 → COMEDU01<br/>
                국어 글쓰기 → COMEDU02<br/>
                과학 탐구 → COMEDU03
              </div>
            </div>
          </div>
        </section>

        {/* 루브릭 */}
        <section className="guide-section">
          <h2>기본 루브릭 템플릿</h2>
          <div className="guide-card-grid">
            <div className="guide-card">
              <h3>일반 AI 활용</h3>
              <p>범교과 활용에 적합합니다.</p>
              <table className="mini-table">
                <thead><tr><th>평가 항목</th><th>가중치</th></tr></thead>
                <tbody>
                  <tr><td>질문의 명확성</td><td>20%</td></tr>
                  <tr><td>반복적 개선</td><td>25%</td></tr>
                  <tr><td>비판적 사고</td><td>25%</td></tr>
                  <tr><td>실제 적용</td><td>30%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="guide-card">
              <h3>글쓰기/국어</h3>
              <p>국어, 사회, 역사 등 글쓰기 중심 교과에 적합합니다.</p>
              <table className="mini-table">
                <thead><tr><th>평가 항목</th><th>가중치</th></tr></thead>
                <tbody>
                  <tr><td>주제 탐색</td><td>20%</td></tr>
                  <tr><td>자기 목소리</td><td>30%</td></tr>
                  <tr><td>수정 과정</td><td>25%</td></tr>
                  <tr><td>자료 검증</td><td>25%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="guide-card">
              <h3>과학 탐구</h3>
              <p>과학, 수학 탐구 활동에 적합합니다.</p>
              <table className="mini-table">
                <thead><tr><th>평가 항목</th><th>가중치</th></tr></thead>
                <tbody>
                  <tr><td>가설 설정</td><td>25%</td></tr>
                  <tr><td>데이터 분석</td><td>25%</td></tr>
                  <tr><td>과학적 추론</td><td>25%</td></tr>
                  <tr><td>보고서 작성</td><td>25%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="guide-card">
              <h3>코딩/프로그래밍</h3>
              <p>정보, 기술 교과에 적합합니다.</p>
              <table className="mini-table">
                <thead><tr><th>평가 항목</th><th>가중치</th></tr></thead>
                <tbody>
                  <tr><td>문제 분해</td><td>25%</td></tr>
                  <tr><td>코드 이해</td><td>25%</td></tr>
                  <tr><td>디버깅</td><td>25%</td></tr>
                  <tr><td>코드 개선</td><td>25%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="step-hint" style={{ marginTop: '0.75rem' }}>
            기본 템플릿 외에도 평가 페이지에서 커스텀 루브릭을 직접 만들 수 있습니다.
          </div>
        </section>

        {/* AI 설정 */}
        <section className="guide-section">
          <h2>AI 제공자 설정</h2>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
            교사 평가와 학생 평가에서 각각 AI 설정이 필요합니다.
          </p>
          <div className="guide-card-grid cols-2">
            <div className="guide-card">
              <h3>교사 직접 평가</h3>
              <p>평가 페이지 상단의 <strong>AI 설정</strong>에서 제공자를 선택하고 API 키를 입력합니다. 브라우저에만 저장됩니다.</p>
            </div>
            <div className="guide-card">
              <h3>학생 자기 평가</h3>
              <p><strong>학급 관리 → 학생 평가 설정</strong>에서 설정합니다. 학급 단위로 DB에 저장되며, 해당 학급의 모든 세션에서 공통 사용됩니다.</p>
            </div>
          </div>
          <table className="mini-table" style={{ marginTop: '1rem', background: 'white', borderRadius: '8px' }}>
            <thead><tr><th>제공자</th><th>추천 모델</th><th>발급처</th></tr></thead>
            <tbody>
              <tr>
                <td>Google Gemini</td>
                <td>gemini-2.5-flash</td>
                <td><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>AI Studio (무료)</a></td>
              </tr>
              <tr>
                <td>OpenAI</td>
                <td>gpt-4.1-mini</td>
                <td><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>OpenAI Platform</a></td>
              </tr>
              <tr>
                <td>Anthropic Claude</td>
                <td>claude-haiku-4-5</td>
                <td><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>Anthropic Console</a></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 대시보드 */}
        <section className="guide-section">
          <h2>대시보드</h2>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem' }}>학급별로 다양한 통계를 확인할 수 있습니다.</p>
          <ul className="feature-list">
            <li><strong>전체 개요</strong> — 학급 수, 학생 수, 총 평가 수, 전체 평균 한눈에 보기</li>
            <li><strong>등급 분포</strong> — A+ ~ F 등급별 학생 수를 막대 그래프로 표시</li>
            <li><strong>월별 점수 추이</strong> — 월별 평균 점수 변화를 꺾은선 그래프로 시각화</li>
            <li><strong>항목별 평균</strong> — 루브릭 평가 항목별 달성률(%) 비교</li>
            <li><strong>최근 평가 이력</strong> — 학생별 점수, 등급, 날짜 테이블</li>
          </ul>
        </section>

        {/* K-run 평가 */}
        <section className="guide-section">
          <h2>K-run 평가</h2>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem' }}>
            동일한 채팅을 여러 번 평가하여 AI 평가의 신뢰도를 높입니다. 교사 직접 평가에서 사용할 수 있습니다.
          </p>
          <table className="mini-table" style={{ background: 'white', borderRadius: '8px' }}>
            <thead><tr><th>횟수</th><th>특징</th><th>권장 용도</th></tr></thead>
            <tbody>
              <tr><td>1회</td><td>빠른 평가 (기본)</td><td>일상적 형성평가</td></tr>
              <tr><td>2~3회</td><td>적절한 신뢰도</td><td>수행평가</td></tr>
              <tr><td>5회</td><td>높은 신뢰도</td><td>고부담 평가</td></tr>
            </tbody>
          </table>
        </section>

        {/* 평가 결과 */}
        <section className="guide-section">
          <h2>평가 결과 항목</h2>
          <div className="result-desc-list">
            <div className="result-desc-item">
              <strong>총점 및 등급</strong>
              <p>100점 만점으로 환산된 점수와 등급(A+~F)이 표시됩니다.</p>
            </div>
            <div className="result-desc-item">
              <strong>항목별 상세</strong>
              <p>각 루브릭 기준별로 점수, 근거, 강점, 약점, 개선 방향이 제시됩니다.</p>
            </div>
            <div className="result-desc-item">
              <strong>학습자 특성</strong>
              <p>AI가 분석한 학생의 주요 학습 특성 3~5가지가 키워드로 제시됩니다.</p>
            </div>
            <div className="result-desc-item">
              <strong>정성 평가</strong>
              <p>학생의 AI 활용 과정에 대한 전체적인 서술형 평가입니다.</p>
            </div>
            <div className="result-desc-item">
              <strong>개선 제안</strong>
              <p>학생이 다음에 AI를 활용할 때 개선할 수 있는 구체적 행동 제안입니다.</p>
            </div>
            <div className="result-desc-item">
              <strong>생활기록부 초안</strong>
              <p>학교 생활기록부에 기록할 수 있는 문구를 자동으로 생성합니다.</p>
            </div>
            <div className="result-desc-item">
              <strong>PDF 보고서</strong>
              <p>평가 결과 전체를 PDF로 다운로드할 수 있습니다. 학생은 이 보고서를 선생님께 제출합니다.</p>
            </div>
          </div>
        </section>

        {/* 등급 기준 */}
        <section className="guide-section">
          <h2>등급 기준표</h2>
          <table className="grade-table">
            <thead>
              <tr><th>등급</th><th>점수 범위</th><th>등급</th><th>점수 범위</th></tr>
            </thead>
            <tbody>
              <tr><td><span className="grade-pill a-plus">A+</span></td><td>95~100</td><td><span className="grade-pill c-plus">C+</span></td><td>75~79</td></tr>
              <tr><td><span className="grade-pill a">A</span></td><td>90~94</td><td><span className="grade-pill c">C</span></td><td>70~74</td></tr>
              <tr><td><span className="grade-pill b-plus">B+</span></td><td>85~89</td><td><span className="grade-pill d-plus">D+</span></td><td>65~69</td></tr>
              <tr><td><span className="grade-pill b">B</span></td><td>80~84</td><td><span className="grade-pill d">D</span></td><td>60~64</td></tr>
              <tr><td colSpan="2"></td><td><span className="grade-pill f">F</span></td><td>0~59</td></tr>
            </tbody>
          </table>
        </section>

        {/* FAQ */}
        <section className="guide-section">
          <h2>자주 묻는 질문</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary>API 키는 어디서 발급받나요?</summary>
              <p>
                <strong>Gemini</strong>: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>에서 무료 발급<br/>
                <strong>OpenAI</strong>: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a>에서 발급 (유료)<br/>
                <strong>Claude</strong>: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Anthropic Console</a>에서 발급 (유료)
              </p>
            </details>
            <details className="faq-item">
              <summary>학생에게 API 키를 공유해야 하나요?</summary>
              <p>아닙니다. 교사가 <strong>학급 관리 → 학생 평가 설정</strong>에서 API 키를 설정하면, 학생은 초대코드만으로 평가할 수 있습니다. API 키는 학생에게 노출되지 않습니다.</p>
            </details>
            <details className="faq-item">
              <summary>같은 학급에서 여러 과목을 평가할 수 있나요?</summary>
              <p>네. <strong>평가 세션</strong>을 과목별로 만들면 같은 학생 명단에 서로 다른 루브릭을 적용할 수 있습니다. 세션마다 고유한 초대코드가 생성됩니다.</p>
            </details>
            <details className="faq-item">
              <summary>학생의 채팅 내용은 저장되나요?</summary>
              <p>아닙니다. 채팅 원문은 평가를 위해 일시적으로 AI에 전달될 뿐, 서버나 DB에 저장하지 않습니다. 개인정보 보호를 위한 설계입니다.</p>
            </details>
            <details className="faq-item">
              <summary>평가 결과가 매번 다르게 나와요.</summary>
              <p>AI 특성상 동일한 입력에도 약간의 편차가 있을 수 있습니다. K-run 평가(2회 이상)를 사용하면 여러 번의 결과를 종합하여 더 안정적인 점수를 얻을 수 있습니다.</p>
            </details>
            <details className="faq-item">
              <summary>교사 인증 코드는 어디서 받나요?</summary>
              <p>시스템 관리자에게 문의하세요. 인증 코드는 보안을 위해 주기적으로 변경됩니다.</p>
            </details>
            <details className="faq-item">
              <summary>학생이 다른 학생의 이름을 볼 수 있나요?</summary>
              <p>아닙니다. 학생은 자기 출석 번호를 입력하고 본인 이름만 확인합니다. 다른 학생의 명단은 표시되지 않습니다.</p>
            </details>
          </div>
        </section>

        {/* 보안 안내 */}
        <section className="guide-section">
          <h2>보안 및 개인정보</h2>
          <ul className="feature-list">
            <li><strong>데이터 격리</strong> — 각 교사의 학급, 학생, 평가 데이터는 다른 교사와 완전히 분리됩니다 (Row-Level Security)</li>
            <li><strong>채팅 미저장</strong> — 학생의 AI 채팅 원문은 서버에 저장하지 않습니다</li>
            <li><strong>학생 프라이버시</strong> — 학생은 자기 번호만 입력하며, 다른 학생의 이름은 볼 수 없습니다</li>
            <li><strong>접근코드 인증</strong> — 회원가입 시 교사 인증 코드가 필요하며, 관리자가 주기적으로 변경합니다</li>
            <li><strong>학생 무인증 접근</strong> — 학생은 로그인 없이 초대코드만으로 접속하며, 교사의 API 키가 내부적으로 사용됩니다</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
