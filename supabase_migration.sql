-- ============================================================
-- CasHuB - Complete Database Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. USERS table (profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'borrower' CHECK (role IN ('super_admin', 'admin', 'lender_admin', 'lender', 'borrower', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. LENDERS table (lending companies)
CREATE TABLE IF NOT EXISTS lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  namfisa_license TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  website TEXT,
  about TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  min_loan_amount NUMERIC DEFAULT 500,
  max_loan_amount NUMERIC DEFAULT 50000,
  avg_interest_rate NUMERIC DEFAULT 15,
  approval_rate NUMERIC DEFAULT 80,
  rating NUMERIC DEFAULT 0,
  total_loans INTEGER DEFAULT 0,
  response_time TEXT DEFAULT '24 hours',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BORROWERS table
CREATE TABLE IF NOT EXISTS borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  id_number TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  street TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  employer_name TEXT,
  job_title TEXT,
  employment_status TEXT,
  monthly_income NUMERIC,
  employment_duration TEXT,
  credit_score INTEGER DEFAULT 50,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted', 'cleared')),
  visibility_mode TEXT DEFAULT 'private' CHECK (visibility_mode IN ('private', 'marketplace')),
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. LOANS table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number TEXT UNIQUE,
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 20,
  term_months INTEGER DEFAULT 12,
  monthly_payment NUMERIC,
  outstanding_balance NUMERIC,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'defaulted', 'rejected', 'overdue')),
  application_date DATE DEFAULT CURRENT_DATE,
  approval_date DATE,
  disbursement_date DATE,
  start_date DATE,
  end_date DATE,
  days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PAYMENTS table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT,
  loan_id TEXT,
  borrower_name TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  payment_date DATE DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. LENDER_ONBOARDING table (lender applications)
CREATE TABLE IF NOT EXISTS lender_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  registration_number TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  namfisa_license TEXT,
  years_in_business INTEGER DEFAULT 0,
  total_borrowers INTEGER DEFAULT 0,
  monthly_disbursement NUMERIC DEFAULT 0,
  package_tier TEXT DEFAULT 'basic' CHECK (package_tier IN ('basic', 'medium', 'advanced')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. LENDER_SUBSCRIPTIONS table
CREATE TABLE IF NOT EXISTS lender_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. BORROWER_BLACKLIST table
CREATE TABLE IF NOT EXISTS borrower_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  reason TEXT DEFAULT 'non_payment' CHECK (reason IN ('non_payment', 'fraud', 'false_information', 'legal_issues', 'other')),
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'under_review', 'dispute_filed')),
  is_shared BOOLEAN DEFAULT true,
  outstanding_amount NUMERIC DEFAULT 0,
  blacklist_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  evidence_documents TEXT[],
  settlement_amount NUMERIC,
  settlement_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. BORROWER_DISPUTES table
CREATE TABLE IF NOT EXISTS borrower_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blacklist_id UUID REFERENCES borrower_blacklist(id) ON DELETE CASCADE,
  dispute_number TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
  clearance_amount NUMERIC,
  clearance_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. SCAM_ALERTS table
CREATE TABLE IF NOT EXISTS scam_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('borrower', 'lender', 'general')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dismissed')),
  reporter_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. LOAN_SIGNATURES table (borrower agreement signatures)
CREATE TABLE IF NOT EXISTS loan_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number TEXT,
  borrower_name TEXT,
  signature_data TEXT,
  signed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. NAMFISA_REPORTS table (compliance reports)
CREATE TABLE IF NOT EXISTS namfisa_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  report_number TEXT,
  report_year INTEGER,
  report_quarter INTEGER,
  total_loans INTEGER DEFAULT 0,
  total_portfolio NUMERIC DEFAULT 0,
  default_rate NUMERIC DEFAULT 0,
  collection_rate NUMERIC DEFAULT 0,
  new_borrowers INTEGER DEFAULT 0,
  active_borrowers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  submission_date DATE,
  approval_date DATE,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. COMPLIANCE_REQUIREMENTS table
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'reporting' CHECK (category IN ('reporting', 'capital', 'risk', 'governance', 'consumer_protection')),
  frequency TEXT DEFAULT 'quarterly' CHECK (frequency IN ('monthly', 'quarterly', 'annually')),
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('compliant', 'pending', 'overdue', 'non_compliant')),
  last_completed DATE,
  next_due DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. MARKETPLACE_APPLICATIONS table (loan marketplace)
CREATE TABLE IF NOT EXISTS marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  requested_amount NUMERIC NOT NULL,
  loan_period INTEGER NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'awarded', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. MARKETPLACE_BIDS table (lender bids on marketplace applications)
