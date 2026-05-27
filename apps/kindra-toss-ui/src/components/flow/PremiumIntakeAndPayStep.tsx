'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useKindraPayment } from '@/hooks/useKindraPayment'
import {
  createDefaultPremiumGalleryUrls,
  type KindraPremiumIntakePayload,
} from '@/lib/kindraPremiumIntakeTypes'

type Props = {
  /** Supabase 데모 플로우로 전환 */
  onSwitchLegacy: () => void
}

function emptyPayload(origin: string): KindraPremiumIntakePayload {
  const urls = createDefaultPremiumGalleryUrls(origin)
  return {
    childName: '',
    childAgeLabel: '',
    childGender: 'unspecified',
    imageUrls: urls,
    parentMemo: '',
    guardianEmail: '',
    marketingOptIn: false,
  }
}

/**
 * 프리미엄 인테이크 UI — Toss는 `useKindraPayment` 안에만 존재합니다.
 */
export function PremiumIntakeAndPayStep({ onSwitchLegacy }: Props) {
  const { requestPremiumPayment } = useKindraPayment()
  const [p, setP] = useState<KindraPremiumIntakePayload>(() =>
    emptyPayload(typeof window !== 'undefined' ? window.location.origin : ''),
  )
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const setUrl = (index: number, value: string) => {
    const next = [...p.imageUrls] as [string, string, string, string, string]
    next[index] = value
    setP({ ...p, imageUrls: next })
  }

  const canPay =
    p.childName.trim().length > 0 &&
    p.childAgeLabel.trim().length > 0 &&
    Boolean(p.guardianEmail?.trim()) &&
    terms &&
    p.imageUrls.every((u) => u.trim().length > 0)

  return (
    <section className="rounded-2xl border border-[#e8e4dc] bg-white/90 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#3d3d3d]">프리미엄 5장 · 인테이크</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6b6b6b]">
        아이 정보와 그림 URL 5개를 묶어 결제 후 구조화 리포트 파이프라인으로 전달합니다.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#4a4a4a]">
          아이 이름
          <input
            value={p.childName}
            onChange={(e) => setP({ ...p, childName: e.target.value })}
            className="mt-2 w-full rounded-xl border border-[#e4ddd3] px-3 py-2.5 text-sm outline-none focus:border-[#7c9070]"
          />
        </label>
        <label className="block text-sm font-medium text-[#4a4a4a]">
          나이 (표기)
          <input
            value={p.childAgeLabel}
            onChange={(e) => setP({ ...p, childAgeLabel: e.target.value })}
            placeholder="예: 만 5세 3개월"
            className="mt-2 w-full rounded-xl border border-[#e4ddd3] px-3 py-2.5 text-sm outline-none focus:border-[#7c9070]"
          />
        </label>
        <label className="block text-sm font-medium text-[#4a4a4a] sm:col-span-2">
          성별
          <select
            value={p.childGender}
            onChange={(e) =>
              setP({
                ...p,
                childGender: e.target.value as KindraPremiumIntakePayload['childGender'],
              })
            }
            className="mt-2 w-full rounded-xl border border-[#e4ddd3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7c9070]"
          >
            <option value="unspecified">선택 안 함</option>
            <option value="female">여아</option>
            <option value="male">남아</option>
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-[#4a4a4a]">그림 URL (5장)</p>
        {p.imageUrls.map((url, i) => (
          <label key={i} className="block text-xs text-[#6b6b6b]">
            {i + 1}번
            <input
              value={url}
              onChange={(e) => setUrl(i, e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e4ddd3] px-3 py-2 font-mono text-[11px] outline-none focus:border-[#7c9070]"
            />
          </label>
        ))}
        <button
          type="button"
          className="text-xs font-medium text-[#4d6b46] underline underline-offset-2"
          onClick={() =>
            setP({
              ...p,
              imageUrls: createDefaultPremiumGalleryUrls(
                typeof window !== 'undefined' ? window.location.origin : '',
              ),
            })
          }
        >
          샘플 갤러리 URL로 다시 채우기
        </button>
      </div>

      <label className="mt-6 block text-sm font-medium text-[#4a4a4a]">
        부모 메모
        <textarea
          value={p.parentMemo}
          onChange={(e) => setP({ ...p, parentMemo: e.target.value })}
          rows={3}
          className="mt-2 w-full resize-y rounded-xl border border-[#e4ddd3] px-3 py-2.5 text-sm outline-none focus:border-[#7c9070]"
        />
      </label>

      <label className="mt-6 block text-sm font-medium text-[#4a4a4a]">
        보호자 이메일
        <input
          type="email"
          value={p.guardianEmail ?? ''}
          onChange={(e) => setP({ ...p, guardianEmail: e.target.value })}
          className="mt-2 w-full rounded-xl border border-[#e4ddd3] px-3 py-2.5 text-sm outline-none focus:border-[#7c9070]"
        />
      </label>

      <label className="mt-4 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={p.marketingOptIn}
          onChange={(e) => setP({ ...p, marketingOptIn: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[#7c9070]"
        />
        <span>(선택) 이벤트·혜택 안내 수신</span>
      </label>

      <label className="mt-4 flex items-start gap-3 text-sm">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-[#7c9070]" />
        <span>(필수) 유료 리포트 이용 및 결제에 동의합니다.</span>
      </label>

      {err ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {err}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canPay || busy}
        onClick={async () => {
          setErr(null)
          setBusy(true)
          try {
            await requestPremiumPayment(p)
          } catch (e) {
            setErr(e instanceof Error ? e.message : '결제를 시작할 수 없습니다.')
          } finally {
            setBusy(false)
          }
        }}
        className="mt-8 w-full rounded-full bg-[#2f4a2a] py-3.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-[#243822] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? '결제창 여는 중…' : '5,000원 결제하고 리포트 받기'}
      </button>

      <p className="mt-6 text-center text-xs text-[#8a8a8a]">
        <button type="button" className="font-medium text-[#4d6b46] underline underline-offset-2" onClick={onSwitchLegacy}>
          데모: 이메일만으로 분석(기존 흐름)
        </button>
        {' · '}
        <Link href="/preview/structured-report" className="text-[#4d6b46] underline underline-offset-2">
          샘플 리포트 보기
        </Link>
      </p>
    </section>
  )
}
