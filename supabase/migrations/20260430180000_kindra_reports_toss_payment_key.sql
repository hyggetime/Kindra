-- 토스페이먼츠 카드·간편결제 성공 시 paymentKey 보관(관리·추적용)
alter table public.kindra_reports
  add column if not exists toss_payment_key text;

comment on column public.kindra_reports.toss_payment_key is '토스페이먼츠 결제 승인 건의 paymentKey (카드·간편결제 완료 시)';
