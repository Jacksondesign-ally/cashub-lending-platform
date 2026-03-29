import { z } from 'zod'

// ─── Borrower Registration ───
export const borrowerRegistrationSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number must be at least 9 digits'),
  id_number: z.string().min(6, 'ID number must be at least 6 characters'),
  date_of_birth: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
})

// ─── Lender Registration ───
export const lenderRegistrationSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number must be at least 9 digits'),
  registration_number: z.string().min(3, 'Registration number is required'),
  namfisa_license: z.string().optional(),
  package_tier: z.enum(['starter', 'professional', 'enterprise']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ─── Loan Application ───
export const loanApplicationSchema = z.object({
  amount: z.number().min(100, 'Minimum loan amount is N$ 100').max(1000000, 'Maximum loan amount is N$ 1,000,000'),
  term_months: z.number().min(1, 'Minimum term is 1 month').max(60, 'Maximum term is 60 months'),
  purpose: z.string().min(5, 'Please describe the loan purpose'),
  monthly_income: z.number().min(0, 'Income must be positive').optional(),
  employer: z.string().optional(),
})

// ─── Loan Creation (Lender) ───
export const NAMFISA_MAX_INTEREST_RATE = 30 // Maximum annual interest rate per NAMFISA

export const loanCreationSchema = z.object({
  borrower_id: z.string().uuid('Invalid borrower ID'),
  principal_amount: z.number().min(100, 'Minimum principal is N$ 100'),
  interest_rate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(NAMFISA_MAX_INTEREST_RATE, `Interest rate exceeds NAMFISA cap of ${NAMFISA_MAX_INTEREST_RATE}%`),
  term_months: z.number().min(1).max(60),
  admin_fee: z.number().min(0).optional(),
})

// ─── Payment Recording ───
export const paymentSchema = z.object({
  loan_id: z.string().uuid('Invalid loan ID'),
  amount: z.number().min(1, 'Payment must be at least N$ 1'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'debit_order', 'other']),
  payment_date: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
})

// ─── Blacklist Entry ───
export const blacklistEntrySchema = z.object({
  borrower_email: z.string().email('Invalid borrower email').optional(),
  id_number: z.string().min(6, 'ID number is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (min 10 characters)'),
  outstanding_amount: z.number().min(0).optional(),
})

// ─── Staff Invite ───
export const staffInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['loan_officer', 'lender_admin']),
})

// ─── Helper: validate and return errors ───
export function validate<T>(schema: z.ZodType<T>, input: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const data = schema.parse(input)
    return { success: true, data }
  } catch (err) {
    const errors: Record<string, string> = {}
    if (err instanceof z.ZodError) {
      err.issues.forEach(e => {
        const key = e.path.join('.') || '_'
        if (!errors[key]) errors[key] = e.message
      })
    }
    return { success: false, errors }
  }
}
