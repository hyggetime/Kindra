import { handleTossPaymentCallbackGet } from '@lib/payment/toss-callback-handler.server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return handleTossPaymentCallbackGet(request)
}
