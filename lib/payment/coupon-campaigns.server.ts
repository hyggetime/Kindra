import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'

import type { CouponResolveResult } from '@lib/payment/coupon-resolve.server'
import { checkoutAmountAfterDiscountWon } from '@lib/payment/coupon-resolve.server'

type CampaignRow = {
  id: string
  code: string
  display_name: string
  discount_won: number
  max_redemptions: number
  active: boolean
}

async function fetchCampaignByCode(normalized: string): Promise<CampaignRow | null> {
  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from('kindra_coupon_campaigns')
    .select('id, code, display_name, discount_won, max_redemptions, active')
    .eq('code', normalized)
    .maybeSingle()

  if (error) {
    console.warn('[coupon-campaigns] fetch campaign', error.message)
    return null
  }
  if (!data || typeof (data as CampaignRow).id !== 'string') return null
  return data as CampaignRow
}

async function countRedemptions(campaignId: string): Promise<number> {
  const admin = createServiceRoleClient()
  const { count, error } = await admin
    .from('kindra_coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)

  if (error) {
    console.warn('[coupon-campaigns] count redemptions', error.message)
    return Number.POSITIVE_INFINITY
  }
  return typeof count === 'number' ? count : 0
}

async function hasRedemptionForReport(campaignId: string, reportId: string): Promise<boolean> {
  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from('kindra_coupon_redemptions')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('report_id', reportId)
    .maybeSingle()

  if (error) {
    console.warn('[coupon-campaigns] has redemption', error.message)
    return true
  }
  return Boolean(data)
}

/**
 * DB 캠페인 + 한도·리포트당 1회 규칙으로 결제 금액을 계산합니다.
 * 테이블이 없거나 조회 실패 시(로컬 미마이그) 알 수 없는 코드로 처리합니다.
 */
export async function resolveCheckoutCouponAsync(
  listedPriceWon: number,
  couponRaw: string | null | undefined,
  reportId: string | null | undefined,
): Promise<CouponResolveResult> {
  const listed = Math.max(0, Math.round(Number(listedPriceWon) || 0))
  const trimmed = String(couponRaw ?? '').trim()
  if (!trimmed) {
    return { ok: true, amountWon: listed, discountWon: 0, couponNormalized: null, displayName: null }
  }

  const code = trimmed.toUpperCase()
  const campaign = await fetchCampaignByCode(code)
  if (!campaign) {
    return {
      ok: false,
      message: '사용할 수 없는 쿠폰 코드예요. 코드를 확인하거나 비워 두고 진행해 주세요.',
    }
  }

  if (!campaign.active) {
    return { ok: false, message: '종료되었거나 사용할 수 없는 프로모션 코드예요.' }
  }

  const rid = typeof reportId === 'string' && reportId.trim().length > 0 ? reportId.trim().toLowerCase() : null
  if (rid) {
    const already = await hasRedemptionForReport(campaign.id, rid)
    if (already) {
      return {
        ok: false,
        message: '이미 이 신청에 프로모션 코드가 적용된 기록이 있어요. 고객센터로 문의해 주세요.',
      }
    }
  }

  const used = await countRedemptions(campaign.id)
  if (used >= campaign.max_redemptions) {
    return { ok: false, message: '프로모션 사용 한도가 마감되었어요. 쿠폰 없이 진행해 주세요.' }
  }

  const { amountWon, discountWon } = checkoutAmountAfterDiscountWon(listed, campaign.discount_won)

  return {
    ok: true,
    amountWon,
    discountWon,
    couponNormalized: campaign.code,
    displayName: campaign.display_name,
  }
}

/**
 * 결제 확정 후(토스 승인·무통장 입금 확인) 1회 호출. 동일 리포트·캠페인은 unique 로 멱등.
 */
export async function recordCouponRedemptionAfterPayment(
  reportId: string | null | undefined,
  couponNormalized: string | null | undefined,
  source: 'toss' | 'bank_deposit',
): Promise<void> {
  const rid = typeof reportId === 'string' && reportId.trim().length > 0 ? reportId.trim().toLowerCase() : null
  const code = typeof couponNormalized === 'string' && couponNormalized.trim().length > 0 ? couponNormalized.trim().toUpperCase() : null
  if (!rid || !code) return

  const campaign = await fetchCampaignByCode(code)
  if (!campaign) return

  const admin = createServiceRoleClient()
  const { error } = await admin.from('kindra_coupon_redemptions').insert({
    campaign_id: campaign.id,
    report_id: rid,
    source,
  })

  if (error) {
    if (error.code === '23505') {
      return
    }
    console.warn('[coupon-campaigns] redemption insert', error.message)
  }
}
