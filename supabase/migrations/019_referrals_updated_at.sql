-- Referrals admin intake support

alter table referrals add column if not exists updated_at timestamptz default now();
