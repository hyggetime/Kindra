'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  requestMagicLinkInitialState,
  requestReportMagicLink,
  type RequestMagicLinkState,
} from '@app/actions/auth-otp'
import { isReportsUuidSegment, sanitizeInternalNextPath } from '@lib/auth/internal-next'

export function MagicLinkRequestForm() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId')
  const defaultNext =
    reportId && isReportsUuidSegment(reportId)
      ? `/reports/${reportId.trim().toLowerCase()}`
      : sanitizeInternalNextPath(searchParams.get('next'))

  const [state, formAction, pending] = useActionState<RequestMagicLinkState, FormData>(
    requestReportMagicLink,
    requestMagicLinkInitialState,
  )

  const reason = searchParams.get('reason')
  const err = searchParams.get('error')

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-left">
      <h1 className="text-center text-xl font-semibold text-[#3D3D3D]">이메일로 계속하기</h1>
      <p className="mt-4 text-center text-sm leading-relaxed text-[#6B6B6B]">
        비밀번호 없이 이메일 링크 하나로 로그인할 수 있어요. 아래에 신청 시 사용한 이메일을 입력하면 링크를
        보내드려요.
      </p>

      {reason === 'missing_code' ? (
        <p className="mt-4 rounded-xl border border-[#E8E4DC] bg-[#F7F5F2] px-4 py-3 text-center text-sm text-[#5A5A5A]">
          유효한 로그인 링크가 아니에요. 메일에 있던 링크를 그대로 눌러 주세요.
        </p>
      ) : null}
      {reason === 'magic_link_only' ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-center text-sm text-amber-950">
          이 리포트는 주소창에 직접 입력해 들어올 수 없어요. 안내 메일의 링크를 눌러 주시거나, 아래에서 같은
          이메일로 다시 링크를 받아 주세요.
        </p>
      ) : null}
      {reason === 'login_required' ? (
        <p className="mt-4 rounded-xl border border-[#E8E4DC] bg-[#F7F5F2] px-4 py-3 text-center text-sm text-[#5A5A5A]">
          로그인이 필요해요. 아래에 신청 시 사용한 이메일을 입력해 주세요.
        </p>
      ) : null}
      {err ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-center text-sm text-red-900">
          {decodeURIComponent(err)}
        </p>
      ) : null}

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={defaultNext} />
        <label className="block text-xs font-medium text-[#5A5A5A]" htmlFor="magic-email">
          이메일
        </label>
        <input
          id="magic-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[#7C9070] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D] disabled:opacity-60"
        >
          {pending ? '메일 보내는 중…' : '로그인 링크 받기'}
        </button>
      </form>

      {state.message ? (
        <p
          role="status"
          className={`mt-6 text-center text-sm ${state.ok ? 'text-[#4F6048]' : 'text-[#B85C5C]'}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  )
}
