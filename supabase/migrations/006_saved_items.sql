-- Saved items (favorites) for logged-in users
create table if not exists saved_items (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  item_type     text not null,
  item_id       text not null,
  title         text,
  meta          jsonb default '{}',
  created_at    timestamptz default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists idx_saved_items_user on saved_items(user_id);

alter table saved_items enable row level security;

create policy "Users manage own saved items"
  on saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
