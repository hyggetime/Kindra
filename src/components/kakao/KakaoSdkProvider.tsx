'use client'

import Script from 'next/script'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const KakaoSdkReadyContext = createContext(false)

export function useKakaoSdkReady(): boolean {
  return useContext(KakaoSdkReadyContext)
}

const KAKAO_SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js'

/**
 * 카카오 JS SDK 로드 및 `Kakao.init()` 1회 실행.
 * `NEXT_PUBLIC_KAKAO_JS_KEY` 가 없으면 스크립트를 넣지 않습니다.
 */
export function KakaoSdkProvider({ children }: { children: React.ReactNode }) {
  const jsKey = useMemo(() => process.env.NEXT_PUBLIC_KAKAO_JS_KEY?.trim() ?? '', [])
  const [ready, setReady] = useState(false)

  const onSdkLoad = useCallback(() => {
    const Kakao = typeof window !== 'undefined' ? window.Kakao : undefined
    if (!Kakao || !jsKey) return
    if (!Kakao.isInitialized()) {
      Kakao.init(jsKey)
    }
    setReady(true)
  }, [jsKey])

  return (
    <KakaoSdkReadyContext.Provider value={ready}>
      {jsKey ? (
        <Script src={KAKAO_SDK_SRC} strategy="lazyOnload" onLoad={onSdkLoad} />
      ) : null}
      {children}
    </KakaoSdkReadyContext.Provider>
  )
}
