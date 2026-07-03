# 개념 · 실습 · 해커톤 활용 예시

## 사용법

각 주제는 같은 형식으로 본다.

전제: **해커톤 참석은 확정**. 따라서 모든 개념과 실습은 “당일 120분 안에 무엇을 만들고 어떻게 설명할지” 기준으로만 본다.

```text
개념: 무엇이고 왜 필요한가
실습: 과금 없이 로컬/읽기 중심으로 해볼 것
해커톤 활용: Study Jam Buddy에서 어떻게 말하거나 쓸 것인가
완료 기준: 이 정도면 넘어가도 됨
```

---

## 1. Streamlit

### 개념

Streamlit은 Python 코드만으로 빠르게 웹 UI를 만드는 도구다. 해커톤에서는 React/Vue 같은 프론트엔드 세팅 시간을 줄이고, 입력 폼과 결과 화면을 빠르게 만들 수 있다.

Study Jam Buddy에서는 다음 역할을 한다.

```text
학습 메모 입력창
  + 학습 목표 입력창
  + 자신감 선택
  + 결과 생성 버튼
  + AI 코칭 결과 카드
```

### 과금 없는 실습

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run src/app.py
```

확인할 것:

- `st.title()`로 앱 제목이 표시되는가
- `st.text_area()`로 학습 메모를 받는가
- `st.button()` 클릭 시 결과가 나오는가
- API 키가 없어도 fallback 결과가 나오는가

### 해커톤 활용 예시

발표에서 이렇게 말할 수 있다.

> 빠른 MVP 검증을 위해 Streamlit으로 입력-결과 흐름을 최소 구현했습니다. 해커톤 시간 안에 프론트엔드 복잡도를 줄이고, 핵심인 AI 학습 코칭 경험에 집중했습니다.

### 완료 기준

- 로컬 앱을 실행할 수 있다.
- 코드에서 입력/버튼/결과 출력 위치를 찾을 수 있다.
- UI가 심플해도 데모 흐름이 끊기지 않는다.

---

## 2. Gemini API

### 개념

Gemini API는 텍스트, 이미지 등 입력을 받아 요약, 분류, 생성, 구조화 같은 작업을 수행하는 Google AI API다.

Study Jam Buddy에서는 **비정형 학습 메모를 구조화된 복습 자료로 바꾸는 역할**을 한다.

```text
입력: "오늘 Cloud Run이랑 컨테이너 배포를 배웠는데 IAM이 헷갈림"
출력:
  - 5줄 요약
  - 복습 퀴즈
  - 약점 개념: IAM, region, service account
  - 다음 실습 체크리스트
