# 과금 없이 기술 공부 세션

## 결론

이 공부 세션은 **Google Cloud 리소스를 하나도 만들지 않고** 로컬에서만 진행한다.

목표는 클라우드 전문가가 되는 것이 아니라, 해커톤 당일 아래를 설명하고 시연할 수 있게 만드는 것이다.

```text
로컬 Streamlit 앱 실행
  → Gemini API 위치 이해
  → fallback 데모 확인
  → Cloud Run/Firestore/Storage 역할 설명
  → 3분 발표 연결
```

---

## 오늘 60분 루틴

### 0~10분: 로컬 앱 켜기

```bash
cd /Users/oc_currenjin/work/google-cloud-study-jam-hackathon
source .venv/bin/activate
streamlit run src/app.py
```

확인:

- 브라우저에서 앱이 열린다.
- 학습 메모 입력창이 보인다.
- 버튼 클릭 시 API 키 없이도 fallback 결과가 나온다.

완료 기준:

- `API 키가 없거나 호출에 실패해 데모용 백업 출력을 표시합니다.` 메시지를 봤으면 통과.

---

### 10~25분: Streamlit 구조 읽기

볼 파일:

```text
src/app.py
```

읽을 포인트:

- `st.text_area`: 사용자 입력
- `st.text_input`: 목표 입력
- `st.select_slider`: 자신감 선택
- `st.button`: 생성 버튼
- `st.markdown`: 결과 출력

말로 설명하기:

> Streamlit으로 입력 폼과 결과 카드를 빠르게 만들었고, 해커톤 시간 안에 프론트엔드 세팅보다 AI 결과 흐름에 집중했습니다.

---

### 25~40분: Gemini/fallback 구조 읽기

볼 파일:

```text
src/gemini_client.py
src/study_buddy.py
```

읽을 포인트:

- Gemini API 호출은 어디서 일어나는가
- API 키가 없을 때 왜 앱이 죽지 않는가
- fallback 출력이 발표를 어떻게 살리는가

말로 설명하기:

> Gemini API가 가능하면 실시간으로 결과를 생성하고, 네트워크/API 키 문제가 있으면 deterministic fallback으로 같은 데모 흐름을 유지합니다.

---

### 40~50분: Google Cloud 역할만 설명하기

실제 리소스 생성 금지.

| 서비스 | 이번 MVP에서의 설명 |
|---|---|
| Gemini API | 학습/관심 정보를 아이디어, MVP, 발표 대본으로 구조화 |
| Cloud Run | Streamlit 앱을 컨테이너로 배포해 URL 제공 |
| Firestore | 확장 시 팀별 계획/결과 저장 |
| Cloud Storage | 확장 시 발표 자료/스크린샷 저장 |

말로 설명하기:

> 현재 MVP는 비용 통제를 위해 로컬과 fallback 중심으로 만들었고, 공식 크레딧이 확인되면 Cloud Run 배포만 최소 1회 시도합니다.

---

### 50~60분: 3분 발표 연결

연습 문장:

> Study Jam은 기술을 배우게 해주지만, 해커톤 당일에는 그 기술을 문제, MVP, 아키텍처, 발표로 바꾸는 능력이 필요합니다. Study Jam Buddy: Hackathon Co-pilot은 배운 기술과 관심 문제를 입력하면 Gemini가 120분 안에 만들 수 있는 MVP와 발표 흐름으로 바꿔주는 AI 실행 코치입니다.

---

## 오늘 절대 하지 않을 것

- GCP 프로젝트에서 리소스 만들기
- Cloud Run 실제 배포
- Firestore/Storage 버킷 생성
- Vertex AI Endpoint/GPU 사용
- Cloud SQL/GKE/BigQuery 실습
- API 호출 반복 테스트

---

## 오늘 완료 체크리스트

- [ ] 로컬 앱 실행 가능
- [ ] API 키 없이 fallback 결과 확인
- [ ] `src/app.py`에서 입력/버튼/출력 위치 설명 가능
- [ ] `src/gemini_client.py`에서 Gemini 호출 위치 설명 가능
- [ ] Cloud Run/Firestore/Storage를 실제 생성 없이 역할만 설명 가능
- [ ] 3분 발표 첫 문단 말할 수 있음

---

## 한 줄 원칙

**과금 없이 공부할 때는 클라우드 리소스를 만들지 말고, 로컬 MVP와 설명 능력을 먼저 완성한다.**
