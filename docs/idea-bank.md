# Idea Bank

## 1. Study Jam Buddy: Hackathon Co-pilot — 수상 목표 1순위

**Problem:** Study Jam 참가자는 기술은 배웠지만, 해커톤 당일 배운 내용을 문제 정의, MVP 범위, Google Cloud 아키텍처, 발표 대본으로 바꾸는 데 어려움을 겪는다.

**User:** Google Cloud Study Jam 해커톤 참가자, 클라우드 입문 학습자, 120분 안에 MVP를 만들어야 하는 참가자.

**MVP:** 학습 내용, 관심 문제, 사용 가능 기술, 남은 시간, 팀 규모를 입력하면 Gemini가 해커톤 아이디어 3개, 추천 MVP 1개, Cloud 아키텍처, 120분 구현 계획, 3분 발표 대본, fallback 전략을 생성한다.

**Google Cloud Fit:** Gemini API가 비정형 학습/관심 정보를 실행 가능한 해커톤 계획으로 구조화하고, Streamlit 앱은 Cloud Run으로 배포 가능하다. 확장 시 Firestore에 팀별 계획을 저장하고 Cloud Storage에 발표 자료를 저장할 수 있다.

**Hackathon Fit:** 행사 참가자 자신이 겪는 문제를 해결한다. 입력 → AI 처리 → MVP/아키텍처/발표 대본 출력이 명확하고, 120분 안에 구현 가능하며, 발표 스토리가 강하다.

**판정:** 수상 목표 기준 1순위. 기존 “복습 도우미”보다 해커톤 맥락과 임팩트가 강하다.

---

## 2. Study Jam Buddy — 안정형 후보

**Problem:** Study Jam 참가자는 실습을 따라가도 “무엇을 이해했고, 다음에 무엇을 해야 하는지”가 흐려지기 쉽다.

**User:** Google Cloud Study Jam 참가자, 해커톤 참가자, 클라우드 입문 학습자.

**MVP:** 학습 메모를 넣으면 Gemini가 5줄 요약, 복습 퀴즈, 약점 개념, 다음 실습 체크리스트, 오늘 30분 액션을 생성한다.

**Google Cloud Fit:** Gemini API, Cloud Run, 향후 Google Sheets/Classroom/Calendar 연동.

**Hackathon Fit:** 행사 맥락과 직접 연결되고, 입력 → AI 처리 → 구조화된 출력이 10초 안에 이해된다.

**판정:** 완성 가능성은 높지만 수상 임팩트는 약할 수 있다. Hackathon Co-pilot의 하위 기능으로 흡수하는 것이 좋다.

---

## 3. Small Table Matcher

작은 모임에서 깊은 대화가 자연스럽게 열리도록 참가자 정보와 목적을 바탕으로 대화 흐름을 설계한다.

- 장점: 다니엘의 장기 방향성과 잘 맞음
- 단점: 해커톤 심사에서는 “질문 생성기”처럼 보일 수 있음
- 판정: 장기 프로젝트 후보로 보류

---

## 4. Reflection Coach

하루 기록을 입력하면 감정, 가치, 다음 작은 실천으로 정리한다.

- 장점: 개인 미션과 잘 맞음
- 단점: Study Jam/Google Cloud 해커톤 맥락이 약할 수 있음
- 판정: 보류

---

## 5. Document-to-Action

문서/PDF 내용을 요약하고 액션아이템으로 변환한다.

- 장점: 기술 시연성은 좋음
- 단점: 파일 업로드/파싱/권한/Storage 등 시간 리스크가 있음
- 판정: 120분 해커톤에는 위험
