"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Building, Search, RefreshCw, Eye, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface Loan {
  id: string
  loan_number?: string
  principal_amount: number
  outstanding_balance?: number
  monthly_payment?: number
  term_months?: number
  interest_rate?: number
  status: string
  purpose?: string
  loan_purpose?: string
  start_date?: string
  end_date?: string
  application_date?: string
  disbursement_date?: string
  days_overdue?: number
  borrower_email?: string
  created_at: string
  borrower?: { first_name: string; last_name: string; risk_level?: string }
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  defaulted: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  declined: 'bg-gray-100 text-gray-600',
}

export default function LenderLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { fetchLoans() }, [])

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const lenderId = localStorage.getItem('lenderId')
      const sel = '*, borrower:borrower_id(first_name, last_name, risk_level)'
      if (lenderId) {
        const allLoans: Loan[] = []
        const seen = new Set<string>()

        // 1. Loans directly tagged with this lender_id
        const { data: d1 } = await supabase.from('loans').select(sel).eq('lender_id', lenderId).order('created_at', { ascending: false })
        for (const l of (d1 || [])) { if (!seen.has(l.id)) { seen.add(l.id); allLoans.push(l) } }

        // 2. Loans via borrowers linked to this lender
        const { data: borrowers } = await supabase.from('borrowers').select('id, email').eq('lender_id', lenderId)
        if (borrowers && borrowers.length > 0) {
          const bids = borrowers.map((b: any) => b.id).filter(Boolean)
          const emails = borrowers.map((b: any) => b.email).filter(Boolean)

          if (bids.length > 0) {
            const { data: d2 } = await supabase.from('loans').select(sel).in('borrower_id', bids).order('created_at', { ascending: false })
            for (const l of (d2 || [])) { if (!seen.has(l.id)) { seen.add(l.id); allLoans.push(l) } }
          }
          // 3. Loans by borrower_email (marketplace-accepted loans)
          if (emails.length > 0) {
            const { data: d3 } = await supabase.from('loans').select(sel).in('borrower_email', emails).order('created_at', { ascending: false })
            for (const l of (d3 || [])) { if (!seen.has(l.id)) { seen.add(l.id); allLoans.push(l) } }
          }
        }
        setLoans(allLoans)
      } else {
        // No lenderId — cannot scope data, show empty state to prevent data leak
        console.warn('No lenderId found in localStorage — cannot fetch loans')
        setLoans([])
      }
    } catch (err) { console.error('[CasHuB Error]', err); setLoans([]) }
    setLoading(false)
  }

  const filtered = loans.filter(l => {
    const name = l.borrower ? `${l.borrower.first_name} ${l.borrower.last_name}` : ''
    const q = search.toLowerCase()
    const matchSearch = !q || name.toLowerCase().includes(q) || (l.loan_number || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    overdue: loans.filter(l => l.status === 'overdue' || l.status === 'defaulted').length,
    totalPortfolio: loans.reduce((s, l) => s + (l.principal_amount || 0), 0),
    outstanding: loans.reduce((s, l) => s + (l.outstanding_balance || l.principal_amount || 0), 0),
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Active Loans</h2>
        <p className="text-neutral-500 text-sm">{stats.active} active loans in your portfolio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Loans', value: stats.total, color: 'text-neutral-700' },
          { label: 'Active', value: stats.active, color: 'text-blue-600' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-600' },
          { label: 'Total Portfolio', value: `N$ ${stats.totalPortfolio.toLocaleString()}`, color: 'text-cashub-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">{stats.overdue} Overdue Loan{stats.overdue > 1 ? 's' : ''} Require Action</p>
            <p className="text-xs text-red-600 mt-0.5">Outstanding balance: N$ {stats.outstanding.toLocaleString()}. Follow up with borrowers immediately.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by borrower or loan number..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
        <button onClick={fetchLoans} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Building className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No loans found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Loan #', 'Borrower', 'Principal', 'Outstanding', 'Monthly', 'Term', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(loan => {
                  const borrowerName = loan.borrower ? `${loan.borrower.first_name} ${loan.borrower.last_name}` : 'Unknown'
                  const statusColor = STATUS_COLORS[loan.status] || 'bg-gray-100 text-gray-600'
                  const isExpanded = expandedId === loan.id
                  return (
                    <React.Fragment key={loan.id}>
                    <tr className={`hover:bg-neutral-50 transition-colors ${loan.status === 'overdue' || loan.status === 'defaulted' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3 text-xs font-mono text-neutral-700">{loan.loan_number || loan.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-neutral-900">{borrowerName}</p>
                        {loan.borrower?.risk_level && <p className="text-[10px] text-neutral-400 capitalize">{loan.borrower.risk_level} risk</p>}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-900">N$ {(loan.principal_amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">N$ {(loan.outstanding_balance ?? loan.principal_amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">N$ {(loan.monthly_payment || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{loan.term_months || '—'} mo</td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>{loan.status}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandedId(isExpanded ? null : loan.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-neutral-50/70">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div><span className="text-neutral-500 block">Interest Rate</span><span className="font-semibold text-neutral-900">{loan.interest_rate || 0}%</span></div>
                            <div><span className="text-neutral-500 block">Application Date</span><span className="font-semibold text-neutral-900">{loan.application_date || loan.created_at?.split('T')[0] || '—'}</span></div>
                            <div><span className="text-neutral-500 block">Start Date</span><span className="font-semibold text-neutral-900">{loan.start_date || '—'}</span></div>
                            <div><span className="text-neutral-500 block">End Date</span><span className="font-semibold text-neutral-900">{loan.end_date || '—'}</span></div>
                            <div><span className="text-neutral-500 block">Days Overdue</span><span className="font-semibold text-neutral-900">{loan.days_overdue || 0}</span></div>
                            <div><span className="text-neutral-500 block">Borrower Email</span><span className="font-semibold text-neutral-900">{loan.borrower_email || '—'}</span></div>
                            <div><span className="text-neutral-500 block">Loan Purpose</span><span className="font-semibold text-neutral-900">{loan.purpose || loan.loan_purpose || '—'}</span></div>
                            <div><span className="text-neutral-500 block">Disbursement Date</span><span className="font-semibold text-neutral-900">{loan.disbursement_date || '—'}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

