-- 토스 웹훅 멱등·결제 상태 추적 (서비스 롤만 접근)
create table if not exists public.kindra_toss_webhook_events (
  transmission_id text primary key,
  event_type text not null,
  payment_key text,
  order_id text,
  created_at timestamptz not null default now()
);

create index if not exists kindra_toss_webhook_events_payment_key_idx
  on public.kindra_toss_webhook_events (payment_key);

comment on table public.kindra_toss_webhook_events is
  '토스 웹훅 tosspayments-webhook-transmission-id 멱등 처리. 성공 수신 즉시 insert.';

alter table public.kindra_reports
  add column if not exists toss_payment_status text;

alter table public.kindra_reports
  add column if not exists toss_webhook_updated_at timestamptz;

alter table public.kindra_reports
  add column if not exists payment_cancelled_at timestamptz;

comment on column public.kindra_reports.toss_payment_status is
  '토스 Payment.status 최신값(DONE·CANCELED 등). 웹훅으로 동기화.';
comment on column public.kindra_reports.payment_cancelled_at is
  '토스 기준 결제 취소 시각(웹훅).';

alter table public.kindra_intakes
  add column if not exists payment_confirmed_at timestamptz;

alter table public.kindra_intakes
  add column if not exists payment_failed_at timestamptz;

alter table public.kindra_intakes
  add column if not exists payment_cancelled_at timestamptz;

comment on column public.kindra_intakes.payment_confirmed_at is
  '카드·간편결제 확정 웹훅(DONE) 시각.';
comment on column public.kindra_intakes.payment_failed_at is
  '결제 실패·만료·중단 웹훅 시각.';
comment on column public.kindra_intakes.payment_cancelled_at is
  '결제 취소·부분취소 웹훅 시각.';

alter table public.kindra_toss_webhook_events enable row level security;
