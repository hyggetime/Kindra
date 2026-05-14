-- 런칭 할인가 9,900원 고정; HELLOKINDRA 쿠폰은 최종 청구 4,900원(listed 9,900 − 차감 5,000)
alter table public.kindra_reports
  alter column listed_price_won set default 9900;

update public.kindra_coupon_campaigns
set discount_won = 5000,
    updated_at = now()
where code = 'HELLOKINDRA';
