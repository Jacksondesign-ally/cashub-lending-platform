-- ============================================================
-- CRITICAL DATABASE FIX - Run this FIRST
-- This fixes all missing columns and RLS policies
-- ============================================================

-- STEP 1: Add ALL missing columns to ALL tables
-- This must be done FIRST before any data linking

-- Add missing columns to lenders table
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add missing columns to borrowers table
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS region TEXT;

-- Add missing columns to loans table
ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;

-- Add missing columns to loan_applications table
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;

-- Add missing columns to lender_onboarding table
ALTER TABLE lender_onboarding ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add missing columns to lender_subscriptions table
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

SELECT '✅ STEP 1 COMPLETED: All missing columns added' as status;

-- ============================================================
-- STEP 2: Fix RLS Policies - Allow authenticated users to access data
-- ============================================================

-- Lender Onboarding Policies
DROP POLICY IF EXISTS "Allow authenticated users to read lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow authenticated users to read lender_onboarding"
  ON lender_onboarding FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow authenticated users to insert lender_onboarding"
  ON lender_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update lender_onboarding" ON lender_onboarding;
CREATE POLICY "Allow authenticated users to update lender_onboarding"
  ON lender_onboarding FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lenders Policies
DROP POLICY IF EXISTS "Allow authenticated users to read lenders" ON lenders;
CREATE POLICY "Allow authenticated users to read lenders"
  ON lenders FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert lenders" ON lenders;
CREATE POLICY "Allow authenticated users to insert lenders"
  ON lenders FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update lenders" ON lenders;
CREATE POLICY "Allow authenticated users to update lenders"
  ON lenders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Borrowers Policies
DROP POLICY IF EXISTS "Allow authenticated users to read borrowers" ON borrowers;
CREATE POLICY "Allow authenticated users to read borrowers"
  ON borrowers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert borrowers" ON borrowers;
CREATE POLICY "Allow authenticated users to insert borrowers"
  ON borrowers FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update borrowers" ON borrowers;
CREATE POLICY "Allow authenticated users to update borrowers"
  ON borrowers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Users Policies
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
CREATE POLICY "Allow authenticated users to update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Loans Policies
DROP POLICY IF EXISTS "Allow authenticated users to read loans" ON loans;
CREATE POLICY "Allow authenticated users to read loans"
  ON loans FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert loans" ON loans;
CREATE POLICY "Allow authenticated users to insert loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Loan Applications Policies
DROP POLICY IF EXISTS "Allow authenticated users to read loan_applications" ON loan_applications;
CREATE POLICY "Allow authenticated users to read loan_applications"
  ON loan_applications FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert loan_applications" ON loan_applications;
CREATE POLICY "Allow authenticated users to insert loan_applications"
  ON loan_applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update loan_applications" ON loan_applications;
CREATE POLICY "Allow authenticated users to update loan_applications"
  ON loan_applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

SELECT '✅ STEP 2 COMPLETED: All RLS policies created' as status;

-- ============================================================
-- STEP 3: Link existing data (user_id connections)
-- ============================================================

-- Link lenders to users by email
UPDATE lenders l
SET user_id = u.id
FROM users u
WHERE l.email = u.email
  AND l.user_id IS NULL
  AND u.role IN ('lender', 'lender_admin', 'loan_officer');

-- Link lender_onboarding to users by email
UPDATE lender_onboarding lo
SET user_id = u.id
FROM users u
WHERE lo.email = u.email
  AND lo.user_id IS NULL;

-- Link borrowers to users by email
UPDATE borrowers b
SET user_id = u.id
FROM users u
WHERE b.email = u.email
  AND b.user_id IS NULL
  AND u.role = 'borrower';

SELECT '✅ STEP 3 COMPLETED: Existing records linked to users' as status;

-- ============================================================
-- STEP 4: Create missing onboarding records for existing lenders
-- ============================================================

INSERT INTO lender_onboarding (
  user_id, 
  company_name, 
  legal_name, 
  email, 
  contact_person, 
  status, 
  package_tier, 
  submitted_at
)
SELECT 
  l.user_id,
  l.company_name,
  l.legal_name,
  l.email,
  COALESCE(u.full_name, 'Admin'),
  CASE WHEN l.is_active THEN 'approved' ELSE 'pending' END,
  'professional',
  COALESCE(l.created_at, NOW())
FROM lenders l
LEFT JOIN users u ON l.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM lender_onboarding lo WHERE lo.email = l.email
)
ON CONFLICT DO NOTHING;

SELECT '✅ STEP 4 COMPLETED: Missing onboarding records created' as status;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check lender onboarding records
SELECT 
  'Lender Onboarding' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM lender_onboarding;

-- Check lenders records
SELECT 
  'Lenders' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active THEN 1 END) as active,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM lenders;

-- Check borrowers records
SELECT 
  'Borrowers' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN lender_id IS NOT NULL THEN 1 END) as with_lender_id,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM borrowers;

-- Check users records
SELECT 
  'Users' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN role = 'lender_admin' THEN 1 END) as lenders,
  COUNT(CASE WHEN role = 'borrower' THEN 1 END) as borrowers,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as admins
FROM users;

-- Show recent lender onboarding records
SELECT 
  'Recent Lender Onboarding Records' as info,
  id,
  company_name,
  email,
  status,
  CASE WHEN user_id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as user_link,
  submitted_at
FROM lender_onboarding
ORDER BY submitted_at DESC
LIMIT 5;

-- Show recent lenders
SELECT 
  'Recent Lenders' as info,
  id,
  company_name,
  email,
  is_active,
  CASE WHEN user_id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as user_link,
  created_at
FROM lenders
ORDER BY created_at DESC
LIMIT 5;

-- Show recent borrowers
SELECT 
  'Recent Borrowers' as info,
  id,
  first_name,
  last_name,
  email,
  CASE WHEN lender_id IS NOT NULL THEN '✅ Has Lender' ELSE '❌ No Lender' END as lender_link,
  CASE WHEN user_id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as user_link,
  created_at
FROM borrowers
ORDER BY created_at DESC
LIMIT 5;

SELECT '🎉 DATABASE FIX COMPLETED SUCCESSFULLY!' as final_status;
