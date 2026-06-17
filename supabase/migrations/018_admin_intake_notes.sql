-- Admin intake notes and expanded status support

alter table visa_requests add column if not exists admin_notes text;
alter table booking_requests add column if not exists admin_notes text;
alter table lead_requests add column if not exists admin_notes text;
alter table property_listings add column if not exists admin_notes text;
alter table support_messages add column if not exists admin_notes text;
alter table referrals add column if not exists admin_notes text;

alter table visa_requests add column if not exists updated_at timestamptz default now();
alter table booking_requests add column if not exists updated_at timestamptz default now();
alter table lead_requests add column if not exists updated_at timestamptz default now();
