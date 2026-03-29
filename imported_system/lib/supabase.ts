import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          role: 'admin' | 'lender_admin' | 'loan_officer' | 'borrower' | 'viewer'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          role?: 'admin' | 'lender_admin' | 'loan_officer' | 'borrower' | 'viewer'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          role?: 'admin' | 'lender_admin' | 'loan_officer' | 'borrower' | 'viewer'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      borrowers: {
        Row: {
          id: string
          user_id: string | null
          id_number: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: string | null
          marital_status: string | null
          email: string | null
          phone: string | null
          alternate_phone: string | null
          street_address: string | null
          city: string | null
          region: string | null
          postal_code: string | null
          employer_name: string | null
          job_title: string | null
          employment_status: string | null
          monthly_income: number | null
          employment_duration: string | null
          bank_name: string | null
          bank_account_number: string | null
          bank_account_type: string | null
          status: 'active' | 'inactive' | 'blacklisted' | 'cleared'
          risk_level: 'low' | 'medium' | 'high'
          credit_score: number
          behavior_classification: string | null
          join_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          id_number: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: string | null
          marital_status?: string | null
          email?: string | null
          phone?: string | null
          alternate_phone?: string | null
          street_address?: string | null
          city?: string | null
          region?: string | null
          postal_code?: string | null
          employer_name?: string | null
          job_title?: string | null
          employment_status?: string | null
          monthly_income?: number | null
          employment_duration?: string | null
          bank_name?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          status?: 'active' | 'inactive' | 'blacklisted' | 'cleared'
          risk_level?: 'low' | 'medium' | 'high'
          credit_score?: number
          behavior_classification?: string | null
          join_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          id_number?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: string | null
          marital_status?: string | null
          email?: string | null
          phone?: string | null
          alternate_phone?: string | null
          street_address?: string | null
          city?: string | null
          region?: string | null
          postal_code?: string | null
          employer_name?: string | null
          job_title?: string | null
          employment_status?: string | null
          monthly_income?: number | null
          employment_duration?: string | null
          bank_name?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          status?: 'active' | 'inactive' | 'blacklisted' | 'cleared'
          risk_level?: 'low' | 'medium' | 'high'
          credit_score?: number
          behavior_classification?: string | null
          join_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      lenders: {
        Row: {
          id: string
          legal_name: string
          registration_number: string
          namfisa_license: string | null
          email: string
          phone: string | null
          physical_address: string | null
          postal_address: string | null
          is_active: boolean
          subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legal_name: string
          registration_number: string
          namfisa_license?: string | null
          email: string
          phone?: string | null
          physical_address?: string | null
          postal_address?: string | null
          is_active?: boolean
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legal_name?: string
          registration_number?: string
          namfisa_license?: string | null
          email?: string
          phone?: string | null
          physical_address?: string | null
          postal_address?: string | null
          is_active?: boolean
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          loan_number: string
          borrower_id: string
          lender_id: string
          principal_amount: number
          interest_rate: number
          finance_charges: number | null
          total_repayable: number | null
          monthly_payment: number | null
          loan_period: number
          purpose: string | null
          status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          outstanding_balance: number | null
          days_overdue: number
          application_date: string
          approval_date: string | null
          disbursement_date: string | null
          first_payment_date: string | null
          last_payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          loan_number: string
          borrower_id: string
          lender_id: string
          principal_amount: number
          interest_rate: number
          finance_charges?: number | null
          total_repayable?: number | null
          monthly_payment?: number | null
          loan_period: number
          purpose?: string | null
          status?: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          outstanding_balance?: number | null
          days_overdue?: number
          application_date?: string
          approval_date?: string | null
          disbursement_date?: string | null
          first_payment_date?: string | null
          last_payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          loan_number?: string
          borrower_id?: string
          lender_id?: string
          principal_amount?: number
          interest_rate?: number
          finance_charges?: number | null
          total_repayable?: number | null
          monthly_payment?: number | null
          loan_period?: number
          purpose?: string | null
          status?: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          outstanding_balance?: number | null
          days_overdue?: number
          application_date?: string
          approval_date?: string | null
          disbursement_date?: string | null
          first_payment_date?: string | null
          last_payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}
