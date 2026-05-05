-- Supabase Advisor: public 테이블은 PostgREST(anon)로 노출될 수 있으므로 RLS 필요.
-- 앱은 `feature_flags`를 service_role 클라이언트로만 조회·수정함(lib/intake-pricing.server, admin actions).
-- 정책을 두지 않으면 anon/authenticated 는 접근 불가. service_role 은 Supabase 에서 RLS 를 우회함.
alter table public.feature_flags enable row level security;
