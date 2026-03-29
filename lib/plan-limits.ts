import { supabase } from './supabase'

export interface PlanLimits {
  maxBorrowers: number  // 0 = unlimited
  maxLoans: number      // 0 = unlimited
  maxStaff: number      // 0 = unlimited
  hasBranches: boolean
  hasMarketplace: boolean
  hasCompliance: boolean
  hasApiAccess: boolean
  planName: string
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    maxBorrowers: 50,
    maxLoans: 100,
    maxStaff: 2,
    hasBranches: false,
    hasMarketplace: false,
    hasCompliance: false,
    hasApiAccess: false,
    planName: 'Starter',
  },
  professional: {
    maxBorrowers: 200,
    maxLoans: 500,
    maxStaff: 10,
    hasBranches: false,
    hasMarketplace: true,
    hasCompliance: true,
    hasApiAccess: false,
    planName: 'Professional',
  },
  enterprise: {
    maxBorrowers: 0,
    maxLoans: 0,
    maxStaff: 0,
    hasBranches: true,
    hasMarketplace: true,
    hasCompliance: true,
    hasApiAccess: true,
    planName: 'Enterprise',
  },
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan?.toLowerCase()] || PLAN_LIMITS.professional
}

export async function checkLenderUsage(lenderId: string) {
  const [{ count: borrowerCount }, { count: loanCount }, { count: staffCount }] = await Promise.all([
    supabase.from('borrowers').select('id', { count: 'exact', head: true }).eq('lender_id', lenderId),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('lender_id', lenderId).in('status', ['active', 'pending', 'approved']),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('lender_id', lenderId).in('role', ['loan_officer', 'lender_admin']),
  ])
  return {
    borrowers: borrowerCount || 0,
    loans: loanCount || 0,
    staff: staffCount || 0,
  }
}

export function isAtLimit(current: number, max: number): boolean {
  if (max === 0) return false // unlimited
  return current >= max
}

export function isNearLimit(current: number, max: number, threshold = 0.8): boolean {
  if (max === 0) return false // unlimited
  return current / max >= threshold
}

export function getLimitWarning(current: number, max: number, label: string): string | null {
  if (max === 0) return null
  if (current >= max) return `You have reached your ${label} limit (${max}). Upgrade your plan to add more.`
  if (current / max >= 0.8) return `You are approaching your ${label} limit (${current}/${max}). Consider upgrading.`
  return null
}
