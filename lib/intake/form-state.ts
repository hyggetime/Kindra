/** 통합 인테이크 폼 상태 — `app/` 밖에 두어 RSC 기본(서버 모듈)과 충돌하지 않게 함 */

import type { PriceTier } from '@lib/constants'

export type IntegratedIntakeReportMeta = {
  intakeId: string
  reportId: string
  applicantLabel: string
  childLabel: string
  /** 생년월일 한 줄 + 관찰 자료(그림 장수 등). 생년월일은 `formatBirthLineForReportCard` 한 번만 포함 */
  birthAndMaterials: string
  childShortName: string
  imageCount: number
}

export type IntegratedIntakeState = {
  ok: boolean
  message: string
  reportMarkdown?: string
  reportMeta?: IntegratedIntakeReportMeta
  /** 신청 시점 요금 구간 (성공 시에만) */
  priceTier?: PriceTier
  /** `kindra_reports.id` — 성공 시 결제/입금 안내 페이지에서 사용 */
  reportRowId?: string
}

export const integratedIntakeInitialState: IntegratedIntakeState = {
  ok: false,
  message: '',
}
