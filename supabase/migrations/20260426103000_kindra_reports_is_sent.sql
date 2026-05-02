-- 리포트 발송 여부 (관리자 /admin/reports 등에서 갱신)
alter table public.kindra_reports
  add column if not exists is_sent boolean not null default false;

comment on column public.kindra_reports.is_sent is '관리자 기준 발송 완료 여부';
