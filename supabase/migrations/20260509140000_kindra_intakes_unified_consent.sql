-- 신청 폼 통합 동의(분석·콘텐츠·마케팅) 플래그
alter table public.kindra_intakes
  add column if not exists personal_info_agreed boolean not null default false;

alter table public.kindra_intakes
  add column if not exists content_utilization_agreed boolean not null default false;

comment on column public.kindra_intakes.personal_info_agreed is
  '통합 동의 시 true — 개인정보 처리에 대한 동의';

comment on column public.kindra_intakes.content_utilization_agreed is
  '통합 동의 시 true — 그림·콘텐츠를 리포트·굿즈·이벤트 등에 활용하는 데 동의';

comment on column public.kindra_intakes.marketing_agreed is
  '통합 동의 시 true — 굿즈·이벤트 알림 등 마케팅 활용 동의(선택 항목을 통합 동의에 포함한 경우)';
