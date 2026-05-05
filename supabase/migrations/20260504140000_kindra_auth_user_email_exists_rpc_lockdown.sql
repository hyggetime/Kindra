-- Advisor: SECURITY DEFINER RPC 가 authenticated 에게 열려 있으면 안 됨.
-- 앱은 service_role 로만 호출함(app/actions/auth-otp.ts).
revoke all on function public.kindra_auth_user_email_exists(text) from public;
revoke all on function public.kindra_auth_user_email_exists(text) from anon;
revoke all on function public.kindra_auth_user_email_exists(text) from authenticated;
grant execute on function public.kindra_auth_user_email_exists(text) to service_role;
