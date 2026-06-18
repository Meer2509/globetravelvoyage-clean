-- profiles.is_active — used by community moderation and public profile RLS
alter table public.profiles add column if not exists is_active boolean not null default true;
