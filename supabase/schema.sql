-- =============================================================================
-- Globe Travel Voyage — Supabase Database Schema
-- =============================================================================
-- Run this against your Supabase project SQL editor after adding your keys.
-- Order matters: run top-to-bottom (extensions → enums → tables → policies).
-- =============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Custom Types / Enums ─────────────────────────────────────────────────────

create type user_role as enum (
  'customer', 'visa_agent', 'travel_agency', 'tour_guide', 'property_host', 'admin'
);

create type verification_status as enum (
  'pending', 'under_review', 'verified', 'rejected'
);

create type booking_status as enum (
  'pending', 'confirmed', 'completed', 'cancelled', 'refunded'
);

create type visa_status as enum (
  'draft', 'submitted', 'documents_pending', 'under_review', 'approved', 'rejected', 'expired'
);

create type property_type as enum (
  'apartment', 'villa', 'house', 'studio', 'hotel_room', 'other'
);

create type listing_type as enum (
  'short_stay', 'long_term', 'for_sale'
);

create type support_status as enum (
  'open', 'in_progress', 'resolved', 'closed'
);

create type notification_type as enum (
  'booking', 'visa_update', 'message', 'review', 'referral', 'system', 'payment'
);

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with platform-specific data.
-- Created automatically via trigger on auth.users insert.
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  full_name       text,
  avatar_url      text,
  phone           text,
  country         text,
  city            text,
  nationality     text,
  passport_country text,
  preferred_currency text default 'USD',
  preferred_language text default 'en',
  bio             text,
  travel_interests text[],   -- e.g. ['beach', 'hiking', 'food']
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── user_roles ────────────────────────────────────────────────────────────────
-- A user can hold multiple roles (e.g. customer + property_host).
create table if not exists user_roles (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references profiles(id) on delete cascade,
  role      user_role not null,
  is_primary boolean default false,
  granted_at timestamptz default now(),
  unique(user_id, role)
);

-- =============================================================================
-- PROVIDER TABLES
-- =============================================================================

