alter table public.kindra_reports
  add column if not exists review_text text;

comment on column public.kindra_reports.review_text is '리포트 열람 후 고객이 남긴 짧은 후기(선택)';
