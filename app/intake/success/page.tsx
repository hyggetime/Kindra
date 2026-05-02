import { redirect } from 'next/navigation'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** 기존 `/intake/success` 북마크 → 통합 결제 안내 URL로 이동 */
export default async function IntakeSuccessRedirectPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = new URLSearchParams()
  const tier = sp.tier
  const report = sp.report
  if (typeof tier === 'string') q.set('tier', tier)
  if (typeof report === 'string') q.set('report', report)
  const suffix = q.toString()
  redirect(suffix ? `/apply/payment?${suffix}` : '/apply/payment')
}
