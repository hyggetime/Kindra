'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createDevBypassIntakeReport } from '@app/actions/dev-bypass-intake'

export function DevIntakeBypassClient() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200/90 bg-amber-50/80 px-5 py-6 text-sm text-amber-950 shadow-sm">
      <p className="font-semibold text-amber-950">로컬 개발 전용</p>
      <p className="mt-2 leading-relaxed text-amber-950/90">
        신청 폼·그림·Gemini 없이 <code className="rounded bg-white/80 px-1 font-mono text-xs">kindra_reports</code>{' '}
        더미 행만 만들고 결제 안내 페이지로 이동합니다. 프로덕션 빌드에서는 비활성입니다.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null)
          startTransition(() => {
            void createDevBypassIntakeReport().then((r) => {
              if (r.ok) {
                router.push(r.redirectPath)
                return
              }
              setMsg(r.message)
            })
          })
        }}
        className="mt-5 w-full rounded-xl bg-amber-900 py-3 text-sm font-semibold text-white transition hover:bg-amber-950 disabled:opacity-60"
      >
        {pending ? '생성 중…' : '더미 신청 생성 후 결제 안내로 이동'}
      </button>
      {msg ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  )
}
