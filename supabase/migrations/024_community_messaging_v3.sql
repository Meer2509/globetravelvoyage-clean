-- V3 Phase 4: Travel community + message reports

-- ── Community membership (free join) ───────────────────────────────────────────
create table if not exists community_members (
  user_id       uuid primary key references profiles(id) on delete cascade,
  joined_at     timestamptz default now()
);

-- ── Community posts ───────────────────────────────────────────────────────────
create table if not exists community_posts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  title           text not null,
  body            text not null,
  destination     text,
  image_url       text,
  status          text not null default 'pending',
  like_count      int not null default 0,
  comment_count   int not null default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists community_comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references community_posts(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  body        text not null,
  status      text not null default 'approved',
  created_at  timestamptz default now()
);

create table if not exists community_likes (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references community_posts(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(post_id, user_id)
);

create table if not exists user_follows (
  id              uuid primary key default uuid_generate_v4(),
  follower_id     uuid not null references profiles(id) on delete cascade,
  following_id    uuid not null references profiles(id) on delete cascade,
  created_at      timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists community_reports (
  id            uuid primary key default uuid_generate_v4(),
  reporter_id   uuid not null references profiles(id) on delete cascade,
  target_type   text not null,
  target_id     uuid not null,
  reason        text not null,
  details       text,
  status        text not null default 'pending',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists message_reports (
  id                uuid primary key default uuid_generate_v4(),
  reporter_id       uuid not null references profiles(id) on delete cascade,
  conversation_id   uuid not null references conversations(id) on delete cascade,
  message_id        uuid references messages(id) on delete set null,
  reason            text not null,
  details           text,
  status            text not null default 'pending',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_community_posts_status on community_posts(status, created_at desc);
create index if not exists idx_community_posts_user on community_posts(user_id, created_at desc);
create index if not exists idx_community_comments_post on community_comments(post_id, created_at asc);
create index if not exists idx_community_likes_post on community_likes(post_id);
create index if not exists idx_user_follows_follower on user_follows(follower_id);
create index if not exists idx_user_follows_following on user_follows(following_id);
create index if not exists idx_community_reports_status on community_reports(status, created_at desc);
create index if not exists idx_message_reports_status on message_reports(status, created_at desc);

alter table community_members enable row level security;
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table community_likes enable row level security;
alter table user_follows enable row level security;
alter table community_reports enable row level security;
alter table message_reports enable row level security;

create policy "Public read approved community posts"
  on community_posts for select
  using (
    status = 'approved'
    and exists (
      select 1 from profiles p
      where p.id = community_posts.user_id and coalesce(p.is_active, true) = true
    )
  );

create policy "Authors read own community posts"
  on community_posts for select
  using (auth.uid() = user_id);

create policy "Members manage own membership"
  on community_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public read approved comments on approved posts"
  on community_comments for select
  using (
    status = 'approved'
    and exists (
      select 1 from community_posts p
      where p.id = community_comments.post_id and p.status = 'approved'
    )
  );

create policy "Authors read own comments"
  on community_comments for select
  using (auth.uid() = user_id);

create policy "Public read community likes"
  on community_likes for select
  using (true);

create policy "Public read follow relationships"
  on user_follows for select
  using (true);

-- Storage bucket for community images (optional — uploads skip gracefully if missing)
insert into storage.buckets (id, name, public)
values ('community-images', 'community-images', true)
on conflict (id) do nothing;
