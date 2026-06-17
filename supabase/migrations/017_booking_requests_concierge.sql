-- Flight booking concierge columns for public.booking_requests
-- Keeps legacy columns for admin dashboards; new inserts populate both sets.

create table if not exists public.booking_requests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  status          text not null default 'pending',
  message         text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.booking_requests add column if not exists service text;
alter table public.booking_requests add column if not exists subject text;
alter table public.booking_requests add column if not exists from_location text;
alter table public.booking_requests add column if not exists to_location text;
alter table public.booking_requests add column if not exists details text;
alter table public.booking_requests add column if not exists customer_name text;
alter table public.booking_requests add column if not exists customer_email text;
alter table public.booking_requests add column if not exists customer_phone text;
alter table public.booking_requests add column if not exists passenger_count int default 1;
alter table public.booking_requests add column if not exists travel_date date;
alter table public.booking_requests add column if not exists return_date date;
alter table public.booking_requests add column if not exists cabin_class text;

-- Legacy columns (admin / existing queries)
alter table public.booking_requests add column if not exists service_type text;
alter table public.booking_requests add column if not exists service_name text;
alter table public.booking_requests add column if not exists full_name text;
alter table public.booking_requests add column if not exists email text;
alter table public.booking_requests add column if not exists phone text;
alter table public.booking_requests add column if not exists start_date date;
alter table public.booking_requests add column if not exists end_date date;
alter table public.booking_requests add column if not exists travelers int default 1;
alter table public.booking_requests add column if not exists budget text;
alter table public.booking_requests add column if not exists customer_id uuid references profiles(id) on delete set null;
alter table public.booking_requests add column if not exists provider_user_id uuid references profiles(id) on delete set null;
alter table public.booking_requests add column if not exists title text;

create index if not exists idx_booking_requests_service on public.booking_requests(service);
create index if not exists idx_booking_requests_status on public.booking_requests(status);

alter table public.booking_requests enable row level security;
