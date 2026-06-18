import type {
  KindraChartScoresJson,
  KindraStructuredChartReportJson,
  KindraVisualSummaryItemJson,
} from './types'

export function normalizeGeminiJsonText(raw: string): string {
  let t = raw.trim().replace(/^\uFEFF/, '')
  t = t.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1')
  t = t.trim()
  const balanced = extractFirstBalancedJsonObject(t)
  return (balanced ?? t).trim()
}

export const stripGeminiJsonEnvelope = normalizeGeminiJsonText

function extractFirstBalancedJsonObject(s: string): string | null {
  const start = s.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]!
    if (esc) {
      esc = false
      continue
    }
    if (inStr) {
      if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') {
      inStr = true
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return s.slice(start, i + 1)
    }
  }
  return null
}

function assertScoreBand(name: keyof KindraChartScoresJson, v: unknown): void {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 50 || v > 100) {
    throw new Error(`Kindra structured report: chart_scores.${name} must be integer 50..100, got ${String(v)}`)
  }
}

function assertStringField(path: string, v: unknown): void {
  if (typeof v !== 'string') {
    throw new Error(`Kindra structured report: ${path} must be a string.`)
  }
}

function validateReportSectionsShape(rs: Record<string, unknown>): void {
  assertStringField('report_sections.title', rs.title)
  assertStringField('report_sections.overall_summary', rs.overall_summary)
  assertStringField('report_sections.integrated_narrative', rs.integrated_narrative)
  assertStringField('report_sections.growth_stats_guide', rs.growth_stats_guide)

  const dev = rs.developmental_lenses
  if (!dev || typeof dev !== 'object') {
    throw new Error('Kindra structured report: developmental_lenses missing or not an object.')
  }
  const d = dev as Record<string, unknown>
  assertStringField('report_sections.developmental_lenses.goodenough_analysis', d.goodenough_analysis)
  assertStringField('report_sections.developmental_lenses.luquet_analysis', d.luquet_analysis)
  assertStringField('report_sections.developmental_lenses.lowenfeld_analysis', d.lowenfeld_analysis)

  const psy = rs.psychological_lenses
  if (!psy || typeof psy !== 'object') {
    throw new Error('Kindra structured report: psychological_lenses missing or not an object.')
  }
  const p = psy as Record<string, unknown>
  assertStringField('report_sections.psychological_lenses.dap_kfd_analysis', p.dap_kfd_analysis)
  assertStringField('report_sections.psychological_lenses.line_pressure_analysis', p.line_pressure_analysis)
  assertStringField('report_sections.psychological_lenses.space_layout_analysis', p.space_layout_analysis)
  assertStringField('report_sections.psychological_lenses.color_density_analysis', p.color_density_analysis)

  const ht = rs.hygge_tips
  if (!Array.isArray(ht)) {
    throw new Error('Kindra structured report: hygge_tips must be an array.')
  }
  if (ht.length < 3 || ht.length > 5) {
    throw new Error(`Kindra structured report: hygge_tips length ${ht.length} must be 3..5.`)
  }
  for (let i = 0; i < ht.length; i++) {
    const tip = ht[i]
    if (typeof tip !== 'string' || !tip.trim()) {
      throw new Error(`Kindra structured report: hygge_tips[${i}] must be a non-empty string.`)
    }
  }
}

export function parseKindraStructuredChartReportJson(
  raw: string,
  expectedImageCount?: number,
): KindraStructuredChartReportJson {
  const t = normalizeGeminiJsonText(raw)
  let parsed: unknown
  try {
    parsed = JSON.parse(t)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`Kindra structured report: JSON.parse failed — ${msg}`)
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Kindra structured report: root is not an object.')
  }
  const o = parsed as Record<string, unknown>
  if (!o.chart_scores || !o.report_sections) {
    throw new Error('Kindra structured report: missing chart_scores or report_sections.')
  }
  const cs = o.chart_scores as Record<string, unknown>
  const keys: (keyof KindraChartScoresJson)[] = [
    'fine_motor',
    'observation',
    'spatial_logic',
    'narrative',
    'emotional_resource',
  ]
  for (const k of keys) {
    assertScoreBand(k, cs[k])
  }

  const rs = o.report_sections as Record<string, unknown>
  const vs = rs.visual_summary
  if (!Array.isArray(vs)) {
    throw new Error('Kindra structured report: visual_summary must be an array.')
  }
  const n = typeof expectedImageCount === 'number' ? Math.min(5, Math.max(1, expectedImageCount)) : undefined
  if (n !== undefined && vs.length !== n) {
    throw new Error(`Kindra structured report: visual_summary length ${vs.length} !== expected ${n}`)
  }
  for (const item of vs) {
    if (!item || typeof item !== 'object') throw new Error('Kindra structured report: invalid visual_summary item.')
    const it = item as Record<string, unknown>
    if (typeof it.target_image !== 'string' || typeof it.description !== 'string') {
      throw new Error('Kindra structured report: visual_summary item missing target_image or description.')
    }
  }

  validateReportSectionsShape(rs)

  return parsed as KindraStructuredChartReportJson
}

