-- Globe Travel Voyage — Launch platform tables (visa cases, documents, email logs, verification, reviews, support)

-- Visa cases (paid visa service tracking)
CREATE TABLE IF NOT EXISTS visa_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  visa_country TEXT,
  visa_type TEXT,
  status TEXT NOT NULL DEFAULT 'intake_started',
  progress_percent INTEGER NOT NULL DEFAULT 5,
  current_step TEXT NOT NULL DEFAULT 'intake_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visa_cases_user_id ON visa_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_visa_cases_payment_id ON visa_cases(payment_id);
CREATE INDEX IF NOT EXISTS idx_visa_cases_case_number ON visa_cases(case_number);

-- Case documents checklist
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES visa_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_user_id ON case_documents(user_id);

-- Email event log (when Resend is unavailable)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'logged',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);

-- Provider verification requests
CREATE TABLE IF NOT EXISTS provider_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_verifications_user_id ON provider_verifications(user_id);

-- Verified provider reviews (post completed booking)
CREATE TABLE IF NOT EXISTS provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  provider_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider ON provider_reviews(provider_user_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_customer ON provider_reviews(customer_id);

-- Support tickets (customer support form)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Extend messages table for case/booking linking if columns missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'case_id') THEN
    ALTER TABLE messages ADD COLUMN case_id UUID REFERENCES visa_cases(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'booking_id') THEN
    ALTER TABLE messages ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS policies (service role bypasses; users read own data)
ALTER TABLE visa_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'visa_cases_select_own') THEN
    CREATE POLICY visa_cases_select_own ON visa_cases FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'case_documents_select_own') THEN
    CREATE POLICY case_documents_select_own ON case_documents FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'case_documents_insert_own') THEN
    CREATE POLICY case_documents_insert_own ON case_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_select_own') THEN
    CREATE POLICY support_tickets_select_own ON support_tickets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_insert_own') THEN
    CREATE POLICY support_tickets_insert_own ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'provider_reviews_select_all') THEN
    CREATE POLICY provider_reviews_select_all ON provider_reviews FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'provider_reviews_insert_own') THEN
    CREATE POLICY provider_reviews_insert_own ON provider_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
  END IF;
END $$;