CREATE TABLE IF NOT EXISTS marketplace_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES marketplace_applications(id) ON DELETE CASCADE,
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  interest_rate NUMERIC NOT NULL,
  processing_fee NUMERIC DEFAULT 0,
  total_repayable NUMERIC,
  monthly_payment NUMERIC,
  approval_time TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. LOAN_APPLICATIONS table (used by new loan form and borrower portal)
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_first_name TEXT,
  borrower_last_name TEXT,
  borrower_id_number TEXT,
  borrower_email TEXT,
  borrower_name TEXT,
  borrower_phone TEXT,
  address TEXT,
  employment_status TEXT,
  employer TEXT,
  monthly_income NUMERIC,
  loan_amount NUMERIC NOT NULL,
  loan_purpose TEXT,
  purpose TEXT,
  loan_term INTEGER,
  interest_rate NUMERIC DEFAULT 20,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  lender_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrower_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrower_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE namfisa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: Allow authenticated users full access
-- (In production, tighten these per role)
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'users', 'lenders', 'borrowers', 'loans', 'payments',
      'lender_onboarding', 'lender_subscriptions',
      'borrower_blacklist', 'borrower_disputes', 'scam_alerts',
      'loan_signatures', 'namfisa_reports', 'compliance_requirements',
      'marketplace_applications', 'marketplace_bids', 'loan_applications'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated full access on %I" ON %I', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Allow authenticated full access on %I"
        ON %I FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true)
    ', tbl, tbl);
  END LOOP;
END $$;

-- Also allow anon read for public-facing pages (borrower portal, marketplace)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'lenders', 'borrowers', 'loans', 'payments',
      'borrower_blacklist', 'borrower_disputes', 'scam_alerts',
      'marketplace_applications', 'marketplace_bids',
      'lender_subscriptions', 'lender_onboarding',
      'namfisa_reports', 'compliance_requirements',
      'loan_signatures', 'users', 'loan_applications'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon read on %I" ON %I', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Allow anon read on %I"
        ON %I FOR SELECT
        TO anon
        USING (true)
    ', tbl, tbl);
  END LOOP;
END $$;

-- Allow anon insert for signup/login flows
DROP POLICY IF EXISTS "Allow anon insert on users" ON users;
CREATE POLICY "Allow anon insert on users"
  ON users FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on loan_signatures" ON loan_signatures;
CREATE POLICY "Allow anon insert on loan_signatures"
  ON loan_signatures FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow anon insert on lender_onboarding"
  ON lender_onboarding FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on lenders" ON lenders;
CREATE POLICY "Allow anon insert on lenders"
  ON lenders FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on borrowers" ON borrowers;
CREATE POLICY "Allow anon insert on borrowers"
  ON borrowers FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on loan_applications" ON loan_applications;
CREATE POLICY "Allow anon insert on loan_applications"
  ON loan_applications FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on marketplace_applications" ON marketplace_applications;
CREATE POLICY "Allow anon insert on marketplace_applications"
  ON marketplace_applications FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- Generate loan numbers automatically
-- ============================================================
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.loan_number IS NULL THEN
    NEW.loan_number := 'LN-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('loan_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS loan_number_seq START 1;

DROP TRIGGER IF EXISTS set_loan_number ON loans;
CREATE TRIGGER set_loan_number
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION generate_loan_number();

-- ============================================================
-- Generate payment numbers automatically
-- ============================================================
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_number IS NULL THEN
    NEW.payment_number := 'PAY-' || LPAD(nextval('payment_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS payment_number_seq START 1;

DROP TRIGGER IF EXISTS set_payment_number ON payments;
CREATE TRIGGER set_payment_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_number();

-- ============================================================
-- V2 MIGRATION: Blueprint compliance updates
-- Run these after the initial schema is deployed
-- ============================================================

-- 1. Fix users role constraint to include loan_officer, remove admin/viewer
-- First migrate existing rows so the new constraint doesn't fail
UPDATE users SET role = 'lender_admin' WHERE role = 'admin';
UPDATE users SET role = 'borrower'     WHERE role = 'viewer';
UPDATE users SET role = 'lender_admin' WHERE role = 'lender';
-- Now drop old constraint and add the correct one
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('super_admin', 'lender_admin', 'loan_officer', 'borrower'));

-- 2. Add AUDIT_LOGS table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Add BLACKLIST table (shared registry, separate from borrower_blacklist)
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
  id_number TEXT,
  full_name TEXT,
  reason TEXT NOT NULL,
  evidence TEXT,
  submitted_by TEXT,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disputed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- 4. Add lender_id to loan_applications for data isolation
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;

-- 5. Add status values to loan_applications: under_review, disbursed
ALTER TABLE loan_applications DROP CONSTRAINT IF EXISTS loan_applications_status_check;
ALTER TABLE loan_applications ADD CONSTRAINT loan_applications_status_check
  CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed', 'cancelled', 'disbursed'));

-- 6. Update marketplace_applications to support lender acceptance
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS borrower_name TEXT;
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS loan_amount NUMERIC;
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS loan_term INTEGER;
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS loan_purpose TEXT;
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS lender_email TEXT;
ALTER TABLE marketplace_applications DROP CONSTRAINT IF EXISTS marketplace_applications_status_check;
ALTER TABLE marketplace_applications ADD CONSTRAINT marketplace_applications_status_check
  CHECK (status IN ('open', 'bidding', 'awarded', 'accepted', 'expired', 'cancelled', 'completed'));

-- 7. Add credit_score range and risk_level critical to borrowers
ALTER TABLE borrowers DROP CONSTRAINT IF EXISTS borrowers_risk_level_check;
ALTER TABLE borrowers ADD CONSTRAINT borrowers_risk_level_check
  CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));

