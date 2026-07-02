import streamlit as st
from dotenv import load_dotenv

from gemini_client import generate_study_brief

load_dotenv()

st.set_page_config(page_title="Study Jam Buddy", page_icon="☁️")
st.title("☁️ Study Jam Buddy")
st.caption("Google Cloud Study Jam Hackathon MVP")

st.markdown("""
Google Cloud Study Jam에서 배운 내용을 **복습 퀴즈, 약점 분석, 다음 실습 액션**으로 바꿉니다.
해커톤 당일에는 학습 메모를 붙여넣고 Gemini 기반 학습 코치 데모를 빠르게 보여줍니다.
""")

learning_notes = st.text_area(
    "학습 메모",
    value="""Cloud Run은 서버를 직접 관리하지 않고 컨테이너를 배포할 수 있게 해준다.
Gemini API는 프롬프트를 입력받아 요약, 퀴즈, 체크리스트 같은 구조화된 결과를 만들 수 있다.
해커톤에서는 복잡한 DB보다 입력-처리-출력이 선명한 MVP가 중요하다.""",
    height=180,
)

goal = st.text_input("오늘 학습 목표", value="Google Cloud Study Jam 내용을 해커톤 데모로 연결하기")
confidence = st.select_slider("현재 자신감", options=["낮음", "보통", "높음"], value="보통")

if st.button("학습 코치 생성", type="primary"):
    if not learning_notes.strip():
        st.warning("학습 메모를 먼저 입력하세요.")
    else:
        with st.spinner("Gemini가 복습 자료를 만드는 중..."):
            source, brief = generate_study_brief(learning_notes, goal, confidence)

        if source == "gemini":
            st.success("Gemini 응답 생성 완료")
        else:
            st.info("API 키가 없거나 호출에 실패해 데모용 백업 출력을 표시합니다.")

        st.markdown(brief)

st.divider()
st.markdown("""
### 해커톤 데모 포인트
1. 학습 메모 입력
2. Gemini가 복습 퀴즈와 약점 개념 생성
3. 다음 실습 체크리스트로 바로 행동 전환
4. API 실패 시에도 fallback 출력으로 발표 지속
""")
