'use server'

import { randomUUID } from 'node:crypto'

import type { IntakeReportSessionPayload } from '@lib/intake/intake-report-session'
import { isDevIntakeBypassEnabled } from '@lib/intake/dev-intake-bypass'
import { allocateKindraReportSerial } from '@lib/intake/report-serial-allocation.server'
import { LIST_PRICE_WON } from '@lib/constants'
import { buildApplyPaymentPath } from '@lib/payment/parse-payment-page-params'
import { setReportAccessCookie } from '@lib/payment/report-access-cookie.server'
import { STORED_KINDRA_INTAKE_SCHEMA } from '@lib/reports/resolve-report-json'
import { createServiceRoleClient } from '@lib/supabase/admin'

export type DevBypassIntakeResult =
  | { ok: true; redirectPath: string }
  | { ok: false; message: string }

/**
 * 신청 폼·Gemini·스토리지 없이 `kindra_reports` 더미 행만 넣고 결제 안내로 이어갈 수 있게 함.
 * 로컬 전용 (`isDevIntakeBypassEnabled`).
 */
export async function createDevBypassIntakeReport(): Promise<DevBypassIntakeResult> {
  if (!isDevIntakeBypassEnabled()) {
    return { ok: false, message: '이 기능은 로컬 개발 환경에서만 사용할 수 있어요.' }
  }

  const admin = createServiceRoleClient()
  const intakeId = randomUUID()
  const childDisplayName = '테스트아이'
  const parentName = '테스트보호자'
  const email = `bypass.local+${Date.now()}@example.invalid`

  const reportMarkdown =
    '# 로컬 바이패스 리포트\n\n개발용 더미 마크다운입니다. 실제 신청·분석 없이 생성된 행이에요.\n'
  const birthAndMaterials = '테스트 · 제출 그림 0장'
  const stableReportId = await allocateKindraReportSerial(admin, {
    ownerEmail: email.trim().toLowerCase(),
    childDisplayName,
  })

  const heroTitleLines: [string, string] = [`${childDisplayName}의 그림 (바이패스)`, '테스트용 더미']
  const sessionPayload: IntakeReportSessionPayload = {
    v: 2,
    reportId: stableReportId,
    intakeId,
    markdown: reportMarkdown,
    subject: {
      applicantLabel: `${parentName} 님`,
      childLabel: `${childDisplayName} (남아)`,
      birthAndMaterials,
    },
    childShortName: childDisplayName,
    heroTitleLines,
  }

  const reportUuid = randomUUID()
  const { error } = await admin.from('kindra_reports').insert({
    id: reportUuid,
    owner_email: email,
    title: `${childDisplayName} · 통합 리포트 (바이패스)`,
    listed_price_won: LIST_PRICE_WON,
    report_json: {
      schema: STORED_KINDRA_INTAKE_SCHEMA,
      childName: childDisplayName,
      parentEmail: email,
      session: sessionPayload,
    },
  })

  if (error) {
    console.error('[createDevBypassIntakeReport]', error.message)
    return { ok: false, message: `DB 저장 실패: ${error.message}` }
  }

  try {
    await setReportAccessCookie(reportUuid)
  } catch (e) {
    console.error('[createDevBypassIntakeReport] cookie', e)
  }

  return { ok: true, redirectPath: buildApplyPaymentPath(reportUuid) }
}
