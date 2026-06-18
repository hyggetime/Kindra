-- Resend 웹훅 멱등·리포트 이메일 배송 추적
create table if not exists public.kindra_resend_webhook_events (
  svix_id text primary key,
  event_type text not null,
  resend_email_id text,
  report_id uuid references public.kindra_reports (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists kindra_resend_webhook_events_report_id_idx
  on public.kindra_resend_webhook_events (report_id);

comment on table public.kindra_resend_webhook_events is
  'Resend(Svix) 웹훅 svix-id 멱등 처리. 성공 수신 즉시 insert.';

alter table public.kindra_resend_webhook_events enable row level security;

alter table public.kindra_reports
  add column if not exists resend_email_id text,
  add column if not exists email_delivery_error text,
  add column if not exists email_delivery_updated_at timestamptz;

comment on column public.kindra_reports.resend_email_id is 'Resend email_id — 웹훅·재조회용';
comment on column public.kindra_reports.email_delivery_error is '마지막 이메일 배송 실패 사유(Resend bounce 등)';
comment on column public.kindra_reports.email_delivery_updated_at is 'Resend 웹훅 기준 이메일 배송 상태 마지막 갱신';

create index if not exists kindra_reports_resend_email_id_idx
  on public.kindra_reports (resend_email_id)
  where resend_email_id is not null;
