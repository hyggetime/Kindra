-- 토스 테스트 키(test_)로 승인된 건인지 구분 (운영 DB에서도 테스트 키로 시험 결제 시 true 로 남김)
alter table public.kindra_reports
  add column if not exists toss_payment_is_test boolean;

comment on column public.kindra_reports.toss_payment_is_test is
  '토스 테스트 API 키로 승인된 결제이면 true. 라이브 키로 승인되면 false. 미기록이면 null.';
