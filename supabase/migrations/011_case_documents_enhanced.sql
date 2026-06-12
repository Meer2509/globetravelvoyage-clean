-- Enhance case_documents for checklist workspace

ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;
ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS notes TEXT;
