import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { formatKindraReportSerial, normalizeChildNameForReportKey } from '@lib/intake/report-id'

export type AllocateKindraReportSerialParams = {
  ownerEmail: string
  childDisplayName: string
  /** 기본: 현재 시각(서버) */
  at?: Date
  /**
   * 이미 `kindra_reports` 행이 있는데 `session.reportId`만 비어 있는 등 갱신 경로에서,
   * 해당 행은 순번 산정에서 제외합니다.
   */
  excludeReportRowId?: string | null
}

export async function countKindraReportsForChild(
  admin: SupabaseClient,
  ownerEmail: string,
  childDisplayName: string,
  excludeReportRowId?: string | null,
): Promise<number> {
  const emailKey = ownerEmail.trim().toLowerCase()
  const childKey = normalizeChildNameForReportKey(childDisplayName)

  const { data, error } = await admin.from('kindra_reports').select('id, report_json').eq('owner_email', emailKey)

  if (error) {
    console.error('[countKindraReportsForChild]', error.message)
    return 0
  }

  let n = 0
  for (const row of data ?? []) {
    if (excludeReportRowId && row.id === excludeReportRowId) continue
    const j = row.report_json
    if (!j || typeof j !== 'object') continue
    const cn = (j as Record<string, unknown>).childName
    if (typeof cn !== 'string') continue
    if (normalizeChildNameForReportKey(cn) === childKey) n += 1
  }
  return n
}

/** 다음 일련번호 문자열(신규 행 삽입 직전 또는 기존 행 보정 시). */
export async function allocateKindraReportSerial(
  admin: SupabaseClient,
  params: AllocateKindraReportSerialParams,
): Promise<string> {
  const prior = await countKindraReportsForChild(
    admin,
    params.ownerEmail,
    params.childDisplayName,
    params.excludeReportRowId,
  )
  const seq = prior + 1
  const at = params.at ?? new Date()
  return formatKindraReportSerial(at, params.childDisplayName, seq)
}
