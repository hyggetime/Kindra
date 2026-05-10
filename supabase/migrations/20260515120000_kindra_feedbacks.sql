-- 리포트 결과 페이지 피드백 (리포트당 1건)

create table if not exists public.kindra_feedbacks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.kindra_reports (id) on delete cascade,
  content text not null,
  rating integer null,
  created_at timestamptz not null default now(),
  constraint kindra_feedbacks_rating_range check (rating is null or (rating >= 1 and rating <= 5)),
  constraint kindra_feedbacks_one_per_report unique (report_id)
);

create index if not exists kindra_feedbacks_report_id_idx on public.kindra_feedbacks (report_id);

comment on table public.kindra_feedbacks is '리포트 열람 후 피드백·만족도. 리포트당 최대 1건(unique report_id).';
comment on column public.kindra_feedbacks.rating is '선택 만족도 1~5. NULL 허용.';

alter table public.kindra_feedbacks enable row level security;

drop policy if exists "kindra_feedbacks_select_own_report" on public.kindra_feedbacks;
drop policy if exists "kindra_feedbacks_insert_own_report" on public.kindra_feedbacks;

create policy "kindra_feedbacks_select_own_report"
  on public.kindra_feedbacks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.kindra_reports r
      where r.id = kindra_feedbacks.report_id
        and coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
        and r.email = lower(trim(auth.jwt() ->> 'email'))
    )
  );

create policy "kindra_feedbacks_insert_own_report"
  on public.kindra_feedbacks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.kindra_reports r
      where r.id = report_id
        and coalesce(nullif(trim(auth.jwt() ->> 'email'), ''), '') <> ''
        and r.email = lower(trim(auth.jwt() ->> 'email'))
    )
  );
