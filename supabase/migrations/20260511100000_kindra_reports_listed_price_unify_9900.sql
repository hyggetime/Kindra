-- 정상가 9,900원으로 통일(구 기본값 59,000 등 레거시 행 보정). 할인은 쿠폰으로만.
update public.kindra_reports
set listed_price_won = 9900
where listed_price_won is distinct from 9900;

alter table public.kindra_reports
  alter column listed_price_won set default 9900;
