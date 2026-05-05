import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'

function detectTossTestKeysFromEnv(): boolean {
  const ck = process.env.NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY?.trim() ?? ''
  const sk = process.env.TOSS_WIDGET_SECRET_KEY?.trim() ?? ''
  return ck.startsWith('test_') && sk.startsWith('test_')
}

type AttachOpts = {
  /** 생략 시 env 의 test_ 키 여부로 판단 */
  isTest?: boolean
}

/** 성공 승인 후 리포트 행에 paymentKey·테스트 여부 기록(컬럼 없으면 경고만). */
export async function attachTossPaymentKeyToReport(
  reportId: string | null,
  paymentKey: string,
  opts?: AttachOpts,
): Promise<void> {
  if (!reportId || !paymentKey) return
  const isTest = opts?.isTest ?? detectTossTestKeysFromEnv()
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from('kindra_reports')
      .update({
        toss_payment_key: paymentKey,
        toss_payment_is_test: isTest,
      })
      .eq('id', reportId)
    if (error) console.warn('[kindra:toss] report toss_payment_key update skipped:', error.message)
  } catch (e) {
    console.warn('[kindra:toss] attach payment key failed:', e)
  }
}