```

### 과금 없는 실습

1. API 키 없이 fallback 모드 먼저 실행한다.
2. `src/gemini_client.py`에서 API 호출 위치를 읽는다.
3. `.env.example`을 보고 환경변수 이름만 확인한다.
4. 실제 호출은 공식 무료/크레딧 범위 확인 후 1~2회만 한다.

주의:

- API 키를 Git에 커밋하지 않는다.
- 발표 연습 때는 매번 API를 호출하지 말고 샘플 결과를 사용한다.
- API 실패 시에도 데모가 계속되어야 한다.

### 해커톤 활용 예시

> Gemini API는 학습자가 남긴 자유로운 메모를 요약, 퀴즈, 약점 개념, 다음 액션이라는 일관된 학습 자료로 구조화합니다.

### 완료 기준

- Gemini가 이 앱에서 하는 역할을 한 문장으로 설명할 수 있다.
- API 키가 없어도 데모가 가능하다.
- API 실패가 앱 전체 실패로 이어지지 않는다.

---

## 3. Prompt Engineering / Output Schema

### 개념

프롬프트는 AI에게 작업을 지시하는 입력문이다. Output schema는 AI가 어떤 형식으로 답해야 하는지 고정하는 구조다.

해커톤 데모에서는 결과가 매번 너무 달라지면 위험하다. 그래서 출력 항목을 고정한다.

```text
- 5줄 요약
- 복습 퀴즈 5개
- 약점 개념 3개
- 다음 실습 체크리스트
- 오늘 30분 액션
```

### 과금 없는 실습

`src/study_buddy.py`에서 fallback 결과를 먼저 다듬는다.

좋은 출력 조건:

- 너무 길지 않음
- 바로 행동으로 이어짐
- 발표 중 읽기 쉬움
- 학습자가 다음에 뭘 해야 하는지 명확함

샘플 입력:

```text
오늘 Cloud Run으로 컨테이너 앱을 배포하는 실습을 했다.
서비스 계정, region, allow unauthenticated 옵션이 헷갈렸다.
Gemini API는 Python에서 호출해봤지만 에러 처리와 환경변수 관리가 아직 익숙하지 않다.
```

기대 출력 방향:

```text
요약: Cloud Run 배포 흐름을 익혔지만 IAM/region/env 관리가 약함
퀴즈: Cloud Run에서 region을 고르는 이유는?
약점: IAM, 환경변수, 배포 옵션
다음 액션: 로컬 fallback → API 호출 → Cloud Run 배포 순서로 점검
```

### 해커톤 활용 예시

> 단순히 답변을 길게 생성하는 것이 아니라, 학습자가 바로 복습하고 다음 실습을 할 수 있도록 출력 구조를 고정했습니다.

### 완료 기준

- 샘플 입력 2개에 대해 발표 가능한 출력이 나온다.
- 결과를 30초 안에 설명할 수 있다.

---

## 4. Cloud Run

### 개념

Cloud Run은 컨테이너를 서버리스로 실행하는 Google Cloud 서비스다. 앱을 컨테이너로 만들면 서버 관리 없이 URL로 배포할 수 있다.

Study Jam Buddy에서는 로컬 Streamlit 앱을 공개 URL로 보여주는 배포 후보로 쓴다.

```text
Streamlit app
  → Docker container
  → Cloud Run service
  → public URL
```

### 과금 없는 실습

크레딧 확인 전에는 실제 배포하지 않는다. 대신 아래만 준비한다.

- `Dockerfile` 읽기
- Cloud Run이 컨테이너를 실행한다는 개념 이해
- 배포 명령이 어떤 일을 하는지 해석
- 배포 실패 시 로컬 데모로 전환하는 플랜 준비

크레딧 확인 후에만 1회 시도:

```bash
gcloud run deploy study-jam-buddy \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

배포 후 확인할 것:

- URL 접속 가능
- 환경변수 설정 여부
- 발표 후 서비스 삭제 방법

### 해커톤 활용 예시

> Cloud Run을 사용하면 Streamlit MVP를 컨테이너로 감싸 빠르게 공개 URL로 배포할 수 있습니다. 다만 데모 안정성을 위해 로컬 fallback도 함께 준비했습니다.

### 완료 기준

- Cloud Run이 왜 필요한지 설명 가능
- 실제 배포 없이도 배포 흐름을 말할 수 있음
- 배포 실패 시 로컬 데모로 전환 가능

---

## 5. Firestore

### 개념

Firestore는 문서 기반 NoSQL 데이터베이스다. 사용자별 학습 기록, 생성된 퀴즈, 약점 개념, 복습 이력을 저장할 수 있다.

Study Jam Buddy 확장 구조:

```text
users/{user_id}/study_notes/{note_id}
  - raw_note
  - summary
  - quiz
  - weak_concepts
  - next_actions
  - created_at
```

### 과금 없는 실습

이번 MVP에서는 Firestore를 만들지 않는다.

대신 로컬에서 이렇게 생각한다.

```json
{
  "note_id": "demo-001",
  "raw_note": "Cloud Run 실습 메모",
  "summary": ["..."],
  "quiz": ["..."],
  "weak_concepts": ["IAM", "region", "env vars"]
}
```

### 해커톤 활용 예시

> 현재 MVP는 데모 안정성을 위해 저장소를 제외했지만, 실제 서비스화 시 Firestore에 학습 기록과 복습 결과를 누적해 개인별 학습 이력을 만들 수 있습니다.

### 완료 기준

- Firestore를 왜 지금 안 쓰는지 설명 가능
- 확장 시 어떤 데이터를 저장할지 말할 수 있음

---

## 6. Cloud Storage

### 개념

