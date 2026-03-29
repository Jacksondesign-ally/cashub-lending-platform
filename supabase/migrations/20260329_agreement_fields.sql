-- ============================================================
-- CasHuB Loan Agreement System - Database Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- ── LENDER AGREEMENT FIELDS ──────────────────────────────────
ALTER TABLE lenders
  ADD COLUMN IF NOT EXISTS postal_address                     TEXT,
  ADD COLUMN IF NOT EXISTS authorized_signatory_name          TEXT,
  ADD COLUMN IF NOT EXISTS authorized_signatory_title         TEXT,
  ADD COLUMN IF NOT EXISTS authorized_signatory_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS late_fee_percentage                DECIMAL(5,2) DEFAULT 5.00;

-- ── BORROWER AGREEMENT FIELDS ────────────────────────────────
ALTER TABLE borrowers
  ADD COLUMN IF NOT EXISTS postal_address      TEXT,
  ADD COLUMN IF NOT EXISTS tel_no              TEXT,
  ADD COLUMN IF NOT EXISTS marital_status      TEXT,
  ADD COLUMN IF NOT EXISTS occupation          TEXT,
  ADD COLUMN IF NOT EXISTS employer_tel        TEXT,
  ADD COLUMN IF NOT EXISTS employer_address    TEXT,
  ADD COLUMN IF NOT EXISTS payslip_employee_no TEXT,
  ADD COLUMN IF NOT EXISTS bank_name           TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch         TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_no     TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_type   TEXT,
  ADD COLUMN IF NOT EXISTS reference1_name     TEXT,
  ADD COLUMN IF NOT EXISTS reference1_tel      TEXT,
  ADD COLUMN IF NOT EXISTS reference2_name     TEXT,
  ADD COLUMN IF NOT EXISTS reference2_tel      TEXT,
  ADD COLUMN IF NOT EXISTS signature_url       TEXT;

-- ── LOAN AGREEMENTS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS loan_agreements (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id                   UUID,
  borrower_id               UUID,
  lender_id                 UUID,
  loan_number               TEXT,
  principal_amount          DECIMAL(12,2),
  finance_charge_rate       DECIMAL(5,2),
  finance_charge_amount     DECIMAL(12,2),
  total_repayable           DECIMAL(12,2),
  instalment_amount         DECIMAL(12,2),
  first_instalment_date     TEXT,
  last_instalment_date      TEXT,
  number_of_instalments     INTEGER,
  repayment_date            TEXT,
  penalty_rate              DECIMAL(5,2) DEFAULT 5.00,
  signed_place              TEXT,
  borrower_signature_url    TEXT,
  borrower_signed_at        TIMESTAMPTZ,
  lender_signature_url      TEXT,
  lender_signed_at          TIMESTAMPTZ  DEFAULT NOW(),
  status                    TEXT         DEFAULT 'pending_borrower',
  created_at                TIMESTAMPTZ  DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  DEFAULT NOW()
);
