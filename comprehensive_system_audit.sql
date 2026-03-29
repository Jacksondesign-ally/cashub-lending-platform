-- ============================================================
-- COMPREHENSIVE SYSTEM AUDIT & FIX
-- Run this in Supabase SQL Editor to diagnose and fix all issues
-- ============================================================

-- STEP 1: Verify all required tables exist
SELECT 
  'Tables Audit' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('users', 'lenders', 'lender_onboarding', 'borrowers', 'loans', 'loan_applications', 'lender_subscriptions') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'lenders', 'lender_onboarding', 'borrowers', 'loans', 'loan_applications', 'lender_subscriptions')
ORDER BY table_name;

-- STEP 2: Check critical columns in each table
SELECT 
  'Column Audit' as check_type,
  'users table' as location,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN '✅' ELSE '❌' END as has_role,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lender_id') THEN '✅' ELSE '❌' END as has_lender_id,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN '✅' ELSE '❌' END as has_is_active;

SELECT 
  'Column Audit' as check_type,
  'lenders table' as location,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lenders' AND column_name = 'user_id') THEN '✅' ELSE '❌' END as has_user_id,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lenders' AND column_name = 'email') THEN '✅' ELSE '❌' END as has_email,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lenders' AND column_name = 'is_active') THEN '✅' ELSE '❌' END as has_is_active;

SELECT 
  'Column Audit' as check_type,
  'lender_onboarding table' as location,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lender_onboarding' AND column_name = 'user_id') THEN '✅' ELSE '❌' END as has_user_id,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lender_onboarding' AND column_name = 'email') THEN '✅' ELSE '❌' END as has_email,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lender_onboarding' AND column_name = 'status') THEN '✅' ELSE '❌' END as has_status;

SELECT 
  'Column Audit' as check_type,
  'borrowers table' as location,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrowers' AND column_name = 'user_id') THEN '✅' ELSE '❌' END as has_user_id,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrowers' AND column_name = 'lender_id') THEN '✅' ELSE '❌' END as has_lender_id,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrowers' AND column_name = 'employment_status') THEN '✅' ELSE '❌' END as has_employment_status;

-- STEP 3: Check actual data counts
SELECT 'Data Count Audit' as check_type, 'users' as table_name, COUNT(*) as total_records FROM users;
SELECT 'Data Count Audit' as check_type, 'lenders' as table_name, COUNT(*) as total_records FROM lenders;
SELECT 'Data Count Audit' as check_type, 'lender_onboarding' as table_name, COUNT(*) as total_records FROM lender_onboarding;
SELECT 'Data Count Audit' as check_type, 'borrowers' as table_name, COUNT(*) as total_records FROM borrowers;
SELECT 'Data Count Audit' as check_type, 'loans' as table_name, COUNT(*) as total_records FROM loans;
SELECT 'Data Count Audit' as check_type, 'loan_applications' as table_name, COUNT(*) as total_records FROM loan_applications;

-- STEP 4: Check lender onboarding records with details
SELECT 
  'Lender Onboarding Details' as check_type,
  id,
  company_name,
  email,
  status,
  user_id,
  submitted_at,
  CASE WHEN user_id IS NULL THEN '⚠️ NO USER_ID' ELSE '✅ HAS USER_ID' END as user_link_status
FROM lender_onboarding
ORDER BY submitted_at DESC
LIMIT 10;

-- STEP 5: Check lenders table with details
SELECT 
  'Lenders Details' as check_type,
  id,
  company_name,
  email,
  is_active,
  user_id,
  created_at,
  CASE WHEN user_id IS NULL THEN '⚠️ NO USER_ID' ELSE '✅ HAS USER_ID' END as user_link_status,
  CASE WHEN is_active THEN '✅ ACTIVE' ELSE '❌ INACTIVE' END as active_status
FROM lenders
ORDER BY created_at DESC
LIMIT 10;

