'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import {
  reportAccessRenewalInitialState,
  sendReportAccessRenewalMagicLink,
  type ReportAccessRenewalState,
} from './actions'

type Props = {
  safeNext: string
  reportUuid: string | null
  maskedEmail: string | null
  loginHref: string
}

export function ReportAccessExpiredClient({ safeNext, reportUuid, maskedEmail, loginHref }: Props) {
  const [state, formAction, pending] = useActionState<ReportAccessRenewalState, FormData>(
    sendReportAccessRenewalMagicLink,
    reportAccessRenewalInitialState,
  )

  const hasEmail = Boolean(reportUuid && maskedEmail)
  const showManualFallback = !hasEmail || state.needsManualLogin

  return (
    <div className="min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      <header className="border-b border-[#EDE8E0] px-5 py-4 text-center">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[#7C9070]">
          Kindra
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-5 py-14 sm:py-20">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C9070]/90">
          리포트 열람
        </p>
        <h1 className="mt-3 text-center text-xl font-semibold tracking-tight text-[#2F3D2E] sm:text-[1.35rem]">
          아이의 소중한 기록을 안전하게 보호하고 있어요.
        </h1>

        <div className="mt-8 rounded-2xl border border-[#E8E4DC] bg-white/90 px-6 py-8 shadow-[0_12px_40px_-28px_rgba(60,55,45,0.35)] sm:px-8">
          <p className="text-[0.95rem] leading-[1.9] text-[#5A5A5A]">
            보안을 위해 30일마다 정기적인 인증이 필요합니다. 아래 버튼을 누르면 등록하신 이메일로 새로운 입장권을
            즉시 보내드릴게요.
          </p>
          {maskedEmail ? (
            <p className="mt-5 text-center text-sm font-medium text-[#4F6048]">등록된 이메일: {maskedEmail}</p>
          ) : null}
        </div>

        {state.message ? (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-center text-sm leading-relaxed ${
              state.ok
                ? 'border-[#C5D4BE] bg-[#F0F6ED] text-[#3D4A38]'
                : 'border-[#E8D4D0] bg-[#FDF6F5] text-[#8A4545]'
            }`}
            role="status"
          >
            {state.message}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center gap-4">
          {hasEmail && !state.ok ? (
            <form action={formAction} className="w-full max-w-sm">
              <input type="hidden" name="reportUuid" value={reportUuid ?? ''} />
              <input type="hidden" name="next" value={safeNext} />
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#7C9070] px-6 text-sm font-semibold text-white shadow-[0_8px_28px_-12px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D] disabled:opacity-60"
              >
                {pending ? '보내는 중…' : `📧 ${maskedEmail}로 새 링크 받기`}
              </button>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-[#9A9A9A]">
                이미 받은 메일이 있다면, 그 메일의 링크를 그대로 사용하셔도 됩니다.
              </p>
            </form>
          ) : null}

          {hasEmail && state.ok ? (
            <p className="text-center text-[11px] leading-relaxed text-[#9A9A9A]">
              이미 받은 메일이 있다면, 그 메일의 링크를 그대로 사용하셔도 됩니다.
            </p>
          ) : null}

          {showManualFallback ? (
            <Link
              href={loginHref}
              className="inline-flex min-h-[48px] w-full max-w-sm items-center justify-center rounded-full border border-[#D4CFC4] bg-[#FDFBF9] px-6 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#7C9070]/40 hover:bg-[#F0F5EF]"
            >
              이메일을 직접 입력하고 링크 받기
            </Link>
          ) : null}

          <Link href="/" className="text-sm text-[#7C9070]/90 underline-offset-4 transition hover:underline">
            킨드라 홈으로
          </Link>
        </div>
      </main>
    </div>
  )
}
