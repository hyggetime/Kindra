# Kindra Toss 미니앱 UI (정적 export)

`main` Next 앱과 **분리된** 미니앱 전용 패키지입니다. `output: 'export'`로 SSR·Route Handler 없이 빌드합니다.

## 개발

```bash
cd apps/kindra-toss-ui
cp .env.example .env.local
npm install
npm run dev
```

## Mock 구조화 리포트 프리뷰 (API 없음)

확정 JSON 스키마(`chart_scores` + `report_sections`)로 **프리미엄 결과 화면**과 **대기 UI**만 즉시 확인할 때:

- 경로: **`/preview/structured-report/`** (trailing slash)
- 상단 바에서 **대기 UI** / **결과** 전환, **0.1s 플래시**로 로딩을 짧게 보였다가 결과로 돌아갑니다.
- 데이터: `src/lib/kindraStructuredReportMock.ts` 의 `MOCK_KINDRA_STRUCTURED_REPORT` 하드코딩.

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
