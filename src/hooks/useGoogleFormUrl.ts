import { useEffect, useState } from 'react'
import { GOOGLE_FORM_URL } from '../constants/form'
import { appendSessionUtmToUrl } from '../lib/analytics'

/**
 * 세션에 저장된 UTM(ref 포함)을 반영한 구글 폼 URL.
 * 마운트 직후 한 번 갱신합니다(App의 useUTMTagger가 먼저 세션을 채운 뒤 동일 틱에서 적용).
 */
export function useGoogleFormUrl(): string {
  const [url, setUrl] = useState(GOOGLE_FORM_URL)

  useEffect(() => {
    setUrl(appendSessionUtmToUrl(GOOGLE_FORM_URL))
  }, [])

  return url
}
