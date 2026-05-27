/**
 * Supabase Edge Function — 미니앱 주문(`kindra_miniapp_orders`) 분석 파이프라인 뼈대
 *
 * 트리거: Database Webhook (INSERT on pending row)
 * 이 파일은 Deno 런타임에서 실행됩니다. 로컬 타입체크는 `deno check` 권장.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.0'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

const WEBHOOK_SECRET = Deno.env.get('KINDRA_WEBHOOK_SECRET') ?? ''
const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

type MiniappOrderRow = {
  id: string
  status: string
  email: string | null
}

function extractInsertedRow(payload: unknown): MiniappOrderRow | null {
  if (!payload || typeof payload !== 'object') return null
  const o = payload as Record<string, unknown>
  // Supabase Database Webhook: type / record / schema 등 필드명은 대시보드 "테스트" 페이로드로 확인 후 맞춤
  const rec = (o.record ?? o.new ?? o) as Record<string, unknown> | undefined
  if (!rec || typeof rec !== 'object') return null
  const id = rec.id
  if (typeof id !== 'string') return null
  return {
    id,
    status: typeof rec.status === 'string' ? rec.status : 'pending',
    email: typeof rec.email === 'string' ? rec.email : null,
  }
}

async function runGeminiStub(_order: MiniappOrderRow): Promise<Record<string, unknown>> {
  if (!GEMINI_KEY) {
    // 프롬프트 없이 연결만 검증하는 스텁
    return {
      note: 'Set GEMINI_API_KEY and port lib/gemini/prompts + generate logic here.',
      axes: {
        세밀_관찰력: 3,
        공간_구성력: 4,
        논리적_서사성: 3,
        소근육_정교성: 4,
        또래_상대_밀도: 3,
      },
    }
  }
  const gen = new GoogleGenerativeAI(GEMINI_KEY)
  const model = gen.getGenerativeModel({ model: Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash' })
  const prompt =
    'Return ONLY compact JSON with keys axes: fine_motor, spatial, narrative, detail, peer_relative each 1-5 integers. No markdown.'
  const r = await model.generateContent(prompt)
  const text = r.response.text()
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as Record<string, unknown>
  } catch {
    return { raw: text }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const secret = req.headers.get('x-kindra-webhook-secret') ?? ''
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return jsonResponse({ error: 'unauthorized' }, 401)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return jsonResponse({ error: 'missing_supabase_env' }, 500)
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400)
  }

  const row = extractInsertedRow(payload)
  if (!row) {
    return jsonResponse({ error: 'no_row', payload }, 400)
  }

  if (row.status !== 'pending') {
    return jsonResponse({ skipped: true, reason: 'not_pending', id: row.id })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

  const { error: runErr } = await admin
    .from('kindra_miniapp_orders')
    .update({ status: 'running', error: null })
    .eq('id', row.id)
    .eq('status', 'pending')

  if (runErr) {
    return jsonResponse({ error: 'db_running', detail: runErr.message }, 500)
  }

  try {
    const result = await runGeminiStub(row)
    const { error: doneErr } = await admin
      .from('kindra_miniapp_orders')
      .update({ status: 'completed', result, error: null })
      .eq('id', row.id)

    if (doneErr) {
      throw new Error(doneErr.message)
    }
    return jsonResponse({ ok: true, id: row.id })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await admin.from('kindra_miniapp_orders').update({ status: 'failed', error: msg }).eq('id', row.id)
    return jsonResponse({ ok: false, id: row.id, error: msg }, 500)
  }
})