-- 8. Add updated_at to borrowers if missing
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 9. Add payments table if not exists (for lender repayment recording)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_number TEXT,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 10. Add RLS policies for new tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['audit_logs', 'blacklist', 'payments'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated full access on %I" ON %I', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Allow authenticated full access on %I"
        ON %I FOR ALL TO authenticated
        USING (true) WITH CHECK (true)
    ', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon read on %I" ON %I', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Allow anon read on %I"
        ON %I FOR SELECT TO anon USING (true)
    ', tbl, tbl);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Allow anon insert on payments" ON payments;
CREATE POLICY "Allow anon insert on payments"
  ON payments FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on blacklist" ON blacklist;
CREATE POLICY "Allow anon insert on blacklist"
  ON blacklist FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert on scam_alerts" ON scam_alerts;
CREATE POLICY "Allow anon insert on scam_alerts"
  ON scam_alerts FOR INSERT TO anon WITH CHECK (true);
-- Creates: lender_onboarding, lender_branches, lender_invitations tables
-- Adds: RLS policies allowing both anon + authenticated inserts
-- Adds: registration_number column to lenders
-- ============================================================
-- V3: LENDER ONBOARDING TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lender_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  registration_number TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  namfisa_license TEXT,
  years_in_business INTEGER DEFAULT 0,
  total_borrowers INTEGER,
  monthly_disbursement NUMERIC,
  package_tier TEXT DEFAULT 'starter',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','suspended')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lender_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can insert lender_onboarding" ON lender_onboarding;
CREATE POLICY "Anon can insert lender_onboarding"
  ON lender_onboarding FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Auth can insert lender_onboarding" ON lender_onboarding;
CREATE POLICY "Auth can insert lender_onboarding"
  ON lender_onboarding FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow read lender_onboarding"
  ON lender_onboarding FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow update lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow update lender_onboarding"
  ON lender_onboarding FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- V3: LENDER BRANCHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lender_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  manager_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lender_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on lender_branches" ON lender_branches;
CREATE POLICY "Allow all on lender_branches"
  ON lender_branches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- V3: LENDER INVITATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lender_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_email TEXT NOT NULL,
  invited_company TEXT,
  invited_by TEXT,
  status TEXT DEFAULT 'pending',
  invite_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lender_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on lender_invitations" ON lender_invitations;
CREATE POLICY "Allow all on lender_invitations"
  ON lender_invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add registration_number column to lenders if missing
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- ============================================================
-- V3 PATCH: Column fixes identified in audit
-- ============================================================

-- Patch users table: add lender_id + status (needed for staff management)
ALTER TABLE users ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Patch lender_subscriptions: add plan_type + payment_status aliases
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
-- Sync plan_type from package_id for existing rows
UPDATE lender_subscriptions SET plan_type = package_id WHERE plan_type IS NULL;

-- Add billing_cycle column for monthly/annual tracking with correct amounts
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));

-- ============================================================
-- V3: BORROWER INVITES TABLE (lender inviting borrowers)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrower_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  borrower_email TEXT NOT NULL,
  borrower_name TEXT,
  borrower_phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'sent',
  invite_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE borrower_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on borrower_invites" ON borrower_invites;
CREATE POLICY "Allow all on borrower_invites"
  ON borrower_invites FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can insert borrower_invites" ON borrower_invites;
CREATE POLICY "Anon can insert borrower_invites"
  ON borrower_invites FOR INSERT TO anon WITH CHECK (true);
