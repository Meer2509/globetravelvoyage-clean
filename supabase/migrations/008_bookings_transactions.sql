-- Bookings and transactions for Stripe payment fulfillment

create table if not exists bookings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references profiles(id) on delete set null,
  customer_email    text,
  provider_user_id  uuid references profiles(id) on delete set null,
  booking_type      text not null,
  listing_id        text,
  listing_title     text,
  agent_id          uuid,
  payment_id        uuid,
  status            text not null default 'pending',
  total_amount      numeric(12,2),
  currency          text default 'USD',
  stripe_session_id text,
  stripe_payment_id text,
  notes             text,
  guests            int default 1,
  start_date        date,
  end_date          date,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists transactions (
  id                      uuid primary key default uuid_generate_v4(),
  payment_id              uuid,
  booking_id              uuid references bookings(id) on delete set null,
  user_id                 uuid references profiles(id) on delete set null,
  provider_user_id        uuid references profiles(id) on delete set null,
  transaction_type        text not null default 'payment',
  amount                  numeric(12,2) not null,
  platform_fee            numeric(12,2),
  provider_amount         numeric(12,2),
  currency                text default 'USD',
  status                  text not null default 'completed',
  stripe_payment_intent_id text,
  stripe_session_id       text,
  description             text,
  created_at              timestamptz default now()
);

alter table payments add column if not exists booking_id uuid;

create index if not exists idx_bookings_user on bookings(user_id);
create index if not exists idx_bookings_provider on bookings(provider_user_id);
create index if not exists idx_bookings_payment on bookings(payment_id);
create index if not exists idx_bookings_session on bookings(stripe_session_id);
create index if not exists idx_transactions_payment on transactions(payment_id);
create index if not exists idx_transactions_booking on transactions(booking_id);
create index if not exists idx_transactions_provider on transactions(provider_user_id);

alter table bookings enable row level security;
alter table transactions enable row level security;

create policy "Users view own bookings"
  on bookings for select using (auth.uid() = user_id or auth.uid() = provider_user_id);

create policy "Users view own transactions"
  on transactions for select using (auth.uid() = user_id or auth.uid() = provider_user_id);
