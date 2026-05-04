/** OG·절대 URL용 사이트 원점 (`layout` 의 metadataBase 와 정합). */
export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kindra.vercel.app').replace(/\/$/, '')
}
