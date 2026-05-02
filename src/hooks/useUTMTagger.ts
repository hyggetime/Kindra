import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { storeUTMParams, trackEvent } from '../lib/analytics'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'] as const

/**
 * URL 쿼리스트링의 UTM 파라미터와 ref 값을 sessionStorage 에 저장합니다.
 * 같은 세션에서 다른 페이지로 이동해도 유입 채널 정보가 유지됩니다.
 */
export function useUTMTagger(): void {
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()

  useEffect(() => {
    const params = new URLSearchParams(searchKey)
    const found: Record<string, string> = {}

    for (const key of UTM_KEYS) {
      const val = params.get(key)
      if (val) found[key] = val
    }

    if (Object.keys(found).length > 0) {
      storeUTMParams(found)
      trackEvent('utm_entry', found)
    }
  }, [searchKey])
}