Cloud Storage는 파일 저장소다. 이미지, PDF, 실습 캡처, 강의 자료 같은 파일을 저장할 수 있다.

Study Jam Buddy 확장 예시:

```text
학습 PDF 업로드
  → Cloud Storage 저장
  → Gemini로 요약
  → Firestore에 결과 저장
```

### 과금 없는 실습

이번 MVP에서는 파일 업로드를 제외한다.

이유:

- 파일 업로드 UI가 추가됨
- 파일 파싱/용량/권한 처리가 필요함
- 해커톤 120분 범위를 넘기기 쉬움

로컬 대체:

```text
uploads/sample-note.txt
```

### 해커톤 활용 예시

> 텍스트 입력 MVP를 먼저 만들고, 이후에는 Cloud Storage에 학습 자료를 저장해 PDF/이미지 기반 복습까지 확장할 수 있습니다.

### 완료 기준

- Storage는 “파일 저장용”이라고 설명 가능
- 지금은 텍스트 입력 MVP라 제외한다고 말할 수 있음

---

## 7. Google Skills / Study Jam 맥락

### 개념

Study Jam은 Google Skills 기반 학습 프로그램이다. 참가자는 강의와 실습을 통해 뱃지를 얻고, 이후 해커톤에서 배운 내용을 실제 서비스 아이디어로 연결한다.

Study Jam Buddy는 이 흐름과 직접 맞는다.

```text
학습
  → 메모
  → 복습 자료 생성
  → 다음 실습 행동
  → 해커톤 준비
```

### 과금 없는 실습

- 공식 안내 페이지와 메일에서 크레딧/수료 조건 확인
- 크레딧 등록 전 유료 실습 시작하지 않기
- 뱃지 조건과 추천 코스 확인
- 배운 내용을 Study Jam Buddy 샘플 입력으로 저장

### 해커톤 활용 예시

> 이 서비스는 Study Jam 참가자가 학습에서 끝나지 않고, 배운 내용을 다음 실습 행동으로 바꾸도록 돕습니다.

### 완료 기준

- 해커톤 주제와 앱의 연결성을 설명할 수 있음

---

## 8. 비용/과금 관리

### 개념

Google Cloud는 사용량 기반 과금이다. 무료 크레딧이 있어도 리소스 삭제를 안 하면 비용이 발생할 수 있다.

### 과금 없이 실습하는 원칙

- 개인 과금 프로젝트에서 실험하지 않기
- 공식 크레딧 범위 확인 전 배포하지 않기
- 배포가 필요하면 새 프로젝트 분리
- Budget alert 설정
- 실습 후 리소스 삭제
- API 키를 노출하지 않기

### 특히 피할 서비스

- Vertex AI Endpoint
- GPU / TPU
- GKE
- Cloud SQL
- BigQuery 대용량 쿼리
- NAT Gateway
- 장시간 VM
- Load Balancer / 고정 IP

### 해커톤 활용 예시

> 데모 안정성과 비용 통제를 위해 핵심 기능은 로컬 fallback으로 준비했고, 공식 크레딧이 확인된 경우에만 Cloud Run 배포를 시도합니다.

### 완료 기준

- 어떤 서비스가 과금 위험이 큰지 말할 수 있음
- 데모 후 삭제해야 할 리소스를 말할 수 있음

---

## 9. 120분 해커톤 구현 전략

### 개념

해커톤에서는 “가능한 모든 기능”이 아니라 “심사자가 이해할 수 있는 작은 완성”이 중요하다.

### 추천 시간 배분

| 시간 | 할 일 | 산출물 |
|---|---|---|
| 0-20분 | 주제/출력 schema 고정 | 문제 정의 1문장 |
| 20-60분 | Streamlit 입력/결과 화면 완성 | 로컬 앱 |
| 60-85분 | Gemini/fallback 연결 | 결과 카드 |
| 85-100분 | 샘플 데이터/스크린샷 준비 | 백업 데모 |
| 100-115분 | 발표 대본 정리 | 3분 발표 |
| 115-120분 | 최종 점검 | 실행 명령/URL |

### 완료 기준

- 로컬 앱이 반드시 돌아간다.
- API/배포 실패해도 발표 가능하다.
- 기능 추가 욕심을 버린다.
