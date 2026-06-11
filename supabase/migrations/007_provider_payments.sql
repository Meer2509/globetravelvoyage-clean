-- Provider payment attribution and platform commission

alter table payments add column if not exists provider_user_id uuid references profiles(id) on delete set null;
alter table payments add column if not exists provider_service_id uuid;
alter table payments add column if not exists platform_fee numeric(12,2);
alter table payments add column if not exists provider_amount numeric(12,2);

create index if not exists idx_payments_provider_user on payments(provider_user_id);
