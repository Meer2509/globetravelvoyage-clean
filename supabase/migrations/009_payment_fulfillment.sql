-- Payment fulfillment: schema fixes, invoices, entitlements, visa case linking

-- ── Fix bookings table drift (schema.sql vs Stripe 008) ─────────────────────
alter table bookings alter column user_id drop not null;

alter table bookings add column if not exists customer_email text;
alter table bookings add column if not exists provider_user_id uuid references profiles(id) on delete set null;
alter table bookings add column if not exists listing_id text;
alter table bookings add column if not exists listing_title text;
alter table bookings add column if not exists payment_id uuid;
alter table bookings add column if not exists stripe_session_id text;
alter table bookings add column if not exists stripe_payment_id text;
alter table bookings add column if not exists currency text default 'USD';
alter table bookings add column if not exists notes text;

create index if not exists idx_bookings_session on bookings(stripe_session_id);
create index if not exists idx_bookings_payment on bookings(payment_id);

-- ── Payment invoices & receipts ─────────────────────────────────────────────
alter table payments add column if not exists invoice_number text;
alter table payments add column if not exists customer_name text;

create unique index if not exists idx_payments_invoice
  on payments(invoice_number) where invoice_number is not null;

-- ── User entitlements (service activation after payment) ────────────────────
create table if not exists user_entitlements (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade,
  entitlement_type      text not null,
  product_key           text not null,
  payment_id            uuid,
  booking_id            uuid,
  visa_application_id   uuid,
  status                text not null default 'active',
  metadata              jsonb default '{}',
  expires_at            timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_entitlements_user on user_entitlements(user_id);
create index if not exists idx_entitlements_payment on user_entitlements(payment_id);
create index if not exists idx_entitlements_type on user_entitlements(entitlement_type);

alter table user_entitlements enable row level security;

create policy "Users view own entitlements"
  on user_entitlements for select using (auth.uid() = user_id);

-- ── Link visa applications to paid services ─────────────────────────────────
alter table visa_applications add column if not exists payment_id uuid;
alter table visa_applications add column if not exists booking_id uuid;
alter table visa_applications add column if not exists service_product_key text;
alter table visa_applications add column if not exists progress_step int default 1;
alter table visa_applications add column if not exists assigned_expert_name text;

create index if not exists idx_visa_apps_payment on visa_applications(payment_id);

-- Provider featured flags
alter table visa_experts add column if not exists is_featured boolean default false;
alter table agencies add column if not exists is_featured boolean default false;
alter table tour_guides add column if not exists is_featured boolean default false;
