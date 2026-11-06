// Plain PostgreSQL, no vendor extensions, so the same schema runs on Neon, Vercel Postgres or Supabase.
export const SCHEMA = `
create table if not exists survey_responses (
  id                    uuid primary key default gen_random_uuid(),
  sid                   uuid unique,
  submitted_at          timestamptz not null default now(),
  survey_version        smallint not null default 1,
  duration_seconds      integer,
  company_name          text not null,
  industry              text,
  industry_other        text,
  employees             text,
  revenue               text,
  role                  text,
  decision_others       text[] not null default '{}',
  triggers              text[] not null default '{}',
  trigger_other         text,
  main_trigger          text,
  alternatives          text[] not null default '{}',
  alternatives_provider text,
  why_ranked            text[] not null default '{}',
  outcome               text,
  team_today            text,
  team_12mo             text,
  readiness             text[] not null default '{}',
  nps                   smallint check (nps between 0 and 10),
  referral_followup     text,
  ip_hash               text,
  user_agent            text
);
create index if not exists survey_responses_submitted_idx on survey_responses (submitted_at desc);
create index if not exists survey_responses_ip_idx on survey_responses (ip_hash, submitted_at);

create table if not exists survey_progress (
  sid        uuid primary key,
  max_step   integer not null default 0,
  completed  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists survey_login_attempts (
  id      bigserial primary key,
  ip_hash text not null,
  at      timestamptz not null default now()
);
create index if not exists survey_login_attempts_idx on survey_login_attempts (ip_hash, at);
`;
