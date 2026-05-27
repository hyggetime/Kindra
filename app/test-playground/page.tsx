'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import {
  KINDRA_STRUCTURED_JSON_SYSTEM_PROMPT,
  buildKindraStructuredJsonUserPrompt,
} from '@lib/gemini/kindra-structured-json-report'

/** public 기본 테스트 이미지 — 업로드 순서 = 그림 1 … 그림 5 (멀티모달 최대 장수) */
const DEFAULT_IMAGE_URLS = [
  '/gallery/birthday-cake.png',
  '/gallery/beach-scene.png',
  '/gallery/paper-dolls-a.png',
  '/gallery/paper-dolls-b.png',
  '/gallery/sketches-card.png',
] as const

const MOCK_CHILD = {
  name: 'testkid1',
  genderLabel: '여아',
  birth: '2020.10.22',
  completedMonths: 66,
  heightCm: 110.8,
  weightKg: 19.5,
} as const

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

async function loadImagesAsInlineData(urls: readonly string[]): Promise<{ mimeType: string; base64: string }[]> {
  const out: { mimeType: string; base64: string }[] = []
  for (const url of urls) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`이미지 로드 실패: ${url} (${res.status})`)
    const blob = await res.blob()
    const mime = (blob.type || 'image/png').split(';')[0].trim().toLowerCase()
    const b64 = arrayBufferToBase64(await blob.arrayBuffer())
    out.push({ mimeType: mime, base64: b64 })
  }
  return out
}

type ChartScores = {
  fine_motor?: number
  observation?: number
  spatial_logic?: number
  narrative?: number
  emotional_resource?: number
}

