-- 무통장 입금: 입금자명(고객 입력) · 입금 확인(관리자) — 유료 리포트 발송 대기 판별에 사용

alter table public.kindra_reports
  add column if not exists bank_depositor_name text,
  add column if not exists deposit_confirmed boolean not null default false;

comment on column public.kindra_reports.bank_depositor_name is '무통장 입금 시 입금자명(고객이 성공 페이지에서 제출).';
comment on column public.kindra_reports.deposit_confirmed is '관리자 입금 확인. 유료 구간에서 true 이고 is_sent 가 false 이면 리포트 발송 대기.';
