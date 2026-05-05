import Link from 'next/link'

import { ApplyPageShell } from '../../../ApplyPageShell'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function pick(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return ''
}

export default async function TossPaymentFailPage({ searchParams }: Props) {
  const sp = await searchParams
  const code = pick(sp, 'code')
  const message = pick(sp, 'message')

  return (
    <ApplyPageShell>
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B85C5C]/90">결제 중단</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3D3D3D]">결제가 완료되지 않았어요</h1>
        {message ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-[#6B6B6B]">{message}</p>
        ) : (
          <p className="mt-4 text-sm text-[#6B6B6B]">결제를 취소했거나 일시적인 오류가 있었을 수 있어요.</p>
        )}
        {code ? (
          <p className="mt-2 font-mono text-[11px] text-[#9A9A9A]">
            코드: {code}
          </p>
        ) : null}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/apply/payment"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#7C9070] px-8 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D]"
          >
            결제 안내로 돌아가기
          </Link>
          <Link href="/" className="text-sm font-medium text-[#5A6F52] underline underline-offset-2">
            메인으로
          </Link>
        </div>
      </main>
    </ApplyPageShell>
  )
}
