# 3-Minute Judging Story

## One-liner

Study Jam Buddy는 Google Cloud Study Jam 학습 메모를 Gemini로 복습 퀴즈, 약점 분석, 다음 실습 액션으로 바꿔주는 AI 학습 코치입니다.

## 0:00-0:30 Problem

Study Jam에서는 짧은 시간에 많은 개념과 실습을 따라갑니다. 그런데 참가자는 끝나고 나면 “무엇을 이해했고, 어디가 약하고, 다음에 뭘 해야 하는지”가 흐려지기 쉽습니다.

## 0:30-1:00 Solution

Study Jam Buddy는 학습 메모와 목표를 입력받아 Gemini로 5줄 요약, 복습 퀴즈, 약점 개념, 다음 실습 체크리스트, 오늘 30분 액션을 생성합니다.

## 1:00-2:20 Demo

1. Cloud Run/Gemini API 학습 메모 입력
2. 현재 자신감 선택
3. “학습 코치 생성” 버튼 클릭
4. Gemini가 만든 복습 퀴즈와 약점 개념 확인
5. 다음 실습 체크리스트와 오늘 30분 액션 확인

## 2:20-2:50 Google Cloud Fit

Gemini API가 비정형 학습 메모를 구조화된 학습 계획으로 바꾸고, Streamlit 앱은 Cloud Run으로 빠르게 배포할 수 있습니다. 향후 Google Sheets와 연동하면 스터디별 학습 기록과 복습 이력을 누적할 수 있습니다.

## 2:50-3:00 Closing

AI를 단순한 답변 생성기가 아니라, 배운 내용을 실제 행동으로 바꾸는 학습 파트너로 쓰고 싶었습니다.
