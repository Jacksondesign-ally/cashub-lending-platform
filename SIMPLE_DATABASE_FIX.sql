-- ============================================================
-- SIMPLE DATABASE FIX - Safe version that won't error
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: Add missing columns (safe - won't error if already exists)
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE lender_onboarding ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE lender_subscriptions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- STEP 2: Create RLS policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Enable read for authenticated users" ON lender_onboarding;
CREATE POLICY "Enable read for authenticated users" ON lender_onboarding FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lender_onboarding;
CREATE POLICY "Enable insert for authenticated users" ON lender_onboarding FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON lender_onboarding;
CREATE POLICY "Enable update for authenticated users" ON lender_onboarding FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON lenders;
CREATE POLICY "Enable read for authenticated users" ON lenders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lenders;
CREATE POLICY "Enable insert for authenticated users" ON lenders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON lenders;
CREATE POLICY "Enable update for authenticated users" ON lenders FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON borrowers;
CREATE POLICY "Enable read for authenticated users" ON borrowers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON borrowers;
CREATE POLICY "Enable insert for authenticated users" ON borrowers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON borrowers;
CREATE POLICY "Enable update for authenticated users" ON borrowers FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON users;
CREATE POLICY "Enable read for authenticated users" ON users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;
CREATE POLICY "Enable update for authenticated users" ON users FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON loans;
CREATE POLICY "Enable read for authenticated users" ON loans FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON loans;
CREATE POLICY "Enable insert for authenticated users" ON loans FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON loan_applications;
CREATE POLICY "Enable read for authenticated users" ON loan_applications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON loan_applications;
CREATE POLICY "Enable insert for authenticated users" ON loan_applications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON loan_applications;
CREATE POLICY "Enable update for authenticated users" ON loan_applications FOR UPDATE TO authenticated USING (true);

-- STEP 3: Link existing records
UPDATE lenders l SET user_id = u.id FROM users u WHERE l.email = u.email AND l.user_id IS NULL;
UPDATE lender_onboarding lo SET user_id = u.id FROM users u WHERE lo.email = u.email AND lo.user_id IS NULL;
UPDATE borrowers b SET user_id = u.id FROM users u WHERE b.email = u.email AND b.user_id IS NULL;

-- STEP 4: Simple verification
SELECT 'Lender Onboarding' as table_name, COUNT(*) as count FROM lender_onboarding;
SELECT 'Lenders' as table_name, COUNT(*) as count FROM lenders;
SELECT 'Borrowers' as table_name, COUNT(*) as count FROM borrowers;
SELECT 'Users' as table_name, COUNT(*) as count FROM users;

SELECT '✅ DATABASE FIX COMPLETED!' as status;
