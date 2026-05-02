-- 신청 이력: 동일 이메일은 새 행이 아니라 갱신(upsert)
create table if not exists public.kindra_intakes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  parent_display_name text not null,
  child_note text,
  report_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kindra_intakes_email_normalized_key unique (email_normalized)
);

comment on table public.kindra_intakes is '분석 신청. 이메일당 1행 — 재신청 시 updated_at 및 필드 갱신.';

-- 서버(service_role) 전용: OTP 시 shouldCreateUser 판별용 (클라이언트에 노출 금지)
create or replace function public.kindra_auth_user_email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where lower(trim(email)) = lower(trim(p_email))
  );
$$;

revoke all on function public.kindra_auth_user_email_exists(text) from public;
grant execute on function public.kindra_auth_user_email_exists(text) to service_role;

-- anon/authenticated 기본 거부 — 서버 service_role upsert 만 허용
alter table public.kindra_intakes enable row level security;
