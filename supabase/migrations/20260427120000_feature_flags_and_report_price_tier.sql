-- 단계별 가격·2차 오픈 제어
create table if not exists public.feature_flags (
  key text primary key,
  value_bool boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.feature_flags is '앱 전역 플래그. is_step2_enabled: 2단계(유료·할인 UI) 활성 여부.';

insert into public.feature_flags (key, value_bool)
values ('is_step2_enabled', false)
on conflict (key) do nothing;

alter table public.kindra_reports
  add column if not exists price_tier text;

comment on column public.kindra_reports.price_tier is '신청 시점 요금 구간: free | discount | normal';
