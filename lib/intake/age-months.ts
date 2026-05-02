/** 평균 월 길이(일) — 개월 수를 일수에서 환산할 때 사용 */
export const APPROX_DAYS_PER_MONTH = 365.242199 / 12

/** 로컬 달력 기준 `YYYY-MM-DD` (date input 용) */
export function isoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * `YYYY-MM-DD` (로컬 의미) 파싱. 형식·달력 유효성 검사.
 */
export function parseBirthDateIso(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!Number.isFinite(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  const test = new Date(y, mo - 1, d)
  if (test.getFullYear() !== y || test.getMonth() !== mo - 1 || test.getDate() !== d) return null
  return { y, m: mo, d }
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** 생일 0시 ~ 기준일 0시까지의 **경과 일수** (음이면 0) */
export function wholeDaysFromBirthToRef(
  birthYear: number,
  birthMonth1to12: number,
  birthDay: number,
  ref: Date = new Date(),
): number {
  const birth = startOfLocalDay(new Date(birthYear, birthMonth1to12 - 1, birthDay))
  const end = startOfLocalDay(ref)
  const ms = end.getTime() - birth.getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

/**
 * 생후 개월 수 — **경과 일수 ÷ 평균 월 길이** 내림 (일수 기준 환산).
 */
export function completedMonthsFromDaysSinceBirth(
  birthYear: number,
  birthMonth1to12: number,
  birthDay: number,
  ref: Date = new Date(),
): number {
  const days = wholeDaysFromBirthToRef(birthYear, birthMonth1to12, birthDay, ref)
  return Math.floor(days / APPROX_DAYS_PER_MONTH)
}

/** 폼·DB·Gemini 에 넣을 한 줄 문자열 */
export function formatBirthAgeHintFromDate(
  birthYear: number,
  birthMonth1to12: number,
  birthDay: number,
  ref: Date = new Date(),
): string {
  const months = completedMonthsFromDaysSinceBirth(birthYear, birthMonth1to12, birthDay, ref)
  const days = wholeDaysFromBirthToRef(birthYear, birthMonth1to12, birthDay, ref)
  const padded = String(months).padStart(2, '0')
  return `${birthYear}년 ${birthMonth1to12}월 ${birthDay}일생 (생후 ${padded}개월, 경과 ${days}일)`
}

/**
 * 리포트 카드용 생년월일 한 줄. 개월 수는 `completedMonthsFromDaysSinceBirth` 와 동일(일수÷평균월) 기준.
 * 예: `2018년 06월 15일생( 생후07개월)`
 */
export function formatBirthLineForReportCard(
  birthYear: number,
  birthMonth1to12: number,
  birthDay: number,
  ref: Date = new Date(),
): string {
  const months = completedMonthsFromDaysSinceBirth(birthYear, birthMonth1to12, birthDay, ref)
  const mo = String(birthMonth1to12).padStart(2, '0')
  const day = String(birthDay).padStart(2, '0')
  const mm = String(months).padStart(2, '0')
  return `${birthYear}년 ${mo}월 ${day}일생( 생후${mm}개월)`
}

