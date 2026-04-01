-- ============================================================
-- CasHuB Lender Contracts Table
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS lender_contracts (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id             UUID,
  legal_name            TEXT,
  registration_number   TEXT,
  authorized_rep        TEXT,
  position_title        TEXT,
  business_email        TEXT,
  business_phone        TEXT,
  business_address      TEXT,
  bank_name             TEXT,
  bank_branch           TEXT,
  branch_code           TEXT,
  account_holder        TEXT,
  account_number        TEXT,
  account_type          TEXT,
  billing_frequency     TEXT         DEFAULT 'Monthly',
  preferred_debit_date  INTEGER,
  subscription_amount   DECIMAL(12,2),
  signatory_name        TEXT,
  signatory_title       TEXT,
  signature_url         TEXT,
  signed_at             TIMESTAMPTZ,
  accepted_terms        BOOLEAN      DEFAULT false,
  accepted_authority    BOOLEAN      DEFAULT false,
  accepted_debit        BOOLEAN      DEFAULT false,
  status                TEXT         DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected')),
  rejection_reason      TEXT,
  reviewed_by           TEXT,
  reviewed_at           TIMESTAMPTZ,
  agreement_version     TEXT         DEFAULT 'v1.0',
  created_at            TIMESTAMPTZ  DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE lender_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated" ON lender_contracts;
CREATE POLICY "Allow all for authenticated" ON lender_contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for anon" ON lender_contracts;
CREATE POLICY "Allow all for anon" ON lender_contracts
  FOR ALL TO anon USING (true) WITH CHECK (true);
