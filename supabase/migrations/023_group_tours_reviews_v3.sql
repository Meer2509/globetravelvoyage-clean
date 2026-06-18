-- V3 Phase 3: Group Tours Marketplace + Review moderation

-- ── group_tours ───────────────────────────────────────────────────────────────
create table if not exists group_tours (
  id                  uuid primary key default uuid_generate_v4(),
  agent_profile_id    uuid not null references travel_agent_profiles(id) on delete cascade,
  user_id             uuid not null references profiles(id) on delete cascade,
  title               text not null,
  destination         text not null,
  description         text,
  start_date          date,
  end_date            date,
  price               numeric(10,2),
  currency            text not null default 'USD',
  seat_limit          int not null default 20 check (seat_limit > 0),
  seats_booked        int not null default 0 check (seats_booked >= 0),
  itinerary           text,
  included_items      text[] default '{}',
  excluded_items      text[] default '{}',
  cancellation_policy text,
  status              text not null default 'draft',
  featured            boolean not null default false,
  rating              numeric(3,2) default 0,
  review_count        int default 0,
  admin_notes         text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists group_tour_requests (
  id              uuid primary key default uuid_generate_v4(),
  tour_id         uuid not null references group_tours(id) on delete cascade,
  user_id         uuid references profiles(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  traveler_count  int not null default 1 check (traveler_count > 0),
  traveler_info   text,
  message         text,
  status          text not null default 'pending',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_group_tours_public
  on group_tours(status, featured desc, start_date asc nulls last);

create index if not exists idx_group_tours_agent
  on group_tours(agent_profile_id, created_at desc);

create index if not exists idx_group_tour_requests_tour
  on group_tour_requests(tour_id, created_at desc);

alter table group_tours enable row level security;
alter table group_tour_requests enable row level security;

create policy "Public read active group tours"
  on group_tours for select
  using (status in ('approved', 'active') and seat_limit > seats_booked);

create policy "Owners read own group tours"
  on group_tours for select
  using (auth.uid() = user_id);

create policy "Owners manage own group tours"
  on group_tours for all
  using (auth.uid() = user_id);

create policy "Public insert group tour requests"
  on group_tour_requests for insert
  with check (true);

create policy "Owners read tour requests"
  on group_tour_requests for select
  using (
    exists (
      select 1 from group_tours t
      where t.id = group_tour_requests.tour_id
        and t.user_id = auth.uid()
    )
  );

-- ── reviews moderation status ─────────────────────────────────────────────────
alter table reviews add column if not exists status text default 'pending';

update reviews
set status = case
  when coalesce(is_hidden, false) = true then 'rejected'
  else 'approved'
end
where status is null or status = 'pending';

create index if not exists idx_reviews_status
  on reviews(target_type, target_id, status);
