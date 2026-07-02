# Stage 01 — Gemini API

목표: Python에서 Gemini API를 최소 호출한다.

## 실습

1. `.env`에 `GOOGLE_API_KEY` 입력
2. `src/gemini_client.py`에서 `generate_study_brief()` 확인
3. 학습 메모 프롬프트로 응답 받기
4. `src/app.py` 버튼과 연결

## 완료 기준

- 버튼 클릭 시 fallback 문구가 아니라 Gemini 응답이 출력된다.
- API 키가 없어도 fallback 출력으로 데모가 계속된다.
- API 키가 Git에 커밋되지 않는다.
