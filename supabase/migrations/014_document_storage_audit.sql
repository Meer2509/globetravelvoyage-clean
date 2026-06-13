-- Document upload audit trail

ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;

CREATE INDEX IF NOT EXISTS idx_case_documents_storage_path ON case_documents(storage_path)
  WHERE storage_path IS NOT NULL;
