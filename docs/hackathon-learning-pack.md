# 해커톤 학습 패키지

## 목적

이 문서는 Google Cloud Study Jam 해커톤을 위해 **과금 없이 먼저 공부할 개념, 로컬 실습, 해커톤 활용 예시**를 한 번에 따라갈 수 있게 정리한 진입점이다.

현재 상태: **스터디잼 통과, 해커톤 참석 확정**. 따라서 목표는 “선발 준비”가 아니라 **해커톤 당일 120분 안에 안정적으로 만들고 발표하는 준비**다.

목표는 클라우드 전문가가 되는 것이 아니라, 해커톤 120분 안에 아래를 해내는 것이다.

```text
문제 정의
  → 작은 MVP 구현
  → Gemini/Google Cloud 활용 설명
  → 로컬 또는 Cloud Run 데모
  → 장애 시 fallback 발표
```

---

## 읽는 순서

1. [`free-study-topics.md`](./free-study-topics.md)
   - 과금 없이 공부할 전체 범위
   - 무엇을 깊게 보고, 무엇을 피할지

2. [`concepts-practices-examples.md`](./concepts-practices-examples.md)
   - 개념 → 로컬 실습 → 해커톤 활용 예시
   - Gemini, Streamlit, Cloud Run, Firestore, Storage, 비용 관리

3. [`demo-playbook.md`](./demo-playbook.md)
   - 발표용 샘플 입력
   - 데모 흐름
   - 장애 시 fallback 멘트
   - 120분 당일 운영법

4. [`judging-story.md`](./judging-story.md)
   - 3분 발표 대본

5. [`plan.md`](./plan.md)
   - 실제 준비 일정과 구현 범위

---

## 학습 우선순위

### 1순위: 반드시 할 것

| 주제 | 이유 | 결과물 |
|---|---|---|
| Streamlit | 120분 안에 화면 있는 MVP를 만들기 쉬움 | 로컬 앱 실행 |
| Gemini API / fallback | Google AI 활용의 핵심 | 학습 메모 → 요약/퀴즈/액션 |
| Prompt / output schema | 데모 결과를 안정적으로 만듦 | 발표 가능한 고정 출력 |
| 발표 스토리 | 심사자가 문제와 가치를 이해하게 함 | 3분 발표 |
| 과금 위험 구분 | 실습 중 비용 사고 방지 | 안전한 실습 판단 |

### 2순위: 개념과 연결만 알 것

| 주제 | 이유 | 이번 MVP에서의 위치 |
|---|---|---|
| Cloud Run | 배포 URL 확보용 | 크레딧 확인 후 1회 시도 |
| Firestore | 학습 결과 저장 확장용 | 지금은 JSON/메모리로 대체 |
| Cloud Storage | 파일 저장 확장용 | 지금은 제외 |
| Cloud Build / Artifact Registry | Cloud Run 배포 과정에서 등장 | 명령어 복붙 수준만 |

### 3순위: 이번엔 피할 것

| 주제 | 피하는 이유 |
|---|---|
| GKE/Kubernetes | 120분 MVP에 과함 |
| Cloud SQL | 설정/비용/운영 부담 큼 |
| BigQuery | 대용량 데이터 없으면 불필요 |
| Vertex AI Endpoint/GPU | 과금 위험 큼 |
| NAT Gateway / Load Balancer | 해커톤 MVP에 불필요 |

---

## 이번 레포의 최종 데모 그림

```text
사용자: Study Jam 학습 메모 입력
  ↓
Streamlit UI
  ↓
study_buddy.py: prompt/output schema 구성
  ↓
gemini_client.py: Gemini API 호출 또는 fallback
  ↓
결과 카드:
  - 5줄 요약
  - 복습 퀴즈
  - 약점 개념
  - 다음 실습 체크리스트
  - 오늘 30분 액션
```

---

## 해커톤에서 말할 핵심 한 문장

> Study Jam Buddy는 Study Jam 학습자가 실습 후 남긴 메모를 Gemini로 분석해, 복습 퀴즈와 다음 실습 액션으로 바꿔주는 AI 학습 코치입니다.

---

## 완료 기준

- [ ] `streamlit run src/app.py` 로컬 실행 가능
- [ ] API 키 없이 fallback 데모 가능
- [ ] Gemini API가 붙는 위치 설명 가능
- [ ] Cloud Run으로 배포 가능한 구조 설명 가능
- [ ] Firestore/Storage를 지금 제외한 이유 설명 가능
- [ ] 과금 위험 서비스 5개 이상 말할 수 있음
- [ ] 3분 발표 가능
- [ ] 배포 실패 시에도 로컬 데모로 발표 가능
