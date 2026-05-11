/** 신청 이메일 노출용 마스킹 (예: `test***@naver.com`) */
export function maskEmailForDisplay(email: string): string {
  const e = email.trim().toLowerCase()
  const at = e.indexOf('@')
  if (at < 1) return '***'
  const local = e.slice(0, at)
  const domain = e.slice(at + 1).trim()
  if (!domain) return '***'
  const vis = local.length <= 2 ? local : local.slice(0, Math.min(4, local.length))
  return `${vis}***@${domain}`
}
