-- Growth & conversion tracking (events, attribution, abandoned inquiries, onboarding)

create table if not exists public.growth_events (
  id            uuid primary key default uuid_generate_v4(),
  event_type    text not null,
  user_id       uuid references public.profiles(id) on delete set null,
  email         text,
  session_id    text,
  source_path   text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  related_id    uuid,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_growth_events_type_created
  on public.growth_events(event_type, created_at desc);
create index if not exists idx_growth_events_session
  on public.growth_events(session_id);
create index if not exists idx_growth_events_user
  on public.growth_events(user_id);

create table if not exists public.growth_attribution (
  id            uuid primary key default uuid_generate_v4(),
  session_id    text not null unique,
  user_id       uuid references public.profiles(id) on delete set null,
  landing_path  text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  first_touch   jsonb default '{}'::jsonb,
  last_touch    jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_growth_attribution_user
  on public.growth_attribution(user_id);

create table if not exists public.abandoned_inquiries (
  id                  uuid primary key default uuid_generate_v4(),
  inquiry_type        text not null,
  email               text,
  user_id             uuid references public.profiles(id) on delete set null,
  session_id          text,
  draft_data          jsonb not null default '{}'::jsonb,
  source_path         text,
  utm_source          text,
  status              text not null default 'draft',
  recovery_sent_at    timestamptz,
  submitted_record_id uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_abandoned_inquiries_status
  on public.abandoned_inquiries(status, created_at desc);
create index if not exists idx_abandoned_inquiries_email
  on public.abandoned_inquiries(email);

create table if not exists public.user_onboarding_checklist (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  steps         jsonb not null default '{}'::jsonb,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now()
);

alter table public.growth_events enable row level security;
alter table public.growth_attribution enable row level security;
alter table public.abandoned_inquiries enable row level security;
alter table public.user_onboarding_checklist enable row level security;

create policy "Users read own onboarding checklist"
  on public.user_onboarding_checklist for select
  using (auth.uid() = user_id);
