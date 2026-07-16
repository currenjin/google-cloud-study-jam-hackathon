# Google Cloud Study Jam Hackathon — 릴드 (Reels Drama)

2026-07-16 (목) 12:00–17:00 · 서울신라호텔 본관 3층 오키드룸 · 실제 개발 시간 **120분** (13:20–15:20)

## 프로젝트: 릴드 (Reels Drama)

프롬프트나 이미지를 시드로 주면, 여러 사람이 **릴레이로 한 줄씩 전개를 이어가며** AI가 숏폼 드라마를 만들어주는 참여형 엔터테인먼트 앱.

- **트랙:** Gemini in Entertainment
- **비주얼 콘셉트:** 목각인형(artist mannequin) 디오라마 스타일 — 캐릭터 일관성 문제를 해결하면서 그 자체로 밈 감성
- **핵심 기믹:** Story Bible(JSON)로 인물·배경·톤을 고정하고, 턴마다 Gemini가 각본 + Nano Banana가 컷 이미지를 생성

## 문서

| 문서 | 내용 |
|---|---|
| [docs/00-before-hackathon.md](docs/00-before-hackathon.md) | 해커톤 시작 전에 해놓을 것 (환경 세팅, 로지스틱스) |
| [docs/01-hackathon-plan.md](docs/01-hackathon-plan.md) | 해커톤에서 해야 할 것 (120분 타임박스 실행 계획) |
| [docs/02-winning-strategy.md](docs/02-winning-strategy.md) | 수상을 위해 준비해야 할 것 (심사 기준 공략, 제출물, 발표) |
| [docs/03-prompts.md](docs/03-prompts.md) | Story Bible 스키마, 프롬프트 3종, 데모 시나리오 (현장 복붙용) |

## ⚠️ 잊지 말 것

- **이 레포는 기획/준비용.** 규정상 프로젝트는 해커톤 현장에서 새로 개발해야 하므로, 실제 코드는 **당일 새 public repo를 만들어서** 작업한다.
- 제공되는 @gcplab.me 계정과 GCP 프로젝트는 **행사 종료 즉시 삭제**된다. 코드는 수시로 GitHub에 푸시.
- 프로젝트 내 자율형 AI 에이전트(OpenClaw 등) 사용 금지.

## 제출물 (해커톤 종료 전까지)

1. Project Description (프로젝트 소개)
2. Public GitHub Repository (소스코드)
3. Demo Video (YouTube / Google Drive 링크)

## 심사 기준

- **Technical Demo** — 에러 없이 정상 동작하는가
- **Impact** — 실제 문제를 해결하는가, 문제가 충분히 중요한가
- **Creativity** — 기존에 없던 새로운 접근인가
