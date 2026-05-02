# Kindra × Google Gemini

## 코드에서 이미 준비된 것

- `@google/generative-ai` 의존성
- `lib/gemini/prompts.ts` — 시스템 지침·1~5장 멀티모달 프로토콜·Few-shot·전통적 그림심리 참고 프레임
- `lib/gemini/generate.ts` — 서버 전용 호출 (`GEMINI_API_KEY`)
- `app/actions/intake-submit.ts` — `submitIntegratedIntake` (DB + Storage + Gemini 한 번에)
- `app/apply/ApplyIntegratedForm.tsx` — `/apply` 통합 폼
- `next.config.ts` — `experimental.serverActions.bodySizeLimit: '22mb'` (5장 업로드용)

## 배포(Vercel) 시

- Project → Settings → Environment Variables 에 **`GEMINI_API_KEY`**, (선택) **`GEMINI_MODEL`** 추가
- CSP는 **브라우저** 요청만 제한합니다. Server Action → Google API 는 서버에서 나가므로 `connect-src`에 Generative Language API 를 넣을 필요는 없습니다.

## 로컬에서 안 될 때

1. `.env.local` 에 `GEMINI_API_KEY=` 가 있는지 (따옴표 없이 붙여넣기)
2. 모델 404 시 `GEMINI_MODEL=gemini-1.5-flash` 등으로 변경
3. 본문 413 시 `next.config` 의 `bodySizeLimit` 과 폼의 이미지 용량(각 4MB 이하) 확인
