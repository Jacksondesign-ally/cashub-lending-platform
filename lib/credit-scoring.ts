/**
 * CasHuB Credit Scoring Engine
 * Calculates a dynamic credit score (300-850) based on borrower behavior.
 */

export interface CreditInput {
  totalLoans: number
  completedLoans: number
  defaultedLoans: number
  overdueLoans: number
  totalBorrowed: number
  totalRepaid: number
  avgDaysLate: number
  accountAgeDays: number
  activeDebtRatio: number // outstanding / income or total borrowed
}

export interface CreditResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  riskLevel: 'low' | 'medium' | 'high'
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[]
}

const BASE_SCORE = 500

export function calculateCreditScore(input: CreditInput): CreditResult {
  const factors: CreditResult['factors'] = []
  let score = BASE_SCORE

  // 1. Repayment history (35% weight, max ±150 points)
  if (input.totalLoans > 0) {
    const completionRate = input.completedLoans / input.totalLoans
    const repaymentPoints = Math.round(completionRate * 150)
    score += repaymentPoints - 75 // center around 0
    factors.push({
      label: `Repayment rate: ${(completionRate * 100).toFixed(0)}%`,
      impact: completionRate >= 0.8 ? 'positive' : completionRate >= 0.5 ? 'neutral' : 'negative',
      weight: 35,
    })
  } else {
    factors.push({ label: 'No loan history', impact: 'neutral', weight: 35 })
  }

  // 2. Default history (25% weight, max -125 points)
  if (input.defaultedLoans > 0) {
    const defaultPenalty = Math.min(input.defaultedLoans * 40, 125)
    score -= defaultPenalty
    factors.push({
      label: `${input.defaultedLoans} default(s) on record`,
      impact: 'negative',
      weight: 25,
    })
  } else {
    score += 50
    factors.push({ label: 'No defaults', impact: 'positive', weight: 25 })
  }

  // 3. Payment timeliness (15% weight, max ±75 points)
  if (input.avgDaysLate <= 0) {
    score += 75
    factors.push({ label: 'Always pays on time', impact: 'positive', weight: 15 })
  } else if (input.avgDaysLate <= 7) {
    score += 30
    factors.push({ label: `Avg ${input.avgDaysLate.toFixed(0)} days late`, impact: 'neutral', weight: 15 })
  } else {
    score -= Math.min(input.avgDaysLate * 2, 75)
    factors.push({ label: `Avg ${input.avgDaysLate.toFixed(0)} days late`, impact: 'negative', weight: 15 })
  }

  // 4. Debt ratio (15% weight, max ±75 points)
  if (input.activeDebtRatio < 0.3) {
    score += 50
    factors.push({ label: 'Low debt ratio', impact: 'positive', weight: 15 })
  } else if (input.activeDebtRatio < 0.6) {
    factors.push({ label: 'Moderate debt ratio', impact: 'neutral', weight: 15 })
  } else {
    score -= 50
    factors.push({ label: 'High debt ratio', impact: 'negative', weight: 15 })
  }

  // 5. Account age (10% weight, max +50 points)
  const ageMonths = input.accountAgeDays / 30
  if (ageMonths >= 24) {
    score += 50
    factors.push({ label: 'Established account (2+ years)', impact: 'positive', weight: 10 })
  } else if (ageMonths >= 6) {
    score += 25
    factors.push({ label: `Account age: ${Math.floor(ageMonths)} months`, impact: 'neutral', weight: 10 })
  } else {
    factors.push({ label: 'New account', impact: 'negative', weight: 10 })
  }

  // Clamp score
  score = Math.max(300, Math.min(850, score))

  // Determine grade and risk
  const grade: CreditResult['grade'] =
    score >= 750 ? 'A' : score >= 650 ? 'B' : score >= 550 ? 'C' : score >= 450 ? 'D' : 'F'

  const riskLevel: CreditResult['riskLevel'] =
    score >= 650 ? 'low' : score >= 500 ? 'medium' : 'high'

  return { score, grade, riskLevel, factors }
}
