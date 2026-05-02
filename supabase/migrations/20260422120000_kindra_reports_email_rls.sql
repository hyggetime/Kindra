-- Kindra: 리포트는 "현재 세션 JWT 의 이메일"과 `owner_email` 이 같을 때만 접근
-- (이메일 OTP / 매직링크 등 passwordless 로그인 후 동일)
--
-- 적용: Supabase SQL Editor 또는 `supabase db push`
-- 백오피스에서 임의 이메일로 행을 넣을 때는 service_role 클라이언트(RLS 우회) 또는
-- 별도의 제한된 admin 정책을 추가하세요.

-- ─── 예시 테이블 (이미 있으면 이 블록만 제거) ───────────────────────────────
create table if not exists public.kindra_reports (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  user_id uuid references auth.users (id) on delete set null,
  title text,
  report_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists kindra_reports_owner_email_lower_idx
  on public.kindra_reports (lower(trim(owner_email)));

create index if not exists kindra_reports_user_id_idx
  on public.kindra_reports (user_id);

comment on table public.kindra_reports is '고객 리포트. RLS: JWT email = owner_email 일 때만 본인 행.';

-- ─── RLS (이메일 일치만 — 위조 방지) ───────────────────────────────────────
alter table public.kindra_reports enable row level security;

drop policy if exists "kindra_reports_select_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_insert_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_update_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_delete_own_email" on public.kindra_reports;

/** JWT 에 email 클레임이 있고, 행의 owner_email 과 대소문자 무시 비교 */
create policy "kindra_reports_select_own_email"
  on public.kindra_reports
  for select
  to authenticated
  using (
    coalesce(nullif(trim(auth.jwt()->>'email'), ''), '') <> ''
    and lower(trim(owner_email)) = lower(trim(auth.jwt()->>'email'))
  );

create policy "kindra_reports_insert_own_email"
  on public.kindra_reports
  for insert
  to authenticated
  with check (
    coalesce(nullif(trim(auth.jwt()->>'email'), ''), '') <> ''
    and lower(trim(owner_email)) = lower(trim(auth.jwt()->>'email'))
  );

create policy "kindra_reports_update_own_email"
  on public.kindra_reports
  for update
  to authenticated
  using (
    coalesce(nullif(trim(auth.jwt()->>'email'), ''), '') <> ''
    and lower(trim(owner_email)) = lower(trim(auth.jwt()->>'email'))
  )
  with check (
    coalesce(nullif(trim(auth.jwt()->>'email'), ''), '') <> ''
    and lower(trim(owner_email)) = lower(trim(auth.jwt()->>'email'))
  );

create policy "kindra_reports_delete_own_email"
  on public.kindra_reports
  for delete
  to authenticated
  using (
    coalesce(nullif(trim(auth.jwt()->>'email'), ''), '') <> ''
    and lower(trim(owner_email)) = lower(trim(auth.jwt()->>'email'))
  );
