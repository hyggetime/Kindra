-- JWT 의 이메일 클레임과 행의 이메일을 매칭 (매직링크 로그인 후).
-- 사용자 요청의 `auth.email() = email` 에 대응:
--   Supabase/Postgres 기본에 `auth.email()` 이 없으므로
--   **동일 의미**는 `(auth.jwt() ->> 'email')` 입니다.
--   아래 정책은 `email` 생성 컬럼과 JWT 이메일을 비교합니다.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'kindra_reports'
  ) then
    execute $e$
      alter table public.kindra_reports
      add column if not exists email text
      generated always as (lower(trim(owner_email))) stored
    $e$;
  end if;
end $$;

alter table public.kindra_reports enable row level security;

drop policy if exists "kindra_reports_select_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_insert_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_update_own_email" on public.kindra_reports;
drop policy if exists "kindra_reports_delete_own_email" on public.kindra_reports;

-- (auth.jwt() ->> 'email') ≒ auth.email() 역할
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
