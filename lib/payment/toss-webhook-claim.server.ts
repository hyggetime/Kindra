import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'

/** @returns true 이면 새로 점유한 것(처리 진행). false 이면 중복 transmission id */
export async function claimTossWebhookEvent(params: {
  transmissionId: string
  eventType: string
  paymentKey: string | null
  orderId: string | null
}): Promise<boolean> {
  try {
    const admin = createServiceRoleClient()
    const { error } = await admin.from('kindra_toss_webhook_events').insert({
      transmission_id: params.transmissionId,
      event_type: params.eventType,
      payment_key: params.paymentKey,
      order_id: params.orderId,
    })
    if (!error) return true

    const code = 'code' in error ? String((error as { code?: string }).code) : ''
    const msg = error.message ?? ''
    if (code === '23505' || msg.includes('duplicate') || msg.includes('unique')) {
      return false
    }
    console.error('[kindra:toss-webhook] claim insert error:', error.message)
    return false
  } catch (e) {
    console.error('[kindra:toss-webhook] claim:', e)
    return false
  }
}
