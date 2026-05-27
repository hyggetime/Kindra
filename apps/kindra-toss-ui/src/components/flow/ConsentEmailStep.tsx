'use client'

import Link from 'next/link'
import { useState } from 'react'

type Props = {
  onSubmit: (input: { email: string; terms: boolean; marketing: boolean }) => void | Promise<void>
  /** true면 제출 버튼 비활성화 (예: Supabase 환경 변수 없음) */
  disabled?: boolean
}

export function ConsentEmailStep({ onSubmit, disabled = false }: Props) {
  const [email, setEmail] = useState('')
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <section className="rounded-2xl border border-[#e8e4dc] bg-white/90 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#3d3d3d]">약관 · 마케팅 · 이메일</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6b6b6b]">
        실제 서비스 문구·개인정보 처리방침 링크는 토스 심사 기준에 맞게 교체하세요.
      </p>

      <label className="mt-6 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#7c9070]"
        />
        <span>(필수) 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
      </label>

      <label className="mt-4 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#7c9070]"
        />
        <span>(선택) 이벤트·혜택 안내 이메일/알림 수신에 동의합니다.</span>
      </label>

      <label className="mt-6 block text-sm font-medium text-[#4a4a4a]">
        이메일 (결과 안내)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="parent@example.com"
          className="mt-2 w-full rounded-xl border border-[#e4ddd3] px-4 py-3 text-sm outline-none ring-0 focus:border-[#7c9070]"
        />
      </label>

      <button
        type="button"
        disabled={pending || !terms || !email.trim() || disabled}
        onClick={async () => {
          setPending(true)
          try {
            await onSubmit({ email: email.trim(), terms, marketing })
          } finally {
            setPending(false)
          }
        }}
        className="mt-8 w-full rounded-full bg-[#7c9070] py-3.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-[#687d5d] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? '처리 중…' : '분석 요청하기'}
      </button>

      {disabled ? (
        <p className="mt-4 rounded-xl border border-[#e8e4dc] bg-[#f7f5f2] px-3 py-2.5 text-xs leading-relaxed text-[#5c5c5c]">
          지금은 분석 신청을 받을 수 없어요.{' '}
          <Link
            href="/preview/structured-report/"
            className="font-semibold text-[#4d6b46] underline decoration-[#7c9070]/40 underline-offset-2"
          >
            샘플 리포트 전체 보기 →
          </Link>
        </p>
      ) : null}
    </section>
  )
}
