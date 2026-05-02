-- kindra_intakes: RLS 만 켜져 있고 정책이 없으면 anon JWT 로는 INSERT 가
-- "new row violates row-level security policy" 로 거절됩니다.
-- service_role 은 보통 RLS 를 우회하지만, 명시 정책으로 동작을 고정합니다.

drop policy if exists "kindra_intakes_service_role_all" on public.kindra_intakes;

create policy "kindra_intakes_service_role_all"
  on public.kindra_intakes
  for all
  to service_role
  using (true)
  with check (true);
