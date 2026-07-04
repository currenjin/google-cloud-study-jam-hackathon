# Google Cloud Study Jam Hackathon

Google Cloud Study Jam Hackathon 준비용 private repo.

- 행사: 2026-07-16 12:00-17:00 KST
- 실제 해커톤: 13:20-15:20, 120분
- 상태: 스터디잼 통과, 해커톤 참석 확정
- 전략: 당일 새로 배우지 않고, 미리 만든 작은 템플릿을 120분 안에 조립/데모한다.

## 빠른 시작

먼저 해커톤 학습 패키지부터 읽는다.

- [`docs/no-billing-study-session.md`](docs/no-billing-study-session.md): 과금 없이 바로 따라 하는 60분 기술 공부 세션
- [`docs/winning-case-analysis-and-recommendation.md`](docs/winning-case-analysis-and-recommendation.md): 수상 케이스 분석 + 다니엘 최종 추천안
- [`docs/winning-strategy.md`](docs/winning-strategy.md): 수상 목표 피벗 전략
- [`docs/hackathon-learning-pack.md`](docs/hackathon-learning-pack.md): 전체 학습 진입점
- [`docs/concepts-practices-examples.md`](docs/concepts-practices-examples.md): 개념/실습/활용 예시
- [`docs/demo-playbook.md`](docs/demo-playbook.md): 발표/데모/fallback

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
streamlit run src/app.py
```

## 디렉토리

```text
docs/
  winning-strategy.md             # 수상 목표 피벗 전략
  hackathon-learning-pack.md       # 학습 패키지 진입점
  concepts-practices-examples.md   # 개념/실습/활용 예시
  demo-playbook.md                 # 샘플 입력/발표/fallback
  plan.md                          # 전체 준비 플랜
  free-study-topics.md             # 과금 없이 공부할 주제/순서
  studyjam-hackathon-guide.md      # 진행 예상/무과금 학습 가이드
  judging-story.md                 # 발표/심사 스토리
  idea-bank.md                     # 아이디어 후보
stages/
  00-gcp-warmup/          # GCP/Cloud Shell 감각 회복
  01-gemini-api/          # Gemini API 최소 호출
  02-streamlit-mvp/       # 화면 있는 MVP
  03-cloud-run-deploy/    # Cloud Run 배포
  04-demo-script/         # 3분 데모/발표
  05-hackathon-rehearsal/ # 120분 리허설
src/
  app.py                  # 해커톤 당일 사용할 최소 Streamlit 앱
  gemini_client.py        # Gemini 호출 + fallback
  study_buddy.py          # 프롬프트/fallback 생성 로직
```

## 현재 1순위 MVP

**Study Jam Buddy: Hackathon Co-pilot**

Google Cloud Study Jam 학습자가 배운 내용을 입력하면 Gemini가 해커톤 아이디어, 120분 MVP 범위, Google Cloud 아키텍처, 구현 순서, 3분 발표 대본, fallback 전략을 만들어주는 AI 실행 코치.

왜 좋나:
- 행사 맥락과 직접 연결됨: Study Jam 학습 → 해커톤 실행 전환
- 120분 안에 만들 수 있음
- Gemini 데모가 명확함: 비정형 학습/관심 정보 → 구조화된 MVP/발표 계획
- 발표 스토리가 선명함: 배운 기술을 실제 제출 가능한 해커톤 결과물로 바꿔줌
- API/배포 실패 시 fallback 데모가 가능함

## 데모 출력

- 추천 아이디어 3개 + 최종 1개
- 10초 문제 정의
- 120분 MVP 범위
- Google Cloud 아키텍처
- 구현 순서
- 3분 발표 대본
- fallback 데모 플랜
