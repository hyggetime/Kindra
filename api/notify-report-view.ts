/** Vercel Edge Function — 리포트 조회 알림 발송
 *
 * 환경변수(Vercel Dashboard → Settings → Environment Variables):
 *   NOTIFY_SLACK_WEBHOOK_URL    — Slack Incoming Webhook URL
 *   NOTIFY_DISCORD_WEBHOOK_URL  — Discord Webhook URL
 *   NOTIFY_TELEGRAM_BOT_TOKEN   — Telegram Bot Token (숫자:문자열 형식)
 *   NOTIFY_TELEGRAM_CHAT_ID     — Telegram 채팅/채널 ID
 *
 * 설정된 채널에만 발송하며, 하나도 설정되지 않으면 즉시 200으로 응답합니다.
 */

export const config = { runtime: 'edge' }

type NotifyPayload = {
  reportId: string
  childShortName: string
  pageUrl: string
  utmSource?: string
  ref?: string
}

function buildText(p: NotifyPayload, now: string): string {
  const source = p.utmSource ?? p.ref ?? '직접접속'
  return (
    `📋 *${p.childShortName} 부모님이 리포트를 열었습니다*\n` +
    `• 리포트: ${p.reportId}\n` +
    `• 시각: ${now}\n` +
    `• 유입: ${source}\n` +
    `• 링크: ${p.pageUrl}`
  )
}

function buildSlackBody(text: string): string {
  return JSON.stringify({
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text } }],
  })
}

function buildDiscordBody(text: string): string {
  return JSON.stringify({ content: text.replace(/\*/g, '**') })
}

function buildTelegramBody(chatId: string, text: string): string {
  const escaped = text.replace(/([_[\]()~`>#+\-=|{}.!])/g, '\\$1')
  return JSON.stringify({ chat_id: chatId, text: escaped, parse_mode: 'MarkdownV2' })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let payload: NotifyPayload
  try {
    payload = (await req.json()) as NotifyPayload
    if (!payload.reportId || !payload.childShortName) {
      return new Response('Bad Request', { status: 400 })
    }
  } catch {
    return new Response('Bad Request: invalid JSON', { status: 400 })
  }

  const now = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const text = buildText(payload, now)
  const sends: Promise<Response>[] = []

  const slackUrl = process.env.NOTIFY_SLACK_WEBHOOK_URL
  if (slackUrl) {
    sends.push(fetch(slackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: buildSlackBody(text),
    }))
  }

  const discordUrl = process.env.NOTIFY_DISCORD_WEBHOOK_URL
  if (discordUrl) {
    sends.push(fetch(discordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: buildDiscordBody(text),
    }))
  }

  const tgToken = process.env.NOTIFY_TELEGRAM_BOT_TOKEN
  const tgChatId = process.env.NOTIFY_TELEGRAM_CHAT_ID
  if (tgToken && tgChatId) {
    sends.push(fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: buildTelegramBody(tgChatId, text),
    }))
  }

  if (sends.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, reason: 'no webhook configured' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const results = await Promise.allSettled(sends)
  const failures = results.filter((r) => r.status === 'rejected').length

  return new Response(
    JSON.stringify({ ok: true, sent: sends.length, failures }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
