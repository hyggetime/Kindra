-- 선택 설문: 마케팅 알림·정식 가격 의향 (베타 신청 폼)
-- 파일명: kindra_intakes 생성(20260422200000) 이후에 실행되도록 배치(빈 DB db push 호환).
alter table public.kindra_intakes
  add column if not exists marketing_opt_in text;

alter table public.kindra_intakes
  add column if not exists pricing_intent text;

comment on column public.kindra_intakes.marketing_opt_in is 'yes | no (필수)';
comment on column public.kindra_intakes.pricing_intent is 'yes | no_expensive | no_uninterested | null (미선택)';
