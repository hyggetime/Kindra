'use client'

import { startTransition, useEffect, useState } from 'react'
import Link from 'next/link'
import { APPLY_FORM_HREF } from '@lib/apply-href'
import { IntakeReportDocument } from '@/components/intake/IntakeReportDocument'
import { ApplyPageShell } from '../ApplyPageShell'
import type { IntakeReportSessionPayload } from '@lib/intake/intake-report-session'
import { INTAKE_REPORT_SESSION_KEY } from '@lib/intake/intake-report-session'

const LEGACY_MARKDOWN_KEY = 'kindra:intakeReportMarkdown:v1'

function parseSessionPayload(raw: string | null): IntakeReportSessionPayload | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && (parsed as IntakeReportSessionPayload).v === 2) {
      return parsed as IntakeReportSessionPayload
    }
  } catch {
    /* 레거시: 순수 마크다운 문자열만 저장된 경우 */
  }
  const t = raw.trim()
  if (t.startsWith('{')) return null
  return {
    v: 2,
    reportId: `KINDRA-${new Date().getFullYear()}-LEGACY`,
    intakeId: '—',
    markdown: t,
    subject: {
      applicantLabel: '—',
      childLabel: '—',
      birthAndMaterials: '—',
    },
    childShortName: '아이',
    heroTitleLines: ['마음 지도 리포트', '분석 내용을 정리했어요'],
  }
}

export function IntakeReportView() {
  const [payload, setPayload] = useState<IntakeReportSessionPayload | null | undefined>(undefined)

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem(INTAKE_REPORT_SESSION_KEY) ?? sessionStorage.getItem(LEGACY_MARKDOWN_KEY)
      startTransition(() => {
        setPayload(parseSessionPayload(raw))
      })
    } catch {
      startTransition(() => setPayload(null))
    }
  }, [])

  if (payload === undefined) {
    return (
      <ApplyPageShell>
        <p className="text-center text-sm text-[#8A8A8A]" aria-live="polite">
          불러오는 중…
        </p>
      </ApplyPageShell>
    )
  }

  if (!payload) {
    return (
      <ApplyPageShell>
        <div className="rounded-2xl border border-[#E8E4DC] bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm leading-relaxed text-[#5A5A5A]">
            표시할 리포트가 없어요. 신청 폼에서 그림을 올려 주시면 분석 후 안내 화면으로 이어져요.
          </p>
          <Link
            href={APPLY_FORM_HREF}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#D4CFC4] bg-[#FDFBF9] px-6 text-sm font-medium text-[#4A4A4A] transition hover:border-[#7C9070]/40 hover:bg-[#F7F5F2]"
          >
            분석 신청하기
          </Link>
        </div>
      </ApplyPageShell>
    )
  }

  return <IntakeReportDocument payload={payload} />
}
