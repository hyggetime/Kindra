import 'server-only'

import { headers } from 'next/headers'

import { getSiteOrigin } from '@lib/site-origin'

/**
 * 현재 HTTP 요청 기준 공개 origin (`https://host`, 슬래시 없음).
 * 관리자 미리보기 등 **같은 호스트로 링크를 열어야 할 때** 사용합니다.
 * (로컬에서 `NEXT_PUBLIC_SITE_URL` 미설정 시 기본값이 프로덕션 도메인으로 가면
 * DB 행이 없어 미리보기가 404가 되는 문제 방지)
 */
export async function getRequestSiteOrigin(): Promise<string> {
  const h = await headers()
  const hostRaw = h.get('x-forwarded-host') ?? h.get('host')
  if (!hostRaw) {
    return getSiteOrigin()
  }
  const host = hostRaw.split(',')[0].trim()
  const forwardedProto = h.get('x-forwarded-proto')?.split(',')[0].trim()
  const proto =
    forwardedProto ||
    (host.includes('localhost') ||
    host.startsWith('127.') ||
    /^192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host)
      ? 'http'
      : 'https')
  return `${proto}://${host}`.replace(/\/$/, '')
}
