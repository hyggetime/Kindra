-- =============================================================================
-- Kindra — 그린필드(빈 프로젝트) 한 번에 스키마 적용
--
-- 용도: 배포·마이그레이션 이력이 없는 Supabase에, `supabase/migrations` 를
--       순서대로 쌓는 대신 **최종 형태만** 한 파일로 올릴 때.
--
-- 전제:
--   - public 에 Kindra 테이블이 없거나, 아래 "선택: 초기화" 블록으로 지운 뒤 실행.
--   - `kindra_intakes.email_normalized` 에는 **UNIQUE 를 두지 않음** (동일 이메일 다중 insert).
--
-- 적용: Dashboard → SQL Editor 에 붙여넣기 실행, 또는 `psql` 로 연결해 실행.
-- 이후 이 레포는 여전히 `supabase/migrations` 로 `db push` 할 수 있음(원격에 이력이 쌓임).
-- **앞으로 `supabase db push` 만 쓸 계획이면 이 파일은 실행하지 마세요.** (스키마 이중 적용·충돌 방지)
-- 그린필드만 SQL Editor 로 올릴 때만 사용.
-- =============================================================================

-- ─── 선택: 기존 테스트 데이터·객체를 싹 지우고 다시 시작할 때만 주석 해제 ───
-- drop table if exists public.kindra_intakes cascade;
-- drop table if exists public.kindra_reports cascade;
-- drop table if exists public.feature_flags cascade;

-- ─── 1) 리포트 (JWT 이메일 = 행의 email 생성 컬럼) ─────────────────────────
create table if not exists public.kindra_reports (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  user_id uuid references auth.users (id) on delete set null,
  title text,
  report_json jsonb,
  created_at timestamptz not null default now(),
  email text generated always as (lower(trim(owner_email))) stored,
  is_sent boolean not null default false,
  price_tier text,
  review_text text,
  bank_depositor_name text,
  deposit_confirmed boolean not null default false
);

create index if not exists kindra_reports_owner_email_lower_idx
  on public.kindra_reports (lower(trim(owner_email)));

create index if not exists kindra_reports_user_id_idx
  on public.kindra_reports (user_id);

comment on table public.kindra_reports is '고객 리포트. RLS: JWT email = 행의 email 일 때만 본인 행.';
comment on column public.kindra_reports.price_tier is '신청 시점 요금 구간: free | discount | normal';
comment on column public.kindra_reports.is_sent is '관리자 기준 발송 완료 여부';
comment on column public.kindra_reports.review_text is '리포트 열람 후 고객이 남긴 짧은 후기(선택)';
comment on column public.kindra_reports.bank_depositor_name is '무통장 입금 시 입금자명(고객이 성공 페이지에서 제출).';
comment on column public.kindra_reports.deposit_confirmed is '관리자 입금 확인. 유료 구간에서 true 이고 is_sent 가 false 이면 리포트 발송 대기.';

alter table public.kindra_reports enable row level security;

drop policy if exists "kindra_reports_select_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_insert_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_update_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_delete_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_select_jwt_email_eq_row_email" on public.kindra_reports;
drop policy if exists "kindra_reports_insert_jwt_email_eq_row_email" on public.kindra_reports;
drop policy if exists "kindra_reports_update_jwt_email_eq_row_email" on public.kindra_reports;
drop policy if exists "kindra_reports_delete_jwt_email_eq_row_email" on public.kindra_reports;

create policy "kindra_reports_select_jwt_email_eq_row_email"
  on public.kindra_reports
  for select
  to authenticated
  using (
    coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
    and email = lower(trim(auth.jwt() ->> 'email'))
  );

create policy "kindra_reports_insert_jwt_email_eq_row_email"
  on public.kindra_reports
  for insert
  to authenticated
  with check (
    coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
    and email = lower(trim(auth.jwt() ->> 'email'))
  );

create policy "kindra_reports_update_jwt_email_eq_row_email"
  on public.kindra_reports
  for update
  to authenticated
  using (
    coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
    and email = lower(trim(auth.jwt() ->> 'email'))
  )
  with check (
    coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
    and email = lower(trim(auth.jwt() ->> 'email'))
  );

create policy "kindra_reports_delete_jwt_email_eq_row_email"
  on public.kindra_reports
  for delete
  to authenticated
  using (
    coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
    and email = lower(trim(auth.jwt() ->> 'email'))
  );

-- ─── 2) 신청 이력 — email_normalized UNIQUE 없음 (신청마다 insert) ─────────
create table if not exists public.kindra_intakes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  parent_display_name text not null,
  child_note text,
  report_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  marketing_opt_in text,
  pricing_intent text,
  child_age_hint text,
  gemini_report_markdown text,
  gemini_status text not null default 'pending',
  gemini_error text,
  drawing_paths jsonb not null default '[]'::jsonb,
  child_display_name text not null,
  child_gender text not null
);

comment on table public.kindra_intakes is '분석 신청 이력. 동일 이메일로 여러 행 가능(신청마다 insert).';
comment on column public.kindra_intakes.marketing_opt_in is 'yes | no (필수)';
comment on column public.kindra_intakes.pricing_intent is 'yes | no_expensive | no_uninterested | null (미선택)';
comment on column public.kindra_intakes.child_age_hint is '신청 시 부모가 남긴 연령 힌트 (선택)';
comment on column public.kindra_intakes.gemini_report_markdown is 'Gemini 멀티모달 분석 결과 (마크다운)';
comment on column public.kindra_intakes.gemini_status is 'pending | running | completed | failed';
comment on column public.kindra_intakes.drawing_paths is 'Storage intake-drawings 버킷 내 객체 경로 JSON 배열';
comment on column public.kindra_intakes.child_display_name is '아이 이름 또는 호칭 (리포트 지칭)';
comment on column public.kindra_intakes.child_gender is '아이 성별 (남아/여아/기타 등 표시 문자열)';

create index if not exists kindra_intakes_email_normalized_created_at_idx
  on public.kindra_intakes (email_normalized, created_at desc);

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

drop policy if exists "kindra_intakes_service_role_all" on public.kindra_intakes;

create policy "kindra_intakes_service_role_all"
  on public.kindra_intakes
  for all
  to service_role
  using (true)
  with check (true);

-- ─── 3) 그림 저장용 비공개 버킷 ────────────────────────────────────────────
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

-- ─── 4) 기능 플래그 ───────────────────────────────────────────────────────
create table if not exists public.feature_flags (
  key text primary key,
  value_bool boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.feature_flags is '앱 전역 플래그. is_step2_enabled: 2단계(유료·할인 UI) 활성 여부.';

insert into public.feature_flags (key, value_bool)
values ('is_step2_enabled', false)
on conflict (key) do nothing;
