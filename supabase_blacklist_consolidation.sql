-- Consolidate blacklist and borrower_blacklist into single unified_blacklist table
-- Run this in Supabase SQL Editor

-- Create unified blacklist table
CREATE TABLE IF NOT EXISTS unified_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID,
  borrower_email TEXT,
  id_number TEXT,
  first_name TEXT,
  last_name TEXT,
  reason TEXT NOT NULL,
  outstanding_amount NUMERIC DEFAULT 0,
  lender_id UUID,
  lender_name TEXT,
  lender_email TEXT,
  blacklist_date TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_unified_blacklist_borrower_id ON unified_blacklist(borrower_id);
CREATE INDEX IF NOT EXISTS idx_unified_blacklist_id_number ON unified_blacklist(id_number);
CREATE INDEX IF NOT EXISTS idx_unified_blacklist_email ON unified_blacklist(borrower_email);
CREATE INDEX IF NOT EXISTS idx_unified_blacklist_lender ON unified_blacklist(lender_id);
CREATE INDEX IF NOT EXISTS idx_unified_blacklist_status ON unified_blacklist(status);

-- Migrate data from blacklist table (lender-submitted entries)
INSERT INTO unified_blacklist (
  borrower_id, borrower_email, id_number, first_name, last_name,
  reason, outstanding_amount, lender_id, lender_name, lender_email,
  blacklist_date, notes, status, created_at
)
SELECT 
  borrower_id, borrower_email, id_number, first_name, last_name,
  reason, outstanding_amount, lender_id, lender_name, submitted_by,
  blacklist_date, notes, status, created_at
FROM blacklist
WHERE NOT EXISTS (
  SELECT 1 FROM unified_blacklist ub 
  WHERE ub.id_number = blacklist.id_number 
  AND ub.lender_id = blacklist.lender_id
);

-- Migrate data from borrower_blacklist table (borrower-facing entries)
INSERT INTO unified_blacklist (
  borrower_id, borrower_email, id_number, first_name, last_name,
  reason, outstanding_amount, lender_id, lender_name,
  blacklist_date, notes, status, created_at
)
SELECT 
  borrower_id, borrower_email, id_number, first_name, last_name,
  reason, outstanding_amount, lender_id, lender_name,
  blacklist_date, notes, status, created_at
FROM borrower_blacklist
WHERE NOT EXISTS (
  SELECT 1 FROM unified_blacklist ub 
  WHERE ub.id_number = borrower_blacklist.id_number 
  AND ub.lender_id = borrower_blacklist.lender_id
);

-- Enable RLS
ALTER TABLE unified_blacklist ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Lenders can view their own blacklist entries"
  ON unified_blacklist FOR SELECT
  USING (true);

CREATE POLICY "Lenders can insert blacklist entries"
  ON unified_blacklist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Lenders can update their own blacklist entries"
  ON unified_blacklist FOR UPDATE
  USING (true);

-- Create views for backward compatibility
CREATE OR REPLACE VIEW blacklist AS
SELECT * FROM unified_blacklist;

CREATE OR REPLACE VIEW borrower_blacklist AS
SELECT * FROM unified_blacklist;

-- After verifying data migration, optionally drop old tables:
-- DROP TABLE IF EXISTS blacklist CASCADE;
-- DROP TABLE IF EXISTS borrower_blacklist CASCADE;
