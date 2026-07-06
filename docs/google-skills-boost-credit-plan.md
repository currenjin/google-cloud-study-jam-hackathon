# Google Skills Boost 크레딧 사용 계획

## 결론

남은 Google Skills Boost 크레딧은 아래 순서로 쓴다.

```text
Gemini / Vertex AI
  → Cloud Run 배포
  → Firebase
  → RAG / 문서·데이터 AI
  → Secret Manager / IAM
```

해커톤 준비의 목표는 클라우드 전문가가 되는 것이 아니라, **120분 안에 AI 기능이 있는 MVP를 만들고 시연하는 것**이다. 따라서 크레딧은 “당일 바로 써먹는 실습”에만 집중해서 사용한다.

---

## 1순위: Gemini / Vertex AI

### 꼭 할 것

| Skills Boost 검색어 | 목적 | 해커톤 활용 |
|---|---|---|
| [Prompt Design in Vertex AI](https://www.cloudskillsboost.google/catalog?keywords=Prompt%20Design%20in%20Vertex%20AI) | 프롬프트 설계, 구조화 출력 | 데모 결과를 안정적으로 만들기 |
| [Explore Generative AI with the Gemini API in Vertex AI](https://www.cloudskillsboost.google/catalog?keywords=Explore%20Generative%20AI%20with%20the%20Gemini%20API%20in%20Vertex%20AI) | Gemini API 호출 흐름 이해 | Study Jam Buddy의 AI 엔진 설명 |
| [Develop GenAI Apps with Gemini and Streamlit](https://www.cloudskillsboost.google/catalog?keywords=Develop%20GenAI%20Apps%20with%20Gemini%20and%20Streamlit) | 빠른 GenAI 앱 제작 | 화면 있는 MVP 구성 |

### 왜 먼저 하나

해커톤에서 가장 중요한 것은 “입력 → AI 처리 → 결과 변화”가 눈에 보이는 것이다.

이번 레포의 MVP인 **Study Jam Buddy / Hackathon Co-pilot** 기준으로는 다음 역량이 바로 필요하다.

- 학습 메모를 Gemini 입력으로 바꾸기
- 출력 형식을 요약 / 퀴즈 / 약점 / 다음 액션으로 고정하기
- API 실패 시 fallback과 같은 형태로 결과 보여주기
- 발표 때 “Google AI를 어떻게 썼는지” 설명하기

---

## 2순위: Cloud Run 배포

### 할 것

| Skills Boost 검색어 | 목적 | 해커톤 활용 |
|---|---|---|
| [Deploying a Containerized Web Application](https://www.cloudskillsboost.google/catalog?keywords=Deploying%20a%20Containerized%20Web%20Application) | 컨테이너 앱 배포 | Streamlit/FastAPI 앱 배포 감각 |
| [Developing Applications with Cloud Run on Google Cloud](https://www.cloudskillsboost.google/catalog?keywords=Developing%20Applications%20with%20Cloud%20Run%20on%20Google%20Cloud) | Cloud Run 앱 개발 흐름 | 배포 URL 확보 |
| [Cloud Run Functions: Qwik Start](https://www.cloudskillsboost.google/catalog?keywords=Cloud%20Run%20Functions%20Qwik%20Start) | 서버리스 함수 기본 | 간단한 API / webhook 확장 |

### 왜 하나

로컬 앱만 있으면 시연은 가능하지만, 배포 URL이 있으면 완성도가 올라간다.

다만 Cloud Run은 **크레딧 범위 확인 후 1회만 시도**한다. 배포가 막히면 로컬 Streamlit + fallback 모드로 발표한다.

---

## 3순위: Firebase

### 할 것

| Skills Boost 검색어 | 목적 | 해커톤 활용 |
|---|---|---|
| [Build Apps & Websites with Firebase](https://www.cloudskillsboost.google/catalog?keywords=Build%20Apps%20Websites%20with%20Firebase) | Firebase 전체 흐름 | 웹 MVP 빠른 구성 |
| [Firebase Authentication](https://www.cloudskillsboost.google/catalog?keywords=Firebase%20Authentication) | 로그인 | 사용자별 학습 기록 확장 |
| [Cloud Firestore](https://www.cloudskillsboost.google/catalog?keywords=Cloud%20Firestore) | 문서 DB | 학습 메모 / 결과 저장 |
| [Firebase Hosting](https://www.cloudskillsboost.google/catalog?keywords=Firebase%20Hosting) | 프론트 배포 | 정적 웹 데모 확장 |

### 왜 하나

Firebase는 인증 / DB / 호스팅을 빠르게 붙일 수 있다. 프론트엔드 중심 팀이 되거나, 사용자별 기록 기능이 필요하면 Cloud Run보다 우선도가 올라간다.

이번 레포에서는 당장 필수는 아니다. 지금은 로컬 상태 / JSON / fallback으로 대체하고, 해커톤 주제가 사용자 데이터 저장을 요구할 때만 확장한다.

---

## 4순위: RAG / 문서·데이터 AI

### 할 것

| Skills Boost 검색어 | 목적 | 해커톤 활용 |
|---|---|---|
| [Inspect Rich Documents with Gemini Multimodality and Multimodal RAG](https://www.cloudskillsboost.google/catalog?keywords=Inspect%20Rich%20Documents%20with%20Gemini%20Multimodality%20and%20Multimodal%20RAG) | 문서/이미지 기반 RAG | 자료 기반 Q&A / 요약 |
| [Build a Multi-Modal GenAI Application: Challenge Lab](https://www.cloudskillsboost.google/catalog?keywords=Build%20a%20Multi-Modal%20GenAI%20Application%20Challenge%20Lab) | 멀티모달 앱 실습 | 이미지/문서 입력 데모 |
| [Document AI](https://www.cloudskillsboost.google/catalog?keywords=Document%20AI) | 문서 OCR / 구조화 | PDF, 영수증, 신청서 자동화 |
| [BigQuery Basics](https://www.cloudskillsboost.google/catalog?keywords=BigQuery%20Basics) | 데이터 분석 기본 | 데이터형 주제 대응 |

### 왜 하나

단순 챗봇보다 **우리 데이터 기반 AI**가 더 설득력 있다.

예시:

- Study Jam 자료 기반 Q&A
- 학습 노트 / PDF 요약
- 회의록 분석
- 정책 / 약관 / 공지 기반 상담봇
- 이미지 + 문서 기반 멀티모달 데모

단, 120분 해커톤에서는 RAG 전체를 새로 만들기보다 “확장 방향”으로 설명하고, 실제 구현은 Gemini + 구조화 출력 중심으로 유지한다.

---

## 5순위: 보안 / 운영 최소 세트

### 할 것

| Skills Boost 검색어 | 목적 | 해커톤 활용 |
|---|---|---|
| [Secret Manager](https://www.cloudskillsboost.google/catalog?keywords=Secret%20Manager) | API 키 관리 | Gemini / 외부 API 키 보호 |
| [IAM Basics](https://www.cloudskillsboost.google/catalog?keywords=IAM%20Basics) | 권한 이해 | 서비스 계정 과권한 방지 |
| [Cloud Logging and Monitoring](https://www.cloudskillsboost.google/catalog?keywords=Cloud%20Logging%20Monitoring) | 로그 확인 | 배포 후 오류 확인 |

### 왜 하나

해커톤이어도 API 키 노출은 치명적이다. 시간이 부족하면 Secret Manager만 먼저 본다.

---

## 크레딧이 적게 남았을 때 최소 루트

정말 적게 남았으면 이것만 한다.

1. [Prompt Design in Vertex AI](https://www.cloudskillsboost.google/catalog?keywords=Prompt%20Design%20in%20Vertex%20AI)
2. [Develop GenAI Apps with Gemini and Streamlit](https://www.cloudskillsboost.google/catalog?keywords=Develop%20GenAI%20Apps%20with%20Gemini%20and%20Streamlit)
3. [Deploying a Containerized Web Application](https://www.cloudskillsboost.google/catalog?keywords=Deploying%20a%20Containerized%20Web%20Application)
4. [Secret Manager](https://www.cloudskillsboost.google/catalog?keywords=Secret%20Manager)

이 조합이면 아래까지 가능하다.

```text
Gemini 앱 만들기
  → Streamlit UI
  → Cloud Run 배포 시도
  → API 키 보호
  → 실패 시 fallback 발표
```

---

## 해커톤 유형별 조합

### AI 상담 / 코치 서비스

- Prompt Design in Vertex AI
- Gemini API in Vertex AI
- Streamlit
- Cloud Run
- Secret Manager

### 웹앱 MVP

- Firebase Hosting
- Firebase Authentication
- Cloud Firestore
- Gemini API

### 문서 기반 AI

- Gemini API
- Multimodal RAG
- Document AI
- Cloud Run

### 데이터 분석형 해커톤

- BigQuery Basics
- BigQuery ML
- Gemini for data analysis
- Looker Studio 계열

### 이미지 / 멀티모달 서비스

- Gemini / Imagen 계열 실습
- Multimodal RAG
- Cloud Run
- Firebase Storage

---

## 이번 레포 기준 실행 순서

### 1. 먼저 볼 것

- Prompt Design in Vertex AI
- Develop GenAI Apps with Gemini and Streamlit

### 2. 그다음 로컬에서 확인할 것

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run src/app.py
```

### 3. 크레딧 확인 후 시도할 것

- Cloud Run 배포
- Secret Manager 적용

### 4. 시간이 남으면 볼 것

- Firebase Authentication
- Cloud Firestore
- Multimodal RAG

---

## 피할 것

이번 해커톤 준비에서는 아래에 크레딧을 쓰지 않는다.

| 피할 주제 | 이유 |
|---|---|
| GKE / Kubernetes | 120분 MVP에 과함 |
| Cloud SQL | 설정과 운영 부담이 큼 |
| Vertex AI Endpoint / GPU | 과금 위험이 큼 |
| NAT Gateway / Load Balancer | MVP에 불필요 |
| 대용량 BigQuery 실습 | 데이터가 없으면 효과가 낮음 |

---

## 최종 Top 10

1. Prompt Design in Vertex AI
2. Explore Generative AI with the Gemini API in Vertex AI
3. Develop GenAI Apps with Gemini and Streamlit
4. Deploying a Containerized Web Application
5. Cloud Run Functions: Qwik Start
6. Build Apps & Websites with Firebase
7. Firebase Authentication
8. Cloud Firestore
9. Inspect Rich Documents with Gemini Multimodality and Multimodal RAG
10. Secret Manager

---

## 한 줄 원칙

> 남은 크레딧은 “학습량”이 아니라 “해커톤 당일 시연 가능성”을 높이는 데만 쓴다.
