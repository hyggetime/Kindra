-- 아이 이름·호칭 및 성별 (신청 폼 필수, 리포트·저장용)
alter table public.kindra_intakes
  add column if not exists child_display_name text,
  add column if not exists child_gender text;

-- 기존 행 보정 후 NOT NULL
update public.kindra_intakes
set child_display_name = '(기존 신청)'
where child_display_name is null;

update public.kindra_intakes
set child_gender = '미입력'
where child_gender is null;

alter table public.kindra_intakes
  alter column child_display_name set not null,
  alter column child_gender set not null;

comment on column public.kindra_intakes.child_display_name is '아이 이름 또는 호칭 (리포트 지칭)';
comment on column public.kindra_intakes.child_gender is '아이 성별 (남아/여아/기타 등 표시 문자열)';
