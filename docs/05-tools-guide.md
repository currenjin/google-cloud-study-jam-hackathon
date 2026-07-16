# 툴 가이드 — GCP / AI Studio / Antigravity (처음 쓰는 사람 기준)

> 핵심 요약: **프로젝트는 고를 필요가 없다.** 현장에서 받는 @gcplab.me 계정에는 GCP 프로젝트가 **딱 하나** 할당되어 있고, 빌링(결제)도 이미 설정되어 있다. 모든 툴에서 "그 하나"를 선택하기만 하면 된다. 개인 계정/개인 프로젝트는 쓰지 않는다.

## 0. 계정 개념 정리

- 현장 오프닝 때 `xxx@gcplab.me` 형식의 **ID와 PW를 종이/화면으로 배부**받는다.
- 이 계정은 일반 구글 계정처럼 동작한다. GCP 콘솔, AI Studio, Antigravity, 심지어 Gmail/Docs/NotebookLM까지 전부 이 계정으로 로그인 가능.
- **반드시 시크릿 창(⌘⇧N) 또는 새 Chrome 프로필**로 로그인한다. 평소 쓰는 브라우저 창에서 로그인하면 개인 구글 계정과 섞여서 "권한 없음" 에러의 주범이 된다.
- 행사 종료 시 계정·프로젝트·문서 전부 즉시 삭제. 코드는 GitHub에, 생성물은 로컬에 백업.

## 1. GCP 콘솔 — 프로젝트 확인 (2분, 딱 한 번)

1. 시크릿 창에서 <https://console.cloud.google.com> 접속 → @gcplab.me 계정으로 로그인
2. 화면 **상단 바 왼쪽**(Google Cloud 로고 옆)에 프로젝트 선택 드롭다운이 있다 → 클릭
3. 목록에 **프로젝트가 하나만** 보인다 → 그걸 선택. 끝.
4. 이때 **프로젝트 ID를 복사해서 메모**해둔다 (드롭다운 목록의 ID 열, 예: `hackathon-user-042` 같은 형식) — Antigravity 로그인에서 필요하다.

우리 MVP는 로컬 `npm run dev` 데모라서 **GCP 콘솔에서 뭔가를 만들 일이 없다.** Cloud Run, GKE, BigQuery 같은 메뉴는 전부 무시해도 된다. 콘솔의 역할은 (a) 프로젝트 ID 확인 (b) 문제 생겼을 때 확인용, 그게 전부다.

(참고) 콘솔 우측 상단의 터미널 아이콘이 **Cloud Shell** — 브라우저 안에서 도는 리눅스 셸이다. 내 노트북 환경이 통째로 말썽일 때의 비상 개발 환경 정도로만 기억해두면 된다.

## 2. AI Studio — API 키 받기 (3분)

AI Studio는 Gemini 모델을 브라우저에서 실험하고 API 키를 관리하는 곳이다.

1. 같은 시크릿 창에서 <https://aistudio.google.com> 접속 (ai.studio로도 감) → 같은 @gcplab.me 계정
2. 좌측(또는 우상단)의 **"Get API key"** 메뉴 클릭
3. 키가 이미 보이면 → 복사. 끝.
4. **키가 안 보이면** → **"Import Projects"** 버튼 클릭 → 목록에 뜨는 유일한 프로젝트 선택 → 프로비저닝된 키가 나타남 → 복사
5. 복사한 키를 레포의 `.env`에 넣는다:
   ```
   VITE_GEMINI_API_KEY=여기에붙여넣기
   ```

주의:
- 이 키는 **할당된 GCP 프로젝트에 연결**되어 있어서 행사 빌링으로 과금된다. 개인 계정 키를 쓰면 내 돈이 나가니 섞지 말 것.
- 키를 GitHub에 커밋하거나 화면 공유로 노출하지 말 것 — 감지되면 프로젝트가 정지될 수 있다 ("Don't leak API Keys").
- 개발 시작 전에 AI Studio 좌측 모델 목록(또는 새 프롬프트 화면의 모델 선택)에서 **텍스트 모델과 이미지 모델의 정확한 ID를 확인**한다. AGENTS.md의 모델명과 다르면 에이전트에게 "AI Studio에 있는 모델 ID로 바꿔"라고 하면 된다.

(참고) AI Studio에는 프롬프트로 앱을 바로 만들어주는 빌드 기능과 "Export to Antigravity" 버튼도 있다 — M1을 AI Studio에서 시작하고 Antigravity로 넘기는 경로도 가능하다.

## 3. Antigravity — 로그인과 프로젝트 ID (5분)

Antigravity는 구글의 에이전틱 개발 툴이다 (Antigravity 2.0 = 에이전트 관리 커맨드센터, IDE = VS Code 기반 에디터, CLI = 터미널판). 사전에 <https://antigravity.google/download>에서 설치해뒀다면:

1. Antigravity 실행 → 로그인 화면에서 **@gcplab.me 계정** 선택 (브라우저 인증이 뜨면 시크릿 창의 세션 사용)
2. **로그인 과정에서 프로젝트 ID를 묻는 단계가 있다 → 1번에서 메모해둔 프로젝트 ID를 입력.** 이걸 해야 유료 플랜(Business/Organization)이 적용된다. 건너뛰면 무료 한도로 돌아가서 에이전트가 금방 막힌다.
3. 로그인 후 "폴더 열기"로 **이 레포 폴더를 연다** → `AGENTS.md`가 자동으로 에이전트 컨텍스트에 로드된다
4. 에이전트 입력창에 [04-kickoff-prompts.md](04-kickoff-prompts.md)의 M1 프롬프트를 붙여넣으면 개발 시작

## 4. 전체 흐름 한 장 요약

```
[현장 도착, 12:10~]
  계정 종이 수령 (id@gcplab.me / PW)
    │
    ├─ 시크릿 창 → console.cloud.google.com 로그인
    │    └─ 프로젝트 1개 확인 + 프로젝트 ID 메모
    │
    ├─ 같은 창 → aistudio.google.com
    │    └─ Get API key (없으면 Import Projects) → 키 복사
    │
    ├─ Antigravity 실행 → gcplab.me 로그인 + 프로젝트 ID 입력
    │    └─ 이 레포 폴더 열기
    │
    └─ 터미널: git clone → cp .env.example .env → 키 붙여넣기
         └─ [13:20] M1 프롬프트 붙여넣기 → 개발 시작
```

## 5. 자주 겪는 문제

| 증상 | 원인/해결 |
|---|---|
| "권한이 없습니다" / 다른 프로젝트가 보임 | 개인 구글 계정으로 로그인됨 → 시크릿 창에서 @gcplab.me로 다시 |
| AI Studio에 API 키가 없음 | "Import Projects" → 유일한 프로젝트 선택 |
| Antigravity가 무료 한도라고 함 | 로그인 시 프로젝트 ID를 안 넣음 → 로그아웃 후 재로그인하며 ID 입력 |
| API 호출 403/404 | 모델 ID 오타이거나 그 계정에 없는 모델 → AI Studio 모델 목록에서 ID 재확인 |
| API 호출 429 (쿼터) | 잠시 대기 후 재시도. 데모 영상은 잘 돌 때 미리 찍어둘 것 |
| 리소스가 갑자기 정지됨 | 키 유출/과도 사용/비보안 포트 감지 → 스태프에게 문의 |
