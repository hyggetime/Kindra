'use client'

import { useEffect, useState } from 'react'

import type { MiniappOrderRow } from '@/lib/orderTypes'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

type Props = {
  orderId: string
  /** UX용 최소 대기 (의도적 지연) */
  minWaitMs: number
  pollIntervalMs: number
  onDone: (row: MiniappOrderRow) => void
}

export function LoadingPollStep({ orderId, minWaitMs, pollIntervalMs, onDone }: Props) {
  const [startAt] = useState(() => Date.now())
  const [lastStatus, setLastStatus] = useState<string>('pending')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setElapsed(Date.now() - startAt), 500)
    return () => window.clearInterval(t)
  }, [startAt])

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      const sb = createSupabaseBrowserClient()
      const { data, error } = await sb
        .from('kindra_miniapp_orders')
        .select('id,status,email,result,error,created_at')
        .eq('id', orderId)
        .maybeSingle()

      if (cancelled || error || !data) return
      const row = data as MiniappOrderRow
      setLastStatus(row.status)
      const waited = Date.now() - startAt
      const terminal = row.status === 'completed' || row.status === 'failed'
      if (terminal && waited >= minWaitMs) {
        onDone(row)
      }
    }

    void poll()
    const id = window.setInterval(() => {
      void poll()
    }, pollIntervalMs)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [minWaitMs, onDone, orderId, pollIntervalMs, startAt])

  const minSec = Math.ceil(minWaitMs / 1000)
  const secLeft = Math.max(0, minSec - Math.floor(elapsed / 1000))

  return (
    <section className="rounded-2xl border border-[#e8e4dc] bg-white/90 p-8 text-center shadow-sm">
      <div
        className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-[#7c9070]/30 border-t-[#7c9070]"
        aria-hidden
      />
      <h2 className="text-lg font-semibold text-[#2f3d2e]">그림을 읽고 있어요</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#5c5c5c]">
        최소 {minSec}초 동안 이 화면을 유지한 뒤 결과로 이동합니다. (실제 분석은 Supabase Edge에서 진행)
      </p>
      <p className="mt-4 font-mono text-xs text-[#8a8a8a]">
        상태: {lastStatus} · 남은 UX 대기 약 {secLeft}s · 폴링 {pollIntervalMs / 1000}s
      </p>
    </section>
  )
}
