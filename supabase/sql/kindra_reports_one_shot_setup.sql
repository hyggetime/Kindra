-- ═══════════════════════════════════════════════════════════════════════════
-- Kindra — public.kindra_reports 한 번에 생성 + RLS (Supabase SQL Editor 용)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 에러 42P01 "relation does not exist" → 이 스크립트를 **먼저** 실행하세요.
-- `/reports/[uuid]` 주소는 Next 앱 경로일 뿐이고, DB에 테이블이 있어야 INSERT/SELECT 가 됩니다.
--
-- 실행: Supabase Dashboard → SQL → New query → 전체 붙여넣기 → Run
-- (이미 동일 이름 테이블이 있으면 CREATE 는 스킵됩니다. 정책만 갱신됩니다.)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.kindra_reports (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  -- RLS 비교용: owner_email 과 동일(소문자·trim), JWT 의 email 과 맞춤
  email text generated always as (lower(trim(owner_email))) stored,
  user_id uuid references auth.users (id) on delete set null,
  title text,
  report_json jsonb,
  is_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists kindra_reports_owner_email_lower_idx
  on public.kindra_reports (lower(trim(owner_email)));

create index if not exists kindra_reports_user_id_idx
  on public.kindra_reports (user_id);

-- 예전 마이그레이션으로 테이블만 있고 `email` 컬럼이 없을 때
alter table public.kindra_reports
  add column if not exists email text generated always as (lower(trim(owner_email))) stored;

alter table public.kindra_reports
  add column if not exists is_sent boolean not null default false;

alter table public.kindra_reports
  add column if not exists review_text text;

alter table public.kindra_reports
  add column if not exists price_tier text;

comment on column public.kindra_reports.price_tier is '신청 시점 요금 구간: free | discount | normal';

alter table public.kindra_reports
  add column if not exists bank_depositor_name text,
  add column if not exists deposit_confirmed boolean not null default false;

comment on column public.kindra_reports.bank_depositor_name is '무통장 입금 시 입금자명(고객이 성공 페이지에서 제출).';
comment on column public.kindra_reports.deposit_confirmed is '관리자 입금 확인. 유료 구간에서 true 이고 is_sent 가 false 이면 리포트 발송 대기.';

comment on table public.kindra_reports is '고객 리포트. RLS: 매직링크 로그인 JWT 의 이메일 = email 컬럼.';

alter table public.kindra_reports enable row level security;

drop policy if exists "kindra_reports_select_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_insert_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_update_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_delete_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_select_jwt_email_eq_row_email" on public.kindra_reports;
drop policy if exists "kindra_reports_insert_jwt_email_eq_row_email" on public.kindra_reports;
drop policy if exists "kindra_reports_update_jwt_email_eq_row_email" on public.kindra_reports;
drop policy if exists "kindra_reports_delete_jwt_email_eq_row_email" on public.kindra_reports;

-- Supabase 에는 보통 auth.email() 이 없음 → JWT 의 email 클레임 사용
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

-- ═══ 아래는 선택: 테스트 행 (SQL Editor 는 postgres 권한이라 RLS 를 우회해 INSERT 됨) ═══
-- 1) id(uuid) 는 브라우저 주소 /reports/이-uuid 와 **반드시 동일**해야 합니다.
-- 2) owner_email 은 매직링크로 로그인할 **본인 이메일**과 같아야 앱에서 조회됩니다.
-- 3) report_json 은 KindraReportPageData 형식 JSON (최소는 {} 로도 INSERT 가능, 앱은 형식 검증)

-- 예시 (주석 해제 후 본인 값으로 수정):
-- insert into public.kindra_reports (id, owner_email, title, report_json)
-- values (
--   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
--   'you@example.com',
--   '테스트 리포트',
--   '{}'::jsonb
-- );
