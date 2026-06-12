-- Allow customers to update their own case documents and visa case progress

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
END $$;
