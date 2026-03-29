-- ============================================================
-- FIX: Allow signup records even without email confirmation
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================

-- Add ALL missing columns first (safe)
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE lender_onboarding ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE scam_alerts ADD COLUMN IF NOT EXISTS alert_type TEXT DEFAULT 'fraud';
ALTER TABLE scam_alerts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE scam_alerts ADD COLUMN IF NOT EXISTS suspect_name TEXT;
ALTER TABLE scam_alerts ADD COLUMN IF NOT EXISTS suspect_id TEXT;
ALTER TABLE scam_alerts ADD COLUMN IF NOT EXISTS submitted_by TEXT;
ALTER TABLE scam_alerts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC;
ALTER TABLE borrowers ALTER COLUMN id_number DROP NOT NULL;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS interest_rate NUMERIC DEFAULT 20;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS marketplace_application_id UUID REFERENCES marketplace_applications(id) ON DELETE SET NULL;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE borrower_blacklist ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE marketplace_applications ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Create borrower_documents table for KYC uploads
CREATE TABLE IF NOT EXISTS borrower_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  borrower_email TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_data TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for borrower_documents
DROP POLICY IF EXISTS "Allow auth read borrower_documents" ON borrower_documents;
CREATE POLICY "Allow auth read borrower_documents" ON borrower_documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow auth insert borrower_documents" ON borrower_documents;
CREATE POLICY "Allow auth insert borrower_documents" ON borrower_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow auth update borrower_documents" ON borrower_documents;
CREATE POLICY "Allow auth update borrower_documents" ON borrower_documents FOR UPDATE TO authenticated USING (true);

-- Allow anonymous (unauthenticated) inserts for signup flow
DROP POLICY IF EXISTS "Allow anon insert users" ON users;
CREATE POLICY "Allow anon insert users" ON users FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow anon insert lender_onboarding" ON lender_onboarding FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert lenders" ON lenders;
CREATE POLICY "Allow anon insert lenders" ON lenders FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert borrowers" ON borrowers;
CREATE POLICY "Allow anon insert borrowers" ON borrowers FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated reads and writes for all tables
DROP POLICY IF EXISTS "Allow auth read users" ON users;
CREATE POLICY "Allow auth read users" ON users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth update users" ON users;
CREATE POLICY "Allow auth update users" ON users FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth read lenders" ON lenders;
CREATE POLICY "Allow auth read lenders" ON lenders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth update lenders" ON lenders;
CREATE POLICY "Allow auth update lenders" ON lenders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth read lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow auth read lender_onboarding" ON lender_onboarding FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth update lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow auth update lender_onboarding" ON lender_onboarding FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth read borrowers" ON borrowers;
CREATE POLICY "Allow auth read borrowers" ON borrowers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth update borrowers" ON borrowers;
CREATE POLICY "Allow auth update borrowers" ON borrowers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth read loans" ON loans;
CREATE POLICY "Allow auth read loans" ON loans FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth insert loans" ON loans;
CREATE POLICY "Allow auth insert loans" ON loans FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth update loans" ON loans;
CREATE POLICY "Allow auth update loans" ON loans FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth read loan_applications" ON loan_applications;
CREATE POLICY "Allow auth read loan_applications" ON loan_applications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow auth insert loan_applications" ON loan_applications;
CREATE POLICY "Allow auth insert loan_applications" ON loan_applications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth update loan_applications" ON loan_applications;
CREATE POLICY "Allow auth update loan_applications" ON loan_applications FOR UPDATE TO authenticated USING (true);

-- Allow authenticated inserts/reads for payments
DROP POLICY IF EXISTS "Allow auth insert payments" ON payments;
CREATE POLICY "Allow auth insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow auth read payments" ON payments;
CREATE POLICY "Allow auth read payments" ON payments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow auth update payments" ON payments;
CREATE POLICY "Allow auth update payments" ON payments FOR UPDATE TO authenticated USING (true);

-- Link existing records by email
UPDATE lenders l SET user_id = u.id FROM users u WHERE l.email = u.email AND l.user_id IS NULL;
UPDATE lender_onboarding lo SET user_id = u.id FROM users u WHERE lo.email = u.email AND lo.user_id IS NULL;
UPDATE borrowers b SET user_id = u.id FROM users u WHERE b.email = u.email AND b.user_id IS NULL;

-- Backfill borrowers from existing loan_applications (where email exists and no borrower record yet)
INSERT INTO borrowers (first_name, last_name, email, lender_id, status, risk_level)
SELECT DISTINCT
  la.borrower_first_name,
  la.borrower_last_name,
  la.borrower_email,
  la.lender_id,
  'active',
  'medium'
FROM loan_applications la
WHERE la.borrower_email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM borrowers b
    WHERE b.email = la.borrower_email
      AND (b.lender_id = la.lender_id OR b.lender_id IS NULL)
  );