type RunTiming = {
  /** 이미지 fetch → base64 변환까지 */
  imageLoadMs: number
  /** POST /api/test-gemini ~ 응답 JSON 수신까지 (서버 Gemini 포함) */
  apiMs: number
  /** 위 둘의 합 */
  totalMs: number
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s (${Math.round(ms)}ms)`
}

export default function PromptTestPlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState(KINDRA_STRUCTURED_JSON_SYSTEM_PROMPT)
  const [userText, setUserText] = useState('')
  const [useStructuredJson, setUseStructuredJson] = useState(true)
  const [model, setModel] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawJson, setRawJson] = useState<string | null>(null)
  const [parsed, setParsed] = useState<unknown>(null)
  const [lastTiming, setLastTiming] = useState<RunTiming | null>(null)

  const defaultUserText = useMemo(
    () =>
      buildKindraStructuredJsonUserPrompt(
        {
          childDisplayName: MOCK_CHILD.name,
          childGenderLabel: MOCK_CHILD.genderLabel,
          completedMonths: MOCK_CHILD.completedMonths,
          childAgeHint: `${MOCK_CHILD.birth} 생, 생후 약 ${MOCK_CHILD.completedMonths}개월`,
          parentNote: `키 ${MOCK_CHILD.heightCm}cm, 몸무게 ${MOCK_CHILD.weightKg}kg (참고)`,
        },
        DEFAULT_IMAGE_URLS.length,
      ),
    [],
  )

  const run = useCallback(async () => {
    setError(null)
    setRawJson(null)
    setParsed(null)
    setLastTiming(null)
    setLoading(true)
    const t0 = performance.now()
    let imageLoadMs = 0
    let apiMs = 0
    let tApiStart = t0
    try {
      const tLoad = performance.now()
      const images = await loadImagesAsInlineData(DEFAULT_IMAGE_URLS)
      imageLoadMs = performance.now() - tLoad
      tApiStart = performance.now()

      const res = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: systemPrompt,
          userText: userText.trim() || defaultUserText,
          useStructuredJson,
          model: model.trim() || undefined,
          images,
          ...(useStructuredJson
            ? {
                structuredGrowth: {
                  completedMonths: MOCK_CHILD.completedMonths,
                  sex: 'female' as const,
                  heightCm: MOCK_CHILD.heightCm,
                  weightKg: MOCK_CHILD.weightKg,
                  childDisplayName: MOCK_CHILD.name,
                },
              }
            : {}),
        }),
      })
      const data = (await res.json()) as { ok?: boolean; rawText?: string; error?: string }
      apiMs = performance.now() - tApiStart

      const timing: RunTiming = {
        imageLoadMs,
        apiMs,
        totalMs: performance.now() - t0,
      }
      setLastTiming(timing)

      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`)
        return
      }
      const text = data.rawText ?? ''
      setRawJson(text)
      if (useStructuredJson) {
        try {
          setParsed(JSON.parse(text))
        } catch {
          setError('JSON 파싱 실패 — raw 로그를 확인하세요.')
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setLastTiming({
        imageLoadMs,
        apiMs: performance.now() - tApiStart,
        totalMs: performance.now() - t0,
      })
    } finally {
      setLoading(false)
    }
  }, [defaultUserText, model, systemPrompt, useStructuredJson, userText])

  const scores = (parsed as { chart_scores?: ChartScores } | null)?.chart_scores

  return (
    <div className="min-h-svh bg-[#fbf9f5] text-[#2a2a2a]">
      <header className="border-b border-[#e8e4dc] bg-white/90 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7c9070]">dev only</p>
        <h1 className="mt-1 text-lg font-bold tracking-tight">프롬프트 테스트 플레이그라운드</h1>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#6b6b6b]">
          <code className="rounded bg-[#f0ebe3] px-1">GEMINI_API_KEY</code> 는 서버(<code className="rounded bg-[#f0ebe3] px-1">/api/test-gemini</code>
          )에서만 사용합니다. 프로덕션에서는 기본 차단됩니다.
        </p>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 lg:flex-row lg:items-start">
        {/* 좌측 컨트롤 */}
        <section className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:w-[min(44%,32rem)] lg:shrink-0">
          <div className="rounded-2xl border border-[#e4ddd3] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#3d3d3d]">고정 아이 정보 (Mock)</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <dt className="text-[#8a8a8a]">이름</dt>
              <dd className="font-medium">{MOCK_CHILD.name}</dd>
              <dt className="text-[#8a8a8a]">성별</dt>
              <dd>{MOCK_CHILD.genderLabel}</dd>
              <dt className="text-[#8a8a8a]">생년월일</dt>
              <dd>{MOCK_CHILD.birth}</dd>
              <dt className="text-[#8a8a8a]">월령</dt>
              <dd>생후 약 {MOCK_CHILD.completedMonths}개월</dd>
              <dt className="text-[#8a8a8a]">키 / 몸무게</dt>
              <dd>
                {MOCK_CHILD.heightCm}cm / {MOCK_CHILD.weightKg}kg
              </dd>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#e4ddd3] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#3d3d3d]">고정 이미지 URL</h2>
            <ul className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-[#5a5a5a]">
              {DEFAULT_IMAGE_URLS.map((u, i) => (
                <li key={u}>
                  그림 {i + 1}: {u}
                </li>
              ))}
            </ul>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#4a4a4a]">
            <input
              type="checkbox"
              checked={useStructuredJson}
              onChange={(e) => setUseStructuredJson(e.target.checked)}
              className="accent-[#7c9070]"
            />
            구조화 JSON (responseSchema + chart_scores / report_sections)
          </label>

          <label className="block text-xs font-medium text-[#4a4a4a]">
            모델 (비우면 GEMINI_API_KEY 환경의 기본값)
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemini-2.5-flash"
              className="mt-1.5 w-full rounded-lg border border-[#e0d8ce] px-3 py-2 font-mono text-xs"
            />
          </label>

          <div>
            <label className="text-xs font-semibold text-[#3d3d3d]">System prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              spellCheck={false}
              className="mt-1.5 h-[min(42vh,22rem)] w-full resize-y rounded-xl border border-[#d8cfc3] bg-[#fdfcfa] p-3 font-mono text-[11px] leading-relaxed text-[#2f2f2f]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3d3d3d]">
              User 텍스트 (비우면 아래 Mock 유저 프롬프트 자동 사용)
            </label>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              spellCheck={false}
              placeholder={defaultUserText}
              className="mt-1.5 h-28 w-full resize-y rounded-xl border border-[#d8cfc3] bg-[#fdfcfa] p-3 font-mono text-[11px] leading-relaxed"
            />
          </div>

          <details className="rounded-xl border border-dashed border-[#cfc4b8] bg-[#faf7f2] p-3 text-[11px] text-[#6b6b6b]">
            <summary className="cursor-pointer font-medium text-[#5a5a5a]">Mock 유저 프롬프트 미리보기</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words">{defaultUserText}</pre>
          </details>

          <button
            type="button"
            disabled={loading}
            onClick={() => void run()}
            className="rounded-2xl bg-[#7c9070] py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#6a7d60] disabled:opacity-50"
          >
            {loading ? 'Gemini 분석 중…' : 'Gemini 분석 실행'}
          </button>
        </section>

        {/* 우측 결과 */}
        <section className="flex min-h-[60vh] w-full flex-1 flex-col gap-4">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[#e4ddd3] bg-white p-12">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c9070]/30 border-t-[#7c9070]"
                aria-hidden
              />
              <p className="mt-4 text-sm text-[#5c5c5c]">Gemini 호출 중…</p>
              <p className="mt-2 text-center text-xs text-[#9a9a9a]">
                5장 로드 + API — 전체 소요는 완료 후 아래에 표시됩니다.
              </p>
            </div>
          ) : null}

          {lastTiming && !loading ? (
            <div className="rounded-2xl border border-[#c5d4bc] bg-[#f0f6ec] px-5 py-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#3d5236]">
                소요 시간 ({DEFAULT_IMAGE_URLS.length}장 분석)
              </h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-[#dfe8d8]">
                  <dt className="text-[10px] font-medium text-[#6b7d64]">총합 (클릭~완료)</dt>
                  <dd className="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#2f3d2e]">
                    {formatDuration(lastTiming.totalMs)}
                  </dd>
                </div>
                <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-[#dfe8d8]">
                  <dt className="text-[10px] font-medium text-[#6b7d64]">이미지 로드 (브라우저)</dt>
                  <dd className="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#2f3d2e]">
                    {formatDuration(lastTiming.imageLoadMs)}
                  </dd>
                </div>
                <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-[#dfe8d8]">
                  <dt className="text-[10px] font-medium text-[#6b7d64]">API (서버 Gemini)</dt>
                  <dd className="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#2f3d2e]">
                    {formatDuration(lastTiming.apiMs)}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-[10px] leading-relaxed text-[#5a6f52]/90">
                API 구간에는 네트워크 왕복 + 서버에서 Gemini 생성까지 포함됩니다. 순수 모델만 측정하려면{' '}
                <code className="rounded bg-[#e4ecdf] px-1">/api/test-gemini</code> 에 서버 타이머를 추가하면 됩니다.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
              {error}
            </div>
          ) : null}

          {parsed && scores ? (
            <div className="rounded-2xl border border-[#e4ddd3] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#3d3d3d]">chart_scores</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ['fine_motor', '소근육 (Lowenfeld)'],
                    ['observation', '관찰 (Goodenough)'],
                    ['spatial_logic', '공간 (Luquet)'],
                    ['narrative', '서사 (Luquet)'],
                    ['emotional_resource', '정서 자원'],
                  ] as const
                ).map(([key, label]) => {
                  const v = scores[key as keyof ChartScores]
                  return (
                    <div key={key} className="rounded-xl bg-[#f5f2ec] px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c9070]">{label}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-[#2f3d2e]">{v ?? '—'}</p>
                    </div>
                  )
                })}
              </div>

              <ReportSectionsPreview data={parsed as Record<string, unknown>} />
            </div>
          ) : null}

          {rawJson ? (
            <div className="flex flex-1 flex-col rounded-2xl border border-[#e0d8ce] bg-[#1e1e1e] p-4 shadow-inner">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a8c4a0]">Raw output (디버그)</h2>
              <pre className="mt-2 max-h-[min(50vh,28rem)] flex-1 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[#d4d4d4]">
                {rawJson}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function ReportSectionsPreview({ data }: { data: Record<string, unknown> }) {
  const rs = data.report_sections as Record<string, unknown> | undefined
  if (!rs) return <p className="mt-4 text-sm text-[#8a8a8a]">report_sections 없음</p>

  const text = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v, null, 2))

  return (
    <div className="mt-8 space-y-6 border-t border-[#ece6dc] pt-6">
      <h2 className="text-sm font-bold text-[#3d3d3d]">report_sections</h2>

      <Block title="title">{text(rs.title)}</Block>

      {Array.isArray(rs.visual_summary) ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c9070]">visual_summary</h3>
          <ul className="mt-2 space-y-4">
            {(rs.visual_summary as { target_image?: string; description?: string }[]).map((item, i) => (
              <li key={i} className="rounded-xl border border-[#ebe4d9] bg-[#fdfcfa] p-4">
                <p className="font-mono text-[11px] font-semibold text-[#5a6f52]">{item.target_image ?? '—'}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#3d3d3d]">{item.description ?? ''}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Block title="overall_summary">{text(rs.overall_summary)}</Block>

      {rs.developmental_lenses && typeof rs.developmental_lenses === 'object' ? (
        <LensBlock title="developmental_lenses" obj={rs.developmental_lenses as Record<string, unknown>} />
      ) : null}
      {rs.psychological_lenses && typeof rs.psychological_lenses === 'object' ? (
        <LensBlock title="psychological_lenses" obj={rs.psychological_lenses as Record<string, unknown>} />
      ) : null}

      <Block title="integrated_narrative">{text(rs.integrated_narrative)}</Block>
      <Block title="growth_stats_guide">{text(rs.growth_stats_guide)}</Block>

      {Array.isArray(rs.hygge_tips) ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c9070]">hygge_tips</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#3d3d3d]">
            {(rs.hygge_tips as string[]).map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c9070]">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#f8f5ef] p-4 text-sm leading-relaxed text-[#3d3d3d]">
        {children}
      </p>
    </div>
  )
}

function LensBlock({ title, obj }: { title: string; obj: Record<string, unknown> }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c9070]">{title}</h3>
      <div className="mt-2 space-y-3">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-[#ebe4d9] bg-[#fdfcfa] p-4">
            <p className="font-mono text-[10px] font-semibold text-[#6b7d64]">{k}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#3d3d3d]">
              {typeof v === 'string' ? v : JSON.stringify(v, null, 2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
