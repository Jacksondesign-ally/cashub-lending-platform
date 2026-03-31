"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Shield, Users,
  FileText, CreditCard, Building, Trash2, Activity, Link, AlertCircle,
  ChevronDown, ChevronRight, RotateCcw
} from 'lucide-react'

/* ─────────────────────────────── types ─────────────────────────────── */
type CheckStatus = 'pass' | 'warn' | 'fail' | 'pending'

interface TableCheck {
  name: string
  label: string
  status: CheckStatus
  count?: number
  detail?: string
  error?: string
}

interface RelCheck {
  label: string
  status: CheckStatus
  detail: string
}

interface AuditResult {
  tables: TableCheck[]
  relations: RelCheck[]
  bugs: { severity: 'high' | 'medium' | 'low'; message: string }[]
  runAt: string
}

/* ─────────────────────────────── helpers ─────────────────────────────── */
const statusIcon = (s: CheckStatus) => {
  if (s === 'pass')    return <CheckCircle  className="w-4 h-4 text-emerald-500 flex-shrink-0" />
  if (s === 'warn')    return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
  if (s === 'fail')    return <XCircle       className="w-4 h-4 text-red-500 flex-shrink-0" />
  return <RefreshCw className="w-4 h-4 text-neutral-400 animate-spin flex-shrink-0" />
}

const statusBg = (s: CheckStatus) => ({
  pass: 'bg-emerald-50 border-emerald-200',
  warn: 'bg-amber-50 border-amber-200',
  fail: 'bg-red-50 border-red-200',
  pending: 'bg-neutral-50 border-neutral-200',
}[s])