-- STEP 6: Check borrowers with lender linkage
SELECT 
  'Borrowers Details' as check_type,
  id,
  first_name,
  last_name,
  email,
  lender_id,
  user_id,
  created_at,
  CASE WHEN lender_id IS NULL THEN '⚠️ NO LENDER_ID' ELSE '✅ HAS LENDER_ID' END as lender_link_status,
  CASE WHEN user_id IS NULL THEN '⚠️ NO USER_ID' ELSE '✅ HAS USER_ID' END as user_link_status
FROM borrowers
ORDER BY created_at DESC
LIMIT 10;

-- STEP 7: Check RLS policies (this will show if policies are blocking reads)
SELECT 
  'RLS Policy Audit' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'lenders', 'lender_onboarding', 'borrowers', 'loans', 'loan_applications')
ORDER BY tablename, policyname;

-- STEP 8: Check if RLS is enabled on tables
SELECT 
  'RLS Status' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN '🔒 RLS ENABLED' ELSE '🔓 RLS DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'lenders', 'lender_onboarding', 'borrowers', 'loans', 'loan_applications')
ORDER BY tablename;

-- ============================================================
-- FIXES: Run these if issues are found
-- ============================================================

-- FIX 1: Add missing columns
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;

ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;

ALTER TABLE lender_onboarding ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- FIX 2: Disable RLS temporarily for testing (ONLY FOR DEBUGGING - RE-ENABLE AFTER)
-- Uncomment these ONLY if you need to test if RLS is blocking reads
-- ALTER TABLE lender_onboarding DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE lenders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE borrowers DISABLE ROW LEVEL SECURITY;

-- FIX 3: Create permissive RLS policies that allow reads for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to read lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow authenticated users to read lender_onboarding"
  ON lender_onboarding FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read lenders" ON lenders;
CREATE POLICY "Allow authenticated users to read lenders"
  ON lenders FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read borrowers" ON borrowers;
CREATE POLICY "Allow authenticated users to read borrowers"
  ON borrowers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow authenticated users to insert lender_onboarding"
  ON lender_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert lenders" ON lenders;
CREATE POLICY "Allow authenticated users to insert lenders"
  ON lenders FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert borrowers" ON borrowers;
CREATE POLICY "Allow authenticated users to insert borrowers"
  ON borrowers FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow authenticated users to update lender_onboarding"
  ON lender_onboarding FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update lenders" ON lenders;
CREATE POLICY "Allow authenticated users to update lenders"
  ON lenders FOR UPDATE
  TO authenticated
  USING (true);

-- FIX 4: Link existing lender_onboarding records to lenders table by email
UPDATE lender_onboarding lo
SET user_id = l.user_id
FROM lenders l
WHERE lo.email = l.email
  AND lo.user_id IS NULL;

-- FIX 5: Ensure all lenders have corresponding onboarding records
INSERT INTO lender_onboarding (
  user_id, company_name, legal_name, email, contact_person, 
  status, package_tier, submitted_at
)
SELECT 
  l.user_id,
  l.company_name,
  l.legal_name,
  l.email,
  u.full_name,
  CASE WHEN l.is_active THEN 'approved' ELSE 'pending' END,
  'professional',
  l.created_at
FROM lenders l
LEFT JOIN users u ON l.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM lender_onboarding lo WHERE lo.email = l.email
);

-- ============================================================
-- VERIFICATION: Run these after fixes
-- ============================================================

-- Verify lender onboarding is visible
SELECT 
  'VERIFICATION: Lender Onboarding' as check_type,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM lender_onboarding;

-- Verify lenders are visible
SELECT 
  'VERIFICATION: Lenders' as check_type,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM lenders;

-- Verify borrowers are visible
SELECT 
  'VERIFICATION: Borrowers' as check_type,
  COUNT(*) as total_records,
  COUNT(CASE WHEN lender_id IS NOT NULL THEN 1 END) as with_lender_id,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM borrowers;

SELECT '✅ AUDIT AND FIXES COMPLETED' as status;