-- ── visa_experts ──────────────────────────────────────────────────────────────
create table if not exists visa_experts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  specializations   text[],    -- e.g. ['usa_b1b2', 'uk_visitor', 'schengen']
  languages         text[],
  years_experience  int,
  price_from        numeric(10,2),
  price_to          numeric(10,2),
  turnaround_days   int,
  claimed_success_rate int,    -- percentage, 0-100
  offers_consultation boolean default true,
  consultation_fee  numeric(10,2) default 0,
  license_number    text,
  verification_status verification_status default 'pending',
  verified_at       timestamptz,
  total_clients     int default 0,
  rating            numeric(3,2) default 0,
  review_count      int default 0,
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── agencies ──────────────────────────────────────────────────────────────────
create table if not exists agencies (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  agency_name         text not null,
  website             text,
  logo_url            text,
  description         text,
  founded_year        int,
  team_size           text,
  services            text[],
  top_destinations    text[],
  annual_bookings     text,
  license_number      text,
  registration_country text,
  iata_number         text,
  verification_status verification_status default 'pending',
  verified_at         timestamptz,
  total_packages      int default 0,
  rating              numeric(3,2) default 0,
  review_count        int default 0,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── tour_guides ───────────────────────────────────────────────────────────────
create table if not exists tour_guides (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  guide_city          text,
  guide_country       text,
  languages           text[],
  tour_categories     text[],
  max_group_size      text,
  advance_booking     text,
  available_days      text[],
  start_times         text[],
  verification_status verification_status default 'pending',
  verified_at         timestamptz,
  total_tours_led     int default 0,
  rating              numeric(3,2) default 0,
  review_count        int default 0,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── property_hosts ────────────────────────────────────────────────────────────
create table if not exists property_hosts (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  verification_status verification_status default 'pending',
  verified_at         timestamptz,
  total_listings      int default 0,
  rating              numeric(3,2) default 0,
  review_count        int default 0,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- =============================================================================
-- LISTINGS / INVENTORY TABLES
-- =============================================================================

-- ── tours ─────────────────────────────────────────────────────────────────────
create table if not exists tours (
  id            uuid primary key default uuid_generate_v4(),
  guide_id      uuid not null references tour_guides(id) on delete cascade,
  title         text not null,
  description   text,
  city          text,
  country       text,
  categories    text[],
  duration_text text,
  duration_hours numeric(4,1),
  price_per_person numeric(10,2) not null,
  max_group_size int,
  languages     text[],
  includes      text[],
  excludes      text[],
  meeting_point text,
  images        text[],
  is_active     boolean default true,
  total_bookings int default 0,
  rating        numeric(3,2) default 0,
  review_count  int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── tickets ───────────────────────────────────────────────────────────────────
-- Platform-curated ticket routes (flights/transport links, not actual booking).
create table if not exists tickets (
  id            uuid primary key default uuid_generate_v4(),
  agency_id     uuid references agencies(id) on delete set null,
  from_city     text not null,
  from_country  text not null,
  to_city       text not null,
  to_country    text not null,
  airlines      text[],
  price_from    numeric(10,2),
  price_to      numeric(10,2),
  cheapest_month text,
  duration_text text,
  travel_tips   text[],
  is_trending   boolean default false,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── properties ────────────────────────────────────────────────────────────────
create table if not exists properties (
  id                uuid primary key default uuid_generate_v4(),
  host_id           uuid not null references property_hosts(id) on delete cascade,
  title             text not null,
  description       text,
  property_type     property_type not null,
  listing_type      listing_type not null,
  city              text not null,
  country           text not null,
  neighborhood      text,
  beds              int,
  baths             int,
  max_guests        int,
  sqft              int,
  price_per_night   numeric(10,2),
  price_per_month   numeric(10,2),
  asking_price      numeric(12,2),
  amenities         text[],
  images            text[],
  check_in_time     text,
  check_out_time    text,
  min_stay_nights   int default 1,
  pet_friendly      boolean default false,
  smoking_allowed   boolean default false,
  instant_book      boolean default true,
  is_active         boolean default true,
  total_bookings    int default 0,
  rating            numeric(3,2) default 0,
  review_count      int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- =============================================================================
-- TRANSACTION TABLES
-- =============================================================================

-- ── visa_applications ─────────────────────────────────────────────────────────
create table if not exists visa_applications (
  id                uuid primary key default uuid_generate_v4(),
  applicant_id      uuid not null references profiles(id) on delete cascade,
  agent_id          uuid references visa_experts(id) on delete set null,
  visa_type         text not null,    -- e.g. 'USA B1/B2', 'UK Visitor'
  destination_country text not null,
  origin_country    text not null,
  status            visa_status default 'draft',
  submitted_at      timestamptz,
  appointment_date  date,
  decision_date     date,
  expiry_date       date,
  notes             text,
  documents         jsonb default '[]',  -- array of {name, url, status}
  ai_checklist      jsonb default '[]',  -- AI-generated document checklist
  agent_fee         numeric(10,2),
  agent_fee_paid    boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── trip_plans ────────────────────────────────────────────────────────────────
create table if not exists trip_plans (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  title           text not null,
  destination     text,
  days            int,
  budget_usd      numeric(10,2),
  travelers       int default 1,
  travel_style    text,    -- 'budget' | 'mid-range' | 'luxury'
  group_type      text,    -- 'solo' | 'couple' | 'family' | 'friends'
  special_needs   text,
  ai_itinerary    jsonb,   -- full AI-generated plan stored as JSON
  is_saved        boolean default true,
  is_public       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── bookings ──────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,

  -- Polymorphic booking target
  booking_type    text not null,   -- 'tour' | 'property' | 'visa_service' | 'package'
  tour_id         uuid references tours(id) on delete set null,
  property_id     uuid references properties(id) on delete set null,
  agent_id        uuid references visa_experts(id) on delete set null,
  agency_id       uuid references agencies(id) on delete set null,

  status          booking_status default 'pending',
  start_date      date,
  end_date        date,
  guests          int default 1,
  total_amount    numeric(10,2),
  currency        text default 'USD',
  stripe_payment_id text,   -- Add Stripe later
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── referrals ─────────────────────────────────────────────────────────────────
create table if not exists referrals (
  id              uuid primary key default uuid_generate_v4(),
  referrer_id     uuid not null references profiles(id) on delete cascade,
  referred_id     uuid references profiles(id) on delete set null,
  referral_code   text unique not null,
  status          text default 'pending',   -- 'pending' | 'converted' | 'paid'
  commission_usd  numeric(10,2) default 0,
  paid_at         timestamptz,
  converted_at    timestamptz,
  created_at      timestamptz default now()
);

-- ── reviews ───────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id              uuid primary key default uuid_generate_v4(),
  reviewer_id     uuid not null references profiles(id) on delete cascade,
  booking_id      uuid references bookings(id) on delete set null,

  -- Polymorphic target
  target_type     text not null,   -- 'visa_agent' | 'agency' | 'tour_guide' | 'property' | 'tour'
  target_id       uuid not null,

  rating          int not null check (rating between 1 and 5),
  title           text,
  body            text,
  is_verified     boolean default false,   -- verified purchase
  helpful_count   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── support_messages ──────────────────────────────────────────────────────────
create table if not exists support_messages (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id) on delete set null,
  subject       text not null,
  body          text not null,
  category      text,   -- 'visa' | 'booking' | 'payment' | 'account' | 'other'
  status        support_status default 'open',
  assigned_to   uuid references profiles(id) on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── notifications ─────────────────────────────────────────────────────────────
create table if not exists notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  type          notification_type not null,
  title         text not null,
  body          text,
  data          jsonb default '{}',   -- extra metadata (booking_id, etc.)
  is_read       boolean default false,
  created_at    timestamptz default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_profiles_email        on profiles(email);
create index if not exists idx_user_roles_user        on user_roles(user_id);
create index if not exists idx_visa_apps_applicant    on visa_applications(applicant_id);
create index if not exists idx_visa_apps_agent        on visa_applications(agent_id);
create index if not exists idx_visa_apps_status       on visa_applications(status);
create index if not exists idx_bookings_user          on bookings(user_id);
create index if not exists idx_bookings_status        on bookings(status);
create index if not exists idx_referrals_code         on referrals(referral_code);
create index if not exists idx_reviews_target         on reviews(target_type, target_id);
create index if not exists idx_notifications_user     on notifications(user_id, is_read);
create index if not exists idx_properties_city        on properties(city, country);
create index if not exists idx_tours_city             on tours(city, country);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enable RLS on all tables. Policies restrict access per user.

alter table profiles           enable row level security;
alter table user_roles         enable row level security;
alter table visa_experts       enable row level security;
alter table agencies           enable row level security;
alter table tour_guides        enable row level security;
alter table property_hosts     enable row level security;
alter table tours              enable row level security;
alter table tickets            enable row level security;
alter table properties         enable row level security;
alter table visa_applications  enable row level security;
alter table trip_plans         enable row level security;
alter table bookings           enable row level security;
alter table referrals          enable row level security;
alter table reviews            enable row level security;
alter table support_messages   enable row level security;
alter table notifications      enable row level security;

-- ── profiles policies ────────────────────────────────────────────────────────
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Public profiles are visible to all"
  on profiles for select using (is_active = true);

-- ── visa_experts — public listing ────────────────────────────────────────────
create policy "Visa experts are publicly listable"
  on visa_experts for select using (is_active = true);

create policy "Visa experts can edit their own record"
  on visa_experts for all using (
    auth.uid() = (select id from profiles where id = user_id limit 1)
  );

-- ── agencies — public listing ────────────────────────────────────────────────
create policy "Agencies are publicly listable"
  on agencies for select using (is_active = true);

create policy "Agencies can edit their own record"
  on agencies for all using (
    auth.uid() = (select id from profiles where id = user_id limit 1)
  );

-- ── visa_applications — private ──────────────────────────────────────────────
create policy "Users can view their own visa applications"
  on visa_applications for select using (auth.uid() = applicant_id);

create policy "Users can create visa applications"
  on visa_applications for insert with check (auth.uid() = applicant_id);

create policy "Users can update their own visa applications"
  on visa_applications for update using (auth.uid() = applicant_id);

-- ── bookings — private ───────────────────────────────────────────────────────
create policy "Users can view their own bookings"
  on bookings for select using (auth.uid() = user_id);

create policy "Users can create bookings"
  on bookings for insert with check (auth.uid() = user_id);

-- ── trip_plans — private ─────────────────────────────────────────────────────
create policy "Users can manage their own trip plans"
  on trip_plans for all using (auth.uid() = user_id);

create policy "Public trip plans visible to all"
  on trip_plans for select using (is_public = true);

-- ── notifications — private ──────────────────────────────────────────────────
create policy "Users can see their own notifications"
  on notifications for all using (auth.uid() = user_id);

-- ── reviews — public reads, authenticated writes ─────────────────────────────
create policy "Reviews are publicly readable"
  on reviews for select using (true);

create policy "Authenticated users can write reviews"
  on reviews for insert with check (auth.uid() = reviewer_id);

-- ── tours & properties — public reads ────────────────────────────────────────
create policy "Tours are publicly readable"
  on tours for select using (is_active = true);

create policy "Properties are publicly readable"
  on properties for select using (is_active = true);

create policy "Tickets are publicly readable"
  on tickets for select using (is_active = true);

-- ── support_messages — user-owned ────────────────────────────────────────────
create policy "Users can manage their own support messages"
  on support_messages for all using (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-create profile row when a new user signs up
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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_visa_experts_updated_at
  before update on visa_experts
  for each row execute procedure public.set_updated_at();

create trigger trg_agencies_updated_at
  before update on agencies
  for each row execute procedure public.set_updated_at();

create trigger trg_properties_updated_at
  before update on properties
  for each row execute procedure public.set_updated_at();

create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute procedure public.set_updated_at();

create trigger trg_visa_apps_updated_at
  before update on visa_applications
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- STORAGE BUCKETS (run in Supabase dashboard → Storage)
-- =============================================================================
-- These SQL inserts create storage buckets programmatically.
-- Alternatively, create them via the Supabase dashboard UI.

insert into storage.buckets (id, name, public)
values
  ('avatars',      'avatars',      true),   -- user profile photos
  ('documents',    'documents',    false),  -- visa documents (private)
  ('property-images', 'property-images', true), -- property listing photos
  ('tour-images',  'tour-images',  true),   -- tour/guide photos
  ('agency-logos', 'agency-logos', true)    -- agency brand assets
on conflict (id) do nothing;

-- =============================================================================
-- INTAKE TABLES (also in migrations/002_intake_tables.sql)
-- Run migrations/002_intake_tables.sql after this file for form intake tables.
-- =============================================================================
