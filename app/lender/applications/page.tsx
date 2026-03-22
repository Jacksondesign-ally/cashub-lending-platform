"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Search, RefreshCw, Plus, CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

type AppStatus = 'pending' | 'approved' | 'rejected' | 'under_review' | 'disbursed' | 'offer_pending'

interface LoanApp {
  id: string
  borrower_first_name?: string
  borrower_last_name?: string
  borrower_name?: string
  borrower_email?: string
  loan_amount?: number
  loan_purpose?: string
  loan_term?: number
  interest_rate?: number
  status: AppStatus
  created_at: string
  notes?: string
}

const STATUS_CFG: Record<AppStatus, { label: string; color: string }> = {
  pending:       { label: 'Pending',        color: 'bg-yellow-100 text-yellow-700' },
  under_review:  { label: 'Under Review',   color: 'bg-blue-100 text-blue-700' },
  approved:      { label: 'Approved',       color: 'bg-emerald-100 text-emerald-700' },
  rejected:      { label: 'Rejected',       color: 'bg-red-100 text-red-700' },
  disbursed:     { label: 'Disbursed',      color: 'bg-green-100 text-green-700' },
  offer_pending: { label: 'Offer Pending',  color: 'bg-indigo-100 text-indigo-700' },
}

export default function LenderApplicationsPage() {
  const [apps, setApps] = useState<LoanApp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AppStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [form, setForm] = useState({ borrower_first_name: '', borrower_last_name: '', borrower_email: '', loan_amount: '', loan_purpose: '', loan_term: '12' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchApps() }, [])

  const fetchApps = async () => {
    setLoading(true)
    const lenderEmail = localStorage.getItem('userName') || ''
    const lenderId = localStorage.getItem('lenderId')
    try {
      let query = supabase.from('loan_applications').select('*').order('created_at', { ascending: false })
      // Filter by lender_id if available, otherwise fall back to lender_email
      if (lenderId) {
        query = query.eq('lender_id', lenderId)
      } else if (lenderEmail) {
        query = query.eq('lender_email', lenderEmail)
      }
      const { data, error } = await query
      if (!error && data) setApps(data)
      else setApps([])
    } catch (err) { console.error('[CasHuB Error]', err); setApps([]) }
    setLoading(false)
  }

  // Helper: ensure a borrower record exists for this person, return borrower id
  const ensureBorrower = async (firstName: string, lastName: string, email: string | null, lenderId: string | null): Promise<string | null> => {
    if (!email && !firstName) return null
    // Check by email + lender
    if (email && lenderId) {
      const { data: existing } = await supabase.from('borrowers').select('id').eq('email', email).eq('lender_id', lenderId).maybeSingle()
      if (existing) return existing.id
    }
    // Create new borrower
    const { data: created } = await supabase.from('borrowers').insert({
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      lender_id: lenderId || null,
      status: 'active',
      risk_level: 'medium',
    }).select('id').single()
    return created?.id || null
  }

  const updateStatus = async (id: string, status: AppStatus) => {
    setActionLoading(id)
    const lenderId = localStorage.getItem('lenderId')
    await supabase.from('loan_applications').update({ status }).eq('id', id)
    // Create a loan record when approving OR disbursing (if not already created)
    if (status === 'approved' || status === 'disbursed') {
      const app = apps.find(a => a.id === id)
      if (app) {
        // Check if a loan already exists for this application to avoid duplicates
        const { data: existingLoan } = await supabase
          .from('loans')
          .select('id')
          .eq('loan_application_id', id)
          .maybeSingle()
        if (!existingLoan) {
          const borrowerId = await ensureBorrower(app.borrower_first_name || '', app.borrower_last_name || '', app.borrower_email || null, lenderId || null)
          const loanNumber = `L-${Date.now().toString(36).toUpperCase()}`
          await supabase.from('loans').insert({
            loan_number: loanNumber,
            borrower_id: borrowerId,
            borrower_email: app.borrower_email || null,
            lender_id: lenderId || null,
            loan_application_id: id,
            principal_amount: app.loan_amount || 0,
            outstanding_balance: app.loan_amount || 0,
            interest_rate: app.interest_rate || 20,
            term_months: app.loan_term || 12,
            status: 'active',
            purpose: app.loan_purpose || 'General',
            start_date: new Date().toISOString().split('T')[0],
          })
        }
      }
    }
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setActionLoading(null)
  }

  const submitNewApp = async () => {
    if (!form.borrower_first_name || !form.loan_amount) return
    setSaving(true)
    const lenderEmail = localStorage.getItem('userName') || ''
    const lenderId = localStorage.getItem('lenderId')
    try {
      // Always create/find borrower record first
      await ensureBorrower(form.borrower_first_name, form.borrower_last_name, form.borrower_email || null, lenderId || null)
      // Create loan application
      const { error } = await supabase.from('loan_applications').insert({
        borrower_first_name: form.borrower_first_name,
        borrower_last_name: form.borrower_last_name,
        borrower_email: form.borrower_email || null,
        loan_amount: parseFloat(form.loan_amount),
        loan_purpose: form.loan_purpose || 'General',
        loan_term: parseInt(form.loan_term),
        lender_email: lenderEmail,
        lender_id: lenderId || null,
        status: 'pending',
      })
      if (!error) { setShowNewModal(false); setForm({ borrower_first_name: '', borrower_last_name: '', borrower_email: '', loan_amount: '', loan_purpose: '', loan_term: '12' }); fetchApps() }
    } catch (err) { console.error('submitNewApp error:', err) }
    setSaving(false)
  }

  const filtered = apps.filter(a => {
    const q = search.toLowerCase()
    const name = `${a.borrower_first_name || ''} ${a.borrower_last_name || ''}`.toLowerCase()
    const matchSearch = !q || name.includes(q) || a.borrower_email?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = { total: apps.length, pending: apps.filter(a => a.status === 'pending').length, approved: apps.filter(a => a.status === 'approved').length, rejected: apps.filter(a => a.status === 'rejected').length }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Loan Applications</h2>
          <p className="text-neutral-500 text-sm">{stats.pending} pending review</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Application
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-neutral-700' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by borrower name or email..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="disbursed">Disbursed</option>
        </select>
        <button onClick={fetchApps} className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <FileText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No applications found</p>
          </div>
        )}
        {filtered.map(app => {
          const cfg = STATUS_CFG[app.status] || STATUS_CFG.pending
          const borrowerName = `${app.borrower_first_name || ''} ${app.borrower_last_name || ''}`.trim() || app.borrower_name || 'Unknown Borrower'
          return (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900">{borrowerName}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                      <span>N$ {(app.loan_amount || 0).toLocaleString()}</span>
                      <span>{app.loan_purpose || 'General'}</span>
                      <span>{app.loan_term || '—'} months</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400">{new Date(app.created_at).toLocaleDateString()}</span>
                  {expandedId === app.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </div>
              </div>
              {expandedId === app.id && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-neutral-900 uppercase tracking-wide text-[10px]">Application Details</h4>
                    {[
                      { label: 'Borrower', value: borrowerName },
                      { label: 'Email', value: app.borrower_email || 'N/A' },
                      { label: 'Amount Requested', value: `N$ ${(app.loan_amount || 0).toLocaleString()}` },
                      { label: 'Purpose', value: app.loan_purpose || 'General' },
                      { label: 'Term', value: `${app.loan_term || '—'} months` },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between"><span className="text-neutral-500">{item.label}</span><span className="font-medium text-neutral-900">{item.value}</span></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-neutral-900 uppercase tracking-wide text-[10px]">Actions</h4>
                    {(app.status === 'pending' || app.status === 'under_review') && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(app.id, 'approved')} disabled={!!actionLoading} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                          {actionLoading === app.id ? '...' : <><CheckCircle className="w-3.5 h-3.5" /> Approve</>}
                        </button>
                        <button onClick={() => updateStatus(app.id, 'rejected')} disabled={!!actionLoading} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                          {actionLoading === app.id ? '...' : <><XCircle className="w-3.5 h-3.5" /> Reject</>}
                        </button>
                      </div>
                    )}
                    {app.status === 'pending' && (
                      <button onClick={() => updateStatus(app.id, 'under_review')} disabled={!!actionLoading} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold">
                        Mark Under Review
                      </button>
                    )}
                    {app.status === 'approved' && (
                      <button onClick={() => updateStatus(app.id, 'disbursed')} disabled={!!actionLoading} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold">
                        Mark as Disbursed
                      </button>
                    )}
                    {(app.status === 'rejected' || app.status === 'disbursed') && (
                      <div className="bg-neutral-100 rounded-lg p-2 text-center text-xs text-neutral-500">Application {app.status}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">New Loan Application</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'borrower_first_name', label: 'First Name *', type: 'text', col: 1 },
                { key: 'borrower_last_name', label: 'Last Name', type: 'text', col: 1 },
                { key: 'borrower_email', label: 'Email', type: 'email', col: 2 },
                { key: 'loan_amount', label: 'Loan Amount (N$) *', type: 'number', col: 1 },
                { key: 'loan_term', label: 'Term (months)', type: 'number', col: 1 },
                { key: 'loan_purpose', label: 'Loan Purpose', type: 'text', col: 2 },
              ].map(f => (
                <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={submitNewApp} disabled={saving} className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

