# Study Jam 해커톤 학습 가이드

## 결론

과금 없이 준비하려면 **클라우드 배포를 먼저 하지 말고**, 로컬 MVP와 발표 흐름을 먼저 완성한다. 해커톤 당일에는 공식 크레딧/안내가 확인된 범위 안에서만 Google Cloud 배포를 시도한다.

이 레포의 기본 전략은 다음이다.

```text
온라인 학습 이해
  → 로컬 Study Jam Buddy MVP
  → Gemini mock / fallback 데모
  → 발표 스토리 고정
  → 크레딧 확인 후 최소 Cloud Run 배포
```

---

## 1. Study Jam 해커톤 진행 예상

### 1) 온라인 스터디잼

- Google Skills에서 AI / Cloud / Data 관련 강의와 실습 진행
- 디지털 뱃지 획득
- 수료 조건 충족
- Skills Boost 크레딧으로 유료 학습 콘텐츠 접근 가능

### 2) 해커톤 신청/선발

- 수료 조건 충족자 중 해커톤 신청 가능
- 리소스 제한 때문에 전원 참가가 아니라 내부 선발 가능성 있음
- 뱃지 수, 학습 성실도, 신청 내용이 참고될 수 있음

### 3) 해커톤 당일

- 오프라인 단기 빌드 가능성 높음
- 팀 구성 또는 사전 팀 참여
- 주제/문제 공개 후 빠르게 MVP 제작
- Google AI / Google Cloud 활용 요구 가능성 높음
- 마지막에 데모와 발표

---

## 2. 평가에서 중요할 것

심사자는 복잡한 내부 구현보다 아래 흐름을 먼저 본다고 가정한다.

1. 문제가 10초 안에 이해되는가
2. Google AI / Cloud를 자연스럽게 썼는가
3. 데모에서 입력 → 처리 → 결과 변화가 눈에 보이는가
4. 120분 안에 완성 가능한 범위인가
5. 네트워크/API/배포가 실패해도 발표 가능한 fallback이 있는가

핵심은 **기술 과시보다 문제 → 입력 → AI/Cloud 처리 → 결과 변화**가 선명한 것이다.

---

## 3. 과금 없이 공부할 범위

상세 체크리스트는 [`free-study-topics.md`](./free-study-topics.md)를 먼저 본다.

### 꼭 익힐 것

- Gemini API 기본 개념
- Streamlit 앱 구조
- Cloud Run이 무엇인지
- Firebase / Firestore의 역할
- Cloud Storage의 역할
- Google Skills 실습 흐름
- 과금 위험 서비스 구분

### 개념만 알아도 되는 것

- Vertex AI
- BigQuery
- Cloud SQL
- Kubernetes / GKE
- VPC / NAT Gateway
- Terraform 운영 배포
- GPU

### 당장 피할 것

- 개인 과금 프로젝트에서 무지성 배포
- 장시간 서버 실행
- 대용량 BigQuery 쿼리
- GPU/Vertex AI Endpoint 생성
- Cloud SQL 인스턴스 생성
- NAT Gateway 구성

---

## 4. 로컬 MVP 연습 구조

### 기본 구조

```text
사용자 입력
  ↓
Streamlit 앱
  ↓
Gemini API 또는 fallback/mock 함수
  ↓
구조화된 학습 코칭 결과
  ↓
발표용 데모 카드
```

### 클라우드 대체표

| 실제 서비스 | 로컬/무료 준비 대체 |
|---|---|
| Gemini API | fallback/mock 응답 함수 |
| Firestore | JSON / 메모리 상태 |
| Cloud Storage | local uploads 폴더 |
| Cloud Run | `streamlit run src/app.py` |
| Vertex AI | 사용하지 않음, 개념만 이해 |

---

## 5. 이 레포의 1순위 MVP: Study Jam Buddy

### 문제

Study Jam 참가자는 많은 실습을 따라가지만, 끝나고 나면 **무엇을 이해했고, 어디가 약하고, 다음에 무엇을 해야 하는지**가 흐려지기 쉽다.

### 해결책

Study Jam Buddy는 학습 메모를 입력받아 Gemini로 다음 결과를 만든다.

