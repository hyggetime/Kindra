/**
 * 킨드라 — **구조화 JSON 전용** 스펙 (다각형 차트 + 정돈된 리포트 UI).
 * - 기존 마크다운 리포트(`buildKindraSystemInstruction`)와 별도 경로.
 * - `responseMimeType: application/json` + `responseSchema`로 스키마 강제.
 * - 시각 정밀 해설은 `report_sections.visual_summary[]`에만 **집중 배치**하고, 다른 절은 요약·렌즈·통합으로 나눕니다.
 * - 시스템 프롬프트 문구는 `prompts.ts`의 {@link KINDRA_STRUCTURED_JSON_SYSTEM_PROMPT} 가 단일 소스입니다.
 */
import { SchemaType, type Schema } from '@google/generative-ai'

export { KINDRA_STRUCTURED_JSON_SYSTEM_PROMPT } from './prompts'

/** 차트 5축 — 정수 **50~100** (아래 밴드 규칙 준수) */
export type KindraChartScoresJson = {
  fine_motor: number
  observation: number
  spatial_logic: number
  narrative: number
  emotional_resource: number
}

export type KindraVisualSummaryItemJson = {
  /** 반드시 `No.01 (그림 1)` … `No.05 (그림 5)` 형식 (업로드 순서와 일치) */
  target_image: string
  /** 해당 장에 대한 정밀 시각 해설 (구도·필압·색·상징·공간 등). 따뜻한 문장력 유지. */
  description: string
}

export type KindraStructuredChartReportJson = {
  chart_scores: KindraChartScoresJson
  report_sections: {
    title: string
    /** N장이면 길이 N. 각 요소가 한 장의 시각 해설을 담당 — 날것 그림 번호 나열은 여기서만 정돈 */
    visual_summary: KindraVisualSummaryItemJson[]
    overall_summary: string
    developmental_lenses: {
      goodenough_analysis: string
      luquet_analysis: string
      lowenfeld_analysis: string
    }
    psychological_lenses: {
      dap_kfd_analysis: string
      line_pressure_analysis: string
      space_layout_analysis: string
      color_density_analysis: string
    }
    integrated_narrative: string
    /** 신체 참고치 안내 — 따뜻한 톤 + 면책; LMS·수치 유무에 맞춰 서술 */
    growth_stats_guide: string
    /** Hygge 팁 3~5개 — 각 문자열이 한 가지 실행 제안 */
    hygge_tips: string[]
  }
}

const str = (description: string): Schema => ({
  type: SchemaType.STRING,
  description,
})

/** 50~100 정수. 밴드: 85~95 매우 안정·우수, 70~84 안정·또래 평균권, 50~69 보완·추후 관찰 (해석은 다정) */
const score50to100 = (axis: string): Schema => ({
  type: SchemaType.INTEGER,
  description: `${axis} — **반드시 50 이상 100 이하 정수**. 밴드: (1) 매우 안정·우수한 표현력 → **85~95** (2) 안정·또래 평균 범주 → **70~84** (3) 보완·추후 관찰 필요 → **50~69**. 진단·지능·발달지연 의미 금지. 심허브·또래 월령 대비 **상대적 표현 밀도**로만 해석.`,
})

const visualSummaryItemSchema: Schema = {
  type: SchemaType.OBJECT,
  description: '한 장에 대한 시각 해설 블록.',
  properties: {
    target_image: str(
      '예: `No.01 (그림 1)` — 번호는 업로드 순서와 일치, No.는 두 자리 01~05.',
    ),
    description: str(
      '그 장만의 정밀 시각 해설 3~10문장. 선·필압·색·구도·상징·공간·반복 모티프 등 **시각 사실** 우선. 따뜻한 톤.',
    ),
  },
  required: ['target_image', 'description'],
}

/**
 * {@link GoogleGenerativeAI.getGenerativeModel} 의 `generationConfig.responseSchema`.
 */
