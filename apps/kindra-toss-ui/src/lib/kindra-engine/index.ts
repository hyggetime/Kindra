/**
 * 킨드라 프롬프트·파싱·리포트 뷰 모델 — 순수 함수만 (RN/웹 공용, 향후 `packages/shared`).
 *
 * 웹 단일 소스(동기화 시 참고):
 * - `lib/gemini/prompts.ts` — 시스템·유저 프롬프트 문구
 * - `lib/gemini/kindra-structured-json-report.ts` — JSON 스키마·파서·폴백
 * - `lib/gemini/generate.ts` — Gemini API 호출(서버 전용)
 * - `lib/kindra-premium-intake-map.ts` — 인테이크 → 유저 컨텍스트
 * - `lib/intake/physio-emotional-from-growth.ts` — 성장도표 프롬프트 블록(서버)
 */

export * from './types'
export * from './parse'
export * from './prompts'
export * from './premiumIntakeMap'
export * from './chartView'
