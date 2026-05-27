/**
 * 브라우저는 시크릿을 가질 수 없으므로, 동일 오리진으로 POST 한 뒤
 * 서버에서만 `KINDRA_MINIAPP_SHARED_SECRET` Bearer 를 붙여 메인 Kindra API 로 전달합니다.
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env.KINDRA_MINIAPP_SHARED_SECRET?.trim()
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'KINDRA_MINIAPP_SHARED_SECRET 미설정으로 메인 프리미엄 인테이크 API를 호출할 수 없습니다.' },
      { status: 500 },
    )
  }

  const mainBase =
    process.env.KINDRA_MAIN_API_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_KINDRA_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_KINDRA_WEB_API_ORIGIN?.trim() ||
    'http://localhost:3000'

  const bodyText = await req.text()

  let res: Response
  try {
    res = await fetch(`${mainBase.replace(/\/$/, '')}/api/kindra-premium-intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: bodyText,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: `메인 API 연결 실패: ${msg}` }, { status: 502 })
  }

  const text = await res.text()
  const ct = res.headers.get('content-type') ?? 'application/json; charset=utf-8'
  return new NextResponse(text, { status: res.status, headers: { 'Content-Type': ct } })
}
