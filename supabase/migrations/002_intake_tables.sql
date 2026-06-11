-- =============================================================================
-- Globe Travel Voyage — Intake tables + payments (run after schema.sql)
-- =============================================================================

-- ── visa_requests (public intake form) ──────────────────────────────────────
create table if not exists visa_requests (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references profiles(id) on delete set null,
  full_name         text not null,
  email             text not null,
  phone             text,
  whatsapp          text,
  nationality       text,
  current_country   text,
  destination       text not null,
  purpose           text,
  travel_date       date,
  previous_refusals text default 'no',
  message           text,
  status            text not null default 'pending',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── booking_requests ──────────────────────────────────────────────────────────
create table if not exists booking_requests (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id) on delete set null,
  service_type  text not null,
  service_name  text,
  full_name     text not null,
  email         text not null,
  phone         text,
  start_date    date,
  end_date      date,
  travelers     int default 1,
  budget        text,
  message       text,
  status        text not null default 'pending',
  created_at    timestamptz default now()
);

-- ── lead_requests ─────────────────────────────────────────────────────────────
create table if not exists lead_requests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  expert_type     text,
  full_name       text not null,
  email           text not null,
  phone           text,
  purpose         text,
  message         text,
  preferred_time  text,
  lead_type       text not null default 'contact_expert',
  subject_name    text,
  subject_meta    text,
  extra_data      jsonb default '{}',
  status          text not null default 'pending',
  created_at      timestamptz default now()
);

-- ── property_listings (pending intake before publish) ─────────────────────────
create table if not exists property_listings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  listing_type    text not null,
  property_type   text not null,
  title           text not null,
  city            text not null,
  country         text,
  address         text,
  price           numeric(12,2),
  price_period    text default 'month',
  beds            int,
  baths           int,
  area_sqft       int,
  description     text,
  contact_name    text not null,
  contact_email   text not null,
  contact_phone   text,
  status          text not null default 'pending',
  created_at      timestamptz default now()
);

-- ── tour_listings (pending intake) ────────────────────────────────────────────
create table if not exists tour_listings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  title           text not null,
  city            text,
  country         text,
  tour_type       text,
  duration        text,
  price           numeric(10,2),
  description     text,
  contact_name    text not null,
  contact_email   text not null,
  contact_phone   text,
  status          text not null default 'pending',
  created_at      timestamptz default now()
);

-- ── payments ──────────────────────────────────────────────────────────────────
create table if not exists payments (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references profiles(id) on delete set null,
  booking_id        uuid references bookings(id) on delete set null,
  amount            numeric(12,2) not null,
  currency          text default 'USD',
  status            text not null default 'unpaid',
  stripe_payment_id text,
  payee_name        text,
  description       text,
  created_at        timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_visa_requests_user    on visa_requests(user_id);
create index if not exists idx_visa_requests_status on visa_requests(status);
create index if not exists idx_booking_requests_user on booking_requests(user_id);
create index if not exists idx_lead_requests_user   on lead_requests(user_id);
create index if not exists idx_property_listings_status on property_listings(status);
create index if not exists idx_payments_user       on payments(user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table visa_requests      enable row level security;
alter table booking_requests   enable row level security;
alter table lead_requests      enable row level security;
alter table property_listings  enable row level security;
alter table tour_listings      enable row level security;
alter table payments           enable row level security;

create policy "Users view own visa requests"
  on visa_requests for select using (auth.uid() = user_id);

create policy "Users view own booking requests"
  on booking_requests for select using (auth.uid() = user_id);

create policy "Users view own lead requests"
  on lead_requests for select using (auth.uid() = user_id);

create policy "Users view own property listings"
  on property_listings for select using (auth.uid() = user_id);

create policy "Users view own payments"
  on payments for select using (auth.uid() = user_id);

create policy "Users view own support messages"
  on support_messages for select using (auth.uid() = user_id);

create policy "Authenticated insert visa requests"
  on visa_requests for insert with check (auth.uid() = user_id);

create policy "Authenticated insert booking requests"
  on booking_requests for insert with check (auth.uid() = user_id);

create policy "Authenticated insert lead requests"
  on lead_requests for insert with check (auth.uid() = user_id);

create policy "Authenticated insert support"
  on support_messages for insert with check (auth.uid() = user_id or user_id is null);

create policy "Users view own roles"
  on user_roles for select using (auth.uid() = user_id);

-- ── Updated trigger: assign role from signup metadata ───────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role;
begin
  insert into public.profiles (id, email, full_name, phone, country, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone     = excluded.phone,
    country   = excluded.country,
    updated_at = now();

  begin
    v_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::user_role,
      'customer'::user_role
    );
  exception when others then
    v_role := 'customer'::user_role;
  end;

  insert into public.user_roles (user_id, role, is_primary)
  values (new.id, v_role, true)
  on conflict (user_id, role) do update set is_primary = true;

  return new;
end;
$$;

create trigger trg_visa_requests_updated_at
  before update on visa_requests
  for each row execute procedure public.set_updated_at();
