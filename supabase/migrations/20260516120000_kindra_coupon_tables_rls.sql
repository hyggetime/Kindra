-- Supabase Advisor: public 스키마 테이블은 PostgREST(anon) 경로에 노출될 수 있어 RLS 필요.
-- 쿠폰 캠페인·사용 기록은 Next 서버(service_role 클라이언트)에서만 읽고 씁니다.
-- 정책 없이 RLS만 켜면 anon/authenticated 는 행 접근 불가. service_role 은 RLS 우회.

alter table if exists public.kindra_coupon_campaigns enable row level security;
alter table if exists public.kindra_coupon_redemptions enable row level security;
