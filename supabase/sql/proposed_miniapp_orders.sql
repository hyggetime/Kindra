-- =============================================================================
-- 제안 스키마: 토스 미니앱 주문 + 폴링 (main에 바로 적용하지 말고 검토 후 마이그레이션화)
-- 실행: Supabase SQL Editor 또는 새 타임스탬프 마이그레이션 파일로 복사
-- =============================================================================

create table if not exists public.kindra_miniapp_orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed')),
  email text,
  marketing_opt_in boolean not null default false,
  terms_agreed_at timestamptz,
  /** Edge가 채움: 발달·인지 오각형 점수 등 */
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kindra_miniapp_orders_status_idx
  on public.kindra_miniapp_orders (status, created_at desc);

comment on table public.kindra_miniapp_orders is
  '토스 미니앱 정적 클라이언트가 insert 후 폴링하는 분석 주문. 무거운 처리는 Edge Function.';

-- updated_at 자동 갱신 (프로젝트에 이미 트리거 패턴이 있으면 생략)
create or replace function public.kindra_miniapp_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kindra_miniapp_orders_touch on public.kindra_miniapp_orders;
create trigger kindra_miniapp_orders_touch
  before update on public.kindra_miniapp_orders
  for each row execute function public.kindra_miniapp_touch_updated_at();

alter table public.kindra_miniapp_orders enable row level security;

-- 예: anon은 자신이 만든 행만 읽기 — 실제 정책은 앱 인증 방식에 맞게 조정
-- create policy "miniapp read own" on public.kindra_miniapp_orders
--   for select using (auth.uid() = user_id);

-- Webhook: Supabase Dashboard → Database Webhooks
--   Table: kindra_miniapp_orders
--   Events: INSERT
--   HTTP Request: POST https://<project-ref>.supabase.co/functions/v1/kindra-analyze-order
--   Headers: x-kindra-webhook-secret: <KINDRA_WEBHOOK_SECRET>
--
-- Edge 함수는 INSERT된 row의 id를 받아 status=running → Gemini → completed/failed 로 갱신합니다.
