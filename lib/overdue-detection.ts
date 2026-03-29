import { supabase } from './supabase'

/**
 * Check all active loans for a lender and auto-mark overdue ones.
 * Call this on lender dashboard mount or via a scheduled job.
 */
export async function detectOverdueLoans(lenderId: string): Promise<{ updated: number; errors: number }> {
  let updated = 0
  let errors = 0

  try {
    const { data: loans, error } = await supabase
      .from('loans')
      .select('id, status, end_date, next_payment_date, days_overdue')
      .eq('lender_id', lenderId)
      .in('status', ['active', 'disbursed'])

    if (error || !loans) return { updated: 0, errors: 1 }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const loan of loans) {
      const dueDate = loan.next_payment_date || loan.end_date
      if (!dueDate) continue

      const due = new Date(dueDate)
      due.setHours(0, 0, 0, 0)

      const diffMs = today.getTime() - due.getTime()
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (daysOverdue > 0) {
        let newStatus = loan.status
        if (daysOverdue > 90) {
          newStatus = 'defaulted'
        } else if (daysOverdue > 0) {
          newStatus = 'overdue'
        }

        if (newStatus !== loan.status || daysOverdue !== loan.days_overdue) {
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              status: newStatus,
              days_overdue: daysOverdue,
              updated_at: new Date().toISOString(),
            })
            .eq('id', loan.id)

          if (updateError) {
            errors++
            console.error('[CasHuB Overdue] Failed to update loan:', loan.id, updateError)
          } else {
            updated++
          }
        }
      }
    }
  } catch (err) {
    console.error('[CasHuB Overdue] Detection failed:', err)
    errors++
  }

  return { updated, errors }
}
