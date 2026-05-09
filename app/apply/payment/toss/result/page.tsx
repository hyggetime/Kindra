import type { Metadata } from 'next'
import Link from 'next/link'

import { ApplyPageShell } from '../../../ApplyPageShell'

export const metadata: Metadata = {
  title: '결제 결과 — 킨드라 Kindra',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function pick(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return ''
}

export default async function TossPaymentResultPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const status = pick(sp, 'status') || 'invalid_query'
  const detail = pick(sp, 'detail')

  if (status === 'success') {
    return (
      <ApplyPageShell>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C9070]/90">결제 완료</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#2F3D2E]">감사합니다</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#5A5A5A]">
            카드·간편결제가 완료되었어요. 입금 확인 후 리포트 발송을 진행할게요. 문의는 고객지원 이메일 또는 카카오톡 채널로
            연락 주세요.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#7C9070] px-8 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D]"
          >
            메인으로
          </Link>
        </div>
      </ApplyPageShell>
    )
  }

  if (status === 'invalid_query') {
    return (
      <ApplyPageShell>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-lg font-bold text-[#3D3D3D]">결제 정보가 올바르지 않아요</h1>
          <p className="mt-3 text-sm text-[#6B6B6B]">주소를 직접 입력하셨거나 결제 세션이 만료되었을 수 있어요.</p>
          <Link href="/apply/payment" className="mt-8 inline-block text-sm font-semibold text-[#5A6F52] underline">
            결제 안내로 돌아가기
          </Link>
        </div>
      </ApplyPageShell>
    )
  }

  if (status === 'mismatch') {
    return (
      <ApplyPageShell>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-lg font-bold text-[#3D3D3D]">주문 정보가 일치하지 않아요</h1>
          <p className="mt-3 text-sm text-[#6B6B6B]">
            결제 준비 정보를 찾지 못했거나 금액·주문번호가 일치하지 않습니다. 결제 안내에서 다시 시도해 주세요.
          </p>
          <Link href="/apply/payment" className="mt-8 inline-block text-sm font-semibold text-[#5A6F52] underline">
            결제 안내로 돌아가기
          </Link>
        </div>
      </ApplyPageShell>
    )
  }

  if (status === 'expired') {
    return (
      <ApplyPageShell>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-lg font-bold text-[#3D3D3D]">결제 준비 시간이 지났어요</h1>
          <p className="mt-3 text-sm text-[#6B6B6B]">30분 이내에 결제를 완료해 주세요.</p>
          <Link href="/apply/payment" className="mt-8 inline-block text-sm font-semibold text-[#5A6F52] underline">
            다시 결제하기
          </Link>
        </div>
      </ApplyPageShell>
    )
  }

  if (status === 'confirm_failed') {
    return (
      <ApplyPageShell>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-lg font-bold text-[#B85C5C]">결제 승인에 실패했어요</h1>
          <p className="mt-3 whitespace-pre-wrap text-sm text-[#6B6B6B]">{detail || '결제 승인에 실패했습니다.'}</p>
          <Link href="/apply/payment" className="mt-8 inline-block text-sm font-semibold text-[#5A6F52] underline">
            결제 안내로 돌아가기
          </Link>
        </div>
      </ApplyPageShell>
    )
  }

  return (
    <ApplyPageShell>
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-lg font-bold text-[#3D3D3D]">결제 정보가 올바르지 않아요</h1>
        <p className="mt-3 text-sm text-[#6B6B6B]">알 수 없는 상태로 돌아왔어요. 결제 안내에서 다시 시도해 주세요.</p>
        <Link href="/apply/payment" className="mt-8 inline-block text-sm font-semibold text-[#5A6F52] underline">
          결제 안내로 돌아가기
        </Link>
      </div>
    </ApplyPageShell>
  )
}
