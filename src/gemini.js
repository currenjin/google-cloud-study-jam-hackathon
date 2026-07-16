import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const withTimeout = (promise, ms = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
  ]);
};

export const generateStoryBible = async (userSeed, imageBase64, visualStyleType = 'real') => {
  const isReal = visualStyleType === 'real';
  const defaultVisualStyleStr = isReal
    ? "photorealistic live-action cinematic Korean drama scene, real actors with emotional expressions, highly detailed faces, stylish clothing, moody studio lighting, shallow depth of field, professional cinematography, 9:16 vertical, photorealistic, 8k"
    : "wooden artist mannequin figures on a miniature diorama stage set, soft studio lighting, shallow depth of field, cinematic color grading, 9:16 vertical";

  const prompt = `너는 숏폼 드라마 기획자다. 사용자가 준 시드(텍스트)와 업로드된 참고 이미지(있는 경우)를 바탕으로 아래 JSON 스키마에 맞는 드라마 설정(Story Bible)을 만들어라.

중요 규칙:
1. 만약 참고 이미지가 제공되었다면, 이미지에 등장하는 분위기, 스타일, 배경, 그리고 인물들을 깊이 있게 분석하라.
   - **매우 중요:** 업로드된 이미지의 비주얼 스타일(초실사 드라마 사진인지, 목각인형 미니어처 세트인지, 카툰인지 등)과 배경(배경 장소, 조명, 색감)을 그대로 분석하여, 'visual_style' 필드에 해당 레퍼런스 이미지와 완벽하게 어울리는 이미지 생성 프롬프트용 스타일 가이드를 작성하라. (예: 이미지가 실사 야외 카페 사진이면 "photorealistic live-action cinematic scene in an outdoor cafe, warm sunset lighting, highly detailed..." 등으로 작성하고, 이미지가 목각인형 사진이면 "wooden artist mannequin figures on a diorama set..."로 작성하라.)
   - 이미지 속 핵심 인물들의 외양(성별, 머리스타일, 옷차림)을 분석하여 'characters' 배열에 있는 등장인물의 속성에 매핑하고 성격과 행동 양식을 정의하라.
2. 만약 참고 이미지가 없다면:
   - visual_style 필드는 기본 지정된 다음 문구를 그대로 유지한다: "${defaultVisualStyleStr}"
3. 등장인물은 반드시 2명으로 구성한다. 각 인물의 외모를 결정하는 다음 속성값들을 추론하여 매핑해야 한다:
   - gender: "M" 또는 "F"
   - hair_style: 'spiky' (남자 스포티/짧은머리), 'ponytail' (포니테일), 'long_wavy' (긴 웨이브머리), 'bob_cut' (단발머리), 'short' (기본 깔끔한 숏컷) 중 하나를 선택하라.
   - outfit_type: 'black_suit' (정장/오피스룩), 'blue_apron' (앞치마/캐주얼 알바), 'red_dress' (럭셔리 드레스), 'white_coat' (의사 가운/연구원), 'casual' (캐주얼 후드티셔츠) 중 하나를 선택하라.
4. 각 등장인물의 marker 속성은 다음과 같이 지정한다:
   - 이미지나 설정에 맞춰 실제 사람이 입을법한 세련된 의상 및 패션 액세서리(예: "wearing a stylish blue shirt and silver glasses" 또는 "wearing a yellow coat and red scarf")로 자세한 영어 묘사를 작성하라. 단, 이미지가 명확히 목각인형 풍인 경우에만 인형용 마커(예: "wearing a blue neon jacket")를 지정하라.
5. JSON만 출력한다.

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
            gender: { type: 'string', enum: ["M", "F"] },
            hair_style: { type: 'string', enum: ["spiky", "ponytail", "long_wavy", "bob_cut", "short"] },
            outfit_type: { type: 'string', enum: ["black_suit", "blue_apron", "red_dress", "white_coat", "casual"] },
            marker: { type: 'string' },
            personality: { type: 'string' },
            speech_style: { type: 'string' }
          },
          required: ["id", "name", "gender", "hair_style", "outfit_type", "marker", "personality", "speech_style"]
        }
      },
      setting: { type: 'string' },
      story_summary: { type: 'string' }
    },
    required: ["title", "logline", "tone", "visual_style", "characters", "setting", "story_summary"]
  };

  let contents = prompt;
  if (imageBase64) {
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(';base64,')) {
      cleanBase64 = imageBase64.split(';base64,')[1];
    }
    contents = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/jpeg'
        }
      },
      {
        text: prompt
      }
    ];
  }

  const call = ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: contents,
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
  const visualStyle = bible.visual_style || '';
  const isReal = !visualStyle.toLowerCase().includes('mannequin') && 
                 !visualStyle.toLowerCase().includes('puppet') && 
                 !visualStyle.toLowerCase().includes('doll') && 
                 !visualStyle.toLowerCase().includes('figure');

  const rulePrompt = isReal ? `
- 현재 드라마는 **초실사 K-드라마(실사풍)** 스타일입니다.
- image_prompt는 반드시 "${visualStyle}" 문구로 시작해야 합니다.
- **매우 중요 (인형 금지 규칙):** 실사풍이므로 이미지 프롬프트에 절대 "mannequin", "figure", "puppet", "doll", "toy", "wood", "wooden" 등 인형 관련 단어를 일절 포함하지 마십시오!
- **인물 묘사 방법:** 프롬프트 내 캐릭터 묘사 시 실제 배우처럼 "a handsome young Korean man [marker]" 혹은 "a beautiful young Korean woman [marker]"의 형태로 구체화하십시오. 캐릭터 이름(예: 철수, 민지)은 모델이 인식하지 못하므로 프롬프트에 포함하지 말고 오직 특징 묘사만 사용하십시오. (예: "a handsome young Korean man wearing a stylish blue shirt and silver glasses with deep sorrowful eyes")
` : `
- 현재 드라마는 **목각인형/피규어** 스타일입니다.
- image_prompt는 반드시 "${visualStyle}" 문구로 시작해야 합니다.
- **인물 묘사 방법:** 캐릭터는 "a wooden mannequin figure [marker]" 형태로 인형임을 암시하고, 이름 대신 marker(예: wearing a pink head ribbon)를 사용해 구별되도록 묘사하십시오.
`;

  const prompt = `너는 K-드라마 연출가다. Story Bible과 지금까지의 줄거리, 그리고 새 참가자가 입력한 "다음 전개 한 줄"을 받아 다음 씬을 만들어라.
규칙:
- 참가자의 전개를 반드시 반영하되, tone과 setting을 벗어나지 않는다.
- 새 전개가 기존 Bible에 없는 인물을 요구할 때만 new_characters에 1명을 추가한다. 아니면 빈 배열을 반환한다.
- dialogues의 character_id는 기존 Bible 또는 new_characters의 id만 사용한다.
- cuts는 1개만 생성한다.
- 대사는 짧고 자막으로 얹기 좋게 구성한다.
${rulePrompt}

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
