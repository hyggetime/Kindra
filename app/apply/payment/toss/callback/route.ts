import { handleTossPaymentCallbackGet } from '@lib/payment/toss-callback-handler.server'

export const dynamic = 'force-dynamic'
/** Gemini·스토리지 등으로 `after()` 작업이 길어질 수 있음(Vercel 플랜별 상한 적용). */
export const maxDuration = 300

export async function GET(request: Request) {
  return handleTossPaymentCallbackGet(request)
}
