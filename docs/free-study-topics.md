# 과금 없이 공부할 것들

## 결론

해커톤 전에는 **돈 드는 클라우드 리소스를 만들지 않고**, 아래만 공부한다.

1. 로컬에서 앱을 만들 수 있는 능력
2. Gemini API를 “어떻게 붙이는지” 이해
3. Cloud Run / Firestore / Storage를 “왜 쓰는지” 설명하는 능력
4. 과금 위험 서비스를 구분하는 능력
5. 배포 실패 시에도 데모 가능한 fallback 구조

목표는 클라우드 운영자가 되는 것이 아니라, **120분 안에 작동하는 MVP를 만들고 설명하는 것**이다.

---

## 0. 공부 원칙

### 해야 할 것

- 공식 문서/Skills Boost 실습은 읽고 따라가되, 개인 과금 프로젝트 생성은 최소화
- API 키 없이도 동작하는 mock/fallback 먼저 구현
- 로컬에서 실행되는 Streamlit MVP 먼저 완성
- Cloud 서비스는 “역할과 연결 방식” 중심으로 이해
- 해커톤 당일 공식 크레딧이 확인되기 전까지 배포는 선택사항으로 둠

### 하지 말 것

- 개인 GCP 과금 계정으로 무지성 배포
- Vertex AI Endpoint, GPU, Cloud SQL, BigQuery 대용량 쿼리 생성
- GKE/Kubernetes 학습에 시간 쓰기
- Terraform/복잡한 인프라 자동화에 시간 쓰기
- 로그인/권한/DB 설계에 과투자

---

## 1. Python / Streamlit

### 왜 공부하나

해커톤 120분 안에 화면 있는 MVP를 만들기 가장 빠른 조합이다. 프론트엔드 프레임워크를 따로 구성하지 않아도 입력 폼, 버튼, 결과 카드를 바로 만들 수 있다.

### 공부할 것

- `streamlit run src/app.py` 실행 흐름
- `st.text_area`, `st.selectbox`, `st.button`
- 입력값 검증
- 결과를 섹션별로 출력하기
- API 실패 시 fallback 결과 출력하기

### 완료 기준

- 학습 메모를 입력하면 결과 카드가 나온다.
- API 키가 없어도 앱이 죽지 않는다.

### 이 레포에서 볼 파일

- `src/app.py`
- `src/study_buddy.py`
- `tests/test_study_buddy.py`

---

## 2. Gemini API 기본

### 왜 공부하나

해커톤에서 Google AI 활용을 보여주는 핵심이다. 단, 깊은 모델 튜닝보다 **비정형 입력을 구조화된 출력으로 바꾸는 흐름**이 중요하다.

### 공부할 것

- Gemini가 하는 일: 텍스트 입력 → 텍스트/구조화 결과 생성
- API key를 환경변수로 넣는 방식
- prompt 구성
- 출력 형식 고정하기
- API 실패/할당량 초과/네트워크 실패 시 fallback 처리

### 과금 없이 공부하는 방법

- 먼저 `src/study_buddy.py`의 fallback 로직으로 연습
- 실제 API 호출은 공식 무료/크레딧 범위 확인 후 최소 횟수만 테스트
- 같은 입력을 여러 번 호출하지 말고 샘플 응답을 저장해서 발표 연습

### 완료 기준

- “Gemini가 학습 메모를 요약/퀴즈/체크리스트로 구조화한다”고 설명 가능
- API 키가 없어도 mock 결과로 데모 가능

### 이 레포에서 볼 파일

- `src/gemini_client.py`
- `src/study_buddy.py`
- `.env.example`

---

## 3. Prompt / Output Schema

### 왜 공부하나

해커톤 데모는 결과가 일관돼야 한다. 프롬프트가 흔들리면 발표 중 결과가 산만해진다.

### 공부할 것

- 입력값: 학습 메모, 학습 목표, 자신감
- 출력값 고정:
  - 5줄 요약
  - 복습 퀴즈 5개
  - 약점 개념 3개
  - 다음 실습 체크리스트
  - 오늘 30분 액션
- 너무 긴 답변 방지
- 발표용으로 읽기 쉬운 문장 만들기

### 완료 기준

- 같은 입력에 대해 발표 가능한 형식의 결과가 나온다.
- 결과를 30초 안에 설명할 수 있다.

---

## 4. Cloud Run 개념

### 왜 공부하나

Streamlit 앱을 컨테이너로 배포해서 URL로 보여줄 수 있는 서비스다. 해커톤에서 “Google Cloud로 배포 가능하다”는 설명에 쓰기 좋다.

### 공부할 것

- Cloud Run은 컨테이너를 실행하는 서버리스 서비스
- Dockerfile이 왜 필요한지
- 요청이 없으면 scale down될 수 있다는 개념
- 환경변수로 API key를 주입하는 방식
- 배포 후 URL이 생기는 흐름

### 과금 없이 공부하는 방법

- 실제 배포 전에는 Docker/Cloud Run 개념만 정리
- 로컬 실행을 기본 데모로 유지
- 공식 크레딧 확인 후에만 1회 배포 시도
- 배포했다면 발표 후 서비스 삭제

### 완료 기준

- “로컬 Streamlit 앱을 컨테이너로 감싸 Cloud Run에 올릴 수 있다”고 설명 가능
- 배포 실패해도 로컬 데모로 발표 가능

### 이 레포에서 볼 파일

- `Dockerfile`
- `.dockerignore`
- `stages/03-cloud-run-deploy/README.md`

---

## 5. Firestore 개념

### 왜 공부하나

