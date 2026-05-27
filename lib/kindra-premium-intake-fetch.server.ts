import 'server-only'

import { assertAllowedImageMime, type GeminiInlineImage } from '@lib/gemini/generate'

function assertSafeImageUrl(url: string): void {
  if (url.startsWith('/')) return
  try {
    const u = new URL(url)
    if (u.protocol === 'https:' || u.protocol === 'http:') return
  } catch {
    /* fallthrough */
  }
  throw new Error(`허용되지 않은 이미지 URL: ${url}`)
}

async function urlToGeminiInline(url: string, signal?: AbortSignal): Promise<GeminiInlineImage> {
  assertSafeImageUrl(url)
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`이미지 로드 실패: ${url} (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  const mimeType = (res.headers.get('content-type') || 'image/png').split(';')[0]!.trim().toLowerCase()
  assertAllowedImageMime(mimeType)
  return { mimeType, base64: buf.toString('base64') }
}

/** 프리미엄 5장 URL → Gemini 멀티모달 입력 (서버 전용). */
export async function fetchPremiumImageUrlsAsGeminiInline(
  urls: readonly [string, string, string, string, string],
  signal?: AbortSignal,
): Promise<GeminiInlineImage[]> {
  return Promise.all(urls.map((u) => urlToGeminiInline(u, signal)))
}
