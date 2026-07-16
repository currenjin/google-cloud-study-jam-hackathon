# 릴드 (Reels Drama) — Agent Context

이 프로젝트는 Google Cloud Study Jam Hackathon(2026-07-16) 출품작이다. **개발 시간이 총 120분**이므로 모든 판단은 "에러 없이 도는 데모"를 최우선으로 한다. 이 파일과 `docs/03-prompts.md`에 이미 내려진 결정을 재논의하지 말고 그대로 구현한다. 사용자에게 질문하기 전에 이 문서에서 답을 찾는다.

## 무엇을 만드는가

프롬프트/이미지를 시드로 받아, 여러 사람이 **릴레이로 한 줄씩 전개를 이어가면** AI가 숏폼 드라마를 만들어주는 참여형 웹앱.

화면 3장 (이 이상 만들지 않는다):
1. **시드 입력** — 텍스트로 드라마 시작 → Gemini가 Story Bible(JSON) 생성
2. **턴 화면** — 현재 씬(컷 이미지 + 대사/내레이션) + "다음 전개 한 줄" 입력 + "다음 사람에게 넘기기" 버튼 (핫시트 방식: 같은 브라우저에서 기기를 넘겨받는 상호작용)
3. **완성 릴 재생** — 9:16 세로 프레임, 컷 자동 넘김(컷당 3~4초), 대사/내레이션 자막 오버레이

## 기술 스택 (고정 — 변경하지 않는다)

- **Vite + React (JavaScript).** TypeScript, 라우터, 상태관리 라이브러리, Tailwind 쓰지 않는다. 화면 전환은 단일 state로, 스타일은 `src/App.css` 하나로.
- **`@google/genai` SDK**, 브라우저에서 직접 호출. API 키는 `.env`의 `VITE_GEMINI_API_KEY` (해커톤용이므로 클라이언트 노출 허용).
- 모델 (현장에서 AI Studio 목록 기준으로 최종 확인, 없으면 괄호 안 대체):
  - 각본/바이블: `gemini-3-flash-preview` (대체: `gemini-2.5-flash`)
  - 이미지: `gemini-2.5-flash-image` (품질 필요 시: `gemini-3-pro-image-preview`), aspect ratio 9:16
- 상태는 React state + localStorage 백업. DB 없음, 서버 없음.
- 배포는 하지 않아도 된다. `npm run dev` 로컬 데모로 충분.

## 핵심 설계 원칙

- **Story Bible이 일관성의 전부다.** 첫 시드에서 JSON 바이블(인물, marker, 톤, visual_style, setting)을 생성하고, 이후 모든 생성 호출에 컨텍스트로 주입한다. 스키마와 프롬프트 3종은 `docs/03-prompts.md`에 있다 — **그대로 사용하고 임의로 재작성하지 않는다.**
- **비주얼 스타일 고정:** "wooden artist mannequin figures on a miniature diorama stage set, soft studio lighting, shallow depth of field, cinematic color grading, 9:16 vertical". 모든 이미지 프롬프트는 이 문구로 시작한다.
- **캐릭터는 이름이 아니라 marker(소품/색)로 이미지 프롬프트에 묘사한다.** (인형은 얼굴로 구분 불가)
- Gemini 호출은 JSON 응답을 강제(responseMimeType: application/json)하고, 파싱 실패 시 1회 재시도한다.

## 스코프 규칙 (절대 준수)

하지 않는다: 로그인/계정, 실시간 멀티유저 동기화, DB, 모바일 대응, 공유/투표 기능, Veo 영상 생성(시간 남으면 마지막에만), 테스트 코드, 접근성/국제화.

## 장애 대응

- 이미지 생성 실패 → 1회 재시도 → 실패 시 해당 컷을 **텍스트 카드**(어두운 배경 + 내레이션 타이포)로 렌더한다. 절대 빈 화면/에러를 노출하지 않는다.
- 모든 생성 호출에 로딩 상태 표시 ("촬영 중..." 같은 콘셉트 문구).

## 마일스톤 (킥오프 프롬프트는 docs/04-kickoff-prompts.md)

- **M1 (0–20분):** 프로젝트 스캐폴드 + 시드 입력 → 바이블 → 씬 1개 → 이미지 1장이 한 번 도는 것
- **M2 (20–60분):** 턴 릴레이 UI, story_summary 갱신, 씬 히스토리 누적
- **M3 (60–90분):** 완성 릴 재생 화면(자동 넘김 + 자막), 텍스트 카드 폴백, 스타일 폴리시
- **M4 (90–120분):** 사람 작업 — 데모 촬영, README, 제출. 에이전트는 요청받은 버그 수정만 한다

각 마일스톤 완료 시 동작 확인 가능한 상태여야 하며, 즉시 커밋한다.
