-- one_shot_setup 전용 DB 등 구버전 스키마에 `price_tier` 가 없을 때 대비(멱등).
-- 적용: `supabase db push` 또는 Dashboard → SQL 에서 실행.

alter table public.kindra_reports
  add column if not exists price_tier text;

comment on column public.kindra_reports.price_tier is '신청 시점 요금 구간: free | discount | normal';
