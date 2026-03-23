"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3, RefreshCw, TrendingUp, TrendingDown, Users, FileText, Banknote, AlertCircle } from 'lucide-react'
import { RiskDistributionChart, LoanStatusChart } from '@/components/charts/LoanCharts'

interface ReportStats {
  totalBorrowers: number
  totalLoans: number
  activeLoans: number
  overdueLoans: number
  completedLoans: number
  totalDisbursed: number
  totalOutstanding: number
  totalCollected: number
  defaultRate: number
  pendingApplications: number
  riskLow: number
  riskMedium: number
  riskHigh: number
}

export default function LenderReportsPage() {
  const [stats, setStats] = useState<ReportStats>({ totalBorrowers: 0, totalLoans: 0, activeLoans: 0, overdueLoans: 0, completedLoans: 0, totalDisbursed: 0, totalOutstanding: 0, totalCollected: 0, defaultRate: 0, pendingApplications: 0, riskLow: 0, riskMedium: 0, riskHigh: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

  useEffect(() => { fetchStats() }, [period])


  const getDateRange = (period: string): { start: string | null; end: string | null } => {
    const now = new Date()
    const end = now.toISOString()
    let start: string | null = null
    
    switch (period) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1).toISOString()
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1).toISOString()
        break
      case 'all':
      default:
        start = null
        break
    }
    
    return { start, end }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      const lenderId = typeof window !== 'undefined' ? localStorage.getItem('lenderId') : null
      const lenderEmail = typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : ''
      const { start, end } = getDateRange(period)

      // Build queries scoped to this lender with date filtering
      let borrowerQ = supabase.from('borrowers').select('id, risk_level, email')
      let payQ = supabase.from('payments').select('id, amount, status')
      
      if (lenderId) {
        borrowerQ = borrowerQ.eq('lender_id', lenderId)
        payQ = payQ.eq('lender_id', lenderId)
      }
      
      if (start) {
        borrowerQ = borrowerQ.gte('created_at', start).lte('created_at', end)
        payQ = payQ.gte('created_at', start).lte('created_at', end)
      }

      const [{ data: borrowers }, { data: apps }, { data: payments }] = await Promise.all([
        borrowerQ,
        lenderId
          ? supabase.from('loan_applications').select('id, status').eq('lender_id', lenderId)
          : supabase.from('loan_applications').select('id, status'),
        payQ,
      ])

      // Collect loans via lender_id + borrower_id + borrower_email (same logic as loans page)
      const seen = new Set<string>()
      let allLoansData: any[] = []
      if (lenderId) {
        const { data: d1 } = await supabase.from('loans').select('id, status, principal_amount, outstanding_balance').eq('lender_id', lenderId)
        for (const l of (d1 || [])) { if (!seen.has(l.id)) { seen.add(l.id); allLoansData.push(l) } }

        const bids = (borrowers || []).map((b: any) => b.id).filter(Boolean)
        const emails = (borrowers || []).map((b: any) => b.email).filter(Boolean)
        if (bids.length > 0) {
          const { data: d2 } = await supabase.from('loans').select('id, status, principal_amount, outstanding_balance').in('borrower_id', bids)
          for (const l of (d2 || [])) { if (!seen.has(l.id)) { seen.add(l.id); allLoansData.push(l) } }
        }
        if (emails.length > 0) {
          const { data: d3 } = await supabase.from('loans').select('id, status, principal_amount, outstanding_balance').in('borrower_email', emails)
          for (const l of (d3 || [])) { if (!seen.has(l.id)) { seen.add(l.id); allLoansData.push(l) } }
        }
      } else {
        // No lenderId — cannot scope data, show empty state to prevent data leak
        console.warn('No lenderId found in localStorage — cannot fetch reports')
        allLoansData = []
      }

      const l = allLoansData
      const b = borrowers || []
      const a = apps || []
      const p = payments || []

      const totalDisbursed = l.reduce((s: number, x: any) => s + (x.principal_amount || 0), 0)
      const totalOutstanding = l.reduce((s: number, x: any) => s + (x.outstanding_balance ?? x.principal_amount ?? 0), 0)
      const totalCollected = p.filter((x: any) => x.status === 'completed').reduce((s: number, x: any) => s + (x.amount || 0), 0)
      const overdueLoans = l.filter((x: any) => x.status === 'overdue' || x.status === 'defaulted').length

      setStats({
        totalBorrowers: b.length,
        totalLoans: l.length,
        activeLoans: l.filter((x: any) => x.status === 'active').length,
        overdueLoans,
        completedLoans: l.filter((x: any) => x.status === 'completed').length,
        totalDisbursed,
        totalOutstanding,
        totalCollected,
        defaultRate: l.length > 0 ? parseFloat(((overdueLoans / l.length) * 100).toFixed(1)) : 0,
        pendingApplications: a.filter((x: any) => x.status === 'pending').length,
        riskLow: b.filter((x: any) => x.risk_level === 'low').length,
        riskMedium: b.filter((x: any) => x.risk_level === 'medium').length,
        riskHigh: b.filter((x: any) => x.risk_level === 'high' || x.risk_level === 'critical').length,
      })
    } catch (err) { console.error('Reports fetch error:', err) }
    setLoading(false)
  }

  const collectionRate = stats.totalDisbursed > 0 ? ((stats.totalCollected / stats.totalDisbursed) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h2>
          <p className="text-neutral-500 text-sm">Portfolio performance overview</p>
        </div>
        <button onClick={fetchStats} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Reporting Period</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Filter reports by time period</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Disbursed', value: `N$ ${stats.totalDisbursed.toLocaleString()}`, icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Outstanding', value: `N$ ${stats.totalOutstanding.toLocaleString()}`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Collected', value: `N$ ${stats.totalCollected.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Collection Rate', value: `${collectionRate}%`, icon: BarChart3, color: 'text-cashub-600', bg: 'bg-cashub-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            </div>
            <p className="text-lg font-bold text-neutral-900">{loading ? '—' : s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Reporting Period</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Filter reports by time period</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Portfolio */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Loan Portfolio Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Loans', value: stats.totalLoans, sub: 'All time' },
              { label: 'Active Loans', value: stats.activeLoans, sub: 'Currently running' },
              { label: 'Completed Loans', value: stats.completedLoans, sub: 'Fully repaid' },
              { label: 'Overdue / Defaulted', value: stats.overdueLoans, sub: `${stats.defaultRate}% default rate` },
              { label: 'Pending Applications', value: stats.pendingApplications, sub: 'Awaiting review' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div><p className="text-sm text-neutral-700">{item.label}</p><p className="text-[10px] text-neutral-400">{item.sub}</p></div>
                <p className="text-sm font-bold text-neutral-900">{loading ? '—' : item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Active', count: stats.activeLoans, total: stats.totalLoans, color: 'bg-blue-500' },
              { label: 'Completed', count: stats.completedLoans, total: stats.totalLoans, color: 'bg-green-500' },
              { label: 'Overdue', count: stats.overdueLoans, total: stats.totalLoans, color: 'bg-red-500' },
              { label: 'Pending Apps', count: stats.pendingApplications, total: stats.totalLoans + stats.pendingApplications, color: 'bg-yellow-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-neutral-600">{item.label}</span>
                  <span className="text-xs font-semibold text-neutral-900">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Borrower Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Borrower Risk Distribution</h3>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Reporting Period</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Filter reports by time period</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Low Risk', count: stats.riskLow, color: 'bg-green-50 border-green-200', text: 'text-green-700' },
              { label: 'Medium Risk', count: stats.riskMedium, color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
              { label: 'High Risk', count: stats.riskHigh, color: 'bg-red-50 border-red-200', text: 'text-red-700' },
            ].map((r, i) => (
              <div key={i} className={`rounded-xl border p-4 text-center ${r.color}`}>
                <p className={`text-2xl font-bold ${r.text}`}>{loading ? '—' : r.count}</p>
                <p className={`text-xs font-medium mt-1 ${r.text}`}>{r.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">Total registered borrowers: <span className="font-semibold text-neutral-900">{stats.totalBorrowers}</span></p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Capital Deployed', value: `N$ ${stats.totalDisbursed.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600' },
              { label: 'Outstanding Balance', value: `N$ ${stats.totalOutstanding.toLocaleString()}`, icon: AlertCircle, color: 'text-amber-600' },
              { label: 'Total Repayments', value: `N$ ${stats.totalCollected.toLocaleString()}`, icon: Banknote, color: 'text-green-600' },
              { label: 'Default Rate', value: `${stats.defaultRate}%`, icon: TrendingDown, color: stats.defaultRate > 10 ? 'text-red-600' : 'text-green-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                <div className="flex-1">
                  <p className="text-xs text-neutral-500">{item.label}</p>
                  <p className="text-sm font-bold text-neutral-900">{loading ? '—' : item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskDistributionChart
          title="Risk Distribution"
          data={[
            { name: 'Low', value: stats.riskLow },
            { name: 'Medium', value: stats.riskMedium },
            { name: 'High', value: stats.riskHigh },
          ].filter(d => d.value > 0)}
        />
        <LoanStatusChart
          title="Loan Status Breakdown"
          data={[
            { status: 'Active', count: stats.activeLoans },
            { status: 'Completed', count: stats.completedLoans },
            { status: 'Overdue', count: stats.overdueLoans },
            { status: 'Pending', count: stats.pendingApplications },
          ].filter(d => d.count > 0)}
        />
      </div>
    </div>
  )
}