const FALLBACK_SCORE = 70 as const

export function buildFallbackKindraStructuredChartReport(imageCount: number): KindraStructuredChartReportJson {
  const n = Math.min(5, Math.max(1, Math.floor(imageCount)))
  const name = '아이'
  const vis: KindraVisualSummaryItemJson[] = Array.from({ length: n }, (_, i) => ({
    target_image: `No.${String(i + 1).padStart(2, '0')} (그림 ${i + 1})`,
    description:
      '자동 폴백 요약입니다. 모델 응답을 JSON으로 읽지 못했습니다. 네트워크·할당량을 확인한 뒤 다시 시도하거나, 그림 파일 형식(JPEG/PNG/WebP)과 용량을 점검해 주세요.',
  }))
  return {
    chart_scores: {
      fine_motor: FALLBACK_SCORE,
      observation: FALLBACK_SCORE,
      spatial_logic: FALLBACK_SCORE,
      narrative: FALLBACK_SCORE,
      emotional_resource: FALLBACK_SCORE,
    },
    report_sections: {
      title: '리포트를 완전히 불러오지 못했어요',
      visual_summary: vis,
      overall_summary: `${name}의 그림 ${n}장을 분석하는 동안 응답 형식에 문제가 있었습니다. 아래 점수는 임시 기준값이며, 실제 관찰 내용을 대체하지 않습니다. 잠시 후 다시 시도해 주세요.`,
      developmental_lenses: {
        goodenough_analysis:
          '폴백: 세밀 관찰 렌즈 요약을 생성하지 못했습니다. 다시 시도하면 Goodenough–Harris 관점의 서술이 채워집니다.',
        luquet_analysis:
          '폴백: 공간·서사 렌즈 요약을 생성하지 못했습니다. 다시 시도하면 Luquet 관점의 서술이 채워집니다.',
        lowenfeld_analysis:
          '폴백: 소근육 렌즈 요약을 생성하지 못했습니다. 다시 시도하면 Lowenfeld 관점의 서술이 채워집니다.',
      },
      psychological_lenses: {
        dap_kfd_analysis: '폴백: 인물·정서 렌즈를 생성하지 못했습니다.',
        line_pressure_analysis: '폴백: 선·필압 해석을 생성하지 못했습니다.',
        space_layout_analysis: '폴백: 공간·구도 해석을 생성하지 못했습니다.',
        color_density_analysis: '폴백: 색·밀도 해석을 생성하지 못했습니다.',
      },
      integrated_narrative:
        '폴백: 여러 장이 함께 이야기하는 결을 아직 쓰지 못했습니다. 재시도 후 따뜻한 통합 내러티브가 이 자리를 채웁니다.',
      growth_stats_guide: `우리 ${name}의 성장 수치는 이번 폴백에서는 생략되었습니다. 그림과 함께 살펴보실 때 참고용으로만 봐주세요.`,
      hygge_tips: [
        '그림을 다시 한번 펼쳐 놓고, 가장 마음에 드는 색 한 가지를 골라 이야기해 보세요.',
        '오늘 하루 중 5분만, 아이가 말로 표현한 장면을 메모에 적어 보세요.',
        '창문 밖 하늘을 함께 바라보며, 구름 모양을 서로 이름 지어 보는 놀이를 해 보세요.',
      ],
    },
  }
}

export function parseKindraStructuredChartReportJsonWithFallback(
  raw: string,
  expectedImageCount?: number,
): KindraStructuredChartReportJson {
  const n =
    typeof expectedImageCount === 'number' ? Math.min(5, Math.max(1, Math.floor(expectedImageCount))) : undefined
  try {
    return parseKindraStructuredChartReportJson(raw, expectedImageCount)
  } catch {
    return buildFallbackKindraStructuredChartReport(n ?? 1)
  }
}

/** API·스토리지에서 받은 객체/문자열을 검증·정규화합니다. */
export function normalizeStructuredReportInput(
  input: unknown,
  expectedImageCount?: number,
): KindraStructuredChartReportJson {
  const n =
    typeof expectedImageCount === 'number' ? Math.min(5, Math.max(1, Math.floor(expectedImageCount))) : undefined
  if (typeof input === 'string') {
    return parseKindraStructuredChartReportJsonWithFallback(input, n)
  }
  try {
    return parseKindraStructuredChartReportJson(JSON.stringify(input), n)
  } catch {
    return buildFallbackKindraStructuredChartReport(n ?? 1)
  }
}
