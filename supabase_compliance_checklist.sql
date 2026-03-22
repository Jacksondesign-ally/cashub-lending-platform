-- Compliance checklist items table
-- Run this in Supabase SQL Editor to enable persistent checklist tracking

CREATE TABLE IF NOT EXISTS compliance_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lender lookups
CREATE INDEX IF NOT EXISTS idx_compliance_checklist_lender ON compliance_checklist(lender_id);

-- RLS policies
ALTER TABLE compliance_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lenders can view their own checklist"
  ON compliance_checklist FOR SELECT
  USING (true);

CREATE POLICY "Lenders can update their own checklist"
  ON compliance_checklist FOR UPDATE
  USING (true);

CREATE POLICY "Lenders can insert their own checklist items"
  ON compliance_checklist FOR INSERT
  WITH CHECK (true);

-- Default checklist items (insert these for each lender on signup)
-- Example insert:
-- INSERT INTO compliance_checklist (lender_id, task) VALUES
--   ('YOUR_LENDER_ID', 'Verify all active loans have signed loan agreements'),
--   ('YOUR_LENDER_ID', 'Ensure all borrowers have verified ID documents on file'),
--   ('YOUR_LENDER_ID', 'Submit quarterly NAMFISA report'),
--   ('YOUR_LENDER_ID', 'Review and update NAMFISA license renewal status'),
--   ('YOUR_LENDER_ID', 'Confirm all loan officers have valid certifications'),
--   ('YOUR_LENDER_ID', 'Audit interest rates comply with NAMFISA caps');
