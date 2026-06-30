# Stage 03 — Cloud Run Deploy

목표: Cloud Run 공개 URL을 확보한다.

## 예정 명령

```bash
gcloud run deploy small-table-matcher   --source .   --region asia-northeast3   --allow-unauthenticated
```

## 완료 기준

- 공개 URL 접속 가능
- 로컬 데모 백업도 가능

## 주의

- 배포가 막히면 Cloud Run을 포기하고 로컬 데모 + 스크린샷으로 전환한다.