export function kindraChartReportResponseSchema(): Schema {
  return {
    type: SchemaType.OBJECT,
    description:
      '단일 JSON. 마크다운·코드펜스·주석 금지. chart_scores 5축은 50~100. visual_summary는 장수만큼 요소.',
    properties: {
      chart_scores: {
        type: SchemaType.OBJECT,
        description: '레이더(5축) 차트용 점수. 각 축 독립 채점 후 서술과 정합.',
        properties: {
          fine_motor: score50to100('소근육 정교성 (Lowenfeld)'),
          observation: score50to100('세밀 관찰력 (Goodenough–Harris)'),
          spatial_logic: score50to100('공간 구성력 (Luquet 공간·배치)'),
          narrative: score50to100('논리적 서사성 (Luquet 인과·순서)'),
          emotional_resource: score50to100('정서적 안정·자원 (HTP/DAP 등 해당 렌즈)'),
        },
        required: ['fine_motor', 'observation', 'spatial_logic', 'narrative', 'emotional_resource'],
      },
      report_sections: {
        type: SchemaType.OBJECT,
        properties: {
          title: str('리포트 헤드라인. 단정·낙인 금지, 한두 줄.'),
          visual_summary: {
            type: SchemaType.ARRAY,
            description:
              '**첨부 N장이면 정확히 N개**. 각 요소 = 한 장의 정밀 시각 해설. JSON 다른 필드에 장별 장문을 흩뿌리지 말고, **시각 밀도는 여기 우선**.',
            items: visualSummaryItemSchema,
            minItems: 1,
            maxItems: 5,
          },
          overall_summary: str(
            '통합 요약 4~12문장. chart_scores 패턴을 다정하게 엮되, 장별 세부는 visual_summary를 참조하는 톤.',
          ),
          developmental_lenses: {
            type: SchemaType.OBJECT,
            description: '3대 인지 발달 렌즈 — 그림 번호 인용 가능.',
            properties: {
              goodenough_analysis: str('Goodenough–Harris — observation 점수와 정합.'),
              luquet_analysis: str('Luquet — spatial_logic·narrative 점수와 정합.'),
              lowenfeld_analysis: str('Lowenfeld — fine_motor 점수와 정합.'),
            },
            required: ['goodenough_analysis', 'luquet_analysis', 'lowenfeld_analysis'],
          },
          psychological_lenses: {
            type: SchemaType.OBJECT,
            description: '전통 렌즈 기반 정서·심리 서술. 해당 없으면 「이 축은 이번 그림에서 덜 두드러짐」을 짧게.',
            properties: {
              dap_kfd_analysis: str('인물·가족 역동(DAP/KFD 등) — emotional_resource와 정합.'),
              line_pressure_analysis: str('선·필압 흐름.'),
              space_layout_analysis: str('여백·기저선·구도·화면 사용.'),
              color_density_analysis: str(
                '색 온도·밀도. 흑백·연필만이면 「색채 재료 없음」을 밝히고 선·형태로 대체.',
              ),
            },
            required: [
              'dap_kfd_analysis',
              'line_pressure_analysis',
              'space_layout_analysis',
              'color_density_analysis',
            ],
          },
          integrated_narrative: str('여러 장이면 통합 내러티브; 1장이면 한 장의 결. 횡단 패턴·마음의 결.'),
          growth_stats_guide: str(
            '3~6문장. 킨드라 톤(따뜻함·휘게). (1) **첫 문장**: 호칭은 **「우리 {이름}」** 만 사용(「사랑스러운 {이름}」 등 수식어 금지). 유저 메시지에 키·몸무게 **둘 다** 있으면 첫 문장을 **「우리 {이름}의 키가 {숫자}cm이고 몸무게는 {숫자}kg이군요.」** 형태로 시작(보호자 메모 등에 적힌 **실제 숫자 그대로**). 하나만 있으면 **「우리 {이름}의 키가 …」** 또는 **「…몸무게는 …kg이군요.」** 중 해당만 자연스럽게. (2) 「성장도표 참고」블록이 있으면 건강보험공단 성장도표 기준 **약 N백분위**(또는 5% 미만·95% 초과)·p50 대비를 한두 문장; 없으면 백분위 **지어내기 금지**. (3) 그림·심리 해석과 신체 참고의 관계를 부드럽게. (4) **마지막**: **평가를 대체하지 않는다**는 뜻의 문장(예: 그림에 담긴 마음의 평가를 대체하지 않습니다) 직후 **반드시** **「참고용으로만 봐주세요.」** 를 붙여 문단을 끝낼 것.',
          ),
          hygge_tips: {
            type: SchemaType.ARRAY,
            description: '부모 실행 팁 **3~5개** (각 문자열 한 가지 제안). 그림에서 본 구체 요소 인용.',
            items: str('대화·놀이·관찰 팁 한 블록 (2~4문장 가능).'),
            minItems: 3,
            maxItems: 5,
          },
        },
        required: [
          'title',
          'visual_summary',
          'overall_summary',
          'developmental_lenses',
          'psychological_lenses',
          'integrated_narrative',
          'growth_stats_guide',
          'hygge_tips',
        ],
      },
    },
    required: ['chart_scores', 'report_sections'],
  }
}

