-- 자기주도 생애설계 이용 기록.
-- 은퇴·생애설계 Supabase 프로젝트에 이 파일만 추가 실행한다.
-- public.life_design_responses, public.life_design_feedback 은 수정하거나 삭제하지 않는다.
-- 이름, 연락처, 정확한 만 나이, 프로그램 응답, 자유서술 의견은 저장하지 않는다.

create table if not exists public.self_life_design_usage (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  age_group text not null,
  gender text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  saved_at timestamptz null,
  helpfulness smallint null,
  helpful_stage text null,
  feedback_submitted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint self_life_design_usage_run_id_key unique (run_id),
  constraint self_life_design_usage_age_group_check check (
    age_group in (
      '18-19',
      '20-24',
      '25-29',
      '30-34',
      '35-39',
      '40-44',
      '45-49',
      '50-54',
      '55-59',
      '60-64',
      '65-69',
      '70-74',
      '75-79',
      '80+',
      'not_provided'
    )
  ),
  constraint self_life_design_usage_gender_check check (
    gender in ('male', 'female', 'not_provided')
  ),
  constraint self_life_design_usage_helpfulness_check check (
    helpfulness is null or helpfulness between 1 and 5
  ),
  constraint self_life_design_usage_helpful_stage_check check (
    helpful_stage is null or helpful_stage in (
      '삶의 영역 돌아보기',
      '우선적으로 다룰 영역 선택',
      '핵심가치 탐색',
      '목표 구체화',
      '첫 행동 계획'
    )
  )
);

create or replace function public.self_life_design_usage_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists self_life_design_usage_set_updated_at on public.self_life_design_usage;
create trigger self_life_design_usage_set_updated_at
  before update on public.self_life_design_usage
  for each row
  execute function public.self_life_design_usage_set_updated_at();

alter table public.self_life_design_usage enable row level security;

revoke all on table public.self_life_design_usage from public, anon, authenticated;
grant insert on table public.self_life_design_usage to anon;

drop policy if exists self_life_design_usage_insert_anon on public.self_life_design_usage;
create policy self_life_design_usage_insert_anon
  on public.self_life_design_usage
  for insert
  to anon
  with check (
    completed_at is null
    and saved_at is null
    and helpfulness is null
    and helpful_stage is null
    and feedback_submitted_at is null
  );

create or replace function public.complete_self_life_design_usage(p_run_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if p_run_id is null then
    raise exception 'invalid run_id';
  end if;

  update public.self_life_design_usage
  set completed_at = now()
  where run_id = p_run_id
    and completed_at is null;

  get diagnostics updated_count = row_count;
  if updated_count = 1 then
    return 'updated';
  end if;

  if exists (
    select 1
    from public.self_life_design_usage
    where run_id = p_run_id
  ) then
    return 'already';
  end if;

  return 'missing';
end;
$$;

create or replace function public.save_self_life_design_usage(p_run_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if p_run_id is null then
    raise exception 'invalid run_id';
  end if;

  update public.self_life_design_usage
  set saved_at = now()
  where run_id = p_run_id
    and saved_at is null;

  get diagnostics updated_count = row_count;
  if updated_count = 1 then
    return 'updated';
  end if;

  if exists (
    select 1
    from public.self_life_design_usage
    where run_id = p_run_id
  ) then
    return 'already';
  end if;

  return 'missing';
end;
$$;

create or replace function public.submit_self_life_design_feedback(
  p_run_id uuid,
  p_helpfulness smallint,
  p_helpful_stage text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
  stage text;
begin
  if p_run_id is null then
    raise exception 'invalid run_id';
  end if;

  stage := nullif(btrim(p_helpful_stage), '');

  if p_helpfulness is not null and (p_helpfulness < 1 or p_helpfulness > 5) then
    raise exception 'invalid helpfulness';
  end if;

  if stage is not null and stage not in (
    '삶의 영역 돌아보기',
    '우선적으로 다룰 영역 선택',
    '핵심가치 탐색',
    '목표 구체화',
    '첫 행동 계획'
  ) then
    raise exception 'invalid helpful_stage';
  end if;

  if p_helpfulness is null and stage is null then
    raise exception 'invalid feedback';
  end if;

  update public.self_life_design_usage
  set
    helpfulness = p_helpfulness,
    helpful_stage = stage,
    feedback_submitted_at = now()
  where run_id = p_run_id
    and feedback_submitted_at is null;

  get diagnostics updated_count = row_count;
  if updated_count = 1 then
    return 'updated';
  end if;

  if exists (
    select 1
    from public.self_life_design_usage
    where run_id = p_run_id
  ) then
    return 'already';
  end if;

  return 'missing';
end;
$$;

revoke all on function public.self_life_design_usage_set_updated_at() from public, anon, authenticated;
revoke all on function public.complete_self_life_design_usage(uuid) from public, anon, authenticated;
revoke all on function public.save_self_life_design_usage(uuid) from public, anon, authenticated;
revoke all on function public.submit_self_life_design_feedback(uuid, smallint, text) from public, anon, authenticated;

grant execute on function public.complete_self_life_design_usage(uuid) to anon;
grant execute on function public.save_self_life_design_usage(uuid) to anon;
grant execute on function public.submit_self_life_design_feedback(uuid, smallint, text) to anon;
