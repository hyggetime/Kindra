-- 리포트·결제 요청 창구 및 통합 라이프사이클 상태
alter table public.kindra_reports
  add column if not exists channel text,
  add column if not exists status text not null default 'created';

comment on column public.kindra_reports.channel is
  '요청 창구(선택): web | toss | desktop 등. 미입력 허용.';
comment on column public.kindra_reports.status is
  '리포트·결제 통합 상태: created | awaiting_payment | awaiting_deposit | payment_confirmed | analysis_complete | sent | cancelled';

create index if not exists kindra_reports_status_idx
  on public.kindra_reports (status);

create index if not exists kindra_reports_channel_idx
  on public.kindra_reports (channel)
  where channel is not null;

-- 기존 행 백필
update public.kindra_reports
set status = 'sent'
where is_sent = true
  and status = 'created';

update public.kindra_reports
set status = 'payment_confirmed'
where status = 'created'
  and (
    (toss_payment_key is not null and trim(toss_payment_key) <> '')
    or deposit_confirmed = true
  );

update public.kindra_reports
set status = 'awaiting_deposit'
where status = 'created'
  and bank_depositor_name is not null
  and trim(bank_depositor_name) <> ''
  and deposit_confirmed = false;

update public.kindra_reports
set status = 'awaiting_payment'
where status = 'created'
  and intake_id is not null;

update public.kindra_reports
set channel = 'web'
where channel is null;
