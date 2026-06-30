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
  plan.md                 # 전체 준비 플랜
  judging-story.md        # 발표/심사 스토리
  idea-bank.md            # 아이디어 후보
stages/
  00-gcp-warmup/          # GCP/Cloud Shell 감각 회복
  01-gemini-api/          # Gemini API 최소 호출
  02-streamlit-mvp/       # 화면 있는 MVP
  03-cloud-run-deploy/    # Cloud Run 배포
  04-demo-script/         # 3분 데모/발표
  05-hackathon-rehearsal/ # 120분 리허설
src/
  app.py                  # 해커톤 당일 사용할 최소 Streamlit 앱
```

## 현재 1순위 MVP 후보

**Small Table Matcher**

사람들의 관심사/고민/에너지 상태를 입력하면 Gemini가 작은 모임의 대화 주제, 소그룹 구성, 첫 질문을 추천한다.

왜 좋나:
- 다니엘의 고유 관심사와 연결됨: 서로 이웃처럼 사랑하도록 돕는 일
- 120분 안에 만들 수 있음
- Gemini 데모가 명확함
- 발표 스토리가 좋음: AI를 정보 처리보다 관계 회복에 사용
