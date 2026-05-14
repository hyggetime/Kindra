-- 공개 프로모션 쿠폰: 정의(할인액·한도) + 리포트 단위 사용 기록(한도 집계·멱등)

create table if not exists public.kindra_coupon_campaigns (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  display_name text not null,
  discount_won integer not null check (discount_won >= 0),
  max_redemptions integer not null check (max_redemptions > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.kindra_coupon_campaigns is '공개 프로모션 쿠폰 캠페인(코드·할인액·최대 사용 횟수).';
comment on column public.kindra_coupon_campaigns.code is '고객 입력용 코드(대문자 저장 권장).';
comment on column public.kindra_coupon_campaigns.discount_won is '청구 기준가(listed)에서 차감하는 금액(원). 최종 청구액 = listed − discount_won (최소 결제 바닥 적용).';

create table if not exists public.kindra_coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.kindra_coupon_campaigns (id) on delete restrict,
  report_id uuid not null references public.kindra_reports (id) on delete restrict,
  source text not null default 'toss' check (source in ('toss', 'bank_deposit')),
  created_at timestamptz not null default now(),
  unique (campaign_id, report_id)
);

comment on table public.kindra_coupon_redemptions is '캠페인별 리포트 1건당 1회 사용(결제 확정 시 기록).';
create index if not exists kindra_coupon_redemptions_campaign_idx
  on public.kindra_coupon_redemptions (campaign_id);

insert into public.kindra_coupon_campaigns (code, display_name, discount_won, max_redemptions, active)
values ('HELLOKINDRA', 'Hello Kindra', 5000, 50, true)
on conflict (code) do update set
  display_name = excluded.display_name,
  discount_won = excluded.discount_won,
  max_redemptions = excluded.max_redemptions,
  active = excluded.active,
  updated_at = now();
