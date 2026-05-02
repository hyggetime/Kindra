/** `/apply` 페이지 내 앵커 — `app/apply/page.tsx` 의 `id` 와 일치 */

export const APPLY_PAGE_PATH = '/apply' as const

/** 신청 폼·신뢰 문구 영역 (`#apply-form`) */
export const APPLY_FORM_HREF = `${APPLY_PAGE_PATH}#apply-form` as const

/** 3단계 절차 안내 (`#apply-steps`) */
export const APPLY_STEPS_HREF = `${APPLY_PAGE_PATH}#apply-steps` as const

/** 분석 소개 접기 블록 (`#apply-analysis`) */
export const APPLY_ANALYSIS_HREF = `${APPLY_PAGE_PATH}#apply-analysis` as const
