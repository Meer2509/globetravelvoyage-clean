-- Globe Travel Voyage — MVP marketplace tables (run after 004)

-- ── provider_services ─────────────────────────────────────────────────────────
create table if not exists provider_services (
  id                uuid primary key default uuid_generate_v4(),
  provider_user_id  uuid not null references profiles(id) on delete cascade,
  provider_role     text not null,
  title             text not null,
  description       text,
  category          text,
  price             numeric(12,2) not null default 0,
  currency          text not null default 'USD',
  duration_minutes  int,
  is_active         boolean not null default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_provider_services_user on provider_services(provider_user_id);
create index if not exists idx_provider_services_role on provider_services(provider_role);

-- ── messages ──────────────────────────────────────────────────────────────────
create table if not exists messages (
  id                  uuid primary key default uuid_generate_v4(),
  sender_id           uuid references profiles(id) on delete set null,
  receiver_id         uuid references profiles(id) on delete set null,
  lead_request_id     uuid references lead_requests(id) on delete set null,
  booking_request_id  uuid references booking_requests(id) on delete set null,
  body                text not null,
  is_read             boolean not null default false,
  created_at          timestamptz default now()
);

create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_messages_receiver on messages(receiver_id);

-- ── documents ─────────────────────────────────────────────────────────────────
create table if not exists documents (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade,
  request_id  uuid,
  file_name   text not null,
  file_url    text,
  file_type   text,
  status      text not null default 'pending',
  created_at  timestamptz default now()
);

create index if not exists idx_documents_user on documents(user_id);

-- ── provider_payout_accounts ──────────────────────────────────────────────────
create table if not exists provider_payout_accounts (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  stripe_account_id   text,
  charges_enabled     boolean not null default false,
  payouts_enabled     boolean not null default false,
  onboarding_status   text not null default 'not_started',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Intake extensions ─────────────────────────────────────────────────────────
alter table lead_requests add column if not exists customer_id uuid references profiles(id) on delete set null;
alter table lead_requests add column if not exists provider_user_id uuid references profiles(id) on delete set null;
alter table lead_requests add column if not exists service_type text;
alter table lead_requests add column if not exists title text;
alter table lead_requests add column if not exists customer_phone text;
alter table lead_requests add column if not exists updated_at timestamptz default now();

update lead_requests set customer_id = user_id where customer_id is null and user_id is not null;

alter table booking_requests add column if not exists customer_id uuid references profiles(id) on delete set null;
alter table booking_requests add column if not exists provider_user_id uuid references profiles(id) on delete set null;
alter table booking_requests add column if not exists title text;
alter table booking_requests add column if not exists customer_phone text;
alter table booking_requests add column if not exists updated_at timestamptz default now();

update booking_requests set customer_id = user_id where customer_id is null and user_id is not null;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table provider_services enable row level security;
alter table messages enable row level security;
alter table documents enable row level security;
alter table provider_payout_accounts enable row level security;

create policy "Providers manage own services"
  on provider_services for all
  using (auth.uid() = provider_user_id)
  with check (auth.uid() = provider_user_id);

create policy "Users view own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Users view own documents"
  on documents for select using (auth.uid() = user_id);

create policy "Users upload own documents"
  on documents for insert with check (auth.uid() = user_id);

create policy "Providers view own payout account"
  on provider_payout_accounts for select using (auth.uid() = user_id);
