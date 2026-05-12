import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'
import { createServerSupabaseClient } from '@lib/supabase/server'

export type KindraReportPublicRow = {
  report_json: unknown
  intake_id: string | null
}

/**
 * `/reports/{uuid}` 공개 열람용 `kindra_reports` 1행.
 *
 * 1) 로그인 세션이 있고 RLS(본인 이메일)로 읽을 수 있으면 그 행.
 * 2) 아니면 서비스 롤로 읽되, 아래 중 하나일 때만 공개(메일·복사 링크로 비로그인 접근).
 *    - 관리자 **발송 완료**(`is_sent`), 또는
 *    - **무통장 입금 확인**(`deposit_confirmed`), 또는
 *    - **카드·간편결제 승인**(`toss_payment_key` 존재) — 발송 체크 전에도 링크를 보낸 경우 포함.
 *
 * 미결제·미입금 건은 UUID를 알아도 열람되지 않습니다.
 */
export async function fetchKindraReportRowForPublicUuid(uuid: string): Promise<KindraReportPublicRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data: asUser, error: userErr } = await supabase
    .from('kindra_reports')
    .select('report_json, intake_id')
    .eq('id', uuid)
    .maybeSingle()

  if (!userErr && asUser?.report_json) {
    return {
      report_json: asUser.report_json,
      intake_id:
        typeof (asUser as { intake_id?: string | null }).intake_id === 'string'
          ? (asUser as { intake_id: string }).intake_id
          : null,
    }
  }

  try {
    const admin = createServiceRoleClient()
    const { data: pub, error: pubErr } = await admin
      .from('kindra_reports')
      .select('report_json, intake_id, is_sent, deposit_confirmed, toss_payment_key')
      .eq('id', uuid)
      .maybeSingle()

    if (pubErr || !pub?.report_json) return null

    const sent = Boolean((pub as { is_sent?: boolean | null }).is_sent)
    const dep = Boolean((pub as { deposit_confirmed?: boolean | null }).deposit_confirmed)
    const tpk = (pub as { toss_payment_key?: string | null }).toss_payment_key
    const hasCard = typeof tpk === 'string' && tpk.trim().length > 0
    if (!sent && !dep && !hasCard) return null

    return {
      report_json: pub.report_json,
      intake_id:
        typeof (pub as { intake_id?: string | null }).intake_id === 'string'
          ? (pub as { intake_id: string }).intake_id
          : null,
    }
  } catch {
    return null
  }
}
