'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function FailInner() {
  const sp = useSearchParams()
  const code = sp.get('code') ?? ''
  const message = sp.get('message') ?? ''

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-lg font-semibold text-[#2a3428]">결제가 완료되지 않았어요</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5c5c5c]">
        {message ? `${message} ` : null}
        {code ? <span className="font-mono text-xs text-[#8a8a8a]">({code})</span> : null}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[#7c9070] px-6 py-3 text-sm font-semibold text-white"
      >
        처음으로
      </Link>
    </main>
  )
}

export default function TossPaymentFailPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-4 py-10 text-sm">…</main>}>
      <FailInner />
    </Suspense>
  )
}
