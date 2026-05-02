-- One-off: Supabase Dashboard → SQL Editor에 붙여넣어 실행
-- (supabase/migrations/20260430120000_kindra_intakes_drop_email_unique.sql과 동일 목적)
alter table public.kindra_intakes
  drop constraint if exists kindra_intakes_email_normalized_key;

comment on table public.kindra_intakes is '분석 신청 이력. 동일 이메일로 여러 행 가능(신청마다 insert).';

create index if not exists kindra_intakes_email_normalized_created_at_idx
  on public.kindra_intakes (email_normalized, created_at desc);
