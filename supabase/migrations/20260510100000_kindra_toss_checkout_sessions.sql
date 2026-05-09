-- 토스 결제 준비 세션(카카오페이 등 간편결제 후 리디렉트 시 쿠키가 없을 때 대비)
create table if not exists public.kindra_toss_checkout_sessions (
  order_id text primary key,
  report_id uuid references public.kindra_reports (id) on delete set null,
  amount integer not null check (amount >= 0),
  listed_price_won integer not null,
  coupon_code text,
  expires_at timestamptz not null
);

create index if not exists kindra_toss_checkout_sessions_expires_at_idx
  on public.kindra_toss_checkout_sessions (expires_at);

comment on table public.kindra_toss_checkout_sessions is
  'POST /api/payments/toss/prepare 시 생성. 성공 콜백 또는 만료 후 삭제. 서비스 롤만 접근.';

alter table public.kindra_toss_checkout_sessions enable row level security;
