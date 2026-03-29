/**
 * Single source of truth for CasHuB lender package/tier definitions.
 * Import from here instead of hardcoding pricing in individual pages.
 */

export interface PackageTier {
  id: string
  name: string
  price: number
  billingLabel: string
  features: string[]
  maxBorrowers: number
  maxLoans: number
  popular?: boolean
}

export const PACKAGE_TIERS: PackageTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 250,
    billingLabel: 'N$ 250 / month',
    features: [
      'Up to 50 borrowers',
      'Up to 100 active loans',
      'Basic reports',
      'Email support',
    ],
    maxBorrowers: 50,
    maxLoans: 100,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 350,
    billingLabel: 'N$ 350 / month',
    features: [
      'Up to 200 borrowers',
      'Up to 500 active loans',
      'Advanced reports & analytics',
      'Priority support',
      'Staff management',
      'Marketplace listing',
    ],
    maxBorrowers: 200,
    maxLoans: 500,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 500,
    billingLabel: 'N$ 500 / month',
    features: [
      'Unlimited borrowers',
      'Unlimited active loans',
      'Full compliance suite',
      'Dedicated support',
      'Staff management',
      'API access',
      'Custom branding',
      'Marketplace priority listing',
    ],
    maxBorrowers: Infinity,
    maxLoans: Infinity,
  },
]

/** Annual discount multiplier (e.g., 0.8 = 20% off) */
export const ANNUAL_DISCOUNT = 0.8

/** Get a package tier by its ID */
export const getPackageById = (id: string): PackageTier | undefined =>
  PACKAGE_TIERS.find(p => p.id === id)

/** Get monthly price, optionally with annual discount */
export const getPrice = (tier: PackageTier, annual = false): number =>
  annual ? Math.round(tier.price * ANNUAL_DISCOUNT) : tier.price

/** Legacy tier ID → new tier ID mapping for migration */
export const LEGACY_TIER_MAP: Record<string, string> = {
  'free-trial': 'starter',
  'basic': 'starter',
  'medium': 'professional',
  'advanced': 'enterprise',
}

/** Resolve a tier ID (supports both legacy and current IDs) */
export const resolveTierId = (id: string): string =>
  LEGACY_TIER_MAP[id] || id
