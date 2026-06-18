import { normalizeStructuredReportInput } from '@/lib/kindra-engine'
import { getKindraApiBaseUrl, getKindraMiniappApiAuthHeaders } from '@/lib/kindraApiEndpoints'

import type { KindraStructuredReportJson } from './kindraStructuredReportTypes'

export function getStructuredReportApiUrl(): string {
  return `${getKindraApiBaseUrl()}/api/kindra-structured-report`
}
/** `public/gallery/*` — 루트 앱이 정적 제공 (테스트용 5장) */
export const DEFAULT_GALLERY_PATHS = [
  '/gallery/birthday-cake.png',
  '/gallery/beach-scene.png',
  '/gallery/paper-dolls-a.png',
  '/gallery/paper-dolls-b.png',
  '/gallery/sketches-card.png',
] as const

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

export async function loadGalleryImagesAsInlineData(origin: string): Promise<{ mimeType: string; base64: string }[]> {
  const base = origin.replace(/\/$/, '')
  const out: { mimeType: string; base64: string }[] = []
  for (const path of DEFAULT_GALLERY_PATHS) {
    const url = `${base}${path}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`갤러리 이미지 로드 실패: ${url} (${res.status})`)
    const blob = await res.blob()
    const mimeType = (blob.type || 'image/png').split(';')[0].trim().toLowerCase()
    const b64 = arrayBufferToBase64(await blob.arrayBuffer())
    out.push({ mimeType, base64: b64 })
  }
  return out
}

export async function readFileAsInlineImage(file: File): Promise<{ mimeType: string; base64: string }> {
  const buf = await file.arrayBuffer()
  const mimeType = (file.type || 'image/png').split(';')[0].trim().toLowerCase()
  return { mimeType, base64: arrayBufferToBase64(buf) }
}

/** 웹 `File` 없이 URL → 인라인 이미지 (RN·Granite 호환) */
export async function fetchUrlAsInlineImage(
  url: string,
  signal?: AbortSignal,
): Promise<{ mimeType: string; base64: string }> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`이미지 로드 실패: ${url} (${res.status})`)
  const mimeType = (res.headers.get('content-type')?.split(';')[0] ?? 'image/png').trim().toLowerCase()
  return { mimeType, base64: arrayBufferToBase64(await res.arrayBuffer()) }
}

export type StructuredReportApiSuccess = { ok: true; report: KindraStructuredReportJson }
export type StructuredReportApiError = { ok: false; error: string }

export async function postStructuredReportAnalysis(
  images: { mimeType: string; base64: string }[],
  context: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<KindraStructuredReportJson> {
  const res = await fetch(getStructuredReportApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getKindraMiniappApiAuthHeaders(),
    },
    body: JSON.stringify({ images, context }),
    signal,
  })

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error(`API 응답을 JSON으로 읽을 수 없습니다 (HTTP ${res.status}).`)
  }

  const o = data as StructuredReportApiSuccess | StructuredReportApiError
  if (!o || typeof o !== 'object' || !('ok' in o)) {
    throw new Error(`API 오류 (HTTP ${res.status})`)
  }
  if (!o.ok) {
    throw new Error(o.error ?? '알 수 없는 오류')
  }
  const imageCount =
    typeof context.imageCount === 'number'
      ? context.imageCount
      : Array.isArray(context.imageUrls)
        ? context.imageUrls.length
        : Array.isArray(images)
          ? images.length
          : undefined
  return normalizeStructuredReportInput(o.report, imageCount)
}
