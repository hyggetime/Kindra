# `kindra-analyze-order` (Supabase Edge Function)

`kindra_miniapp_orders` 행이 **`pending`으로 INSERT**될 때 Database Webhook이 이 함수를 호출해 Gemini 분석 후 `completed` / `failed`로 갱신하는 **보일러플레이트**입니다.

## 로컬 실행

```bash
cd supabase
supabase secrets set GEMINI_API_KEY=xxx KINDRA_WEBHOOK_SECRET=yyy
supabase functions serve kindra-analyze-order --no-verify-jwt
```

## 배포

```bash
supabase functions deploy kindra-analyze-order --no-verify-jwt
```

`--no-verify-jwt`: Supabase Database Webhook은 사용자 JWT가 아니라 **공유 시크릿 헤더**로 보호합니다.

## Webhook 페이로드

Supabase가 보내는 본문은 프로젝트/버전에 따라 다를 수 있습니다. `index.ts`의 `extractInsertedRow()`를 실제 페이로드에 맞게 조정하세요.

## Gemini 이식

- 웹앱 기준 구현: `lib/gemini/generate.ts`, `lib/gemini/prompts.ts`
- Edge(Deno)에서는 `npm:@google/generative-ai` 또는 `esm.sh`로 import 후, **동일 프롬프트 조립**을 포팅합니다.

## 보안

- `SUPABASE_SERVICE_ROLE_KEY`: Edge Secrets에만. 클라이언트 번들에 넣지 않음.
- `KINDRA_WEBHOOK_SECRET`: Webhook 설정과 Edge Secrets 동일 값.
