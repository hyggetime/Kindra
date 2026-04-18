/** 리포트 조회 알림 클라이언트 헬퍼
 *
 * - 같은 브라우저 세션에서 동일 리포트의 중복 알림을 차단합니다.
 * - 네트워크 실패는 조용히 무시합니다 (UX 영향 없음).
 * - 실제 알림 발송은 Edge Function이 처리하므로 webhook URL이 클라이언트에 노출되지 않습니다.
 */

const NOTIFIED_SESSION_KEY = 'kindra_notified'

type NotifyParams = {
  reportId: string
  childShortName: string
}

function hasNotifiedThisSession(reportId: string): boolean {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_SESSION_KEY)
    const notified: string[] = raw ? (JSON.parse(raw) as string[]) : []
    return notified.includes(reportId)
  } catch {
    return false
  }
}

function markNotified(reportId: string): void {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_SESSION_KEY)
    const notified: string[] = raw ? (JSON.parse(raw) as string[]) : []
    if (!notified.includes(reportId)) {
      notified.push(reportId)
      sessionStorage.setItem(NOTIFIED_SESSION_KEY, JSON.stringify(notified))
    }
  } catch {
    /* noop */
  }
}

/**
 * 리포트 페이지가 열렸음을 서버 측 webhook 알림으로 전송합니다.
 * 세션 내 중복 발송을 방지하므로 컴포넌트 마운트 시 무조건 호출해도 됩니다.
 */
export async function notifyReportView(params: NotifyParams): Promise<void> {
  if (hasNotifiedThisSession(params.reportId)) return

  const searchParams = new URLSearchParams(window.location.search)

  const payload = {
    reportId: params.reportId,
    childShortName: params.childShortName,
    pageUrl: window.location.href,
    utmSource: searchParams.get('utm_source') ?? undefined,
    ref: searchParams.get('ref') ?? undefined,
  }

  try {
    const res = await fetch('/api/notify-report-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) markNotified(params.reportId)
  } catch {
    /* 네트워크 오류 — 조용히 무시 */
  }
}
