-- Stripe Connect provider payouts: account extensions, payout events, payment transfer tracking

-- ── provider_payout_accounts extensions ───────────────────────────────────────
ALTER TABLE provider_payout_accounts
  ADD COLUMN IF NOT EXISTS provider_role text,
  ADD COLUMN IF NOT EXISTS details_submitted boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_provider_payout_accounts_status
  ON provider_payout_accounts (onboarding_status);

CREATE INDEX IF NOT EXISTS idx_provider_payout_accounts_stripe
  ON provider_payout_accounts (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

-- ── payout_events ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_events (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id text,
  amount            numeric(12,2) NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'USD',
  status            text NOT NULL DEFAULT 'pending',
  stripe_payout_id  text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_events_user ON payout_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_events_stripe ON payout_events(stripe_account_id);

-- ── payments transfer tracking ────────────────────────────────────────────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transfer_status text,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text;

CREATE INDEX IF NOT EXISTS idx_payments_transfer_status ON payments(transfer_status)
  WHERE transfer_status IS NOT NULL;

-- ── RLS: payout_events ────────────────────────────────────────────────────────
ALTER TABLE payout_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers view own payout events"
  ON payout_events FOR SELECT
  USING (auth.uid() = user_id);
