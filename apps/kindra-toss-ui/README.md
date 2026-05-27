# Kindra Toss 미니앱 UI (정적 export)

`main` Next 앱과 **분리된** 미니앱 전용 패키지입니다. `output: 'export'`로 SSR·Route Handler 없이 빌드합니다.

## 개발

```bash
cd apps/kindra-toss-ui
cp .env.example .env.local
npm install
npm run dev
```

## 구조화 리포트 프리뷰 (`/preview/structured-report/`)

### Mock 전용 UI

확정 JSON 스키마(`chart_scores` + `report_sections`)로 **프리미엄 결과 화면**과 **대기 UI**만 즉시 확인할 때:

- 경로: **`/preview/structured-report/`** (trailing slash)
- 상단 바에서 **대기 UI** / **결과** 전환, **0.1s 플래시**로 로딩을 짧게 보였다가 결과로 돌아갑니다.
- 데이터: `src/lib/kindraStructuredReportMock.ts` 의 `MOCK_KINDRA_STRUCTURED_REPORT` 하드코딩.

### 실시간 분석 (루트 Gemini 엔진)

1. 루트 Kindra 웹을 띄웁니다: 저장소 루트에서 `npm run dev` (기본 **http://localhost:3000**). `.env.local`에 `GEMINI_API_KEY` 필요. API는 `development` 또는 `ALLOW_PROMPT_PLAYGROUND=1` 일 때만 열립니다.
2. 미니앱: `cd apps/kindra-toss-ui && npm run dev` (**http://localhost:3001** — 루트 `.env.example` 의 `KINDRA_STRUCTURED_REPORT_CORS_ORIGIN` 과 맞춤).
3. `.env.local` (미니앱)에 선택: `NEXT_PUBLIC_KINDRA_WEB_API_ORIGIN=http://localhost:3000` (기본값과 동일하면 생략 가능).
4. 프리뷰 페이지 **「실제 엔드포인트 실시간 분석 가동」** — 이미지를 고르지 않으면 루트 `public/gallery/` 5장을 가져와 `POST /api/kindra-structured-report` 로 `generateKindraStructuredChartReport` 를 호출합니다. 성공 시 Mock이 **실시간 JSON으로 덮어써집니다.**

교차 출처(CORS)는 기본적으로 요청 `Origin` 을 에코합니다. 필요 시 루트에 `KINDRA_STRUCTURED_REPORT_CORS_ORIGIN` 을 설정하세요.

## 프로덕션 정적 산출

```bash
npm run build
# 산출물: out/
```

## 브랜치

- 이 디렉터리 전체는 **`dev1-toss-ui`** 브랜치에서 다루는 것을 권장합니다.

## 연동

- Supabase 테이블: `kindra_miniapp_orders` (제안 SQL: `supabase/sql/proposed_miniapp_orders.sql`)
- 분석 실행: `supabase/functions/kindra-analyze-order`