export function buildKindraStructuredJsonUserPrompt(
  ctx: {
    childDisplayName?: string
    childAgeHint?: string
    completedMonths?: number
    parentNote?: string
    childGenderLabel?: string
  },
  imageCount: number,
  /** 서버에서만 채움 — 건강보험공단 성장도표 기반 백분위·p50 사실(모델이 growth_stats_guide에 녹여 씀) */
  growthChartFactsBlock?: string,
): string {
  const n = Math.min(5, Math.max(1, Math.floor(imageCount)))
  const name = ctx.childDisplayName?.trim() || '아이'
  const growth = growthChartFactsBlock?.trim()
  const lines = [
    `첨부 이미지는 업로드 순서대로 **그림 1 ~ 그림 ${n}** (총 ${n}장)입니다.`,
    `JSON의 visual_summary 배열 길이는 반드시 **${n}** 이어야 합니다.`,
    `아이 호칭: ${name}`,
    ctx.childGenderLabel?.trim() ? `성별 라벨(참고만): ${ctx.childGenderLabel.trim()}` : '',
    ctx.childAgeHint?.trim() ? `연령 힌트: ${ctx.childAgeHint.trim()}` : '',
    typeof ctx.completedMonths === 'number' && Number.isFinite(ctx.completedMonths)
      ? `생후 완료 개월 수(참고): 약 ${ctx.completedMonths}개월`
      : '',
    ctx.parentNote?.trim() ? `보호자 메모(보조): ${ctx.parentNote.trim()}` : '',
    growth ? growth : '',
    '시스템 지침을 따르고, **순수 JSON 한 덩어리만** 반환하세요.',
  ]
  return lines.filter(Boolean).join('\n')
}

function assertScoreBand(name: keyof KindraChartScoresJson, v: unknown): void {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 50 || v > 100) {
    throw new Error(`Kindra structured report: chart_scores.${name} must be integer 50..100, got ${String(v)}`)
  }
}

/** 모델이 가끔 감싸는 \`\`\`json 펜스·BOM 제거 — 파싱 전에 항상 통과 */
export function stripGeminiJsonEnvelope(raw: string): string {
  let t = raw.trim().replace(/^\uFEFF/, '')
  const fenced = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```\s*$/i.exec(t)
  if (fenced) t = fenced[1]!.trim()
  return t
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

/** 파싱 + 최소 검증. \`expectedImageCount\` 를 넣으면 visual_summary 길이를 검사합니다. */
export function parseKindraStructuredChartReportJson(
  raw: string,
  expectedImageCount?: number,
): KindraStructuredChartReportJson {
  const t = stripGeminiJsonEnvelope(raw)
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
