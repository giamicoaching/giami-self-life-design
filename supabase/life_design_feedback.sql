-- 지아미 자기주도 생애설계 익명 피드백
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여 넣기 → Run
-- 프런트엔드는 이 SQL을 자동 실행하지 않습니다. 운영 DB에 한 번 적용해야 합니다.

create table if not exists public.life_design_feedback (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  helpfulness integer,
  helpful_stage text,
  comment text,
  age_group text,
  gender text,
  created_at timestamptz not null default now(),
  constraint life_design_feedback_run_id_unique unique (run_id),
  constraint life_design_feedback_helpfulness_range
    check (helpfulness is null or (helpfulness >= 1 and helpfulness <= 5)),
  constraint life_design_feedback_comment_length
    check (comment is null or char_length(comment) <= 300),
  constraint life_design_feedback_has_answer
    check (
      helpfulness is not null
      or (helpful_stage is not null and length(btrim(helpful_stage)) > 0)
      or (comment is not null and length(btrim(comment)) > 0)
    )
);

comment on table public.life_design_feedback is
  'Voluntary anonymous feedback from the summary screen. Program answers stay in the browser.';

alter table public.life_design_feedback enable row level security;

drop policy if exists anon_insert_life_design_feedback on public.life_design_feedback;
create policy anon_insert_life_design_feedback
  on public.life_design_feedback
  for insert
  to anon
  with check (true);

revoke all on table public.life_design_feedback from anon, authenticated;
grant insert on table public.life_design_feedback to anon;
