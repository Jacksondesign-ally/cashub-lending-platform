"use client"

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, Search, User, AlertTriangle, Ban, CheckCircle, ShieldAlert, ShieldCheck, CreditCard, Building2, Clock } from 'lucide-react'

interface ActiveLoanInfo {
  id: string
  status: string
  principal_amount: number
  lender_name: string
}

interface ScamAlertInfo {
  id: string
  title?: string
  suspect_name?: string
  suspect_id?: string
  alert_type?: string
  status?: string
  submitted_by?: string
}

interface BlacklistEntry {
  id: string
  full_name?: string
  id_number?: string
  reason?: string
  status?: string
  submitted_by?: string
}

interface RegistryResult {
  id: string
  first_name?: string
  last_name?: string
  id_number?: string
  email?: string
  risk_level?: string
  credit_score?: number
  status?: string
  blacklist_entries?: BlacklistEntry[]
  scam_alerts?: ScamAlertInfo[]
  active_loans?: ActiveLoanInfo[]
  source: 'borrower' | 'blacklist_only'
  reason?: string
}

export default function LenderRegistryPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RegistryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const q = query.trim()
      const [{ data: borrowers }, { data: blacklistAll }, { data: scamAll }] = await Promise.all([
        supabase.from('borrowers').select('id, first_name, last_name, id_number, email, risk_level, credit_score, status')
          .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,id_number.ilike.%${q}%,email.ilike.%${q}%`),
        supabase.from('blacklist').select('id, full_name, id_number, reason, status, submitted_by')
          .or(`full_name.ilike.%${q}%,id_number.ilike.%${q}%`),
        supabase.from('scam_alerts').select('id, title, suspect_name, suspect_id, alert_type, status, submitted_by')
          .or(`suspect_name.ilike.%${q}%,suspect_id.ilike.%${q}%`),
      ])

      const loanSel = 'id, status, principal_amount, borrower_email, lender:lender_id(company_name, legal_name)'

      const borrowerResults: RegistryResult[] = await Promise.all(
        (borrowers || []).map(async (b: any) => {
          const seen = new Set<string>()
          const [{ data: byId }, { data: byEmail }] = await Promise.all([
            supabase.from('loans').select(loanSel).eq('borrower_id', b.id).in('status', ['active', 'overdue']),
            b.email ? supabase.from('loans').select(loanSel).eq('borrower_email', b.email).in('status', ['active', 'overdue']) : Promise.resolve({ data: [] }),
          ])
          const active_loans: ActiveLoanInfo[] = [...(byId || []), ...(byEmail || [])]
            .filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true })
            .map((l: any) => ({
              id: l.id, status: l.status,
              principal_amount: l.principal_amount || 0,
              lender_name: l.lender?.company_name || l.lender?.legal_name || 'Unknown Lender',
            }))

          // Match blacklist entries for this borrower
          const blacklist_entries: BlacklistEntry[] = (blacklistAll || []).filter((bl: any) =>
            (b.id_number && bl.id_number && bl.id_number === b.id_number) ||
            (b.first_name && b.last_name && bl.full_name?.toLowerCase().includes(b.first_name.toLowerCase()))
          )
          // Match scam alerts for this borrower
          const scam_alerts: ScamAlertInfo[] = (scamAll || []).filter((sa: any) =>
            (b.id_number && sa.suspect_id && sa.suspect_id === b.id_number) ||
            (b.first_name && sa.suspect_name?.toLowerCase().includes(b.first_name.toLowerCase()))
          )

          return { ...b, source: 'borrower' as const, active_loans, blacklist_entries, scam_alerts }
        })
      )

      // Blacklist-only results (person not in borrowers table)
      const borrowerIdNums = new Set((borrowers || []).map((b: any) => b.id_number).filter(Boolean))
      const blacklistOnlyResults: RegistryResult[] = (blacklistAll || [])
        .filter((bl: any) => !bl.id_number || !borrowerIdNums.has(bl.id_number))
        .map((bl: any) => ({
          id: bl.id,
          first_name: (bl.full_name || '').split(' ')[0],
          last_name: (bl.full_name || '').split(' ').slice(1).join(' '),
          id_number: bl.id_number,
          source: 'blacklist_only' as const,
          blacklist_entries: [bl],
          scam_alerts: [],
          active_loans: [],
        }))

      setResults([...borrowerResults, ...blacklistOnlyResults])
    } catch (err) { console.error('[CasHuB Error]', err); setResults([]) }
    setLoading(false)
  }

  const RISK_COLORS: Record<string, string> = {
    low: 'text-green-700 bg-green-50 border-green-200',
    medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    high: 'text-orange-700 bg-orange-50 border-orange-200',
    critical: 'text-red-700 bg-red-50 border-red-200',
  }

  const ALERT_TYPE_LABELS: Record<string, string> = {
    fraud: 'Fraud',
    identity_theft: 'Identity Theft',
    default_escape: 'Default Escape',
    other: 'Other',
  }

  const getOverallStatus = (r: RegistryResult) => {
    const hasApprovedBlacklist = (r.blacklist_entries || []).some(b => b.status === 'approved')
    const hasPendingBlacklist = (r.blacklist_entries || []).some(b => b.status === 'pending')
    const hasVerifiedScam = (r.scam_alerts || []).some(s => s.status === 'verified')
    const hasPendingScam = (r.scam_alerts || []).some(s => s.status === 'pending')
    if (hasApprovedBlacklist || hasVerifiedScam) return 'danger'
    if (hasPendingBlacklist || hasPendingScam) return 'warning'
    return 'clean'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Shared Registry Search</h2>
        <p className="text-neutral-500 text-sm">Verify borrower history, blacklist status and scam alerts before approving any loan</p>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-indigo-900">Cross-Platform Registry</p>
          <p className="text-xs text-indigo-700 mt-0.5">Searches borrower records, blacklist submissions and scam alert reports across all lenders on CasHuB.</p>
        </div>
      </div>

      {/* Search box */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <label className="block text-sm font-bold text-neutral-900 mb-3">Search Registry</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Full name, national ID, or email address..."
              className="w-full pl-11 pr-3 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Searching...</> : <><Search className="w-4 h-4" /> Search</>}
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-2">Partial matches supported. Checks borrowers registry, blacklist and scam alerts simultaneously.</p>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-neutral-600">
            {results.length === 0 ? `No records found for "${query}"` : `${results.length} record${results.length !== 1 ? 's' : ''} found for "${query}"`}
          </p>

          {/* No records = clean */}
          {results.length === 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-800 font-bold text-lg">All Clear</p>
              <p className="text-green-600 text-sm mt-1">No records found in the borrower registry, blacklist, or scam alert database.</p>
              <p className="text-green-500 text-xs mt-3 bg-green-100 rounded-lg px-4 py-2 inline-block">This person appears to be clean across the CasHuB platform.</p>
            </div>
          )}

          {results.map(r => {
            const overallStatus = getOverallStatus(r)
            const hasBlacklist = (r.blacklist_entries || []).length > 0
            const hasScam = (r.scam_alerts || []).length > 0
            const hasLoans = (r.active_loans || []).length > 0
            const borderClass = overallStatus === 'danger' ? 'border-red-300' : overallStatus === 'warning' ? 'border-amber-300' : 'border-neutral-200'
            const headerClass = overallStatus === 'danger' ? 'bg-red-50' : overallStatus === 'warning' ? 'bg-amber-50' : 'bg-white'

            return (
              <div key={r.id} className={`rounded-2xl border-2 overflow-hidden shadow-sm ${borderClass}`}>
                {/* Card header */}
                <div className={`px-5 py-4 flex items-start justify-between gap-4 ${headerClass}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${overallStatus === 'danger' ? 'bg-red-100' : overallStatus === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      {overallStatus === 'danger' ? <ShieldAlert className="w-6 h-6 text-red-600" /> : overallStatus === 'warning' ? <AlertTriangle className="w-6 h-6 text-amber-600" /> : <ShieldCheck className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-neutral-900">{r.first_name} {r.last_name}</h3>
                        {r.risk_level && (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${RISK_COLORS[r.risk_level] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {r.risk_level} Risk
                          </span>
                        )}
                        {r.source === 'blacklist_only' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-200 text-red-700 rounded-full text-[10px] font-bold">
                            <Ban className="w-2.5 h-2.5" /> Blacklist Only
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                        <span>ID: <span className="font-semibold text-neutral-700">{r.id_number || 'N/A'}</span></span>
                        {r.email && <span>Email: <span className="font-semibold text-neutral-700">{r.email}</span></span>}
                        {r.credit_score && <span>Credit Score: <span className="font-semibold text-neutral-700">{r.credit_score}</span></span>}
                      </div>
                    </div>
                  </div>
                  {/* Overall verdict badge */}
                  <div className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-xl text-center ${overallStatus === 'danger' ? 'bg-red-100 text-red-700' : overallStatus === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {overallStatus === 'danger' ? <Ban className="w-5 h-5 mb-0.5" /> : overallStatus === 'warning' ? <Clock className="w-5 h-5 mb-0.5" /> : <CheckCircle className="w-5 h-5 mb-0.5" />}
                    <span className="text-[10px] font-bold uppercase">{overallStatus === 'danger' ? 'Flagged' : overallStatus === 'warning' ? 'Under Review' : 'Clean'}</span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="bg-white divide-y divide-neutral-100">

                  {/* Blacklist section */}
                  <div className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Ban className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Blacklist Status</span>
                    </div>
                    {hasBlacklist ? (
                      <div className="space-y-2">
                        {r.blacklist_entries!.map(bl => (
                          <div key={bl.id} className={`rounded-lg px-3 py-2 flex items-start justify-between gap-3 ${bl.status === 'approved' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                            <div>
                              <p className="text-xs font-semibold text-neutral-800">{bl.reason || 'No reason provided'}</p>
                              {bl.submitted_by && <p className="text-[10px] text-neutral-500 mt-0.5">Reported by: {bl.submitted_by}</p>}
                            </div>
                            <span className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${bl.status === 'approved' ? 'bg-red-100 text-red-700' : bl.status === 'rejected' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                              {bl.status === 'approved' ? 'Confirmed' : bl.status === 'rejected' ? 'Dismissed' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Not on any blacklist</p>
                    )}
                  </div>

                  {/* Scam alerts section */}
                  <div className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Scam Alerts</span>
                    </div>
                    {hasScam ? (
                      <div className="space-y-2">
                        {r.scam_alerts!.map(sa => (
                          <div key={sa.id} className={`rounded-lg px-3 py-2 ${sa.status === 'verified' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-neutral-800">{sa.title || 'Scam Alert'}</p>
                              <span className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sa.status === 'verified' ? 'bg-red-100 text-red-700' : sa.status === 'dismissed' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                                {sa.status === 'verified' ? 'Verified' : sa.status === 'dismissed' ? 'Dismissed' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500">
                              {sa.alert_type && <span className="capitalize">{ALERT_TYPE_LABELS[sa.alert_type] || sa.alert_type}</span>}
                              {sa.submitted_by && <span>By: {sa.submitted_by}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> No scam alerts reported</p>
                    )}
                  </div>

                  {/* Active loans section */}
                  <div className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Active Loans Across Platform</span>
                    </div>
                    {hasLoans ? (
                      <div className="space-y-1.5">
                        {r.active_loans!.map(l => (
                          <div key={l.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Building2 className="w-3.5 h-3.5 text-amber-600" />
                              <span className="font-semibold text-amber-800">{l.lender_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-amber-900">N$ {l.principal_amount.toLocaleString()}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${l.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{l.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> No active loans in registry</p>
                    )}
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

