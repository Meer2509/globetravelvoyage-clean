-- Phase 7: Trust & Reputation System

create table if not exists public.provider_verification_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  provider_category   text not null,
  provider_role       text not null,
  verification_level  text not null default 'basic',
  status              text not null default 'pending',
  identity_doc_path   text,
  business_license_path text,
  certifications      jsonb not null default '[]'::jsonb,
  social_links        jsonb not null default '{}'::jsonb,
  website             text,
  verification_notes  text,
  admin_notes         text,
  suspended_at        timestamptz,
  revoked_at          timestamptz,
  verified_at         timestamptz,
  submitted_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, provider_category)
);

create index if not exists idx_provider_verification_status
  on public.provider_verification_profiles(status, verification_level);
create index if not exists idx_provider_verification_user
  on public.provider_verification_profiles(user_id);

create table if not exists public.provider_trust_scores (
  user_id             uuid not null references public.profiles(id) on delete cascade,
  provider_role       text not null,
  trust_score         int not null default 0,
  verification_pts    int not null default 0,
  profile_pts         int not null default 0,
  review_pts          int not null default 0,
  response_pts        int not null default 0,
  completion_pts      int not null default 0,
  age_pts             int not null default 0,
  badge_tier          text not null default 'none',
  calculated_at       timestamptz not null default now(),
  primary key (user_id, provider_role)
);

create table if not exists public.provider_reputation_metrics (
  user_id             uuid not null references public.profiles(id) on delete cascade,
  provider_role       text not null,
  inquiries_total     int not null default 0,
  inquiries_answered  int not null default 0,
  bookings_completed  int not null default 0,
  cancellations       int not null default 0,
  avg_response_hours  numeric(8,2),
  review_average      numeric(3,2) default 0,
  review_count        int not null default 0,
  updated_at          timestamptz not null default now(),
  primary key (user_id, provider_role)
);

create table if not exists public.provider_fraud_flags (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  flag_type           text not null,
  severity            text not null default 'low',
  details             jsonb not null default '{}'::jsonb,
  status              text not null default 'open',
  reviewed_by         uuid references public.profiles(id) on delete set null,
  reviewed_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists idx_provider_fraud_flags_status
  on public.provider_fraud_flags(status, created_at desc);
create index if not exists idx_provider_fraud_flags_user
  on public.provider_fraud_flags(user_id);

alter table public.provider_verification_profiles enable row level security;
alter table public.provider_trust_scores enable row level security;
alter table public.provider_reputation_metrics enable row level security;
alter table public.provider_fraud_flags enable row level security;

create policy "Users read own verification profile"
  on public.provider_verification_profiles for select
  using (auth.uid() = user_id);

create policy "Users read own trust score"
  on public.provider_trust_scores for select
  using (auth.uid() = user_id);

create policy "Public read trust scores"
  on public.provider_trust_scores for select
  using (true);

create policy "Public read reputation metrics"
  on public.provider_reputation_metrics for select
  using (true);

create policy "Users read own reputation"
  on public.provider_reputation_metrics for select
  using (auth.uid() = user_id);
