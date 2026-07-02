from __future__ import annotations


def build_study_jam_prompt(learning_notes: str, goal: str, confidence: str) -> str:
    """Build the fixed Gemini prompt for the hackathon MVP."""
    notes = learning_notes.strip()
    study_goal = goal.strip() or "Google Cloud Study Jam 학습 내용을 복습하고 다음 실습으로 연결하기"
    confidence_level = confidence.strip() or "보통"

    return f"""
당신은 Google Cloud Study Jam 참가자를 돕는 학습 코치입니다.
사용자가 방금 배운 내용을 해커톤/실습으로 이어갈 수 있게 짧고 실행 중심으로 정리하세요.

목표:
{study_goal}

사용자 자신감:
{confidence_level}

학습 메모:
{notes}

반드시 아래 Markdown 섹션 이름을 그대로 사용하세요.

### 5줄 요약
- 핵심만 5줄로 요약

### 복습 퀴즈 5개
- 객관식보다 짧은 주관식 위주
- 각 문항 아래에 정답을 한 줄로 제공

### 약점 개념 3개
- 사용자가 헷갈릴 가능성이 높은 개념 3개
- 왜 중요한지 한 줄씩 설명

### 다음 실습 체크리스트
- Google Cloud 콘솔/Cloud Run/Gemini API 실습으로 이어지는 단계별 체크리스트
- 5개 이내

### 오늘 30분 액션
- 지금 바로 30분 안에 할 수 있는 구체적 행동 1개
""".strip()


def build_fallback_brief(learning_notes: str, goal: str, confidence: str) -> str:
    """Return a deterministic demo response when Gemini is unavailable."""
    first_line = next((line.strip() for line in learning_notes.splitlines() if line.strip()), "입력한 학습 내용")
    study_goal = goal.strip() or "Google Cloud Study Jam 복습"
    confidence_level = confidence.strip() or "보통"

    return f"""### 5줄 요약
- 목표는 **{study_goal}**입니다.
- 현재 자신감은 **{confidence_level}**로 표시되었습니다.
- 핵심 메모: {first_line}
- 지금 필요한 것은 개념 암기보다 실습 흐름을 다시 손으로 밟는 것입니다.
- 결과물은 Cloud Run/Gemini API 데모로 연결되어야 합니다.

### 복습 퀴즈 5개
1. 오늘 배운 개념을 한 문장으로 설명하면?
   - 정답: 핵심 기능과 쓰임새를 함께 말할 수 있어야 합니다.
2. 이 기능이 Google Cloud에서 어떤 문제를 줄이나요?
   - 정답: 배포, 운영, 생성형 AI 활용 같은 반복 부담을 줄입니다.
3. 실습 중 가장 먼저 확인해야 할 설정은?
   - 정답: 프로젝트, 리전, API 활성화, 인증 정보입니다.
4. 데모가 실패할 때 보여줄 백업은?
   - 정답: 로컬 실행 화면과 샘플 출력입니다.
5. 이 학습을 해커톤 결과물로 바꾸려면 무엇이 필요하나요?
   - 정답: 입력, 처리, 출력이 10초 안에 이해되는 MVP 흐름입니다.

### 약점 개념 3개
- 인증/API 키: Gemini 호출 실패의 가장 흔한 원인입니다.
- 배포 단위: Cloud Run은 컨테이너/소스 배포 흐름 이해가 중요합니다.
- 데모 스토리: 기술보다 사용자가 얻는 변화가 보여야 합니다.

### 다음 실습 체크리스트
- [ ] 학습 메모 5줄을 앱에 붙여넣기
- [ ] Gemini 응답 또는 fallback 출력 확인
- [ ] Cloud Run 배포 명령 한 번 읽고 필요한 값 표시
- [ ] 데모용 샘플 입력 1개 저장
- [ ] 3분 발표에서 보여줄 화면 순서 정하기

### 오늘 30분 액션
- 이 앱에 실제 Study Jam 메모를 넣고, 나온 퀴즈 5개를 소리 내어 답해보세요.
"""