# 수상 목표 전략

## 결론

수상을 목표로 하면 **Study Jam Buddy 단독은 너무 무난하다.**  
기존 아이디어를 버리기보다, 포지셔닝을 아래처럼 바꾼다.

> Study Jam Buddy → **Hackathon Co-pilot for Study Jam Learners**

즉, “복습 도우미”가 아니라 **스터디잼 참가자가 해커톤에서 아이디어를 MVP와 발표까지 바꾸도록 돕는 AI 실행 코치**로 만든다.

---

## 왜 기존 Study Jam Buddy는 약한가

### 장점

- Study Jam 맥락과 잘 맞음
- Gemini 활용이 명확함
- 120분 안에 완성 가능
- fallback 데모가 쉬움

### 약점

- “학습 메모 → 요약/퀴즈”는 흔함
- 심사자가 보면 AI 노트 정리 앱처럼 보일 수 있음
- 문제의 긴급성이 약함
- 수상작으로 보기엔 임팩트가 작을 수 있음

판정:

> 완성 가능성은 높지만, 수상 확률을 높이려면 **해커톤 당일 문제 해결**로 바꿔야 한다.

---

## 수상형 피벗: Hackathon Co-pilot

### 한 줄 설명

> Study Jam에서 배운 내용을 입력하면, Gemini가 해커톤 아이디어, MVP 범위, Google Cloud 아키텍처, 120분 실행 계획, 3분 발표 대본까지 만들어주는 AI 해커톤 코치.

### 해결하는 문제

Study Jam 참가자는 기술은 배웠지만 해커톤 당일 아래에서 막힌다.

1. 어떤 문제를 고를지 모름
2. 아이디어가 너무 커짐
3. Google Cloud를 어디에 써야 할지 애매함
4. 120분 안에 만들 범위를 못 자름
5. 발표 스토리를 못 만듦

Hackathon Co-pilot은 이걸 한 번에 줄인다.

---

## 입력 / 출력

### 입력

- Study Jam에서 배운 내용
- 관심 문제 영역
- 사용할 수 있는 Google Cloud 기술
- 팀 규모
- 남은 구현 시간
- 본인 자신감

### 출력

1. 해커톤 아이디어 3개
2. 가장 수상 가능성 높은 1개 추천
3. 10초 문제 정의
4. 120분 MVP 범위
5. Google Cloud 아키텍처
6. 구현 순서
7. 과금 위험 체크
8. 3분 발표 대본
9. fallback 데모 플랜

---

## 왜 수상 가능성이 더 높은가

### 1. 행사 맥락과 직접 연결됨

Study Jam 참가자가 해커톤에서 겪는 문제를 해결한다.  
즉, 사용자가 바로 그 행사 참가자다.

### 2. 데모가 선명함

입력:

> “나는 Cloud Run, Gemini API를 배웠고 환경 문제 해결에 관심 있다.”

출력:

> “환경 실천 인증 앱을 만들고, Gemini로 사진/텍스트 인증을 요약하고, Cloud Run으로 배포하라.”

이 변화가 눈에 보인다.

### 3. Google Cloud 활용 설명이 자연스러움

- Gemini API: 아이디어/계획/발표 생성
- Cloud Run: 생성된 MVP 템플릿 실행/배포
- Firestore: 팀별 아이디어/계획 저장 확장
- Cloud Storage: 발표 자료/스크린샷 저장 확장

### 4. 120분 안에 만들 수 있음

핵심은 생성형 AI 결과 카드라서 구현 범위가 작다.

---

## 수상용 MVP 범위

### 반드시 만들 것

- 입력 폼
- Gemini/fallback 결과 생성
- 추천 아이디어 카드
- MVP 범위 카드
- Google Cloud 아키텍처 카드
- 120분 실행 계획 카드
- 3분 발표 대본 카드

### 만들지 않을 것

- 로그인
- DB 저장
- 파일 업로드
- 팀 협업 기능
- 복잡한 UI
- 자동 배포

---

## 데모 시나리오

### 샘플 입력

```text
배운 내용:
- Gemini API로 텍스트 생성
- Cloud Run으로 컨테이너 앱 배포
- Firestore가 문서 DB라는 것

관심 문제:
- 초보자가 해커톤에서 아이디어를 너무 크게 잡아 실패하는 문제

사용 가능 기술:
- Python, Streamlit, Gemini API, Cloud Run

팀 규모:
- 1명

남은 시간:
- 120분

자신감:
- 보통
```

### 기대 출력

```text
추천 아이디어:
Hackathon Co-pilot for Study Jam Learners

문제 정의:
Study Jam 참가자는 기술은 배웠지만 해커톤 당일 아이디어를 MVP와 발표로 바꾸는 데 어려움을 겪는다.

MVP:
학습 내용과 관심 문제를 입력하면 Gemini가 해커톤 아이디어, MVP 범위, Cloud 아키텍처, 발표 대본을 생성한다.

Google Cloud 활용:
Gemini API로 아이디어와 실행 계획을 생성하고, Streamlit 앱을 Cloud Run에 배포한다.

120분 계획:
0-20분 입력/출력 schema 고정
20-60분 Streamlit UI 구현
60-90분 Gemini/fallback 연결
90-110분 샘플 데모/발표 대본 정리
110-120분 리허설
```

---

## 발표 한 줄

> Study Jam은 기술을 배우게 해주지만, 해커톤 당일에는 배운 기술을 문제·MVP·발표로 바꾸는 능력이 필요합니다. Hackathon Co-pilot은 그 전환을 Gemini로 돕는 AI 실행 코치입니다.

---

## 심사 기준 대응

| 기준 | 대응 |
|---|---|
| 문제 명확성 | Study Jam 참가자가 해커톤 당일 겪는 문제 |
| Google 기술 활용 | Gemini API + Cloud Run 중심 |
| 데모 가능성 | 입력 → 아이디어/계획/발표 생성 |
| 실현 가능성 | Streamlit + Gemini로 120분 내 가능 |
| 확장성 | Firestore/Storage/Calendar 연동 가능 |
| 차별성 | 단순 복습 앱이 아니라 해커톤 실행 코치 |

---

## 최종 판단

수상을 원하면 전략은 이거다.

1. **Study Jam Buddy 이름은 유지 가능**
2. 기능은 “복습”에서 “해커톤 실행 코치”로 피벗
3. 출력은 퀴즈보다 MVP/아키텍처/발표 대본 중심
4. 발표에서는 “Study Jam 학습 → 해커톤 실행” 간극을 해결한다고 말하기

최종 추천 이름:

> **Study Jam Buddy: Hackathon Co-pilot**
