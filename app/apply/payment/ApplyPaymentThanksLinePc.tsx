'use client'

import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext'
import { useMemo, useSyncExternalStore } from 'react'

/** `ApplyPaymentView` 본문 — Pretext 측정과 동일한 문자열 */
export const APPLY_PAYMENT_THANKS_BODY =
  '신청 감사합니다. 전송하신 아이의 그림과 개인정보는 소중히 안전하게 사용 후 보관됩니다.'

/**
 * `text-sm`(14px) / font-normal — globals `@theme` 의 sans 와 맞춤. Pretext 권고에 따라 `system-ui` 제외.
 */
const PRETEXT_FONT = '400 14px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif'

const SM_UP_MQ = '(min-width: 640px)'

function subscribeSmUp(onStoreChange: () => void) {
  const mq = window.matchMedia(SM_UP_MQ)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getSmUpSnapshot(): boolean {
  return window.matchMedia(SM_UP_MQ).matches
}

function getSmUpServerSnapshot(): boolean {
  return false
}

type Props = {
  className?: string
}

/**
 * PC 뷰(sm+)에서 한 줄 폭을 Pretext로 계산해 줄바꿈 없이 표시합니다. 모바일은 기본 줄바꿈.
 */
export function ApplyPaymentThanksLinePc({ className }: Props) {
  const isSmUp = useSyncExternalStore(subscribeSmUp, getSmUpSnapshot, getSmUpServerSnapshot)

  const oneLineWidthPx = useMemo(() => {
    if (typeof window === 'undefined') return null
    const prepared = prepareWithSegments(APPLY_PAYMENT_THANKS_BODY, PRETEXT_FONT, { wordBreak: 'keep-all' })
    return Math.ceil(measureNaturalWidth(prepared))
  }, [])

  const pcOneLine = isSmUp && oneLineWidthPx != null

  return (
    <p
      className={`${className ?? ''} ${pcOneLine ? 'sm:inline-block sm:whitespace-nowrap sm:break-keep' : 'break-keep'}`.trim()}
      style={
        pcOneLine
          ? {
              width: oneLineWidthPx,
              maxWidth: 'min(100%, calc(100vw - 2rem))',
            }
          : undefined
      }
    >
      {APPLY_PAYMENT_THANKS_BODY}
    </p>
  )
}
