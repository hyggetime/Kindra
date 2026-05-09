-- 회원 등급(price_tier) 제거 → 정상가·쿠폰·청구액 컬럼으로 전환
-- 인테이크: 그림 시점(drawn_at), 그 시점 생후 개월 수

alter table public.kindra_intakes
  add column if not exists drawn_at date,
  add column if not exists child_age_in_months integer;

comment on column public.kindra_intakes.drawn_at is '그림이 실제 그려진 날짜(부모 입력·기본값 업로드일)';
comment on column public.kindra_intakes.child_age_in_months is 'drawn_at 시점 기준 생후 개월 수(코드 계산)';

update public.kindra_intakes
set drawn_at = coalesce(drawn_at, (created_at at time zone 'Asia/Seoul')::date)
where drawn_at is null;

alter table public.kindra_reports
  add column if not exists listed_price_won integer not null default 59000,
  add column if not exists coupon_code_applied text,
  add column if not exists charged_amount_won integer,
  add column if not exists intake_id uuid;

comment on column public.kindra_reports.listed_price_won is '결제 안내 시점 정상가(원)';
comment on column public.kindra_reports.coupon_code_applied is '적용된 프로모션 쿠폰 코드(대문자 등 정규화)';
comment on column public.kindra_reports.charged_amount_won is '실제 청구·결제 확정 금액(원). 카드 승인 후 기록';
comment on column public.kindra_reports.intake_id is '신청 행(kindra_intakes) 참조 — 관리자 조회·그림 시점 연결';

alter table public.kindra_reports drop column if exists price_tier;

do $$
begin
  alter table public.kindra_reports
    add constraint kindra_reports_intake_id_fkey
    foreign key (intake_id) references public.kindra_intakes (id) on delete set null;
exception
  when duplicate_object then null;
end $$;

create index if not exists kindra_reports_intake_id_idx on public.kindra_reports (intake_id);
