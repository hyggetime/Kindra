'use client'

import { useCallback, useMemo } from 'react'

import { useKakaoSdkReady } from '@/components/kakao/KakaoSdkProvider'
import { getKakaoChannelChatPageUrl, resolveKakaoChannelPublicId } from '@lib/kakao/kakao-channel-constants'

function KakaoGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1.2C4.35 1.2 1.4 3.55 1.4 6.35c0 1.55.95 2.92 2.4 3.85l-.5 2.6 2.75-1.1c.28.03.57.05.85.05 3.65 0 6.6-2.35 6.6-5.15S11.65 1.2 8 1.2z"
      />
    </svg>
  )
}

/**
 * 카카오톡 채널: 간편 추가는 JS SDK, 1:1 톡상담은 공식 `pf.kakao.com/…/chat` URL로 직접 이동
 * (SDK `Channel.chat` 인증 중간 페이지 오류 회피).
 * @see https://developers.kakao.com/docs/ko/kakaotalk-channel/js
 */
export function KakaoChannelButtons() {
  const sdkReady = useKakaoSdkReady()
  const channelId = useMemo(() => resolveKakaoChannelPublicId(), [])
  const chatUrl = useMemo(() => getKakaoChannelChatPageUrl(channelId), [channelId])
  const jsKeyPresent = Boolean(process.env.NEXT_PUBLIC_KAKAO_JS_KEY?.trim())
  const canUseSdk = sdkReady && jsKeyPresent
  const canOpenChat = Boolean(channelId.trim())

  const onFollowChannel = useCallback(() => {
    const Kakao = window.Kakao
    if (!Kakao?.Channel || !channelId) return
    const ch = Kakao.Channel
    const params = { channelPublicId: channelId }
    /** `followChannel` 는 최신 JS SDK에만 있음(구버전 2.1.x 등은 `addChannel`만 제공) */
    const result =
      typeof ch.followChannel === 'function'
        ? ch.followChannel(params)
        : typeof ch.addChannel === 'function'
          ? ch.addChannel(params)
          : undefined
    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      void (result as Promise<unknown>).catch(() => {
        /* 사용자 취소·오류는 조용히 무시 */
      })
    }
  }, [channelId])

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] text-[#8A8A8A] sm:text-[11px]">
        <button
          type="button"
          onClick={onFollowChannel}
          disabled={!canUseSdk}
          className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-medium text-[#5C5C5C] transition hover:bg-black/[0.03] hover:text-[#3C1E1E] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <KakaoGlyph className="h-3 w-3 shrink-0 text-[#3C1E1E]/80" />
          채널 추가
        </button>
        <span className="select-none text-[#D8D4CC]" aria-hidden>
          ·
        </span>
        {canOpenChat ? (
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-medium text-[#5C5C5C] transition hover:bg-black/[0.03] hover:text-[#3C1E1E]"
          >
            <KakaoGlyph className="h-3 w-3 shrink-0 text-[#3C1E1E]/80" />
            1:1 채팅
          </a>
        ) : (
          <span
            className="inline-flex cursor-not-allowed items-center gap-1 rounded-md px-1 py-0.5 font-medium text-[#5C5C5C] opacity-40"
            aria-hidden
          >
            <KakaoGlyph className="h-3 w-3 shrink-0 text-[#3C1E1E]/80" />
            1:1 채팅
          </span>
        )}
        {!jsKeyPresent ? (
          <span className="w-full text-[9px] text-[#B0A8A0] sm:w-auto">카카오 채널 연결 준비 중이에요.</span>
        ) : !sdkReady ? (
          <span className="text-[9px] text-[#B0A8A0]">연결 중이에요…</span>
        ) : null}
      </div>
    </div>
  )
}
