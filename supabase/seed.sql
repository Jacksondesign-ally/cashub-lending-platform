-- ============================================================
-- CasHuB Microlending Platform - Database Schema & Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DROP EXISTING TABLES (in correct order due to foreign keys)
-- ============================================================
DROP TABLE IF EXISTS loan_signatures CASCADE;
DROP TABLE IF EXISTS namfisa_reports CASCADE;
DROP TABLE IF EXISTS lender_subscriptions CASCADE;
DROP TABLE IF EXISTS lender_onboarding CASCADE;
DROP TABLE IF EXISTS scam_alerts CASCADE;
DROP TABLE IF EXISTS borrower_disputes CASCADE;
DROP TABLE IF EXISTS borrower_blacklist CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS borrowers CASCADE;
DROP TABLE IF EXISTS lenders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
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
CREATE TABLE lenders (
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
CREATE TABLE borrowers (
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
CREATE TABLE loans (
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
CREATE TABLE loan_applications (
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
CREATE TABLE payments (
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
CREATE TABLE borrower_blacklist (
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
CREATE TABLE borrower_disputes (
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
CREATE TABLE scam_alerts (
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
CREATE TABLE lender_onboarding (
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
CREATE TABLE lender_subscriptions (
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
CREATE TABLE namfisa_reports (
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
CREATE TABLE loan_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT,
  borrower_name TEXT,
  borrower_email TEXT,
  signature_method TEXT,
  signed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (optional, recommended for production)
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

-- Allow full access for authenticated users (adjust for production)
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


-- ============================================================
-- =================== SEED DATA ==============================
-- ============================================================

-- Clear existing data (safe for fresh installs)
TRUNCATE loan_signatures, namfisa_reports, lender_subscriptions, lender_onboarding,
         scam_alerts, borrower_disputes, borrower_blacklist, payments,
         loan_applications, loans, borrowers, lenders, users CASCADE;

-- ============================================================
-- USERS (6 users across all roles)
-- ============================================================
INSERT INTO users (id, email, full_name, phone, role, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@cashhub.com.na', 'Super Admin', '+264 61 300 0001', 'super_admin', true),
  ('a0000000-0000-0000-0000-000000000002', 'ops@cashhub.com.na', 'CasHuB Operations', '+264 61 300 0002', 'admin', true),
  ('a0000000-0000-0000-0000-000000000003', 'james@quickcash.com.na', 'James Nambahu', '+264 81 234 5678', 'lender_admin', true),
  ('a0000000-0000-0000-0000-000000000004', 'anna@namfin.com.na', 'Anna Shikongo', '+264 81 345 6789', 'lender', true),
  ('a0000000-0000-0000-0000-000000000005', 'john.kamati@gmail.com', 'John Kamati', '+264 81 456 7890', 'borrower', true),
  ('a0000000-0000-0000-0000-000000000006', 'viewer@cashhub.com.na', 'Report Viewer', '+264 61 300 0003', 'viewer', true);

-- ============================================================
-- LENDERS (5 Namibian microlending companies)
-- ============================================================
INSERT INTO lenders (id, legal_name, trading_name, registration_number, namfisa_license, contact_person, email, phone, address, city, website, about, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'QuickCash Finance (Pty) Ltd', 'QuickCash Finance', 'RC2024/00145', 'ML-2024-0089', 'James Nambahu', 'james@quickcash.com.na', '+264 81 234 5678', '15 Independence Ave', 'Windhoek', 'https://quickcash.com.na', 'Leading microlender in Windhoek serving government employees and SMEs since 2019.', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'NamFin Microlenders CC', 'NamFin Micro', 'RC2023/00892', 'ML-2023-0156', 'Anna Shikongo', 'anna@namfin.com.na', '+264 81 345 6789', '42 Sam Nujoma Drive', 'Oshakati', 'https://namfin.com.na', 'Serving the northern regions with affordable microloans and financial literacy programs.', 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'Coastal Cash Solutions (Pty) Ltd', 'Coastal Cash', 'RC2022/01234', 'ML-2022-0210', 'Peter Garoeb', 'peter@coastalcash.com.na', '+264 64 200 1234', '88 Bismarck St', 'Walvis Bay', NULL, 'Quick turnaround microloans for the coastal fishing and tourism industry.', 'active'),
  ('b0000000-0000-0000-0000-000000000004', 'Erongo Lending Group CC', 'Erongo Lending', 'RC2021/00567', 'ML-2021-0078', 'Selma Hangula', 'selma@erongolending.com.na', '+264 64 500 5678', '5 Libertina Amathila Ave', 'Swakopmund', NULL, 'Community-focused lending with flexible repayment options.', 'active'),
  ('b0000000-0000-0000-0000-000000000005', 'Kalahari Capital (Pty) Ltd', 'Kalahari Capital', 'RC2020/00333', 'ML-2020-0045', 'Thomas Eiseb', 'thomas@kalaharicap.com.na', '+264 67 300 3456', '12 Hendrik Witbooi St', 'Keetmanshoop', NULL, 'Specialists in agricultural and livestock microfinance in the south.', 'active');

-- ============================================================
-- BORROWERS (20 realistic Namibian borrowers)
-- ============================================================
INSERT INTO borrowers (id, id_number, first_name, last_name, email, phone, monthly_income, credit_score, risk_level, status, join_date, employer_name, job_title, city, region, visibility_mode) VALUES
  ('c0000000-0000-0000-0000-000000000001', '85010500123', 'John', 'Kamati', 'john.kamati@gmail.com', '+264 81 456 7890', 12500.00, 720, 'low', 'active', '2023-06-15', 'Ministry of Education', 'Senior Teacher', 'Windhoek', 'Khomas', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000002', '90032100456', 'Maria', 'Santos', 'maria.santos@iway.na', '+264 81 567 8901', 8500.00, 580, 'medium', 'active', '2023-08-22', 'Shoprite Holdings', 'Store Supervisor', 'Windhoek', 'Khomas', 'private'),
  ('c0000000-0000-0000-0000-000000000003', '88071500789', 'David', 'Shilongo', 'david.shilongo@yahoo.com', '+264 81 678 9012', 15000.00, 690, 'low', 'active', '2023-11-10', 'NamPower', 'Electrical Engineer', 'Windhoek', 'Khomas', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000004', '92051200101', 'Sarah', 'Angula', 'sarah.angula@mweb.com.na', '+264 81 789 0123', 22000.00, 810, 'low', 'active', '2022-03-01', 'First National Bank', 'Relationship Manager', 'Windhoek', 'Khomas', 'private'),
  ('c0000000-0000-0000-0000-000000000005', '95082800202', 'Peter', 'Hamutenya', 'peter.ham@gmail.com', '+264 81 890 1234', 6000.00, 450, 'high', 'active', '2024-01-05', 'Self-Employed', 'Taxi Driver', 'Oshakati', 'Oshana', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000006', '87041000303', 'Elizabeth', 'Iipumbu', 'elizabeth.i@hotmail.com', '+264 81 901 2345', 9800.00, 650, 'medium', 'active', '2023-04-18', 'Namibia Breweries', 'Quality Controller', 'Windhoek', 'Khomas', 'private'),
  ('c0000000-0000-0000-0000-000000000007', '91110500404', 'Michael', 'Garoeb', 'mgaoreb@gmail.com', '+264 64 201 3456', 11000.00, 700, 'low', 'active', '2023-07-20', 'Erongo RED', 'Technician', 'Walvis Bay', 'Erongo', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000008', '89020100505', 'Grace', 'Mweshihange', 'grace.mwe@outlook.com', '+264 81 012 3456', 7500.00, 520, 'medium', 'active', '2023-09-05', 'OK Foods', 'Cashier Lead', 'Oshakati', 'Oshana', 'private'),
  ('c0000000-0000-0000-0000-000000000009', '93061500606', 'Abraham', 'Nghidinwa', 'abe.nghidinwa@gmail.com', '+264 81 123 4560', 18000.00, 760, 'low', 'active', '2022-11-12', 'Bank Windhoek', 'Credit Analyst', 'Windhoek', 'Khomas', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000010', '86090100707', 'Hilma', 'Nangolo', 'hilma.n@iway.na', '+264 81 234 5670', 5500.00, 480, 'high', 'blacklisted', '2023-02-28', 'Woermann Brock', 'Sales Assistant', 'Rundu', 'Kavango East', 'private'),
  ('c0000000-0000-0000-0000-000000000011', '94031500808', 'Jason', 'Amupolo', 'jason.amu@gmail.com', '+264 81 345 6780', 14000.00, 710, 'low', 'active', '2023-05-10', 'Telecom Namibia', 'Network Specialist', 'Windhoek', 'Khomas', 'private'),
  ('c0000000-0000-0000-0000-000000000012', '88121200909', 'Ndapanda', 'Kashikola', 'ndapanda.k@hotmail.com', '+264 81 456 7891', 9000.00, 610, 'medium', 'active', '2023-10-01', 'Debmarine Namibia', 'Admin Officer', 'Oranjemund', 'Karas', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000013', '90070800010', 'Willem', 'Fredericks', 'wfredericks@gmail.com', '+264 63 222 1234', 8000.00, 550, 'medium', 'active', '2024-01-15', 'Namdeb', 'Drill Operator', 'Lüderitz', 'Karas', 'private'),
  ('c0000000-0000-0000-0000-000000000014', '92111100111', 'Frieda', 'Shaanika', 'frieda.sha@yahoo.com', '+264 65 230 4567', 10500.00, 680, 'medium', 'active', '2023-03-22', 'Ministry of Health', 'Registered Nurse', 'Katima Mulilo', 'Zambezi', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000015', '87050500212', 'Paulus', 'Nashandi', 'p.nashandi@mweb.com.na', '+264 81 567 8902', 20000.00, 790, 'low', 'active', '2022-08-10', 'Old Mutual Namibia', 'Financial Advisor', 'Windhoek', 'Khomas', 'private'),
  ('c0000000-0000-0000-0000-000000000016', '95010200313', 'Loide', 'Ndjamba', 'loide.ndj@gmail.com', '+264 81 678 9013', 4500.00, 410, 'high', 'active', '2024-02-01', 'Unemployed', NULL, 'Ondangwa', 'Oshana', 'private'),
  ('c0000000-0000-0000-0000-000000000017', '91040700414', 'Heinrich', 'van Wyk', 'hvanwyk@iway.na', '+264 64 205 5678', 16000.00, 740, 'low', 'active', '2023-01-18', 'Rössing Uranium', 'Safety Officer', 'Swakopmund', 'Erongo', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000018', '89080300515', 'Selma', 'Kashona', 'selma.kash@outlook.com', '+264 81 789 0124', 7000.00, 530, 'medium', 'inactive', '2023-06-25', 'Pupkewitz Holdings', 'Admin Clerk', 'Windhoek', 'Khomas', 'private'),
  ('c0000000-0000-0000-0000-000000000019', '93120100616', 'Erastus', 'Nekongo', 'erastus.nek@gmail.com', '+264 81 890 1235', 13000.00, 670, 'medium', 'active', '2023-08-14', 'Namibia Airports Company', 'Ground Handler', 'Windhoek', 'Khomas', 'marketplace'),
  ('c0000000-0000-0000-0000-000000000020', '86030200717', 'Ruusa', 'Nghifindaka', 'ruusa.ng@hotmail.com', '+264 81 901 2346', 11500.00, 700, 'low', 'active', '2022-12-05', 'Nedbank Namibia', 'Teller Supervisor', 'Windhoek', 'Khomas', 'private');

-- ============================================================
-- LOANS (25 loans across different statuses)
-- ============================================================
INSERT INTO loans (id, loan_number, borrower_id, lender_id, principal_amount, interest_rate, term_months, monthly_payment, outstanding_balance, purpose, status, start_date, end_date) VALUES
  -- QuickCash Finance loans
  ('d0000000-0000-0000-0000-000000000001', 'LN-2024-0001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 15000.00, 22.00, 12, 1400.00, 9800.00, 'Home Improvement', 'active', '2024-01-15', '2025-01-15'),
  ('d0000000-0000-0000-0000-000000000002', 'LN-2024-0002', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 8000.00, 25.00, 6, 1500.00, 4500.00, 'Medical Emergency', 'active', '2024-02-01', '2024-08-01'),
  ('d0000000-0000-0000-0000-000000000003', 'LN-2024-0003', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 25000.00, 20.00, 18, 1550.00, 22000.00, 'Vehicle Purchase', 'active', '2024-01-20', '2025-07-20'),
  ('d0000000-0000-0000-0000-000000000004', 'LN-2024-0004', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 50000.00, 18.00, 24, 2450.00, 35000.00, 'Business Expansion', 'active', '2023-11-01', '2025-11-01'),
  ('d0000000-0000-0000-0000-000000000005', 'LN-2024-0005', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 3000.00, 30.00, 3, 1100.00, 0.00, 'School Fees', 'completed', '2023-09-01', '2023-12-01'),
  -- NamFin Micro loans
  ('d0000000-0000-0000-0000-000000000006', 'LN-2024-0006', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 12000.00, 24.00, 12, 1120.00, 7800.00, 'Debt Consolidation', 'active', '2024-01-10', '2025-01-10'),
  ('d0000000-0000-0000-0000-000000000007', 'LN-2024-0007', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 5000.00, 28.00, 6, 950.00, 2800.00, 'Funeral Expenses', 'active', '2024-02-15', '2024-08-15'),
  ('d0000000-0000-0000-0000-000000000008', 'LN-2024-0008', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 7000.00, 26.00, 6, 1300.00, 7000.00, 'Personal', 'defaulted', '2023-06-01', '2023-12-01'),
  ('d0000000-0000-0000-0000-000000000009', 'LN-2024-0009', 'c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000002', 10000.00, 22.00, 12, 930.00, 5500.00, 'Education', 'active', '2024-01-05', '2025-01-05'),
  ('d0000000-0000-0000-0000-000000000010', 'LN-2024-0010', 'c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000002', 2000.00, 30.00, 3, 750.00, 0.00, 'Emergency', 'completed', '2023-10-01', '2024-01-01'),
  -- Coastal Cash loans
  ('d0000000-0000-0000-0000-000000000011', 'LN-2024-0011', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 18000.00, 21.00, 12, 1680.00, 12600.00, 'Fishing Equipment', 'active', '2024-01-25', '2025-01-25'),
  ('d0000000-0000-0000-0000-000000000012', 'LN-2024-0012', 'c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003', 6000.00, 25.00, 6, 1130.00, 3400.00, 'Relocation', 'active', '2024-02-10', '2024-08-10'),
  ('d0000000-0000-0000-0000-000000000013', 'LN-2024-0013', 'c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000003', 10000.00, 23.00, 12, 940.00, 0.00, 'Personal', 'completed', '2023-02-01', '2024-02-01'),
  -- Erongo Lending loans
  ('d0000000-0000-0000-0000-000000000014', 'LN-2024-0014', 'c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000004', 20000.00, 19.00, 18, 1240.00, 16000.00, 'Home Renovation', 'active', '2024-01-08', '2025-07-08'),
  ('d0000000-0000-0000-0000-000000000015', 'LN-2024-0015', 'c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000004', 14000.00, 22.00, 12, 1310.00, 9100.00, 'Vehicle Repair', 'active', '2024-02-20', '2025-02-20'),
  -- Kalahari Capital loans
  ('d0000000-0000-0000-0000-000000000016', 'LN-2024-0016', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 30000.00, 20.00, 24, 1520.00, 24000.00, 'Agricultural Equipment', 'active', '2024-01-12', '2026-01-12'),
  ('d0000000-0000-0000-0000-000000000017', 'LN-2024-0017', 'c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000005', 40000.00, 18.00, 24, 1970.00, 28500.00, 'Business Start-up', 'active', '2023-12-01', '2025-12-01'),
  ('d0000000-0000-0000-0000-000000000018', 'LN-2024-0018', 'c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000005', 8500.00, 24.00, 6, 1590.00, 4800.00, 'Wedding', 'active', '2024-02-05', '2024-08-05'),
  -- Pending and declined loans
  ('d0000000-0000-0000-0000-000000000019', 'LN-2024-0019', 'c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000001', 12000.00, 22.00, 12, 1120.00, 12000.00, 'Debt Consolidation', 'pending', '2024-03-01', '2025-03-01'),
  ('d0000000-0000-0000-0000-000000000020', 'LN-2024-0020', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 15000.00, 28.00, 12, 1500.00, 15000.00, 'Business', 'pending', '2024-03-05', '2025-03-05'),
  ('d0000000-0000-0000-0000-000000000021', 'LN-2024-0021', 'c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000002', 5000.00, 30.00, 3, 1850.00, 5000.00, 'Emergency', 'declined', NULL, NULL),
  ('d0000000-0000-0000-0000-000000000022', 'LN-2024-0022', 'c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000001', 20000.00, 22.00, 18, 1240.00, 20000.00, 'Education', 'pending', '2024-03-10', '2025-09-10'),
  -- More completed loans
  ('d0000000-0000-0000-0000-000000000023', 'LN-2023-0001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 5000.00, 24.00, 6, 950.00, 0.00, 'School Fees', 'completed', '2023-01-15', '2023-07-15'),
  ('d0000000-0000-0000-0000-000000000024', 'LN-2023-0002', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 8000.00, 20.00, 6, 1480.00, 0.00, 'Holiday', 'completed', '2023-06-01', '2023-12-01'),
  ('d0000000-0000-0000-0000-000000000025', 'LN-2023-0003', 'c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 10000.00, 22.00, 12, 930.00, 0.00, 'Medical', 'completed', '2022-12-01', '2023-12-01');

-- ============================================================
-- LOAN APPLICATIONS (8 applications)
-- ============================================================
INSERT INTO loan_applications (borrower_first_name, borrower_last_name, borrower_id_number, borrower_email, borrower_phone, borrower_name, address, employment_status, employer, monthly_income, loan_amount, loan_purpose, loan_term, interest_rate, status, lender_email) VALUES
  ('John', 'Kamati', '85010500123', 'john.kamati@gmail.com', '+264 81 456 7890', 'John Kamati', '45 Mandume Ndemufayo Ave, Windhoek, Khomas', 'employed', 'Ministry of Education', 12500.00, 15000.00, 'Home Improvement', 12, 22.00, 'approved', 'james@quickcash.com.na'),
  ('Maria', 'Santos', '90032100456', 'maria.santos@iway.na', '+264 81 567 8901', 'Maria Santos', '12 Robert Mugabe Ave, Windhoek, Khomas', 'employed', 'Shoprite Holdings', 8500.00, 8000.00, 'Medical Emergency', 6, 25.00, 'approved', 'james@quickcash.com.na'),
  ('Loide', 'Ndjamba', '95010200313', 'loide.ndj@gmail.com', '+264 81 678 9013', 'Loide Ndjamba', '78 Main Road, Ondangwa, Oshana', 'unemployed', NULL, 4500.00, 5000.00, 'Emergency', 3, 30.00, 'declined', 'anna@namfin.com.na'),
  ('Ruusa', 'Nghifindaka', '86030200717', 'ruusa.ng@hotmail.com', '+264 81 901 2346', 'Ruusa Nghifindaka', '22 Curt von Francois St, Windhoek, Khomas', 'employed', 'Nedbank Namibia', 11500.00, 12000.00, 'Debt Consolidation', 12, 22.00, 'pending', 'james@quickcash.com.na'),
  ('Peter', 'Hamutenya', '95082800202', 'peter.ham@gmail.com', '+264 81 890 1234', 'Peter Hamutenya', '33 Oshakati Main Rd, Oshakati, Oshana', 'self_employed', 'Self-Employed', 6000.00, 15000.00, 'Business', 12, 28.00, 'pending', 'peter@coastalcash.com.na'),
  ('Selma', 'Kashona', '89080300515', 'selma.kash@outlook.com', '+264 81 789 0124', 'Selma Kashona', '10 Nelson Mandela Ave, Windhoek, Khomas', 'employed', 'Pupkewitz Holdings', 7000.00, 20000.00, 'Education', 18, 22.00, 'pending', 'james@quickcash.com.na'),
  ('Michael', 'Garoeb', '91110500404', 'mgaoreb@gmail.com', '+264 64 201 3456', 'Michael Garoeb', '56 Atlantic St, Walvis Bay, Erongo', 'employed', 'Erongo RED', 11000.00, 18000.00, 'Fishing Equipment', 12, 21.00, 'approved', 'peter@coastalcash.com.na'),
  ('Erastus', 'Nekongo', '93120100616', 'erastus.nek@gmail.com', '+264 81 890 1235', 'Erastus Nekongo', '8 Hosea Kutako Drive, Windhoek, Khomas', 'employed', 'Namibia Airports Company', 13000.00, 8500.00, 'Wedding', 6, 24.00, 'approved', 'thomas@kalaharicap.com.na');

-- ============================================================
-- PAYMENTS (30 payment records)
-- ============================================================
INSERT INTO payments (loan_id, borrower_name, amount, payment_method, payment_date, reference, notes, status) VALUES
  -- John Kamati payments (LN-2024-0001)
  ('d0000000-0000-0000-0000-000000000001', 'John Kamati', 1400.00, 'bank_transfer', '2024-02-15', 'BT-20240215-001', 'February instalment', 'completed'),
  ('d0000000-0000-0000-0000-000000000001', 'John Kamati', 1400.00, 'bank_transfer', '2024-03-15', 'BT-20240315-001', 'March instalment', 'completed'),
  ('d0000000-0000-0000-0000-000000000001', 'John Kamati', 1400.00, 'mobile_money', '2024-04-16', 'MM-20240416-001', 'April instalment - 1 day late', 'completed'),
  ('d0000000-0000-0000-0000-000000000001', 'John Kamati', 1400.00, 'bank_transfer', '2024-05-15', 'BT-20240515-001', NULL, 'completed'),
  -- Maria Santos payments (LN-2024-0002)
  ('d0000000-0000-0000-0000-000000000002', 'Maria Santos', 1500.00, 'cash', '2024-03-01', 'CSH-20240301-001', 'Paid at office', 'completed'),
  ('d0000000-0000-0000-0000-000000000002', 'Maria Santos', 1500.00, 'mobile_money', '2024-04-01', 'MM-20240401-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000002', 'Maria Santos', 1000.00, 'cash', '2024-04-20', 'CSH-20240420-001', 'Partial payment', 'completed'),
  -- David Shilongo payments (LN-2024-0003)
  ('d0000000-0000-0000-0000-000000000003', 'David Shilongo', 1550.00, 'bank_transfer', '2024-02-20', 'BT-20240220-002', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000003', 'David Shilongo', 1550.00, 'bank_transfer', '2024-03-20', 'BT-20240320-002', NULL, 'completed'),
  -- Sarah Angula payments (LN-2024-0004)
  ('d0000000-0000-0000-0000-000000000004', 'Sarah Angula', 2450.00, 'bank_transfer', '2023-12-01', 'BT-20231201-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000004', 'Sarah Angula', 2450.00, 'bank_transfer', '2024-01-01', 'BT-20240101-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000004', 'Sarah Angula', 2450.00, 'bank_transfer', '2024-02-01', 'BT-20240201-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000004', 'Sarah Angula', 2450.00, 'bank_transfer', '2024-03-01', 'BT-20240301-002', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000004', 'Sarah Angula', 2450.00, 'bank_transfer', '2024-04-01', 'BT-20240401-002', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000004', 'Sarah Angula', 2450.00, 'bank_transfer', '2024-05-01', 'BT-20240501-001', NULL, 'completed'),
  -- Elizabeth Iipumbu payments (LN-2024-0006)
  ('d0000000-0000-0000-0000-000000000006', 'Elizabeth Iipumbu', 1120.00, 'mobile_money', '2024-02-10', 'MM-20240210-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000006', 'Elizabeth Iipumbu', 1120.00, 'cash', '2024-03-11', 'CSH-20240311-001', 'Paid at branch', 'completed'),
  ('d0000000-0000-0000-0000-000000000006', 'Elizabeth Iipumbu', 1120.00, 'mobile_money', '2024-04-10', 'MM-20240410-001', NULL, 'completed'),
  -- Michael Garoeb payments (LN-2024-0011)
  ('d0000000-0000-0000-0000-000000000011', 'Michael Garoeb', 1680.00, 'bank_transfer', '2024-02-25', 'BT-20240225-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000011', 'Michael Garoeb', 1680.00, 'bank_transfer', '2024-03-25', 'BT-20240325-001', NULL, 'completed'),
  -- Heinrich van Wyk payments (LN-2024-0014)
  ('d0000000-0000-0000-0000-000000000014', 'Heinrich van Wyk', 1240.00, 'bank_transfer', '2024-02-08', 'BT-20240208-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000014', 'Heinrich van Wyk', 1240.00, 'bank_transfer', '2024-03-08', 'BT-20240308-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000014', 'Heinrich van Wyk', 1240.00, 'bank_transfer', '2024-04-08', 'BT-20240408-001', NULL, 'completed'),
  -- Abraham Nghidinwa payments (LN-2024-0016)
  ('d0000000-0000-0000-0000-000000000016', 'Abraham Nghidinwa', 1520.00, 'bank_transfer', '2024-02-12', 'BT-20240212-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000016', 'Abraham Nghidinwa', 1520.00, 'bank_transfer', '2024-03-12', 'BT-20240312-001', NULL, 'completed'),
  -- Failed and pending payments
  ('d0000000-0000-0000-0000-000000000007', 'Grace Mweshihange', 950.00, 'mobile_money', '2024-03-15', 'MM-20240315-002', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000009', 'Frieda Shaanika', 930.00, 'cash', '2024-02-05', 'CSH-20240205-001', 'Paid in Katima Mulilo office', 'completed'),
  ('d0000000-0000-0000-0000-000000000009', 'Frieda Shaanika', 930.00, 'mobile_money', '2024-03-06', 'MM-20240306-001', NULL, 'completed'),
  ('d0000000-0000-0000-0000-000000000008', 'Hilma Nangolo', 1300.00, 'mobile_money', '2023-07-01', 'MM-20230701-001', 'Only payment before default', 'completed'),
  ('d0000000-0000-0000-0000-000000000018', 'Erastus Nekongo', 1590.00, 'bank_transfer', '2024-03-05', 'BT-20240305-003', NULL, 'completed');

-- ============================================================
-- BORROWER BLACKLIST (5 entries)
-- ============================================================
INSERT INTO borrower_blacklist (id, borrower_id, lender_id, reason, description, status, is_shared, outstanding_amount, blacklist_date) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'non_payment', 'Borrower defaulted on N$ 7,000 loan after making only one payment. Multiple contact attempts unsuccessful. Last known address: Rundu, Kavango East.', 'active', true, 5700.00, '2024-01-15'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000002', 'fraud', 'Submitted falsified employment letter from a non-existent company. Application was declined but flagged for fraud.', 'active', true, 0.00, '2024-02-10'),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'non_payment', 'Missed 3 consecutive payments on N$ 3,000 loan. Partial repayment received after debt collection. Remaining balance disputed.', 'dispute_filed', true, 1200.00, '2023-12-20'),
  ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000004', 'absconded', 'Borrower relocated without notifying lender. Contact details no longer valid. Loan balance of N$ 4,500 outstanding.', 'under_review', true, 4500.00, '2024-01-28'),
  ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000003', 'non_payment', 'Cleared after making full repayment including penalty fees. Good standing restored.', 'resolved', true, 0.00, '2023-08-15');

-- ============================================================
-- BORROWER DISPUTES (4 disputes)
-- ============================================================
INSERT INTO borrower_disputes (id, blacklist_id, dispute_number, reason, evidence_description, status, clearance_paid) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'DS-240301', 'I made two additional cash payments of N$ 600 each to the branch office in Oshakati that were not recorded in the system. I have receipts as proof.', 'Two cash payment receipts from QuickCash Oshakati branch dated Oct 2023 and Nov 2023.', 'pending', false),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 'DS-240210', 'I notified the lender of my relocation to Walvis Bay via email on 15 December 2023. I provided my new phone number and address. The lender did not update their records.', 'Email correspondence dated 15 Dec 2023 showing relocation notice sent to selma@erongolending.com.na.', 'under_review', false),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'DS-240115', 'The loan amount was incorrectly calculated. I was charged interest on the full amount instead of the reducing balance. I believe my actual outstanding amount is N$ 3,200.', 'Loan agreement copy showing reducing balance method was agreed upon.', 'pending', false),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', 'DS-231001', 'Dispute resolved. Full payment confirmed by lender. Clearance certificate issued.', 'Bank statement showing final transfer of N$ 2,800 to Coastal Cash on 10 Oct 2023.', 'resolved', true);

-- ============================================================
-- SCAM ALERTS (8 alerts)
-- ============================================================
INSERT INTO scam_alerts (title, description, type, severity, status, reporter_name, created_at) VALUES
  ('Fake ID document submitted by loan applicant', 'Applicant submitted a Namibian ID card with inconsistent font and alignment. ID number does not match NATIS records. Name: Petrus Shivute, claimed ID: 94050100999.', 'identity', 'critical', 'verified', 'James Nambahu', '2024-02-15T08:30:00Z'),
  ('Suspicious lender offering unrealistic rates', 'A company called "EasyMoney Namibia" is advertising 2% interest loans on Facebook with no NAMFISA license. Multiple borrowers have reported paying upfront fees with no loan disbursement.', 'lender', 'high', 'verified', 'Anna Shikongo', '2024-02-10T14:20:00Z'),
  ('Forged payslip from Ministry of Finance', 'Borrower Maria Haufiku submitted a payslip from Ministry of Finance showing a salary of N$ 35,000. Verification with the ministry confirms no employee by that name. Payslip has incorrect ministry letterhead.', 'document', 'high', 'investigating', 'Peter Garoeb', '2024-02-20T10:15:00Z'),
  ('Borrower using multiple identities', 'Borrower applied at three different lenders using different names but same phone number. Names used: Joseph Shikongo, Joseph Mutanga, Joseph Hamukwaya. Phone: +264 81 555 0000.', 'borrower', 'critical', 'verified', 'Selma Hangula', '2024-01-28T09:45:00Z'),
  ('Phishing SMS targeting CasHuB users', 'Multiple users reported receiving SMS messages claiming to be from CasHuB asking them to verify their accounts via a suspicious link (cashhub-verify.com). This is NOT an official CasHuB domain.', 'other', 'high', 'verified', 'CasHuB Operations', '2024-02-25T16:00:00Z'),
  ('Possible collusion between borrower and lender employee', 'Internal audit flagged loan LN-2024-0099 where approval was fast-tracked without standard credit checks. The borrower is allegedly a relative of the approving officer.', 'lender', 'medium', 'investigating', 'Super Admin', '2024-03-01T11:30:00Z'),
  ('Stolen ID used for loan application', 'Mr. Jonas Shilongo reported his ID was stolen in November 2023. A loan of N$ 10,000 was taken out in his name at Coastal Cash in December 2023. Police case number: CR 45/12/2023.', 'identity', 'critical', 'pending', 'Thomas Eiseb', '2024-03-05T08:00:00Z'),
  ('Low-risk: Duplicate account inquiry', 'Borrower created two accounts with different email addresses but same ID number. Appears unintentional - borrower forgot previous registration. No fraudulent activity detected.', 'borrower', 'low', 'dismissed', 'James Nambahu', '2024-01-15T13:00:00Z');

-- ============================================================
-- LENDER ONBOARDING (6 requests)
-- ============================================================
INSERT INTO lender_onboarding (company_name, legal_name, registration_number, contact_person, email, phone, address, city, namfisa_license, years_in_business, total_borrowers, monthly_disbursement, package_tier, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, notes) VALUES
  ('QuickCash Finance', 'QuickCash Finance (Pty) Ltd', 'RC2024/00145', 'James Nambahu', 'james@quickcash.com.na', '+264 81 234 5678', '15 Independence Ave', 'Windhoek', 'ML-2024-0089', 5, 320, 450000.00, 'advanced', 'approved', '2024-01-10T09:30:00Z', '2024-01-12T14:00:00Z', 'Super Admin', NULL, 'Established lender with strong track record. NAMFISA compliant.'),
  ('NamFin Micro', 'NamFin Microlenders CC', 'RC2023/00892', 'Anna Shikongo', 'anna@namfin.com.na', '+264 81 345 6789', '42 Sam Nujoma Drive', 'Oshakati', 'ML-2023-0156', 3, 150, 180000.00, 'medium', 'approved', '2024-01-15T11:00:00Z', '2024-01-17T10:30:00Z', 'Super Admin', NULL, 'Good coverage in northern regions.'),
  ('Windhoek Quick Loans', 'Windhoek Quick Loans CC', 'RC2024/00567', 'Martin Amupadhi', 'martin@whkloans.com.na', '+264 81 777 8888', '88 John Meinert St', 'Windhoek', NULL, 1, 45, 60000.00, 'basic', 'pending', '2024-03-01T08:00:00Z', NULL, NULL, NULL, 'New applicant. Awaiting NAMFISA license verification.'),
  ('Oshana Microfinance', 'Oshana Microfinance (Pty) Ltd', 'RC2024/00789', 'Helena Ndeutapo', 'helena@oshanamf.com.na', '+264 65 220 1234', '12 Main Road', 'Ongwediva', 'ML-2024-0112', 2, 80, 95000.00, 'medium', 'under_review', '2024-02-20T09:15:00Z', NULL, NULL, NULL, 'Documents submitted. Credit bureau check in progress.'),
  ('Fast Cash Namibia', 'Fast Cash Namibia CC', 'RC2023/01234', 'Robert Shipanga', 'robert@fastcash.com.na', '+264 81 999 0000', '5 Independence Ave', 'Windhoek', NULL, 0, 0, 0.00, 'free-trial', 'rejected', '2024-01-25T15:00:00Z', '2024-01-28T09:00:00Z', 'Super Admin', 'No NAMFISA license. Registration number could not be verified with BIPA. Applicant has no prior microlending experience.', NULL),
  ('Caprivi Lending Solutions', 'Caprivi Lending Solutions CC', 'RC2022/00456', 'Daniel Masule', 'daniel@caprivilend.com.na', '+264 66 252 3456', '34 Ngoma Road', 'Katima Mulilo', 'ML-2022-0198', 4, 110, 130000.00, 'medium', 'suspended', '2023-11-05T10:00:00Z', '2024-02-01T16:00:00Z', 'Super Admin', NULL, 'Suspended pending investigation into customer complaints regarding hidden fees. NAMFISA inquiry ref: INQ-2024-0034.');

-- ============================================================
-- LENDER SUBSCRIPTIONS (5 subscriptions)
-- ============================================================
INSERT INTO lender_subscriptions (lender_id, package_id, package_name, status, start_date, end_date, auto_renew, amount) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'advanced', 'Advanced', 'ACTIVE', '2024-01-12', '2025-01-12', true, 1999.00),
  ('b0000000-0000-0000-0000-000000000002', 'medium', 'Medium', 'ACTIVE', '2024-01-17', '2025-01-17', true, 999.00),
  ('b0000000-0000-0000-0000-000000000003', 'basic', 'Basic', 'ACTIVE', '2024-02-01', '2025-02-01', true, 499.00),
  ('b0000000-0000-0000-0000-000000000004', 'medium', 'Medium', 'ACTIVE', '2024-01-20', '2025-01-20', false, 999.00),
  ('b0000000-0000-0000-0000-000000000005', 'free-trial', 'Free Trial', 'TRIAL', '2024-03-01', '2024-03-31', false, 0.00);

-- ============================================================
-- NAMFISA REPORTS (6 compliance reports)
-- ============================================================
INSERT INTO namfisa_reports (lender_id, report_type, report_period, status, submitted_at, due_date, notes) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'quarterly_financial', 'Q4 2023', 'submitted', '2024-01-25T10:00:00Z', '2024-01-31', 'Quarterly financial statement submitted on time.'),
  ('b0000000-0000-0000-0000-000000000001', 'loan_portfolio', 'Q4 2023', 'submitted', '2024-01-20T14:30:00Z', '2024-01-31', 'Portfolio analysis showing 5% default rate, within acceptable range.'),
  ('b0000000-0000-0000-0000-000000000002', 'quarterly_financial', 'Q4 2023', 'submitted', '2024-01-28T09:00:00Z', '2024-01-31', 'Financial statements reviewed and submitted.'),
  ('b0000000-0000-0000-0000-000000000003', 'quarterly_financial', 'Q4 2023', 'overdue', NULL, '2024-01-31', 'Report not yet submitted. Reminder sent to lender.'),
  ('b0000000-0000-0000-0000-000000000001', 'quarterly_financial', 'Q1 2024', 'pending', NULL, '2024-04-30', 'Upcoming submission for Q1 2024.'),
  ('b0000000-0000-0000-0000-000000000002', 'capital_adequacy', 'Annual 2023', 'submitted', '2024-02-15T11:00:00Z', '2024-02-28', 'Capital reserves meet minimum requirements. CAR: 18.5%.');

-- ============================================================
-- LOAN SIGNATURES (3 signed agreements)
-- ============================================================
INSERT INTO loan_signatures (loan_number, borrower_name, borrower_email, signature_method, signed_at) VALUES
  ('LN-2024-0001', 'John Kamati', 'john.kamati@gmail.com', 'digital', '2024-01-15T10:30:00Z'),
  ('LN-2024-0002', 'Maria Santos', 'maria.santos@iway.na', 'otp', '2024-02-01T14:15:00Z'),
  ('LN-2024-0003', 'David Shilongo', 'david.shilongo@yahoo.com', 'digital', '2024-01-20T09:45:00Z');

-- ============================================================
-- DONE! Verify with:
-- SELECT 'users' as tbl, count(*) FROM users
-- UNION ALL SELECT 'lenders', count(*) FROM lenders
-- UNION ALL SELECT 'borrowers', count(*) FROM borrowers
-- UNION ALL SELECT 'loans', count(*) FROM loans
-- UNION ALL SELECT 'loan_applications', count(*) FROM loan_applications
-- UNION ALL SELECT 'payments', count(*) FROM payments
-- UNION ALL SELECT 'borrower_blacklist', count(*) FROM borrower_blacklist
-- UNION ALL SELECT 'borrower_disputes', count(*) FROM borrower_disputes
-- UNION ALL SELECT 'scam_alerts', count(*) FROM scam_alerts
-- UNION ALL SELECT 'lender_onboarding', count(*) FROM lender_onboarding
-- UNION ALL SELECT 'lender_subscriptions', count(*) FROM lender_subscriptions
-- UNION ALL SELECT 'namfisa_reports', count(*) FROM namfisa_reports
-- UNION ALL SELECT 'loan_signatures', count(*) FROM loan_signatures;
-- ============================================================
