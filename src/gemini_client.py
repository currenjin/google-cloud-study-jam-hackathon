from __future__ import annotations

import os

from study_buddy import build_fallback_brief, build_study_jam_prompt


def generate_study_brief(learning_notes: str, goal: str, confidence: str) -> tuple[str, str]:
    """Generate a Study Jam Buddy brief.

    Returns:
        (source, markdown) where source is either "gemini" or "fallback".
    """
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    prompt = build_study_jam_prompt(learning_notes, goal, confidence)

    if not api_key:
        return "fallback", build_fallback_brief(learning_notes, goal, confidence)

    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt,
        )
        text = getattr(response, "text", "") or ""
        if text.strip():
            return "gemini", text.strip()
    except Exception as exc:  # Demo safety: never let the app die during judging.
        fallback = build_fallback_brief(learning_notes, goal, confidence)
        return "fallback", f"{fallback}\n\n> Gemini 호출 실패로 백업 출력을 표시했습니다: `{type(exc).__name__}`"

    return "fallback", build_fallback_brief(learning_notes, goal, confidence)
