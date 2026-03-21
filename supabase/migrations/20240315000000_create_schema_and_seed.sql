-- ============================================================
-- CasHuB Microlending Platform - Migration: Schema & Seed
-- Run with: supabase db push (or supabase migration up)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'lender_admin', 'lender', 'borrower', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. LENDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lenders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  registration_number TEXT,
  namfisa_license TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  website TEXT,
  about TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. BORROWERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  monthly_income NUMERIC(12,2),
  credit_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted', 'cleared')),
  join_date DATE DEFAULT CURRENT_DATE,
  employer_name TEXT,
  job_title TEXT,
  city TEXT,
  region TEXT,
  visibility_mode TEXT DEFAULT 'private' CHECK (visibility_mode IN ('private', 'marketplace')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. LOANS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT UNIQUE,
  borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  principal_amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) DEFAULT 20.00,
  term_months INTEGER DEFAULT 12,
  monthly_payment NUMERIC(12,2),
  outstanding_balance NUMERIC(12,2),
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'defaulted', 'declined')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. LOAN APPLICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_first_name TEXT,
  borrower_last_name TEXT,
  borrower_id_number TEXT,
  borrower_email TEXT,
  borrower_phone TEXT,
  borrower_name TEXT,
  address TEXT,
  employment_status TEXT,
  employer TEXT,
  monthly_income NUMERIC(12,2),
  loan_amount NUMERIC(12,2),
  loan_purpose TEXT,
  loan_term INTEGER,
  interest_rate NUMERIC(5,2) DEFAULT 20.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'withdrawn')),
  lender_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  borrower_name TEXT,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. BORROWER BLACKLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS borrower_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT 'non_payment',
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'dispute_filed', 'resolved')),
  is_shared BOOLEAN DEFAULT true,
  outstanding_amount NUMERIC(12,2) DEFAULT 0,
  blacklist_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. BORROWER DISPUTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS borrower_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blacklist_id UUID REFERENCES borrower_blacklist(id) ON DELETE CASCADE,
  dispute_number TEXT,
  reason TEXT NOT NULL,
  evidence_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
  clearance_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. SCAM ALERTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scam_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'borrower' CHECK (type IN ('borrower', 'lender', 'identity', 'document', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dismissed', 'investigating')),
  reporter_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. LENDER ONBOARDING TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lender_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  legal_name TEXT,
  registration_number TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  namfisa_license TEXT,
  years_in_business INTEGER DEFAULT 0,
  total_borrowers INTEGER DEFAULT 0,
  monthly_disbursement NUMERIC(12,2) DEFAULT 0,
  package_tier TEXT DEFAULT 'free-trial' CHECK (package_tier IN ('free-trial', 'basic', 'medium', 'advanced')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  notes TEXT
);

-- ============================================================
-- 11. LENDER SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lender_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  package_name TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'TRIAL')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. NAMFISA REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS namfisa_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  report_type TEXT,
  report_period TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. LOAN SIGNATURES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS loan_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT,
  borrower_name TEXT,
  borrower_email TEXT,
  signature_method TEXT,
  signed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrower_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrower_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE namfisa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_signatures ENABLE ROW LEVEL SECURITY;

-- Allow access for authenticated and anon (adjust for production)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'users','lenders','borrowers','loans','loan_applications',
    'payments','borrower_blacklist','borrower_disputes','scam_alerts',
    'lender_onboarding','lender_subscriptions','namfisa_reports','loan_signatures'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all for anon" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