학습 기록, 복습 결과, 사용자별 히스토리를 저장하는 데 쓸 수 있다. 하지만 현재 MVP에는 필수 아님.

### 공부할 것

- Firestore는 문서 기반 NoSQL DB
- collection / document 개념
- Study Jam Buddy에 붙이면 저장할 수 있는 것:
  - 학습 메모
  - 생성된 퀴즈
  - 약점 개념
  - 다음 액션

### 과금 없이 공부하는 방법

- 실제 Firestore 생성하지 말고 JSON 저장으로 대체
- 발표에서는 “향후 Firestore에 저장 가능” 정도로 설명

### 완료 기준

- Firestore를 왜 쓰는지 설명 가능
- 지금 MVP에서 왜 제외했는지 설명 가능

---

## 6. Cloud Storage 개념

### 왜 공부하나

파일 업로드, 이미지, PDF, 학습자료 저장에 쓰인다. 하지만 120분 MVP에는 위험도가 높다.

### 공부할 것

- Cloud Storage는 파일/object 저장소
- 버킷, 객체 개념
- Study Jam Buddy에 붙이면 가능한 확장:
  - 학습 PDF 업로드
  - 실습 캡처 저장
  - 발표 자료 저장

### 과금 없이 공부하는 방법

- 실제 버킷 생성하지 않기
- 로컬 `uploads/` 폴더로 개념만 대체
- 파일 업로드 기능은 이번 MVP 범위에서 제외

### 완료 기준

- “파일 저장이 필요해지면 Cloud Storage를 쓴다”고 설명 가능
- 지금은 텍스트 입력 MVP라 필요 없다고 판단 가능

---

## 7. Google Skills / Study Jam 흐름

### 왜 공부하나

해커톤 아이디어가 행사 맥락과 맞아야 한다. Study Jam Buddy는 Study Jam 학습자를 직접 돕는 도구라서 행사 fit이 좋다.

### 공부할 것

- Google Skills에서 뱃지를 얻는 흐름
- Skill Badge / Completion Badge 차이
- 크레딧 등록 후 실습하는 방식
- 수료 조건
- 해커톤 신청/선발 조건

### 과금 없이 공부하는 방법

- 공식 안내 메일과 사이트 먼저 확인
- 크레딧 등록 전 유료 콘텐츠 수강/실습 시작하지 않기
- 안내된 Skills Boost 크레딧 안에서만 실습

### 완료 기준

- “Study Jam Buddy가 왜 Study Jam 참가자에게 필요한지” 설명 가능

---

## 8. 과금 위험 서비스 구분

### 왜 공부하나

해커톤 준비 중 실수로 비용이 나가는 것을 막기 위해서다.

### 비교적 안전하게 개념만 볼 것

- Cloud Run
- Firestore
- Cloud Storage
- Gemini API
- Cloud Build

단, 안전하다는 뜻은 “무료”가 아니라 **작게 쓰면 관리 가능**하다는 뜻이다. 공식 크레딧/무료 범위 확인 전에는 실제 생성하지 않는다.

### 피할 것

- Vertex AI Endpoint
- GPU / TPU
- GKE
- Cloud SQL
- BigQuery 대용량 쿼리
- NAT Gateway
- 장시간 실행 VM
- 고정 IP / Load Balancer

### 완료 기준

- 배포 전 “이 서비스가 계속 돈을 먹는지” 판단 가능
- 실습 후 삭제해야 할 리소스를 말할 수 있음

---

## 9. 발표/데모 준비

### 왜 공부하나

해커톤은 구현만 보는 게 아니라, 짧은 시간에 문제와 결과를 설득해야 한다.

### 공부할 것

- 1문장 문제 정의
- 30초 솔루션 설명
- 90초 데모
- 30초 Google Cloud fit 설명
- 10초 fallback 설명

### 완료 기준

- 배포가 실패해도 로컬 화면으로 3분 발표 가능
- Gemini API가 실패해도 fallback 결과로 데모 가능

### 이 레포에서 볼 파일

- `docs/judging-story.md`
- `docs/studyjam-hackathon-guide.md`

---

## 10. 추천 학습 순서

### 1순위: 오늘 바로 할 것

1. `README.md` 빠른 시작 실행
2. `src/app.py` 화면 구조 읽기
3. `src/study_buddy.py` fallback 결과 읽기
4. API 키 없이 데모 실행
5. `docs/judging-story.md` 3분 발표 흐름 읽기

### 2순위: 그다음 할 것

1. Gemini API 붙이는 흐름 이해
2. prompt/output schema 다듬기
3. 샘플 학습 메모 2개 준비
4. fallback 결과를 발표용으로 자연스럽게 만들기

### 3순위: 크레딧 확인 후 할 것

1. Gemini API 실제 호출 1~2회 테스트
2. Cloud Run 배포 1회 테스트
3. 배포 URL 확인
4. 리소스 삭제 방법 확인

---

## 11. 학습 완료 체크리스트

- [ ] 로컬에서 Streamlit 앱 실행 가능
- [ ] API 키 없이 fallback 데모 가능
- [ ] Gemini API가 이 MVP에서 하는 역할 설명 가능
- [ ] Cloud Run이 왜 필요한지 설명 가능
- [ ] Firestore/Storage를 왜 지금 제외했는지 설명 가능
- [ ] 과금 위험 서비스 5개 이상 말할 수 있음
- [ ] 3분 발표 가능
- [ ] 배포 실패 시 fallback 멘트 준비됨

---

## 한 줄 전략

**과금 없이 공부할 때는 “실제 클라우드 리소스 생성”보다 “로컬 MVP + Google Cloud 역할 설명 + fallback 데모”를 먼저 끝낸다.**
