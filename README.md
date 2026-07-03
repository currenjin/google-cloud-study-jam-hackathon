# Google Cloud Study Jam Hackathon

Google Cloud Study Jam Hackathon 준비용 private repo.

- 행사: 2026-07-16 12:00-17:00 KST
- 실제 해커톤: 13:20-15:20, 120분
- 전략: 당일 새로 배우지 않고, 미리 만든 작은 템플릿을 120분 안에 조립/데모한다.

## 빠른 시작

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
  plan.md                     # 전체 준비 플랜
  studyjam-hackathon-guide.md # 진행 예상/무과금 학습 가이드
  judging-story.md            # 발표/심사 스토리
  idea-bank.md                # 아이디어 후보
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

**Study Jam Buddy**

Google Cloud Study Jam 학습자가 배운 내용을 입력하면 Gemini가 개인 맞춤 복습 퀴즈, 약점 분석, 다음 실습 체크리스트를 만들어주는 학습 코치.

왜 좋나:
- 행사 맥락과 직접 연결됨: Study Jam 학습 → 해커톤 실습 전환
- 120분 안에 만들 수 있음
- Gemini 데모가 명확함: 비정형 학습 메모 → 구조화된 복습/액션
- 발표 스토리가 선명함: 배운 내용을 실제 행동으로 바꿔주는 AI 학습 파트너

## 데모 출력

- 5줄 요약
- 복습 퀴즈 5개
- 약점 개념 3개
- 다음 실습 체크리스트
- 오늘 30분 액션
