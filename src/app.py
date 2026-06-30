import os
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="Small Table Matcher", page_icon="🍽️")
st.title("🍽️ Small Table Matcher")
st.caption("Google Cloud Study Jam Hackathon MVP")

st.markdown("""
사람들의 관심사와 고민을 바탕으로 작은 모임의 대화 흐름을 제안합니다.

현재 파일은 해커톤용 최소 골격입니다. `stages/`를 순서대로 진행하면서 기능을 채워 넣으세요.
""")

participants = st.text_area(
    "참가자 정보",
    value="""A: 이직 고민, 백엔드 개발자, 조용한 편
B: 창업 관심, 활발한 편
C: 신앙과 일의 균형 고민, 듣는 편""",
    height=160,
)

purpose = st.text_input("모임 목적", value="서로를 더 깊이 이해하고 다음 한 걸음을 돕기")

if st.button("대화 설계 생성"):
    st.info("다음 단계에서 Gemini API 호출로 교체합니다.")
    st.markdown("""
### 추천 흐름 초안

1. 아이스브레이크: 요즘 마음을 한 단어로 표현하기
2. 깊은 질문: 지금 가장 에너지를 쓰는 고민은 무엇인가?
3. 연결 질문: 서로에게 줄 수 있는 작은 도움은 무엇인가?
4. 마무리: 이번 주 작은 실천 1개 정하기

### 해커톤 TODO

- `stages/01-gemini-api`에서 Gemini 호출 함수 만들기
- `stages/02-streamlit-mvp`에서 이 버튼과 연결하기
- `stages/04-demo-script`로 3분 발표 준비하기
""")
