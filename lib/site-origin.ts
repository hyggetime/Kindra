/** 공개 사이트 원점 — 슬래시 없는 `https://host` (`NEXT_PUBLIC_SITE_URL`). */
export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kindra.vercel.app').replace(/\/$/, '')
}

/** Next.js `metadataBase` — canonical·OG 절대 URL의 기준. */
export function getMetadataBase(): URL {
  return new URL(`${getSiteOrigin()}/`)
}
