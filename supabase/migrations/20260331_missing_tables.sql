-- ============================================================
-- Missing tables required by the application
-- ============================================================

-- borrower_documents (used by KYC Review + Borrower Portal Documents tab)
CREATE TABLE IF NOT EXISTS borrower_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id UUID,
  borrower_email TEXT,
  document_type TEXT NOT NULL DEFAULT 'identity',
  document_name TEXT NOT NULL,
  file_data TEXT,
  file_url TEXT,
  file_size INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS borrower_documents_email_idx ON borrower_documents(borrower_email);
CREATE INDEX IF NOT EXISTS borrower_documents_borrower_id_idx ON borrower_documents(borrower_id);

-- loan_agreements (used by Lender Agreements page + Borrower Agreement page)
CREATE TABLE IF NOT EXISTS loan_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID,
  loan_number TEXT,
  lender_id UUID,
  borrower_id UUID,
  principal_amount NUMERIC(12,2) DEFAULT 0,
  total_repayable NUMERIC(12,2) DEFAULT 0,
  instalment_amount NUMERIC(12,2) DEFAULT 0,
  number_of_instalments INTEGER DEFAULT 0,
  first_instalment_date DATE,
  last_instalment_date DATE,
  penalty_rate NUMERIC(5,2) DEFAULT 5,
  finance_charge_rate NUMERIC(5,2) DEFAULT 0,
  finance_charge_amount NUMERIC(12,2) DEFAULT 0,
  borrower_signature_url TEXT,
  borrower_signed_at TIMESTAMPTZ,
  lender_signature_url TEXT,
  lender_signed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'borrower_signed', 'lender_signed', 'fully_signed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Ensure lender_id and borrower_id columns exist (idempotent for existing tables)
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS loan_id UUID;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS loan_number TEXT;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS lender_id UUID;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS borrower_id UUID;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS principal_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS total_repayable NUMERIC(12,2) DEFAULT 0;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS instalment_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS number_of_instalments INTEGER DEFAULT 0;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS first_instalment_date DATE;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS last_instalment_date DATE;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS penalty_rate NUMERIC(5,2) DEFAULT 5;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS finance_charge_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS finance_charge_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS borrower_signature_url TEXT;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS borrower_signed_at TIMESTAMPTZ;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS lender_signature_url TEXT;
ALTER TABLE loan_agreements ADD COLUMN IF NOT EXISTS lender_signed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS loan_agreements_lender_id_idx ON loan_agreements(lender_id);
CREATE INDEX IF NOT EXISTS loan_agreements_borrower_id_idx ON loan_agreements(borrower_id);

-- compliance_requirements (used by Compliance page Requirements tab)
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'reporting' CHECK (category IN ('reporting', 'capital', 'risk', 'governance', 'consumer_protection')),
  frequency TEXT DEFAULT 'quarterly' CHECK (frequency IN ('monthly', 'quarterly', 'annually')),
  due_date DATE,
  next_due DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('compliant', 'pending', 'overdue', 'non_compliant')),
  last_completed DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default compliance requirements
INSERT INTO compliance_requirements (name, description, category, frequency, due_date, next_due, status, priority)
VALUES
  ('Quarterly NAMFISA Report', 'Submit quarterly lending activity report to NAMFISA', 'reporting', 'quarterly', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 'pending', 'high'),
  ('Annual Audit Submission', 'Submit audited financial statements', 'capital', 'annually', CURRENT_DATE + INTERVAL '90 days', CURRENT_DATE + INTERVAL '90 days', 'pending', 'high'),
  ('KYC Policy Review', 'Review and update Know Your Customer policies', 'governance', 'annually', CURRENT_DATE + INTERVAL '180 days', CURRENT_DATE + INTERVAL '180 days', 'pending', 'medium'),
  ('Consumer Protection Compliance', 'Ensure all lending terms comply with consumer protection laws', 'consumer_protection', 'quarterly', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 'pending', 'high'),
  ('Risk Management Framework Update', 'Update risk assessment and mitigation framework', 'risk', 'annually', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE + INTERVAL '60 days', 'pending', 'medium')
ON CONFLICT DO NOTHING;

-- Add missing columns to existing tables
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS postal_address TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_tel TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS employer_address TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS payslip_employee_no TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS bank_branch TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS bank_account_no TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS bank_account_type TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS reference1_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS reference1_tel TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS reference2_name TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS reference2_tel TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS tel_no TEXT;
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS lender_id UUID;

ALTER TABLE borrower_disputes ADD COLUMN IF NOT EXISTS evidence_url TEXT;
ALTER TABLE borrower_disputes ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
ALTER TABLE borrower_disputes ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE borrower_disputes ADD COLUMN IF NOT EXISTS borrower_id UUID;
ALTER TABLE borrower_disputes ADD COLUMN IF NOT EXISTS lender_id UUID;
ALTER TABLE borrower_disputes ADD COLUMN IF NOT EXISTS borrower_email TEXT;

ALTER TABLE borrower_blacklist ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE borrower_blacklist ADD COLUMN IF NOT EXISTS reason_detail TEXT;

ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS lender_id UUID;
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5,2) DEFAULT 20;

ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_application_id UUID;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS borrower_email TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS days_overdue INTEGER DEFAULT 0;

ALTER TABLE lenders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS authorized_signatory_name TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS authorized_signatory_title TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS authorized_signatory_signature_url TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS late_fee_percentage NUMERIC(5,2) DEFAULT 5;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS avg_interest_rate NUMERIC(5,2) DEFAULT 20;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS namfisa_license TEXT;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS min_loan_amount NUMERIC(12,2) DEFAULT 500;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS max_loan_amount NUMERIC(12,2) DEFAULT 50000;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS borrower_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS lender_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_number TEXT;

-- Enable RLS on new tables
ALTER TABLE borrower_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all for authenticated" ON borrower_documents;
DROP POLICY IF EXISTS "Allow all for anon" ON borrower_documents;
DROP POLICY IF EXISTS "Allow all for authenticated" ON loan_agreements;
DROP POLICY IF EXISTS "Allow all for anon" ON loan_agreements;
DROP POLICY IF EXISTS "Allow all for authenticated" ON compliance_requirements;
DROP POLICY IF EXISTS "Allow all for anon" ON compliance_requirements;

CREATE POLICY "Allow all for authenticated" ON borrower_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON borrower_documents FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON loan_agreements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON loan_agreements FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON compliance_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON compliance_requirements FOR ALL TO anon USING (true) WITH CHECK (true);
