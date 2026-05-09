-- 아이 생일(정확한 일자) — 맞춤 분석·선택 마케팅 근거
alter table public.kindra_intakes
  add column if not exists child_birthday date;

comment on column public.kindra_intakes.child_birthday is
  '아이 생년월일(YYYY-MM-DD). 성장 분석·통계에 사용하며, 선택 마케팅 동의 시 생일 이벤트 등에 활용.';

-- 선택 동의: 생일 쿠폰·맞춤 성장 알림 등 (체크 시에만 true)
alter table public.kindra_intakes
  add column if not exists marketing_agreed boolean not null default false;

comment on column public.kindra_intakes.marketing_agreed is
  '마케팅 정보 수신·활용 선택 동의. true일 때만 생일 쿠폰·맞춤 리포트 알림 등 발송 대상.';
