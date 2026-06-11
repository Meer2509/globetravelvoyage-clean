-- Stripe payment fields for checkout sessions and webhooks

alter table payments add column if not exists email text;
alter table payments add column if not exists service_type text;
alter table payments add column if not exists stripe_session_id text;
alter table payments add column if not exists stripe_payment_intent_id text;
alter table payments add column if not exists paid_at timestamptz;

-- Backfill session id from legacy column
update payments
set stripe_session_id = stripe_payment_id
where stripe_session_id is null and stripe_payment_id is not null;

create index if not exists idx_payments_stripe_session on payments(stripe_session_id);
create index if not exists idx_payments_service_type on payments(service_type);