/* ─────────────────────────────── component ─────────────────────────────── */
export default function SystemHealthPage() {
  const [role,      setRole]      = useState<string | null>(null)
  const [running,   setRunning]   = useState(false)
  const [result,    setResult]    = useState<AuditResult | null>(null)
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({})

  // Reset state
  const [resetPhase,   setResetPhase]   = useState<'idle' | 'confirm1' | 'confirm2' | 'running' | 'done'>('idle')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetLog,     setResetLog]     = useState<string[]>([])

  useEffect(() => {
    setRole(typeof window !== 'undefined' ? localStorage.getItem('userRole') : null)
  }, [])

  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Supabase Not Configured</h3>
          <p className="text-red-700 mb-4">Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.</p>
          <p className="text-red-600 text-sm">Please check your Vercel environment variables configuration.</p>
        </div>
      </div>
    )
  }

  /* ──────────── run audit ──────────── */
  const runAudit = useCallback(async () => {
    setRunning(true)
    setResult(null)

    const tables: TableCheck[] = []
    const relations: RelCheck[] = []
    const bugs: AuditResult['bugs'] = []

    // Helper: probe a table
    const probe = async (name: string, label: string): Promise<{ count: number | null; error: string | null }> => {
      const { count, error } = await supabase.from(name).select('*', { count: 'exact', head: true })
      return { count: count ?? null, error: error ? error.message : null }
    }

    // ── Core tables ──
    const coreProbes: { name: string; label: string }[] = [
      { name: 'users',                label: 'Users' },
      { name: 'lenders',              label: 'Lenders' },
      { name: 'borrowers',            label: 'Borrowers' },
      { name: 'loans',                label: 'Loans' },
      { name: 'loan_applications',    label: 'Loan Applications' },
      { name: 'lender_subscriptions', label: 'Lender Subscriptions' },
      { name: 'lender_onboarding',    label: 'Lender Onboarding' },
      { name: 'marketplace_applications', label: 'Marketplace Applications' },
      { name: 'borrower_blacklist',   label: 'Borrower Blacklist' },
      { name: 'borrower_disputes',    label: 'Borrower Disputes' },
      { name: 'scam_alerts',          label: 'Scam Alerts' },
      { name: 'system_settings',      label: 'System Settings' },
      { name: 'audit_logs',           label: 'Audit Logs' },
    ]

    await Promise.all(coreProbes.map(async ({ name, label }) => {
      const { count, error } = await probe(name, label)
      tables.push({
        name,
        label,
        status: error ? 'fail' : 'pass',
        count: count ?? undefined,
        error: error ?? undefined,
      })
    }))

    // Sort: fail first, then warn, then pass
    tables.sort((a, b) => {
      const ord: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2, pending: 3 }
      return ord[a.status] - ord[b.status]
    })

    // ── Relationship checks ──
    const sysSettingsOk = tables.find(t => t.name === 'system_settings')?.status === 'pass'
    const lendersOk     = tables.find(t => t.name === 'lenders')?.status === 'pass'
    const subOk         = tables.find(t => t.name === 'lender_subscriptions')?.status === 'pass'
    const loansOk       = tables.find(t => t.name === 'loans')?.status === 'pass'
    const borrowersOk   = tables.find(t => t.name === 'borrowers')?.status === 'pass'

    // Check 1: admin_packages setting
    if (sysSettingsOk) {
      const { data: pkgRow } = await supabase.from('system_settings').select('value').eq('key', 'admin_packages').maybeSingle()
      relations.push({
        label: 'Admin packages → system_settings',
        status: pkgRow ? 'pass' : 'warn',
        detail: pkgRow ? 'admin_packages key present in system_settings' : 'admin_packages not yet saved — open Packages page to initialise',
      })
    }

    // Check 2: login_slides setting
    if (sysSettingsOk) {
      const { data: slideRow } = await supabase.from('system_settings').select('value').eq('key', 'login_slides').maybeSingle()
      relations.push({
        label: 'Login slides → system_settings',
        status: slideRow ? 'pass' : 'warn',
        detail: slideRow ? 'login_slides key present in system_settings' : 'login_slides not saved — go to Settings → Branding and Save Slides',
      })
    }

    // Check 3: lenders with no subscription
    if (lendersOk && subOk) {
      const { data: allLenders } = await supabase.from('lenders').select('id').eq('is_active', true)
      const { data: allSubs } = await supabase.from('lender_subscriptions').select('lender_id').eq('status', 'ACTIVE')
      const subIds = new Set((allSubs || []).map((s: any) => s.lender_id))
      const noSub = (allLenders || []).filter((l: any) => !subIds.has(l.id)).length
      relations.push({
        label: 'Active lenders → subscriptions',
        status: noSub === 0 ? 'pass' : 'warn',
        detail: noSub === 0 ? 'All active lenders have subscriptions' : `${noSub} active lender(s) have no subscription`,
      })
    }

    // Check 4: loans linked to valid borrowers
    if (loansOk && borrowersOk) {
      const { data: loansWithBorrower } = await supabase.from('loans').select('id, borrower_id').not('borrower_id', 'is', null).limit(100)
      let orphanCount = 0
      if (loansWithBorrower && loansWithBorrower.length > 0) {
        const ids = [...new Set((loansWithBorrower as any[]).map(l => l.borrower_id))]
        const { data: validBorrowers } = await supabase.from('borrowers').select('id').in('id', ids)
        const validIds = new Set((validBorrowers || []).map((b: any) => b.id))
        orphanCount = (loansWithBorrower as any[]).filter(l => !validIds.has(l.borrower_id)).length
      }
      relations.push({
        label: 'Loans → borrowers integrity',
        status: orphanCount === 0 ? 'pass' : 'warn',
        detail: orphanCount === 0 ? 'All loans reference valid borrower records' : `${orphanCount} loan(s) reference missing borrowers`,
      })
    }

    // Check 5: super admin exists
    const { data: superAdmins } = await supabase.from('users').select('id, email').eq('role', 'super_admin')
    relations.push({
      label: 'Super admin account',
      status: (superAdmins && superAdmins.length > 0) ? 'pass' : 'fail',
      detail: (superAdmins && superAdmins.length > 0)
        ? `${superAdmins.length} super admin account(s) found`
        : 'No super admin account found — system may be inaccessible',
    })

    // Check 6: lender portal authentication path
    if (lendersOk) {
      const { data: pendingLenders } = await supabase.from('lender_onboarding').select('id').eq('status', 'pending')
      relations.push({
        label: 'Pending lender onboarding',
        status: (pendingLenders && pendingLenders.length > 0) ? 'warn' : 'pass',
        detail: (pendingLenders && pendingLenders.length > 0)
          ? `${pendingLenders.length} lender application(s) awaiting admin review`
          : 'No pending lender applications',
      })
    }

    // ── Identify known bugs / issues ──
    const failedTables = tables.filter(t => t.status === 'fail')
    failedTables.forEach(t => {
      bugs.push({ severity: 'high', message: `Table "${t.name}" is missing or inaccessible — ${t.error}` })
    })

    const warnRels = relations.filter(r => r.status === 'warn')
    warnRels.forEach(r => {
      bugs.push({ severity: 'medium', message: r.detail })
    })

    const failRels = relations.filter(r => r.status === 'fail')
    failRels.forEach(r => {
      bugs.push({ severity: 'high', message: r.detail })
    })

    if (bugs.length === 0) {
      // no structural bugs but check data quality
      const loansCount = tables.find(t => t.name === 'loans')?.count ?? 0
      const borrowersCount = tables.find(t => t.name === 'borrowers')?.count ?? 0
      if (loansCount > 0 && borrowersCount === 0) {
        bugs.push({ severity: 'medium', message: 'Loans exist but no borrower records found' })
      }
    }

    setResult({ tables, relations, bugs, runAt: new Date().toLocaleString() })
    setRunning(false)
  }, [])

  /* ──────────── system reset ──────────── */
  const TABLES_TO_CLEAR = [
    'loans', 'loan_applications', 'lender_subscriptions',
    'lender_onboarding', 'marketplace_applications',
    'borrower_blacklist', 'borrower_disputes',
    'scam_alerts', 'audit_logs',
    'borrowers', 'lenders',
  ]

  const runReset = async () => {
    if (resetConfirm !== 'RESET') return
    setResetPhase('running')
    const log: string[] = []

    const add = (msg: string) => {
      log.push(msg)
      setResetLog([...log])
    }

    add('⚙️ Starting system reset...')

    for (const table of TABLES_TO_CLEAR) {
      try {
        const { error, count } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        if (error) {
          add(`⚠️  ${table}: ${error.message}`)
        } else {
          add(`✅ Cleared: ${table}`)
        }
      } catch (e: any) {
        add(`❌ ${table}: ${e.message}`)
      }
    }

    // Delete non-super_admin users
    try {
      const { error } = await supabase.from('users').delete().neq('role', 'super_admin')
      if (error) {
        add(`⚠️  users (non-admin): ${error.message}`)
      } else {
        add('✅ Cleared: users (non-super_admin preserved)')
      }
    } catch (e: any) {
      add(`❌ users: ${e.message}`)
    }

    add('🎉 Reset complete. Super admin and system settings preserved.')
    setResetPhase('done')
    // Re-run audit to reflect fresh state
    setTimeout(() => runAudit(), 1500)
  }

  /* ──────────── summary counters ──────────── */
  const passCount = result?.tables.filter(t => t.status === 'pass').length ?? 0
  const failCount = result?.tables.filter(t => t.status === 'fail').length ?? 0
  const warnRels  = result?.relations.filter(r => r.status === 'warn').length ?? 0
  const failRels  = result?.relations.filter(r => r.status === 'fail').length ?? 0
  const bugHigh   = result?.bugs.filter(b => b.severity === 'high').length ?? 0
  const bugMed    = result?.bugs.filter(b => b.severity === 'medium').length ?? 0

  const isSuperAdmin = role === 'super_admin'

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">System Health Check</h2>
          <p className="text-neutral-500 text-sm mt-0.5">Live audit of database connectivity, data integrity, and known issues</p>
        </div>
        <button
          onClick={runAudit}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {running ? 'Running checks...' : (result ? 'Re-run Audit' : 'Run Audit')}
        </button>
      </div>

      {/* Idle state */}
      {!result && !running && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <Database className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Click Run Audit to check all system connections</p>
          <p className="text-neutral-400 text-sm mt-1">Checks ~13 tables, key relationships, and data integrity</p>
        </div>
      )}

      {/* Running loader */}
      {running && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <RefreshCw className="w-10 h-10 text-cashub-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-medium">Running system checks...</p>
          <p className="text-neutral-400 text-sm mt-1">Probing tables and relationships</p>
        </div>
      )}

      {result && (
        <>
          {/* Summary banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tables OK',     value: passCount, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: 'Missing Tables',value: failCount, color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
              { label: 'Rel. Warnings', value: warnRels + failRels, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Issues Found',  value: bugHigh + bugMed,    color: bugHigh > 0 ? 'text-red-700' : 'text-amber-700', bg: bugHigh > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-neutral-600 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table checks */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(e => ({ ...e, tables: !e.tables }))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-neutral-500" />
                <span className="font-semibold text-neutral-900">Database Tables</span>
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{result.tables.length} checked</span>
                {failCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{failCount} missing</span>}
              </div>
              {expanded.tables ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>
            {expanded.tables && (
              <div className="border-t border-neutral-100 divide-y divide-neutral-100">
                {result.tables.map(t => (
                  <div key={t.name} className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      {statusIcon(t.status)}
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{t.label}</p>
                        <p className="text-xs text-neutral-400 font-mono">{t.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {t.count != null && <p className="text-sm font-bold text-neutral-700">{t.count.toLocaleString()} rows</p>}
                      {t.error && <p className="text-xs text-red-600 max-w-xs truncate">{t.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Relationship checks */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(e => ({ ...e, relations: !e.relations }))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-neutral-500" />
                <span className="font-semibold text-neutral-900">Connectivity & Relationships</span>
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{result.relations.length} checks</span>
              </div>
              {expanded.relations ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>
            {expanded.relations && (
              <div className="border-t border-neutral-100 divide-y divide-neutral-100">
                {result.relations.map((r, i) => (
                  <div key={i} className={`flex items-start gap-3 px-6 py-3 ${statusBg(r.status)} border-l-4`}>
                    {statusIcon(r.status)}
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{r.label}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Issues / Bugs */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(e => ({ ...e, bugs: !e.bugs }))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-neutral-500" />
                <span className="font-semibold text-neutral-900">Issues & Bugs</span>
                {bugHigh > 0
                  ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{bugHigh} critical</span>
                  : bugMed > 0
                    ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{bugMed} warning(s)</span>
                    : <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">No issues</span>
                }
              </div>
              {expanded.bugs ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>
            {expanded.bugs && (
              <div className="border-t border-neutral-100">
                {result.bugs.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-neutral-600 font-medium">No issues detected</p>
                    <p className="text-neutral-400 text-sm">All system checks passed successfully</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {result.bugs.map((b, i) => (
                      <div key={i} className={`flex items-start gap-3 px-6 py-3 ${b.severity === 'high' ? 'bg-red-50' : b.severity === 'medium' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                        {b.severity === 'high'
                          ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          : b.severity === 'medium'
                            ? <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            : <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mr-2 ${b.severity === 'high' ? 'bg-red-100 text-red-700' : b.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {b.severity}
                          </span>
                          <span className="text-sm text-neutral-700">{b.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-400 text-right">Last run: {result.runAt}</p>
        </>
      )}

      {/* ─── System Reset (super admin only) ─── */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">System Data Reset</h3>
              <p className="text-xs text-red-600">Clears all data — preserves super admin account and system settings only</p>
            </div>
          </div>

          <div className="p-6">
            {resetPhase === 'idle' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-sm font-semibold text-red-800 mb-2">⚠️ This will permanently delete:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {['All lenders & their onboarding records', 'All borrowers', 'All loans & loan applications', 'All subscriptions', 'All marketplace applications', 'All blacklist & dispute records', 'All scam alerts', 'All audit logs', 'All non-super-admin user accounts'].map(item => (
                      <li key={item} className="flex items-center gap-2"><XCircle className="w-3 h-3 flex-shrink-0" /> {item}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-800 font-semibold mt-3">✅ Preserved: Super admin account, system_settings</p>
                </div>
                <button
                  onClick={() => setResetPhase('confirm1')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Initiate System Reset
                </button>
              </div>
            )}

            {resetPhase === 'confirm1' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-100 rounded-xl border border-red-300">
                  <p className="text-sm font-bold text-red-900">First confirmation</p>
                  <p className="text-xs text-red-700 mt-1">Are you absolutely sure? This action cannot be undone. All operational data will be permanently lost.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setResetPhase('idle')} className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50">Cancel</button>
                  <button onClick={() => setResetPhase('confirm2')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">Yes, I'm sure</button>
                </div>
              </div>
            )}

            {resetPhase === 'confirm2' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-100 rounded-xl border border-red-300">
                  <p className="text-sm font-bold text-red-900">Final confirmation — type RESET to proceed</p>
                  <p className="text-xs text-red-700 mt-1">Type the word <strong>RESET</strong> in capital letters to confirm deletion of all system data.</p>
                </div>
                <input
                  type="text"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  placeholder="Type RESET here"
                  className="w-full px-4 py-2.5 border-2 border-red-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setResetPhase('idle'); setResetConfirm('') }} className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50">Cancel</button>
                  <button
                    onClick={runReset}
                    disabled={resetConfirm !== 'RESET'}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Execute Reset
                  </button>
                </div>
              </div>
            )}

            {resetPhase === 'running' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Resetting system data...
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1">
                  {resetLog.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            )}

            {resetPhase === 'done' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-800">✅ System reset complete</p>
                  <p className="text-xs text-emerald-700 mt-1">All operational data has been cleared. Super admin account and system settings have been preserved.</p>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1">
                  {resetLog.map((line, i) => <p key={i}>{line}</p>)}
                </div>
                <button
                  onClick={() => { setResetPhase('idle'); setResetConfirm(''); setResetLog([]) }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
