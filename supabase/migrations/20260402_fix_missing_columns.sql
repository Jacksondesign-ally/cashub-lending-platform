-- ============================================================
-- CasHuB Platform Fix: Missing columns, broken constraints,
-- and RLS policies for full admin/lender/borrower visibility
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. LENDERS TABLE: Add all missing columns ────────────────
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS authorized_signatory_id TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS late_payment_percentage DECIMAL(5,2) DEFAULT 5.00;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Make legal_name nullable so inserts without it don't fail
ALTER TABLE lenders ALTER COLUMN legal_name DROP NOT NULL;
ALTER TABLE lenders ALTER COLUMN legal_name SET DEFAULT '';

-- Indexes for fast user_id and email lookups
CREATE INDEX IF NOT EXISTS lenders_user_id_idx ON lenders(user_id);
CREATE INDEX IF NOT EXISTS lenders_email_idx ON lenders(email);

-- ── 2. LENDER_ONBOARDING: Fix package_tier constraint ────────
-- Drop the old constraint that only allows legacy tier names
ALTER TABLE lender_onboarding
  DROP CONSTRAINT IF EXISTS lender_onboarding_package_tier_check;

-- Add updated constraint that includes new tier names
ALTER TABLE lender_onboarding
  ADD CONSTRAINT lender_onboarding_package_tier_check
  CHECK (package_tier IN (
    'free-trial', 'basic', 'medium', 'advanced',
    'starter', 'professional', 'enterprise'
  ));

-- Also add user_id column to lender_onboarding for linking
ALTER TABLE lender_onboarding ADD COLUMN IF NOT EXISTS user_id UUID;

-- ── 3. BORROWERS TABLE: Add missing columns ──────────────────
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Index for fast user_id lookup
CREATE INDEX IF NOT EXISTS borrowers_user_id_idx ON borrowers(user_id);
CREATE INDEX IF NOT EXISTS borrowers_email_idx ON borrowers(email);

-- ── 4. USERS TABLE: Fix role constraint to include loan_officer
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN (
    'super_admin', 'admin', 'lender_admin', 'lender',
    'loan_officer', 'borrower', 'viewer'
  ));

-- ── 5. ENSURE PERMISSIVE RLS FOR ALL TABLES ──────────────────
-- These tables were added by later migrations but may be missing policies

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'users','lenders','borrowers','loans','loan_applications',
    'payments','borrower_blacklist','borrower_disputes','scam_alerts',
    'lender_onboarding','lender_subscriptions','namfisa_reports',
    'loan_signatures','borrower_documents','loan_agreements',
    'compliance_requirements','lender_contracts'
  ]) LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated" ON %I', tbl);
      EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon" ON %I', tbl);
      EXECUTE format('CREATE POLICY "Allow all for anon" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl);
    EXCEPTION WHEN undefined_table THEN
      -- Table doesn't exist yet, skip
      NULL;
    END;
  END LOOP;
END $$;

-- ── 6. BACKFILL: Sync company_name from legal_name where missing
UPDATE lenders SET company_name = legal_name WHERE company_name IS NULL AND legal_name IS NOT NULL AND legal_name != '';