-- Backfill loans from approved loan_applications (where no loan record yet)
INSERT INTO loans (loan_number, borrower_id, lender_id, principal_amount, outstanding_balance, interest_rate, term_months, status, purpose, start_date)
SELECT
  'L-' || UPPER(SUBSTRING(la.id::text, 1, 8)),
  b.id,
  la.lender_id,
  la.loan_amount,
  la.loan_amount,
  COALESCE(la.interest_rate, 20),
  COALESCE(la.loan_term, 12),
  'active',
  la.loan_purpose,
  CURRENT_DATE
FROM loan_applications la
JOIN borrowers b ON b.email = la.borrower_email AND (b.lender_id = la.lender_id OR b.lender_id IS NULL)
WHERE la.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM loans l WHERE l.loan_number = 'L-' || UPPER(SUBSTRING(la.id::text, 1, 8))
  );

-- Link loans to lenders via their borrowers
UPDATE loans l SET lender_id = b.lender_id
  FROM borrowers b
  WHERE l.borrower_id = b.id AND l.lender_id IS NULL AND b.lender_id IS NOT NULL;

-- Link payments to lenders via their loans
UPDATE payments p SET lender_id = l.lender_id
  FROM loans l
  WHERE p.loan_id = l.id AND p.lender_id IS NULL AND l.lender_id IS NOT NULL;

-- Fix package_tier check constraint to allow signup package names
ALTER TABLE lender_onboarding DROP CONSTRAINT IF EXISTS lender_onboarding_package_tier_check;
ALTER TABLE lender_onboarding ADD CONSTRAINT lender_onboarding_package_tier_check
  CHECK (package_tier IN ('free-trial', 'basic', 'medium', 'advanced', 'starter', 'professional', 'enterprise'));

-- Verification
SELECT 'lender_onboarding' as tbl, COUNT(*) as count FROM lender_onboarding
UNION ALL SELECT 'lenders', COUNT(*) FROM lenders
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'borrowers', COUNT(*) FROM borrowers;

SELECT 'SUCCESS' as status;

-- Activate all existing lenders (backward compatibility)
UPDATE lenders SET is_active = true WHERE is_active IS NULL;


-- ============================================================
-- CRITICAL BACKFILL: Fix null lender_id on existing records
-- ============================================================

-- Step 1: Add missing columns to loans table if not present
ALTER TABLE loans ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_application_id UUID REFERENCES loan_applications(id) ON DELETE SET NULL;

-- Step 2: Backfill loan_applications.lender_id via lender_email match
UPDATE loan_applications la
SET lender_id = l.id
FROM lenders l
WHERE la.lender_email = l.email
  AND la.lender_id IS NULL;

-- Step 3: Backfill borrowers.lender_id via loan_applications
UPDATE borrowers b
SET lender_id = la.lender_id
FROM loan_applications la
WHERE la.borrower_email = b.email
  AND la.lender_id IS NOT NULL
  AND b.lender_id IS NULL;

-- Step 4: Backfill loans.lender_id via borrowers
UPDATE loans lo
SET lender_id = b.lender_id
FROM borrowers b
WHERE lo.borrower_id = b.id
  AND b.lender_id IS NOT NULL
  AND lo.lender_id IS NULL;

-- Step 5: Backfill loans.lender_id via loan_application_id
UPDATE loans lo
SET lender_id = la.lender_id
FROM loan_applications la
WHERE lo.loan_application_id = la.id
  AND la.lender_id IS NOT NULL
  AND lo.lender_id IS NULL;

-- Step 6: Backfill loans.borrower_email from borrowers table
UPDATE loans lo
SET borrower_email = b.email
FROM borrowers b
WHERE lo.borrower_id = b.id
  AND lo.borrower_email IS NULL
  AND b.email IS NOT NULL;

-- Step 7: Backfill loans.lender_id via borrower_email through loan_applications
UPDATE loans lo
SET lender_id = la.lender_id
FROM loan_applications la
WHERE lo.borrower_email = la.borrower_email
  AND la.lender_id IS NOT NULL
  AND lo.lender_id IS NULL;

-- Step 8: Create loans for approved/disbursed applications that have no loan yet
INSERT INTO loans (loan_number, borrower_id, borrower_email, lender_id, loan_application_id, principal_amount, outstanding_balance, interest_rate, term_months, status, purpose, start_date)
SELECT
  'LA-' || UPPER(SUBSTRING(la.id::text, 1, 12)),
  b.id,
  la.borrower_email,
  la.lender_id,
  la.id,
  la.loan_amount,
  la.loan_amount,
  COALESCE(la.interest_rate, 20),
  COALESCE(la.loan_term, 12),
  'active',
  COALESCE(la.loan_purpose, 'General'),
  CURRENT_DATE
FROM loan_applications la
LEFT JOIN borrowers b ON b.email = la.borrower_email AND (b.lender_id = la.lender_id OR b.lender_id IS NULL)
WHERE la.status IN ('approved', 'disbursed')
  AND la.loan_amount > 0
  AND NOT EXISTS (
    SELECT 1 FROM loans l2
    WHERE l2.loan_application_id = la.id
  )
ON CONFLICT (loan_number) DO NOTHING;

SELECT 'BACKFILL COMPLETE' as status;
