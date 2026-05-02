/**
 * `growth_stats.json` (male/female → 개월 문자열 → height/weight p5…p95)을 바탕으로
 * 리포트 마크다운 `### 몸과 마음이 함께 보내는 신호` 본문을 만듭니다.
 * 신체 수치가 있을 때는 **p50(중앙값)과의 비교**만 서술합니다.
 * 의학적 진단이 아닌 **참고용 경향** 문구만 사용합니다.
 */

export type GrowthBand = {
  p5: number
  p25: number
  p50: number
  p75: number
  p95: number
}

export type GrowthMonthRow = {
  height?: GrowthBand
  weight?: GrowthBand
}

export type GrowthStatsShape = {
  male?: Record<string, GrowthMonthRow>
  female?: Record<string, GrowthMonthRow>
}

function isBand(x: unknown): x is GrowthBand {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.p5 === 'number' &&
    typeof o.p25 === 'number' &&
    typeof o.p50 === 'number' &&
    typeof o.p75 === 'number' &&
    typeof o.p95 === 'number'
  )
}

function isMonthRow(x: unknown): x is GrowthMonthRow {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  const h = o.height
  const w = o.weight
  if (h !== undefined && !isBand(h)) return false
  if (w !== undefined && !isBand(w)) return false
  return true
}

export function parseGrowthStatsJson(raw: string): GrowthStatsShape | null {
  try {
    const j = JSON.parse(raw) as unknown
    if (!j || typeof j !== 'object') return null
    const o = j as Record<string, unknown>
    const out: GrowthStatsShape = {}
    for (const sex of ['male', 'female'] as const) {
      const bucket = o[sex]
      if (!bucket || typeof bucket !== 'object') continue
      const rec: Record<string, GrowthMonthRow> = {}
      for (const [k, v] of Object.entries(bucket as Record<string, unknown>)) {
        if (k.startsWith('_')) continue
        if (isMonthRow(v)) rec[k] = v
      }
      if (Object.keys(rec).length) out[sex] = rec
    }
    return out.male || out.female ? out : null
  } catch {
    return null
  }
}

export function monthKeysForSex(data: GrowthStatsShape, sex: 'male' | 'female'): number[] {
  const rec = data[sex]
  if (!rec) return []
  return Object.keys(rec)
    .map((k) => Number.parseInt(k, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
}

/** 완료 개월 수를 표에 있는 개월 키로 맞춤(범위 밖이면 가장 가까운 끝). */
export function clampedMonthKey(completedMonths: number, available: number[]): number {
  if (available.length === 0) return Math.max(0, completedMonths)
  const lo = available[0]!
  const hi = available[available.length - 1]!
  const m = Math.max(0, completedMonths)
  if (m <= lo) return lo
  if (m >= hi) return hi
  if (available.includes(m)) return m
  return available.reduce((best, cur) => (Math.abs(cur - m) < Math.abs(best - m) ? cur : best), lo)
}

function fmtNum(n: number, digits: number): string {
  return Number(n.toFixed(digits)).toString()
}

/** 측정값을 같은 월령·성별의 **중앙값(p50)** 과만 비교해 짧은 문장으로 씁니다. */
function lineCompareToP50(label: string, value: number, p50: number, unit: string, digits = 1): string {
  const rel = p50 !== 0 ? ((value - p50) / p50) * 100 : 0
  const med = fmtNum(p50, digits)
  const v = fmtNum(value, digits)
  if (Math.abs(rel) < 4) {
    return `**${label} ${v}${unit}**는 같은 월령·성별에서 많이 쓰는 **중앙값(약 ${med}${unit})** 에 가깝습니다.`
  }
  if (value > p50) {
    return `**${label} ${v}${unit}**는 같은 조건의 **중앙값(약 ${med}${unit})** 보다 **다소 위쪽**에 해당하는 편으로 볼 수 있습니다(참고용).`
  }
  return `**${label} ${v}${unit}**는 같은 조건의 **중앙값(약 ${med}${unit})** 보다 **다소 아래쪽**에 해당하는 편으로 볼 수 있습니다(참고용).`
}

export type PhysioEmotionalInput = {
  childShortName: string
  sex: 'male' | 'female'
  completedMonths: number
  /** cm — 있으면 키 백분위 추정 */
  heightCm?: number | null
  /** kg — 있으면 몸무게 백분위 추정 */
  weightKg?: number | null
}

/** `### 부모님께` / Hygge 절 앞에 삽입하면 읽기 순서가 자연스럽습니다. 없으면 문서 끝에 붙입니다. */
export function injectPhysioMarkdownBeforeParentsSection(markdown: string, physioBlock: string): string {
  const norm = markdown.replace(/\r\n/g, '\n')
  const lines = norm.split('\n')
  const h3 = /^###\s+/
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (h3.test(line) && /부모님께|Hygge|함께\s*이어가기/i.test(line)) {
      return [...lines.slice(0, i), '', physioBlock, '', ...lines.slice(i)].join('\n').trimEnd()
    }
  }
  return `${norm.trimEnd()}\n\n${physioBlock}`
}

export function buildPhysioEmotionalSectionMarkdown(
  stats: GrowthStatsShape,
  input: PhysioEmotionalInput,
): string | null {
  const { childShortName, sex, completedMonths } = input
  const keys = monthKeysForSex(stats, sex)
  if (keys.length === 0) return null

  const monthKey = clampedMonthKey(completedMonths, keys)
  const row = stats[sex]?.[String(monthKey)]
  if (!row || (!row.height && !row.weight)) return null

  const sexLabel = sex === 'male' ? '남아' : '여아'
  const name = childShortName.trim() || '아이'
  const clampNote =
    monthKey !== completedMonths
      ? ` (성장도표에 해당 월이 없어 **${monthKey}개월** 구간 기준으로 맞춤)`
      : ''

  const personal: string[] = []
  const hIn = input.heightCm
  const wIn = input.weightKg
  if (hIn != null && row.height?.p50 != null) {
    personal.push(lineCompareToP50('키', hIn, row.height.p50, 'cm', 1))
  }
  if (wIn != null && row.weight?.p50 != null) {
    personal.push(lineCompareToP50('몸무게', wIn, row.weight.p50, 'kg', 2))
  }
  if (personal.length === 0) {
    personal.push(
      '키·몸무게를 알려 주시면, 같은 월령·성별의 **중앙값(p50)** 과만 비교해 한두 문장으로 정리할 수 있습니다. 지금은 **그림에서 읽히는 정서·표현**을 중심으로 보시면 됩니다.',
    )
  }

  const bridge =
    '그림에서 읽힌 **선·색·구도의 에너지**와, 여기서 말하는 **신체 성장의 참고치**는 서로를 대신하지 않습니다. 부모님께서 평소 느끼시는 아이의 모습과 그림이 주는 신호가 다르게 느껴질 때는, **둘을 나란히 두고** 차분히 보시는 것이 좋습니다. 리포트 본문에서는 부모 메모를 **맥락**으로만 쓰고, 해석의 중심은 항상 **그림의 시각적 근거**에 두었습니다.'

  const intro =
    `이 절은 국민건강보험공단이 공개한 **영유아 성장도표(LMS 기반)** 를 바탕으로, **${name}**의 **생후 ${completedMonths}개월 · ${sexLabel}** 조건에서 **중앙값(p50)** 만 짚어 드립니다. 임상 진단이나 의학적 판정이 아닙니다.${clampNote}`

  const body = [intro, ...personal, bridge].join('\n\n')

  return `### 몸과 마음이 함께 보내는 신호\n\n${body}`
}
