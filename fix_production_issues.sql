-- ============================================================
-- FIX PRODUCTION ISSUES - Run in Supabase SQL Editor
-- ============================================================

-- Issue #1: Add missing employment_status column to borrowers
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS region TEXT;

-- Issue #2: Ensure lender_id column exists in all tables for data isolation
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL;

-- Issue #3: Add user_id to lender_onboarding for approval workflow
ALTER TABLE lender_onboarding ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Verify tables exist
SELECT 'Tables verified' as status;
