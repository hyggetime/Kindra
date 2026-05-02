-- =============================================================================
-- kindra_intakes + Gemini/Storage
-- 이전 파일(20260422200000)을 적용하지 않은 DB에서도 동작하도록,
-- 테이블이 없으면 먼저 생성한 뒤 컬럼을 추가합니다.
-- =============================================================================

-- 1) 테이블 (없을 때만 생성 — 20260422200000 과 동일 스키마)
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

-- 2) OTP 등에서 쓰는 함수 (멱등)
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

alter table public.kindra_intakes enable row level security;

-- 3) Gemini·연령·스토리지 경로·아이 프로필 컬럼 (기존 테이블에만 추가되는 경우)
alter table public.kindra_intakes
  add column if not exists child_age_hint text,
  add column if not exists gemini_report_markdown text,
  add column if not exists gemini_status text not null default 'pending',
  add column if not exists gemini_error text,
  add column if not exists drawing_paths jsonb not null default '[]'::jsonb,
  add column if not exists child_display_name text,
  add column if not exists child_gender text;

update public.kindra_intakes
set child_display_name = '(기존 신청)'
where child_display_name is null;

update public.kindra_intakes
set child_gender = '미입력'
where child_gender is null;

alter table public.kindra_intakes
  alter column child_display_name set not null,
  alter column child_gender set not null;

comment on column public.kindra_intakes.child_age_hint is '신청 시 부모가 남긴 연령 힌트 (선택)';
comment on column public.kindra_intakes.gemini_report_markdown is 'Gemini 멀티모달 분석 결과 (마크다운)';
comment on column public.kindra_intakes.gemini_status is 'pending | running | completed | failed';
comment on column public.kindra_intakes.drawing_paths is 'Storage intake-drawings 버킷 내 객체 경로 JSON 배열';
comment on column public.kindra_intakes.child_display_name is '아이 이름 또는 호칭 (리포트 지칭)';
comment on column public.kindra_intakes.child_gender is '아이 성별 (남아/여아/기타 등 표시 문자열)';

-- 4) 비공개 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'intake-drawings',
  'intake-drawings',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
