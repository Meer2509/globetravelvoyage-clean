-- Globe Travel Voyage — Phase 1 core: AI concierge, messaging, property inquiries, admin audit

-- ── AI Travel Concierge ───────────────────────────────────────────────────────
create table if not exists ai_conversations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text not null default 'Travel concierge',
  feature       text not null default 'concierge',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists ai_messages (
  id                uuid primary key default uuid_generate_v4(),
  conversation_id   uuid not null references ai_conversations(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant', 'system')),
  content           text not null,
  metadata          jsonb default '{}',
  created_at        timestamptz default now()
);

create index if not exists idx_ai_conversations_user on ai_conversations(user_id, updated_at desc);
create index if not exists idx_ai_messages_conversation on ai_messages(conversation_id, created_at);

-- ── Messaging (threaded) ──────────────────────────────────────────────────────
create table if not exists conversations (
  id            uuid primary key default uuid_generate_v4(),
  kind          text not null default 'direct',
  context_type  text,
  context_id    uuid,
  subject       text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists conversation_participants (
  id                uuid primary key default uuid_generate_v4(),
  conversation_id   uuid not null references conversations(id) on delete cascade,
  user_id           uuid not null references profiles(id) on delete cascade,
  last_read_at      timestamptz,
  joined_at         timestamptz default now(),
  unique(conversation_id, user_id)
);

alter table messages add column if not exists conversation_id uuid references conversations(id) on delete set null;

create index if not exists idx_conversations_updated on conversations(updated_at desc);
create index if not exists idx_conversation_participants_user on conversation_participants(user_id);
create index if not exists idx_messages_conversation on messages(conversation_id, created_at);

-- ── Property inquiries ────────────────────────────────────────────────────────
create table if not exists property_inquiries (
  id                  uuid primary key default uuid_generate_v4(),
  property_listing_id uuid not null references property_listings(id) on delete cascade,
  user_id             uuid references profiles(id) on delete set null,
  full_name           text not null,
  email               text not null,
  phone               text,
  message             text not null,
  status              text not null default 'new',
  admin_notes         text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_property_inquiries_listing on property_inquiries(property_listing_id, created_at desc);
create index if not exists idx_property_inquiries_status on property_inquiries(status);

-- ── Reviews moderation ────────────────────────────────────────────────────────
alter table reviews add column if not exists is_hidden boolean default false;
alter table reviews add column if not exists admin_notes text;

-- ── Admin audit log ───────────────────────────────────────────────────────────
create table if not exists admin_audit_log (
  id            uuid primary key default uuid_generate_v4(),
  actor_id      uuid references profiles(id) on delete set null,
  action        text not null,
  entity_type   text not null,
  entity_id     uuid,
  metadata      jsonb default '{}',
  created_at    timestamptz default now()
);

create index if not exists idx_admin_audit_entity on admin_audit_log(entity_type, entity_id, created_at desc);
create index if not exists idx_admin_audit_actor on admin_audit_log(actor_id, created_at desc);

-- ── Public read for published property listings ───────────────────────────────
drop policy if exists "Public read published property listings" on property_listings;
create policy "Public read published property listings"
  on property_listings for select
  using (status in ('active', 'approved', 'published'));

-- ── RLS: AI tables ────────────────────────────────────────────────────────────
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

create policy "Users manage own ai conversations"
  on ai_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read own ai messages"
  on ai_messages for select
  using (
    exists (
      select 1 from ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users insert own ai messages"
  on ai_messages for insert
  with check (
    exists (
      select 1 from ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- ── RLS: Conversations ────────────────────────────────────────────────────────
alter table conversations enable row level security;
alter table conversation_participants enable row level security;

create policy "Participants view conversations"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
    )
  );

create policy "Participants view membership"
  on conversation_participants for select
  using (auth.uid() = user_id);

create policy "Users view messages in their conversations"
  on messages for select
  using (
    conversation_id is null and (auth.uid() = sender_id or auth.uid() = receiver_id)
    or exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "Users send messages in conversations"
  on messages for insert
  with check (auth.uid() = sender_id);

-- ── RLS: Property inquiries ───────────────────────────────────────────────────
alter table property_inquiries enable row level security;

create policy "Users view own property inquiries"
  on property_inquiries for select
  using (auth.uid() = user_id);

create policy "Anyone can submit property inquiry"
  on property_inquiries for insert
  with check (true);

-- ── trip_plans: ensure exists (from schema.sql) ───────────────────────────────
alter table trip_plans add column if not exists source text default 'manual';
alter table trip_plans add column if not exists ai_conversation_id uuid references ai_conversations(id) on delete set null;

alter table property_listings add column if not exists rating numeric(3,2) default 0;
alter table property_listings add column if not exists review_count int default 0;
alter table property_listings add column if not exists updated_at timestamptz default now();
