-- Travel Agent Marketplace

create table if not exists travel_agent_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  agency_name         text,
  full_name           text not null,
  bio                 text,
  specialties         text[] default '{}',
  countries_served    text[] default '{}',
  languages           text[] default '{}',
  years_experience    int,
  profile_photo       text,
  verification_status text not null default 'pending',
  rating              numeric(3,2) default 0,
  review_count        int default 0,
  featured            boolean not null default false,
  is_active           boolean not null default true,
  admin_notes         text,
  verified_at         timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists travel_agent_services (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references travel_agent_profiles(id) on delete cascade,
  title         text not null,
  description   text,
  price         numeric(10,2),
  price_unit    text default 'quote',
  is_active     boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists travel_agent_inquiries (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references travel_agent_profiles(id) on delete cascade,
  user_id       uuid references profiles(id) on delete set null,
  service_id    uuid references travel_agent_services(id) on delete set null,
  full_name     text not null,
  email         text not null,
  phone         text,
  message       text not null,
  status        text not null default 'new',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_travel_agent_profiles_verified
  on travel_agent_profiles(verification_status, featured desc, created_at desc);

create index if not exists idx_travel_agent_services_profile
  on travel_agent_services(profile_id, is_active);

create index if not exists idx_travel_agent_inquiries_profile
  on travel_agent_inquiries(profile_id, created_at desc);

alter table travel_agent_profiles enable row level security;
alter table travel_agent_services enable row level security;
alter table travel_agent_inquiries enable row level security;

create policy "Public read verified travel agents"
  on travel_agent_profiles for select
  using (verification_status = 'verified' and is_active = true);

create policy "Owners read own travel agent profile"
  on travel_agent_profiles for select
  using (auth.uid() = user_id);

create policy "Public read active travel agent services"
  on travel_agent_services for select
  using (
    exists (
      select 1 from travel_agent_profiles p
      where p.id = travel_agent_services.profile_id
        and p.verification_status = 'verified'
        and p.is_active = true
    )
    and is_active = true
  );

create policy "Owners read own travel agent services"
  on travel_agent_services for select
  using (
    exists (
      select 1 from travel_agent_profiles p
      where p.id = travel_agent_services.profile_id and p.user_id = auth.uid()
    )
  );
