"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Users, FileText, Banknote, Clock, CheckCircle, AlertCircle, ArrowRight, BarChart3, Building, DollarSign, AlertTriangle } from 'lucide-react'

export default function LenderDashboard() {
  const [userName, setUserName] = useState('Lender')
  const [companyName, setCompanyName] = useState('')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBorrowers: 0,
    pendingApplications: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalPortfolio: 0,
    defaultRate: 0,
  })

  useEffect(() => {
    setMounted(true)
    setUserName(localStorage.getItem('userName') || 'Lender')
    setCompanyName(localStorage.getItem('lenderCompany') || '')
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const lenderEmail = localStorage.getItem('userName') || ''
      const lenderId = localStorage.getItem('lenderId')

      const borrowersQuery = lenderId
        ? supabase.from('borrowers').select('id').eq('lender_id', lenderId)
        : supabase.from('borrowers').select('id')

      // Fetch loans — try lender_id first, fallback to borrower_id list
      let loanData: any[] = []
      if (lenderId) {
        const { data: ld } = await supabase.from('loans').select('id, status, principal_amount').eq('lender_id', lenderId)
        if (ld && ld.length > 0) {
          loanData = ld
        } else {
          // fallback: fetch loans where borrower belongs to this lender
          const { data: bids } = await supabase.from('borrowers').select('id').eq('lender_id', lenderId)
          if (bids && bids.length > 0) {
            const { data: ld2 } = await supabase.from('loans').select('id, status, principal_amount').in('borrower_id', bids.map((b: any) => b.id))
            loanData = ld2 || []
          }
        }
      } else {
        const { data: ld } = await supabase.from('loans').select('id, status, principal_amount')
        loanData = ld || []
      }

      const [{ data: borrowers }, { data: apps }, { data: marketplaceAccepted }] = await Promise.all([
        borrowersQuery,
        supabase.from('loan_applications').select('id, status').eq('lender_email', lenderEmail),
        supabase.from('marketplace_applications').select('id').eq('lender_email', lenderEmail).eq('status', 'accepted'),
      ])
      const loans = loanData

      const allLoans = loans || []
      const totalPortfolio = allLoans.reduce((s: number, l: any) => s + (l.principal_amount || 0), 0)
      const activeLoans = allLoans.filter((l: any) => l.status === 'active').length
      const overdueLoans = allLoans.filter((l: any) => l.status === 'overdue' || l.status === 'defaulted').length
      const pending = (apps || []).filter((a: any) => a.status === 'pending').length

      // Combine registered borrowers + marketplace-accepted (avoid double counting)
      const registeredBorrowers = (borrowers || []).length
      const marketplaceExtra = (marketplaceAccepted || []).length
      setStats({
        totalBorrowers: registeredBorrowers + marketplaceExtra,
        pendingApplications: pending,
        activeLoans,
        overdueLoans,
        totalPortfolio,
        defaultRate: allLoans.length > 0 ? Math.round((overdueLoans / allLoans.length) * 100) : 0,
      })
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (!mounted) return null

  const kpis = [
    { label: 'Total Borrowers', value: stats.totalBorrowers, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', href: '/lender/borrowers' },
    { label: 'Pending Applications', value: stats.pendingApplications, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/lender/applications' },
    { label: 'Active Loans', value: stats.activeLoans, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', href: '/lender/loans' },
    { label: 'Overdue Loans', value: stats.overdueLoans, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', href: '/lender/loans' },
    { label: 'Total Portfolio', value: 'N$ ' + stats.totalPortfolio.toLocaleString(), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', href: '/lender/loans' },
    { label: 'Default Rate', value: stats.defaultRate + '%', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', href: '/lender/reports' },
  ]

  const quickActions = [
    { label: 'New Application', href: '/lender/applications', color: 'bg-cashub-600 hover:bg-cashub-700 text-white', icon: FileText },
    { label: 'Register Borrower', href: '/lender/borrowers', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: Users },
    { label: 'Record Repayment', href: '/lender/repayments', color: 'bg-blue-600 hover:bg-blue-700 text-white', icon: Banknote },
    { label: 'View Reports', href: '/lender/reports', color: 'bg-purple-600 hover:bg-purple-700 text-white', icon: BarChart3 },
  ]

  const sections = [
    { title: 'Borrowers', desc: 'Manage registered borrowers and KYC', href: '/lender/borrowers', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Loan Applications', desc: 'Review and process applications', href: '/lender/applications', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Active Loans', desc: 'Monitor your loan portfolio', href: '/lender/loans', icon: Building, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Repayments', desc: 'Collections and payment schedules', href: '/lender/repayments', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Loan Staff', desc: 'Manage loan officers and team', href: '/lender/staff', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Reports', desc: 'Analytics, performance and compliance', href: '/lender/reports', icon: BarChart3, color: 'text-pink-600', bg: 'bg-pink-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cashub-600 to-cashub-700 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome back, {companyName || userName}</h2>
        <p className="text-cashub-100 text-sm mt-0.5">Your lending portfolio overview for today.</p>
        {stats.overdueLoans > 0 && (
          <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 flex items-center gap-2 w-fit">
            <AlertCircle className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-medium">{stats.overdueLoans} overdue loan{stats.overdueLoans > 1 ? 's' : ''} need attention</span>
            <Link href="/lender/loans" className="text-xs underline text-white/80 hover:text-white">View</Link>
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.href} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 hover:shadow-md transition-shadow flex items-center justify-between group">
            <div>
              <p className="text-xs font-medium text-neutral-500">{kpi.label}</p>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">{loading ? '—' : kpi.value}</p>
            </div>
            <div className={'p-2.5 rounded-xl ' + kpi.bg + ' group-hover:scale-110 transition-transform'}>
              <kpi.icon className={'w-5 h-5 ' + kpi.color} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-neutral-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className={'flex items-center gap-3 p-4 rounded-xl transition-all ' + action.color}>
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Portal Sections */}
      <div>
        <h3 className="text-sm font-bold text-neutral-700 mb-3">Portal Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, i) => (
            <Link key={i} href={section.href} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 hover:shadow-md transition-all hover:border-cashub-200 group">
              <div className="flex items-start gap-4">
                <div className={'p-2.5 rounded-xl ' + section.bg + ' group-hover:scale-110 transition-transform'}>
                  <section.icon className={'w-5 h-5 ' + section.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900">{section.title}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{section.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-cashub-500 transition-colors mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
