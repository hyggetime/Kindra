import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'

/** @returns true 이면 새로 점유(처리 진행). false 이면 중복 svix-id */
export async function claimResendWebhookEvent(params: {
  svixId: string
  eventType: string
  resendEmailId: string | null
  reportId: string | null
}): Promise<boolean> {
  try {
    const admin = createServiceRoleClient()
    const { error } = await admin.from('kindra_resend_webhook_events').insert({
      svix_id: params.svixId,
      event_type: params.eventType,
      resend_email_id: params.resendEmailId,
      report_id: params.reportId,
    })
    if (!error) return true

    const code = 'code' in error ? String((error as { code?: string }).code) : ''
    const msg = error.message ?? ''
    if (code === '23505' || msg.includes('duplicate') || msg.includes('unique')) {
      return false
    }
    console.error('[kindra:resend-webhook] claim insert error:', error.message)
    return false
  } catch (e) {
    console.error('[kindra:resend-webhook] claim:', e)
    return false
  }
}
