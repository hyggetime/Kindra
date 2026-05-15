-- Hi Kindra: Hello Kindra 와 동일 할인(5,000원)·한도 50·독립 한도 집계

insert into public.kindra_coupon_campaigns (code, display_name, discount_won, max_redemptions, active)
values ('HIKINDRA', 'Hi Kindra', 5000, 50, true)
on conflict (code) do update set
  display_name = excluded.display_name,
  discount_won = excluded.discount_won,
  max_redemptions = excluded.max_redemptions,
  active = excluded.active,
  updated_at = now();
