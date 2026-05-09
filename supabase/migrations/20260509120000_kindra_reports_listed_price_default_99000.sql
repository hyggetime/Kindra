-- 앱 정상가(LIST_PRICE_WON)와 DB 기본값 정렬
alter table public.kindra_reports
  alter column listed_price_won set default 99000;
