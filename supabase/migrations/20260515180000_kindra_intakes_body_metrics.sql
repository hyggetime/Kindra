-- 선택 입력 키·몸무게: 결제 확정 후 AI(`triggerAiAnalysis`)에서 성장도표(p50) 비교 문단에 사용
alter table public.kindra_intakes
  add column if not exists child_height_cm double precision;

alter table public.kindra_intakes
  add column if not exists child_weight_kg double precision;

comment on column public.kindra_intakes.child_height_cm is '신청 시 선택 입력 키(cm). 건강보험공단 영유아 성장도표 참고 비교용.';
comment on column public.kindra_intakes.child_weight_kg is '신청 시 선택 입력 몸무게(kg). 성장도표 참고 비교용.';
