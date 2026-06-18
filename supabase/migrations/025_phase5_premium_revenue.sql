-- V3 Phase 5: Premium concierge plans, subscriptions, featured listings

-- ── Subscriptions (Stripe recurring) ──────────────────────────────────────────
create table if not exists subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  plan_key                text not null,
  status                  text not null default 'active',
  stripe_subscription_id  text unique,
  stripe_customer_id      text,
  current_period_end      timestamptz,
  payment_id              uuid references payments(id) on delete set null,
  metadata                jsonb default '{}',
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists idx_subscriptions_user on subscriptions(user_id, status);
create index if not exists idx_subscriptions_stripe on subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_plan on subscriptions(plan_key, status);

-- ── Premium concierge / planning requests ───────────────────────────────────
create table if not exists premium_requests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  payment_id      uuid references payments(id) on delete set null,
  subscription_id uuid references subscriptions(id) on delete set null,
  plan_key        text not null,
  request_type    text not null default 'concierge',
  status          text not null default 'pending',
  details         jsonb default '{}',
  admin_notes     text,
  reviewed_at     timestamptz,
  reviewed_by     uuid references profiles(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_premium_requests_status on premium_requests(status, created_at desc);
create index if not exists idx_premium_requests_user on premium_requests(user_id, created_at desc);

-- ── Featured listing purchases ──────────────────────────────────────────────
create table if not exists featured_listings (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  listing_type        text not null,
  listing_id          text not null,
  payment_id          uuid references payments(id) on delete set null,
  subscription_id     uuid references subscriptions(id) on delete set null,
  status              text not null default 'active',
  expires_at          timestamptz,
  stripe_session_id   text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_featured_listings_active
  on featured_listings(listing_type, status, expires_at desc);
create index if not exists idx_featured_listings_user on featured_listings(user_id);

-- ── Payment Stripe customer reference ───────────────────────────────────────
alter table payments add column if not exists stripe_customer_id text;

create index if not exists idx_payments_stripe_customer on payments(stripe_customer_id);

alter table subscriptions enable row level security;
alter table premium_requests enable row level security;
alter table featured_listings enable row level security;

create policy "Users view own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Users view own premium requests"
  on premium_requests for select using (auth.uid() = user_id);

create policy "Users view own featured listings"
  on featured_listings for select using (auth.uid() = user_id);
