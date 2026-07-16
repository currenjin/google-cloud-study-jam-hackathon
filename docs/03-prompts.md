# 프롬프트 설계 (현장 복붙용)

## Story Bible 스키마

일관성의 핵심. 첫 시드에서 한 번 생성하고, **이후 모든 Gemini/이미지 호출에 컨텍스트로 주입**한다.

```json
{
  "title": "드라마 제목",
  "logline": "한 줄 설정",
  "tone": "막장 멜로 / 코믹 스릴러 등",
  "visual_style": "wooden artist mannequin figures on a miniature diorama stage set, soft studio lighting, shallow depth of field, cinematic color grading, 9:16 vertical",
  "characters": [
    {
      "id": "mina",
      "name": "미나",
      "marker": "빨간 목도리를 두른 인형",
      "personality": "집착이 심한 재벌 3세",
      "speech_style": "존댓말이지만 서늘함"
    }
  ],
  "setting": "장소·시대 고정값 (예: 2026년 서울, 한강뷰 펜트하우스와 편의점)",
  "story_summary": "지금까지의 줄거리 (턴마다 갱신)"
}
```

핵심: **`marker`** — 인형은 얼굴로 구분이 안 되므로 소품·색깔로 캐릭터를 식별한다. 이미지 프롬프트에서 캐릭터는 항상 marker로 묘사.

## 구조화 출력과 정규화 규칙

- `responseMimeType: application/json`만으로 끝내지 않는다. 설치한 `@google/genai` 버전의 공식 방식에 맞춰 아래 Bible/Scene 필드를 구조화 출력 스키마로 지정한다.
- 파싱 후 런타임 검증을 한 번 더 한다. 문자열 필수 필드, 배열 여부, 컷 정확히 1개, 대사 `character_id`를 확인한다.
- `character_id`는 기존 Bible의 인물이거나 같은 씬의 `new_characters`에 있어야 한다. 새 인물은 검증 후 Bible의 `characters`에 합친다.
- 목업과 실제 API 응답은 아래 클라이언트 형태로 정규화한다.

```json
{
  "scene_title": "N화 제목",
  "narration": "내레이션",
  "dialogues": [{"character_id": "mina", "line": "대사"}],
  "new_characters": [],
  "cuts": [
    {
      "image_prompt": "영어 이미지 프롬프트",
      "image_url": null
    }
  ],
  "updated_story_summary": "갱신된 전체 줄거리",
  "user_twist": "사용자가 입력한 전개"
}
```

- Gemini Scene 응답에는 `image_url`과 `user_twist`를 요구하지 않는다. 클라이언트가 각각 `null`과 원래 사용자 입력으로 채운다.
- 목업은 `image_url`에 `/demo-assets/cut-01-contract.svg`처럼 `/demo-assets/`부터 시작하는 경로를 넣는다.
- 이미지 생성 성공 시 `image_url`만 blob URL로 교체한다. base64/blob은 localStorage에 저장하지 않는다.

## 프롬프트 1: Story Bible 생성 (게임 시작 시 1회)

```
너는 숏폼 드라마 기획자다. 사용자가 준 시드(텍스트 또는 이미지 설명)를 바탕으로
아래 JSON 스키마에 맞는 드라마 설정(Story Bible)을 만들어라.

규칙:
- visual_style 필드는 다음 문구를 글자 그대로 유지한다:
  "wooden artist mannequin figures on a miniature diorama stage set, soft studio lighting, shallow depth of field, cinematic color grading, 9:16 vertical"
- 등장인물은 2~3명. 각 인물에 시각적으로 구분되는 marker(소품/색)를 반드시 부여한다.
- tone은 과장된 K-드라마 문법(막장, 재벌, 기억상실 환영)으로.
- story_summary는 "아직 시작 전" 상태로 비워두거나 도입부 한 줄만.
- JSON만 출력한다.

시드: {user_seed}
```

## 프롬프트 2: 씬 생성 (매 턴)

```
너는 K-드라마 연출가다. Story Bible과 지금까지의 줄거리, 그리고 새 참가자가 입력한
"다음 전개 한 줄"을 받아 다음 씬을 만들어라.

출력 JSON:
{
  "scene_title": "N화 제목",
  "narration": "내레이션 1~2문장",
  "dialogues": [{"character_id": "mina", "line": "짧은 대사"}],
  "new_characters": [
    {
      "id": "새 인물 ID",
      "name": "새 인물 이름",
      "marker": "기존 인물과 겹치지 않는 소품/색",
      "personality": "성격",
      "speech_style": "말투"
    }
  ],
  "cuts": [
    {"image_prompt": "컷 이미지 프롬프트 (영어)"}
  ],
  "updated_story_summary": "갱신된 전체 줄거리 요약"
}

규칙:
- 참가자의 전개를 반드시 반영하되, tone과 setting을 벗어나지 않는다.
- image_prompt는 반드시 Story Bible의 visual_style 문구로 시작한다.
- image_prompt에서 캐릭터는 이름이 아니라 marker로 묘사한다.
  (예: "a wooden mannequin figure wearing a red scarf" — 절대 사람 이름 사용 금지)
- 새 전개가 기존 Bible에 없는 인물을 요구할 때만 new_characters에 1명을 추가한다. 아니면 빈 배열을 반환한다.
- dialogues의 character_id는 기존 Bible 또는 new_characters의 id만 사용한다.
- cuts는 1개만 생성한다. 120분 MVP에서는 장면당 여러 이미지 금지.
- 대사는 짧고 자막으로 얹기 좋게.

Story Bible: {bible_json}
지금까지의 줄거리: {story_summary}
새 전개: {user_twist}
```

## 프롬프트 3: 이미지 생성 (Nano Banana / Gemini 이미지)

씬 생성이 뽑아준 `cuts[].image_prompt`를 **그대로** 전달. 종횡비 9:16 고정. 응답의 첫 part를 이미지라고 가정하지 말고, `inlineData`와 MIME type이 실제로 있는 part를 찾는다. candidate 없음, 이미지 part 없음, safety block은 생성 실패로 처리한다.
스타일 프리픽스가 이미 박혀 있으므로 추가 가공 불필요. 이미지 실패는 1회 재시도 후 텍스트 카드로 대체한다.

(옵션) Veo 시네마틱 모드: 같은 image_prompt에 카메라 움직임 한 문장 추가
(예: "slow push-in on the mannequin's face") — 클립당 1–3분 소요, 데모 영상용은 미리 생성.

## 데모 시나리오 (현장에서 고민 금지, 이대로 촬영)

**시드:**
> 재벌집 막내인형과 편의점 알바인형의 계약연애

**릴레이 전개 (순서대로 입력):**
1. "갑자기 막내인형이 기억상실에 걸린다"
2. "알바인형의 쌍둥이가 나타나 자기가 진짜 계약자라고 주장한다"
3. "사실 이 모든 것은 편의점 CCTV에 찍히고 있었다"

**촬영 순서 (90초):**
1. 시드 입력 → Story Bible 생성 화면 (10초)
2. 첫 씬 생성 — 컷 + 대사 (20초)
3. "다음 사람에게 넘기기" → 전개 1, 2 입력하며 릴레이 시연 (40초)
4. 완성 릴 재생 — 세로 자동 넘김 (20초)

생성 대기 시간은 전부 편집으로 컷.
