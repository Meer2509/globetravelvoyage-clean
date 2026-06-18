-- Provider acquisition: referrals, onboarding progress, profile views

create table if not exists public.provider_referral_codes (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  referral_code     text not null unique,
  total_referrals   int not null default 0,
  total_rewards_usd numeric(10,2) not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.provider_referrals (
  id                uuid primary key default uuid_generate_v4(),
  referrer_id       uuid not null references public.profiles(id) on delete cascade,
  referred_user_id  uuid references public.profiles(id) on delete set null,
  referred_email    text,
  referral_code     text not null,
  provider_role     text not null,
  status            text not null default 'pending',
  reward_usd        numeric(10,2) not null default 0,
  converted_at      timestamptz,
  rewarded_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_provider_referrals_referrer
  on public.provider_referrals(referrer_id, created_at desc);
create index if not exists idx_provider_referrals_code
  on public.provider_referrals(referral_code);
create index if not exists idx_provider_referrals_status
  on public.provider_referrals(status);

create table if not exists public.provider_onboarding_progress (
  user_id           uuid not null references public.profiles(id) on delete cascade,
  provider_role     text not null,
  steps             jsonb not null default '{}'::jsonb,
  completion_score  int not null default 0,
  current_step      int not null default 0,
  recovery_sent_at  timestamptz,
  completed_at      timestamptz,
  updated_at        timestamptz not null default now(),
  primary key (user_id, provider_role)
);

create table if not exists public.provider_profile_views (
  id                uuid primary key default uuid_generate_v4(),
  provider_user_id  uuid not null references public.profiles(id) on delete cascade,
  provider_role     text not null,
  session_id        text,
  source_path       text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_provider_profile_views_provider
  on public.provider_profile_views(provider_user_id, created_at desc);

alter table public.provider_referral_codes enable row level security;
alter table public.provider_referrals enable row level security;
alter table public.provider_onboarding_progress enable row level security;
alter table public.provider_profile_views enable row level security;

create policy "Users read own referral code"
  on public.provider_referral_codes for select
  using (auth.uid() = user_id);

create policy "Users read own provider referrals"
  on public.provider_referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_user_id);

create policy "Users read own onboarding progress"
  on public.provider_onboarding_progress for select
  using (auth.uid() = user_id);
