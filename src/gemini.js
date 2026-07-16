import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const withTimeout = (promise, ms = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
  ]);
};

export const generateStoryBible = async (userSeed) => {
  const prompt = `너는 숏폼 드라마 기획자다. 사용자가 준 시드(텍스트 또는 이미지 설명)를 바탕으로 아래 JSON 스키마에 맞는 드라마 설정(Story Bible)을 만들어라.
규칙:
- visual_style 필드는 다음 문구를 글자 그대로 유지한다: "wooden artist mannequin figures on a miniature diorama stage set, soft studio lighting, shallow depth of field, cinematic color grading, 9:16 vertical"
- 등장인물은 2~3명. 각 인물에 시각적으로 구분되는 marker(소품/색)를 반드시 부여한다.
- tone은 과장된 K-드라마 문법(막장, 재벌, 기억상실 환영)으로.
- story_summary는 "아직 시작 전" 상태로 도입부 한 줄만.
- JSON만 출력한다.

시드: ${userSeed}`;

  const responseSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      logline: { type: 'string' },
      tone: { type: 'string' },
      visual_style: { type: 'string' },
      characters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            marker: { type: 'string' },
            personality: { type: 'string' },
            speech_style: { type: 'string' }
          },
          required: ["id", "name", "marker", "personality", "speech_style"]
        }
      },
      setting: { type: 'string' },
      story_summary: { type: 'string' }
    },
    required: ["title", "logline", "tone", "visual_style", "characters", "setting", "story_summary"]
  };

  const call = ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema
    }
  });

  const response = await withTimeout(call, 15000);
  const data = JSON.parse(response.text);
  
  if (!data.title || !data.characters || !Array.isArray(data.characters)) {
    throw new Error('INVALID_BIBLE_FORMAT');
  }
  return data;
};

export const generateNextScene = async (bible, storySummary, userTwist) => {
  const prompt = `너는 K-드라마 연출가다. Story Bible과 지금까지의 줄거리, 그리고 새 참가자가 입력한 "다음 전개 한 줄"을 받아 다음 씬을 만들어라.
규칙:
- 참가자의 전개를 반드시 반영하되, tone과 setting을 벗어나지 않는다.
- image_prompt는 반드시 Story Bible의 visual_style 문구로 시작한다.
- image_prompt에서 캐릭터는 이름이 아니라 marker로 묘사한다. (예: "a wooden mannequin figure wearing a red scarf" — 절대 사람 이름 사용 금지)
- 새 전개가 기존 Bible에 없는 인물을 요구할 때만 new_characters에 1명을 추가한다. 아니면 빈 배열을 반환한다.
- dialogues의 character_id는 기존 Bible 또는 new_characters of id만 사용한다.
- cuts는 1개만 생성한다.
- 대사는 짧고 자막으로 얹기 좋게.

Story Bible: ${JSON.stringify(bible)}
지금까지의 줄거리: ${storySummary}
새 전개: ${userTwist}`;

  const responseSchema = {
    type: 'object',
    properties: {
      scene_title: { type: 'string' },
      narration: { type: 'string' },
      dialogues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            character_id: { type: 'string' },
            line: { type: 'string' }
          },
          required: ["character_id", "line"]
        }
      },
      new_characters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            marker: { type: 'string' },
            personality: { type: 'string' },
            speech_style: { type: 'string' }
          },
          required: ["id", "name", "marker", "personality", "speech_style"]
        }
      },
      cuts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            image_prompt: { type: 'string' }
          },
          required: ["image_prompt"]
        }
      },
      updated_story_summary: { type: 'string' }
    },
    required: ["scene_title", "narration", "dialogues", "new_characters", "cuts", "updated_story_summary"]
  };

  const call = ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema
    }
  });

  const response = await withTimeout(call, 15000);
  const data = JSON.parse(response.text);

  const allowedIds = new Set([
    ...bible.characters.map(c => c.id),
    ...data.new_characters.map(c => c.id)
  ]);
  
  for (const d of data.dialogues) {
    if (!allowedIds.has(d.character_id)) {
      throw new Error(`INVALID_CHARACTER_ID: ${d.character_id}`);
    }
  }

  return data;
};

export const generateImage = async (imagePrompt) => {
  const call = ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '9:16',
      outputMimeType: 'image/jpeg'
    }
  });

  const response = await withTimeout(call, 20000);
  const image = response.generatedImages[0];
  if (!image || !image.image || !image.image.imageBytes) {
    throw new Error('IMAGE_GEN_FAILED');
  }

  return `data:image/jpeg;base64,${image.image.imageBytes}`;
};
