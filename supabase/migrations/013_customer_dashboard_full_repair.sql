-- Customer dashboard full repair: columns, indexes, RLS

ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;
ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_case_documents_case_user ON case_documents(case_id, user_id);
CREATE INDEX IF NOT EXISTS idx_visa_cases_user_status ON visa_cases(user_id, status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'case_documents_update_own') THEN
    CREATE POLICY case_documents_update_own ON case_documents
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'visa_cases_update_own') THEN
    CREATE POLICY visa_cases_update_own ON visa_cases
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_select_own') THEN
    CREATE POLICY support_tickets_select_own ON support_tickets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_insert_own') THEN
    CREATE POLICY support_tickets_insert_own ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;
