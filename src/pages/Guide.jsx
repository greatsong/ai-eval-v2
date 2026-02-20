import './Guide.css'

export default function Guide() {
  return (
    <div className="guide-page">
      <div className="guide-container">
        <h1>사용 안내</h1>
        <p className="guide-subtitle">문제해결과정에 대한 평가를 돕는 AI 채팅 평가 시스템 — 과정의 증명 (Proof of Process)</p>

        {/* 빠른 시작 */}
        <section className="guide-section">
          <h2>빠른 시작 가이드</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>API 키 설정</h3>
                <p>평가 페이지 상단의 <strong>AI 설정</strong>에서 사용할 AI 제공자(Gemini, OpenAI, Claude)를 선택하고 API 키를 입력합니다.</p>
                <div className="step-hint">API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>학급 및 학생 등록</h3>
                <p><strong>학급</strong> 메뉴에서 학급을 생성하고 학생 명단을 등록합니다. CSV나 탭 구분 텍스트로 일괄 등록도 가능합니다.</p>
                <div className="step-hint">형식: 번호, 이름 (예: 1, 홍길동)</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>평가 실행</h3>
                <p>학생이 AI와 나눈 채팅 내용을 복사하여 붙여넣고, 루브릭과 학생을 선택한 뒤 <strong>평가 시작</strong>을 클릭합니다.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>결과 확인 및 활용</h3>
                <p>평가 결과에서 점수, 항목별 분석, 생활기록부 초안을 확인합니다. 대시보드에서 학급 전체 통계도 볼 수 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 평가 페이지 */}
        <section className="guide-section">
          <h2>평가 페이지 상세</h2>
          <div className="guide-card-grid">
            <div className="guide-card">
              <h3>루브릭 선택</h3>
              <p>4개의 기본 템플릿 중 교과에 맞는 것을 선택하거나, 커스텀 루브릭을 직접 만들 수 있습니다.</p>
              <table className="mini-table">
                <thead><tr><th>템플릿</th><th>적합한 교과</th></tr></thead>
                <tbody>
                  <tr><td>일반 AI 활용</td><td>범교과</td></tr>
                  <tr><td>글쓰기/국어</td><td>국어, 사회, 역사</td></tr>
                  <tr><td>과학 탐구</td><td>과학, 수학</td></tr>
                  <tr><td>코딩/프로그래밍</td><td>정보, 기술</td></tr>
                </tbody>
              </table>
            </div>

            <div className="guide-card">
              <h3>AI 제공자 설정</h3>
              <p>3종의 AI 중 하나를 선택하여 평가에 사용합니다.</p>
              <table className="mini-table">
                <thead><tr><th>제공자</th><th>추천 모델</th></tr></thead>
                <tbody>
                  <tr><td>Google Gemini</td><td>gemini-2.5-flash</td></tr>
                  <tr><td>OpenAI</td><td>gpt-4o</td></tr>
                  <tr><td>Anthropic Claude</td><td>claude-3.5-sonnet</td></tr>
                </tbody>
              </table>
            </div>

            <div className="guide-card">
              <h3>K-run 평가</h3>
              <p>동일한 채팅을 여러 번 평가하여 AI 평가의 신뢰도를 높입니다. 여러 번의 결과를 자동으로 종합합니다.</p>
              <table className="mini-table">
                <thead><tr><th>횟수</th><th>특징</th></tr></thead>
                <tbody>
                  <tr><td>1회</td><td>빠른 평가 (기본)</td></tr>
                  <tr><td>2~3회</td><td>일상적 평가에 적합</td></tr>
                  <tr><td>5회</td><td>고부담 평가에 적합</td></tr>
                </tbody>
              </table>
            </div>

            <div className="guide-card">
              <h3>채팅 붙여넣기 팁</h3>
              <p>AI 채팅 화면에서 <strong>전체 선택(Ctrl+A) → 복사(Ctrl+C)</strong> 후 붙여넣기하면 됩니다.</p>
              <div className="step-hint">사이드바, 버튼 등 불필요한 텍스트가 포함되어도 AI가 자동으로 걸러냅니다.</div>
            </div>
          </div>
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
              <p>학교 생활기록부에 기록할 수 있는 문구를 자동으로 생성합니다. 복사 버튼으로 간편하게 활용하세요.</p>
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

        {/* 학급 관리 */}
        <section className="guide-section">
          <h2>학급 관리</h2>
          <div className="guide-card-grid cols-2">
            <div className="guide-card">
              <h3>학급 생성</h3>
              <p>학급명, 학년도, 학기, 교과명을 입력하여 학급을 만듭니다. 여러 학급을 만들어 교과별, 반별로 관리할 수 있습니다.</p>
            </div>
            <div className="guide-card">
              <h3>학생 일괄 등록</h3>
              <p>엑셀이나 명단에서 복사한 텍스트를 붙여넣어 한 번에 등록합니다.</p>
              <div className="code-example">
                1, 홍길동<br/>
                2, 김철수<br/>
                3, 이영희
              </div>
            </div>
          </div>
        </section>

        {/* 대시보드 */}
        <section className="guide-section">
          <h2>대시보드</h2>
          <p>학급별로 다양한 통계를 확인할 수 있습니다.</p>
          <ul className="feature-list">
            <li>전체 학급 수, 학생 수, 평가 수, 평균 점수 한눈에 보기</li>
            <li>학급별 등급 분포 차트 (A+~F 학생 수)</li>
            <li>루브릭 항목별 평균 점수 비교 차트</li>
            <li>최근 평가 이력 테이블 (학생, 점수, 등급, 날짜)</li>
          </ul>
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
              <summary>API 키가 유출될 위험은 없나요?</summary>
              <p>API 키는 브라우저의 localStorage에만 저장되며, 서버나 데이터베이스에 전송/저장하지 않습니다. 다만 공용 컴퓨터에서는 사용 후 반드시 로그아웃하세요.</p>
            </details>
            <details className="faq-item">
              <summary>학생의 채팅 내용은 저장되나요?</summary>
              <p>아닙니다. 채팅 원문은 평가를 위해 일시적으로 AI에 전달될 뿐, 서버나 DB에 저장하지 않습니다. 개인정보 보호를 위한 설계입니다.</p>
            </details>
            <details className="faq-item">
              <summary>K-run 평가는 비용이 더 드나요?</summary>
              <p>네, K-run 횟수만큼 API 호출이 발생합니다. 2회면 2배, 5회면 5배의 API 비용이 듭니다. 일상적 평가는 1~2회, 중요한 평가는 3~5회를 권장합니다.</p>
            </details>
            <details className="faq-item">
              <summary>평가 결과가 매번 다르게 나와요.</summary>
              <p>AI 특성상 동일한 입력에도 약간의 편차가 있을 수 있습니다. K-run 평가(2회 이상)를 사용하면 여러 번의 결과를 종합하여 더 안정적인 점수를 얻을 수 있습니다.</p>
            </details>
            <details className="faq-item">
              <summary>교사 인증 코드는 어디서 받나요?</summary>
              <p>시스템 관리자에게 문의하세요. 인증 코드는 보안을 위해 주기적으로 변경됩니다.</p>
            </details>
          </div>
        </section>

        {/* 보안 안내 */}
        <section className="guide-section">
          <h2>보안 및 개인정보</h2>
          <ul className="feature-list">
            <li><strong>데이터 격리</strong> — 각 교사의 학급, 학생, 평가 데이터는 다른 교사와 완전히 분리됩니다 (Row-Level Security)</li>
            <li><strong>채팅 미저장</strong> — 학생의 AI 채팅 원문은 서버에 저장하지 않습니다</li>
            <li><strong>API 키 로컬 보관</strong> — AI API 키는 브라우저에만 저장되며 데이터베이스에 전송하지 않습니다</li>
            <li><strong>접근코드 인증</strong> — 회원가입 시 교사 인증 코드가 필요하며, 관리자가 주기적으로 변경합니다</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
