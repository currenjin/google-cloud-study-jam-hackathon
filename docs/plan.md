# Google Cloud Study Jam Hackathon Preparation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 2026-07-16 Google Cloud Study Jam Hackathon에서 120분 안에 데모 가능한 Gemini/GCP 기반 Study Jam Buddy를 완성한다.

**Architecture:** Streamlit UI + Gemini API 핵심 기능 + deterministic fallback + Cloud Run 배포를 기본 구조로 한다. 복잡한 DB/로그인/권한은 제외하고, 데모 데이터와 발표 스토리를 먼저 완성한다.

**Tech Stack:** Python, Streamlit, Gemini API (`google-genai`), Google Cloud Run, Docker.

---

## 성공 기준

- 로컬에서 `streamlit run src/app.py` 실행 가능
- Gemini API로 실제 응답 생성 가능
- API 키/인터넷 실패 시 fallback 출력으로 데모 지속 가능
- Cloud Run 또는 대체 배포 URL 확보
- 3분 발표 대본과 데모 데이터 준비
- 120분 리허설 1회 완료

## 핵심 전략

1. 기술은 작게: Gemini + Streamlit + Cloud Run만 쓴다.
2. 스토리는 선명하게: Study Jam 학습 메모를 다음 실습 행동으로 전환한다.
3. 당일에는 새 기능 개발보다 조립과 발표 완성에 집중한다.
4. 모든 실습은 `stages/` 순서대로 끝낸다.

## D-16 ~ D-10: 기반 만들기

### Task 1: 로컬 실행 환경 만들기

**Objective:** Streamlit 앱을 로컬에서 실행한다.

**Files:**
- Modify: `requirements.txt`
- Run: `src/app.py`

**Steps:**

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run src/app.py
```

**Expected:** 브라우저에서 Study Jam Buddy 화면이 뜬다.

### Task 2: Gemini API 최소 호출 성공

**Objective:** 학습 메모 프롬프트로 Gemini 응답을 받는다.

**Files:**
- Create/Modify: `src/gemini_client.py`
- Modify: `src/app.py`
- Practice: `stages/01-gemini-api/README.md`

**Verification:** 버튼 클릭 시 Gemini가 복습 자료를 생성한다.

### Task 3: MVP 입력/출력 고정

**Objective:** 당일 구현 범위를 고정한다.

**Input:** 학습 메모, 오늘 학습 목표, 현재 자신감

**Output:**
- 5줄 요약
- 복습 퀴즈 5개
- 약점 개념 3개
- 다음 실습 체크리스트
- 오늘 30분 액션

## D-9 ~ D-4: 배포와 데모

### Task 4: Cloud Run 배포 성공

**Objective:** 최소 앱을 Cloud Run에 배포한다.

**Files:**
- Modify: `Dockerfile`
- Modify: `.dockerignore`
- Practice: `stages/03-cloud-run-deploy/README.md`

**Verification:** 공개 URL에서 앱 접속 가능.

### Task 5: 3분 발표 대본 작성

**Objective:** 문제-해결-데모-확장 흐름을 고정한다.

**Files:**
- Modify: `docs/judging-story.md`

**Verification:** 타이머 켜고 3분 안에 발표 가능.

## D-3 ~ D-1: 리허설

### Task 6: 120분 리허설

**Objective:** 빈 상태에서 120분 안에 데모 가능한 상태까지 도달한다.

**Files:**
- Practice: `stages/05-hackathon-rehearsal/README.md`

**Verification:** 120분 안에 로컬 실행 + Gemini/fallback 응답 + 발표 초안 완성.

## 당일 운영표

| 시간 | 할 일 |
|---|---|
| 13:20-13:40 | 팀/주제/최종 출력 형식 확정 |
| 13:40-14:40 | 핵심 기능 구현 |
| 14:40-15:00 | 배포/백업/스크린샷 |
| 15:00-15:20 | 발표 리허설 |

## 금지 목록

- 로그인 구현 금지
- DB 붙이기 금지
- PDF/파일 업로드 구현 금지
- 복잡한 프론트엔드 금지
- 당일 처음 쓰는 기술 금지
- 기능 추가 욕심 금지
