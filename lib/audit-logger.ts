import { supabase } from './supabase'

export type AuditAction =
  | 'loan.created'
  | 'loan.approved'
  | 'loan.rejected'
  | 'loan.disbursed'
  | 'loan.status_changed'
  | 'payment.recorded'
  | 'payment.reversed'
  | 'borrower.created'
  | 'borrower.updated'
  | 'borrower.blacklisted'
  | 'borrower.removed_from_blacklist'
  | 'application.submitted'
  | 'application.approved'
  | 'application.rejected'
  | 'staff.invited'
  | 'staff.removed'
  | 'settings.updated'
  | 'report.exported'
  | 'agreement.signed'
  | 'login'
  | 'logout'

export type EntityType =
  | 'loan'
  | 'payment'
  | 'borrower'
  | 'application'
  | 'staff'
  | 'settings'
  | 'report'
  | 'agreement'
  | 'auth'

interface AuditLogEntry {
  action: AuditAction
  entity_type: EntityType
  entity_id?: string
  details?: Record<string, any>
}

/**
 * Log an action to the audit_logs table.
 * Automatically captures user info from localStorage.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    const userId = typeof window !== 'undefined' ? localStorage.getItem('lenderId') || localStorage.getItem('borrowerId') : null

    await supabase.from('audit_logs').insert({
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      user_id: userId,
      user_email: userEmail,
      user_role: userRole,
      details: entry.details || {},
    })
  } catch (err) {
    console.error('[CasHuB Audit] Failed to log:', err)
  }
}
