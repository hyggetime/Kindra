/**
 * 리포트 화면·인쇄용 일련번호 `KINDRA-{YY}-{이니셜2자}-{순번}`.
 * 순번은 동일 보호자 이메일 + 동일 아이 표시 이름(`report_json.childName` 정규화 일치) 기준 누적 건수입니다.
 */

/** 신청·DB 매칭용 아이 이름 정규화 */
export function normalizeChildNameForReportKey(name: string): string {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ')
}

const CHOSEONG_LETTER = ['G', 'K', 'N', 'D', 'T', 'R', 'M', 'B', 'P', 'S', 'S', '', 'J', 'J', 'C', 'K', 'T', 'P', 'H'] as const

/** ㅏ…ㅣ — 선행 ㅇ일 때 이니셜용 첫 문자 */
const JUNGSEONG_LETTER = [
  'A',
  'E',
  'Y',
  'Y',
  'E',
  'E',
  'Y',
  'Y',
  'O',
  'W',
  'W',
  'O',
  'Y',
  'U',
  'W',
  'W',
  'W',
  'Y',
  'E',
  'E',
  'I',
] as const

function hangulSyllableToInitialLetter(codePoint: number): string {
  if (codePoint < 0xac00 || codePoint > 0xd7a3) return ''
  const S = codePoint - 0xac00
  const choseong = Math.floor(S / 588)
  const jungseong = Math.floor((S % 588) / 28)
  if (choseong === 11) {
    return JUNGSEONG_LETTER[jungseong] ?? 'O'
  }
  const letter = CHOSEONG_LETTER[choseong]
  return letter && letter.length > 0 ? letter : 'X'
}

/** 단어·토막의 첫 이니셜 1자(라틴 우선, 없으면 첫 한글 음절) */
function firstTokenInitialLetter(segment: string): string {
  const u = segment.toUpperCase()
  const latin = u.match(/[A-Z]/)
  if (latin) return latin[0]!
  for (const ch of segment) {
    const cp = ch.codePointAt(0)!
    if (cp >= 0xac00 && cp <= 0xd7a3) {
      return hangulSyllableToInitialLetter(cp)
    }
  }
  return ''
}

/**
 * 아이 이름에서 라틴 2글자 이니셜.
 * - 공백으로 둘 이상의 토큰이 있으면(예: `Tae Kyung`) 각 토큰의 첫 글자를 사용해 `TK` 형태를 우선합니다.
 * - 한 토큰에 라틴이 여럿이면 등장 순서대로 A–Z만 뽑아 앞 2자.
 * - 한글만 있으면 앞쪽 한글 음절 2개의 자모 기반 이니셜(로마자 1자씩).
 * - 그 외는 코드포인트 해시로 2자(충돌 가능성은 낮게 유지).
 */
export function childDisplayNameToInitials(name: string): string {
  const t = normalizeChildNameForReportKey(name)
  if (!t) return 'XX'

  const tokens = t.split(/\s+/).filter(Boolean)
  if (tokens.length >= 2) {
    const a = firstTokenInitialLetter(tokens[0]!)
    const b = firstTokenInitialLetter(tokens[1]!)
    if (a && b) return `${a}${b}`.slice(0, 2)
  }

  const latinLetters = t.toUpperCase().match(/[A-Z]/g)
  if (latinLetters && latinLetters.length >= 2) {
    return (latinLetters[0] + latinLetters[1]).slice(0, 2)
  }
  if (latinLetters && latinLetters.length === 1) {
    return `${latinLetters[0]}X`
  }

  const out: string[] = []
  for (const ch of t) {
    if (out.length >= 2) break
    const cp = ch.codePointAt(0)!
    if (cp >= 0xac00 && cp <= 0xd7a3) {
      const L = hangulSyllableToInitialLetter(cp)
      if (L) out.push(L)
    }
  }
  if (out.length >= 2) return `${out[0]}${out[1]}`
  if (out.length === 1) return `${out[0]}X`

  const digits = t.match(/\d/g)
  if (digits && digits.length >= 2) {
    return `${digits[0]}${digits[1]}`
  }
  if (digits && digits.length === 1) {
    return `${digits[0]}X`
  }

  let h = 0
  for (const ch of t) {
    h = (h * 31 + (ch.codePointAt(0) ?? 0)) | 0
  }
  const hex = Math.abs(h).toString(16).toUpperCase().padStart(4, '0')
  const a = hex[0] ?? 'X'
  const b = hex[1] ?? 'X'
  const map = (c: string) => ((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ? c : 'X')
  return `${map(a)}${map(b)}`
}

function formatSequencePart(n: number): string {
  const k = Math.max(1, Math.floor(n))
  if (k <= 99) return String(k).padStart(2, '0')
  return String(k)
}

/** `KINDRA-26-TK-01` 형식 */
export function formatKindraReportSerial(at: Date, childDisplayName: string, sequence1Based: number): string {
  const yy = at.getFullYear() % 100
  const initials = childDisplayNameToInitials(childDisplayName)
  const seq = formatSequencePart(sequence1Based)
  return `KINDRA-${String(yy).padStart(2, '0')}-${initials}-${seq}`
}

/**
 * @deprecated DB 누적 순번 없이 쓰이던 패턴. 마이그레이션·복구용으로만 유지합니다.
 */
export function buildIntakeReportIdentifiers(childDisplayName: string, intakeId: string): { reportId: string } {
  const year = new Date().getFullYear()
  const latin = (childDisplayName.normalize('NFKC').match(/[A-Za-z0-9]+/g) ?? []).join('').toUpperCase()
  const hex = intakeId.replace(/-/g, '').toUpperCase()
  const suffix = hex.slice(0, 5)
  const slug = latin.length >= 2 ? latin.slice(0, 12) : `U${suffix}`
  return { reportId: `KINDRA-${year}-${slug}` }
}
