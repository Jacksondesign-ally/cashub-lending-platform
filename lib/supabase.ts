import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Whether Supabase is properly configured (checked at runtime in browser)
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// No-op proxy used when Supabase env vars are absent (e.g. local dev without .env)
function createNoopProxy(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === 'auth') {
        return new Proxy({}, {
          get() {
            return async () => ({ data: { user: null, session: null, users: [] }, error: { message: 'Supabase not configured' } })
          }
        })
      }
      if (prop === 'from') {
        return () => {
          const chain: any = new Proxy({}, {
            get(_t, p) {
              if (p === 'then') return undefined
              if (p === 'single' || p === 'maybeSingle') return async () => ({ data: null, error: null })
              return () => chain
            }
          })
          return chain
        }
      }
      return () => ({})
    }
  })
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createNoopProxy()

export const supabaseAdmin: SupabaseClient = (supabaseUrl && (supabaseServiceKey || supabaseAnonKey))
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!)
  : createNoopProxy()

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          role: 'super_admin' | 'lender_admin' | 'loan_officer' | 'borrower'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          role?: 'super_admin' | 'lender_admin' | 'loan_officer' | 'borrower'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          role?: 'super_admin' | 'lender_admin' | 'loan_officer' | 'borrower'
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
          visibility_mode?: 'private' | 'marketplace'
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
          visibility_mode?: 'private' | 'marketplace'
          join_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          loan_number: string
          borrower_id: string
          principal_amount: number
          interest_rate: number
          term_months: number
          start_date: string
          end_date: string
          status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          created_at: string
        }
      }
    }
  }
}