```json
{
  "summary": ["5줄 요약"],
  "quiz": ["복습 문제 5개"],
  "weak_concepts": ["약한 개념 3개"],
  "next_checklist": ["다음 실습 체크리스트"],
  "thirty_min_action": "오늘 30분 안에 할 일"
}
```

### 왜 해커톤에 맞나

- Study Jam 학습 경험과 직접 연결됨
- 입력 → AI 처리 → 구조화된 출력이 명확함
- Streamlit + Gemini만으로 120분 안에 구현 가능
- API 실패 시 fallback 출력으로 데모 지속 가능
- Cloud Run 배포로 Google Cloud 활용을 설명하기 쉬움

---

## 6. 3일 학습 플랜

### Day 1 — 구조 이해

할 일:

- Study Jam 공식 페이지에서 수료 조건, 크레딧, 해커톤 조건 확인
- Gemini / Streamlit / Cloud Run 역할 정리
- 과금 위험 서비스 목록 정리
- `docs/plan.md`, `docs/judging-story.md`, `docs/idea-bank.md` 읽기

완료 기준:

- “이 앱이 왜 Google Cloud Study Jam 해커톤에 맞는지” 1분 안에 설명 가능

### Day 2 — 로컬 MVP 실행

할 일:

- 로컬 venv 생성
- 의존성 설치
- Streamlit 앱 실행
- API 키 없이 fallback 결과 확인
- 샘플 학습 메모 2개 준비

명령:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run src/app.py
```

완료 기준:

- 인터넷/API 없이도 발표용 데모 가능

### Day 3 — 발표 준비

할 일:

- 1분 문제 정의 암기
- 2분 데모 흐름 연습
- 1분 아키텍처 설명 연습
- API/배포 실패 시 fallback 멘트 준비

완료 기준:

- 배포 실패해도 로컬 화면과 fallback 출력으로 발표 가능

---

## 7. 발표 템플릿

### 1문장 문제 정의

> 스터디잼 참가자는 많은 실습을 하지만, 무엇을 이해했고 다음에 무엇을 해야 하는지 정리하기 어렵습니다.

### 해결책

> Study Jam Buddy는 학습 내용을 입력하면 요약, 퀴즈, 약점 개념, 다음 실습 체크리스트를 자동 생성합니다.

### 데모 흐름

1. 사용자가 학습 메모 입력
2. 현재 자신감 선택
3. AI가 5줄 요약 생성
4. 복습 퀴즈와 약한 개념 생성
5. 다음 실습 체크리스트와 오늘 30분 액션 제안

### 아키텍처 설명

```text
Streamlit UI
  → study_buddy.py prompt builder
  → gemini_client.py
  → Gemini API or fallback
  → Result Card
```

### fallback 멘트

> 현재 데모는 과금 방지를 위해 fallback 모드로도 실행 가능하게 만들었습니다. 해커톤 크레딧이 제공되면 같은 인터페이스에서 Gemini API와 Cloud Run 배포로 전환할 수 있습니다.

---

## 8. 과금 방지 체크리스트

- [ ] 개인 GCP 과금 프로젝트에서 무지성 배포하지 않기
- [ ] Skills Boost / 공식 크레딧 범위 먼저 확인
- [ ] 새 GCP 프로젝트 분리
- [ ] Budget alert 설정
- [ ] Cloud Run 서비스 실행 후 삭제
- [ ] Firestore / Storage 테스트 데이터 삭제
- [ ] Vertex AI / BigQuery / GPU / Cloud SQL 사용 금지 또는 최소화
- [ ] 최종 데모는 fallback 모드 유지

---

## 9. 당일 전략

백엔드 개발자 강점은 화려한 UI보다 **안정적인 구조, 명확한 API 경계, 장애 대비**에 있다.

따라서 해커톤에서는:

- 큰 서비스 만들기 X
- 작고 선명한 MVP 만들기 O
- 배포 성공에 올인 X
- 로컬 데모 + Cloud Run 확장 가능성 설명 O
- API 장애 대비 없는 실시간 호출 데모 X
- fallback 결과가 준비된 데모 O

최종 목표는 **“실제로 작동하는 작은 도구 + 왜 Google Cloud로 확장 가능한지 설명”**이다.
