"use client"

import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  CheckCircle,
  XCircle,
  Database,
  Shield,
  CreditCard,
  ChevronRight
} from 'lucide-react'

// Types
type Loan = {
  id: string
  borrower: string
  amount: string
  status: string
  date: string
  riskLevel: string
}

type Stat = {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: any
  color: string
  bgColor: string
}

type Alert = {
  type: 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
}

type Health = {
  ok: boolean
  projectRef?: string | null
  error?: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState<Stat[]>([
    {
      title: 'Total Borrowers',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Loans',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Portfolio',
      value: 'N$ 0',
      change: '+0%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Default Rate',
      value: '0%',
      change: '0%',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ])
  const [recentLoans, setRecentLoans] = useState<Loan[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [health, setHealth] = useState<Health | null>(null)

  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin'

  // Fetch data from Supabase
  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
    setHealth(isSupabaseConfigured ? { ok: true } : { ok: false, error: 'Supabase environment variables not configured' })
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch borrowers count
      const { count: borrowersCount } = await supabase
        .from('borrowers')
        .select('*', { count: 'exact', head: true })

      // Fetch lenders count (optional table)
      let lendersCount: number | null = null
      const { count: lendersCountRaw, error: lendersError } = await supabase
        .from('lenders')
        .select('*', { count: 'exact', head: true })
      if (!lendersError && typeof lendersCountRaw === 'number') {
        lendersCount = lendersCountRaw
      }

      // Fetch loans data
      const { data: loansData } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Calculate portfolio value
      const { data: portfolioData } = await supabase
        .from('loans')
        .select('principal_amount, status')

      const totalPortfolio = portfolioData?.reduce((sum: number, loan: any) => sum + (loan.principal_amount || 0), 0) || 0
      const activeLoans = portfolioData?.filter((loan: any) => loan.status === 'active').length || 0
      const defaultedLoans = portfolioData?.filter((loan: any) => loan.status === 'defaulted' || loan.status === 'overdue').length || 0
      const pendingLoans = portfolioData?.filter((loan: any) => loan.status === 'pending').length || 0
      const defaultRate = portfolioData && portfolioData.length > 0 ? (defaultedLoans / portfolioData.length) * 100 : 0

      // Subscription revenue (optional table)
      let subscriptionRevenue = 0
      const { data: subsData, error: subsError } = await supabase
        .from('lender_subscriptions')
        .select('amount, status')
      if (!subsError && subsData) {
        subscriptionRevenue = subsData
          .filter((s: any) => s.status === 'ACTIVE')
          .reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
      }

      // Update stats - role-aware
      const role = localStorage.getItem('userRole')
      const isAdmin = role === 'super_admin' || role === 'admin'

      const dashStats: Stat[] = [
        {
          title: 'Total Borrowers',
          value: borrowersCount?.toLocaleString() || '0',
          change: undefined,
          changeType: 'positive',
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        ...(isAdmin ? [{
          title: 'Total Lenders',
          value: lendersCount != null ? lendersCount.toString() : 'N/A',
          change: '+0%',
          changeType: 'positive' as const,
          icon: Shield,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50'
        }] : []),
        {
          title: 'Active Loans',
          value: activeLoans.toString(),
          change: undefined,
          changeType: 'positive',
          icon: FileText,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          title: 'Total Portfolio',
          value: `N$ ${(totalPortfolio / 1000000).toFixed(1)}M`,
          change: undefined,
          changeType: 'positive',
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        {
          title: 'Default Rate',
          value: `${defaultRate.toFixed(1)}%`,
          change: '-0.8%',
          changeType: defaultRate > 5 ? 'negative' : 'positive',
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        },
        ...(isAdmin ? [{
          title: 'Subscription Revenue',
          value: `N$ ${subscriptionRevenue.toLocaleString()}`,
          change: '+0%',
          changeType: 'positive' as const,
          icon: CreditCard,
          color: 'text-green-700',
          bgColor: 'bg-green-50'
        }] : [])
      ]
      setStats(dashStats)

      // Format recent loans with borrower info
      const formattedLoans = await Promise.all(
        (loansData || []).map(async (loan: any) => {
          const { data: borrower } = await supabase
            .from('borrowers')
            .select('first_name, last_name, risk_level')
            .eq('id', loan.borrower_id)
            .single()

          return {
            id: loan.loan_number,
            borrower: borrower ? `${borrower.first_name} ${borrower.last_name}` : 'Unknown',
            amount: `N$ ${loan.principal_amount?.toLocaleString() || 0}`,
            status: loan.status,
            date: new Date(loan.created_at).toLocaleDateString(),
            riskLevel: borrower?.risk_level || 'medium'
          }
        })
      )

      setRecentLoans(formattedLoans)

      // Build alerts from real data
      const dynamicAlerts: typeof alerts = []
      if (defaultedLoans > 0) {
        dynamicAlerts.push({
          type: 'error',
          title: 'Payment Overdue',
          message: `${defaultedLoans} loan${defaultedLoans > 1 ? 's are' : ' is'} overdue or defaulted`,
          time: 'Now'
        })
      }
      if (pendingLoans > 0) {
        dynamicAlerts.push({
          type: 'warning',
          title: 'Pending Applications',
          message: `${pendingLoans} loan application${pendingLoans > 1 ? 's' : ''} awaiting review`,
          time: 'Now'
        })
      }
      setAlerts(dynamicAlerts)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'defaulted': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-50 text-red-800 border-red-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {health && health.ok && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50 text-green-800">
              <span className="text-sm font-medium">Supabase Connected</span>
              <span className="text-xs">Project: {health.projectRef || 'unknown'}</span>
            </div>
          )}
          {health && !health.ok && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 text-red-800">
              <span className="text-sm font-medium">Supabase Connection Issue</span>
              <span className="text-xs truncate max-w-[60%]">{health.error}</span>
            </div>
          )}
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-neutral-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Modules Quick Access */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">System Modules</h3>
              <p className="text-sm text-neutral-500">Quick access to imported system features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Loan Officer', icon: FileText, href: '/dashboard/loans', color: 'text-green-600', bgColor: 'bg-green-50', desc: 'Manage loan applications', roles: ['super_admin', 'admin', 'lender_admin', 'lender'] },
                { name: 'NAMFISA', icon: Database, href: '/dashboard/compliance', color: 'text-indigo-600', bgColor: 'bg-indigo-50', desc: 'Compliance & reporting', roles: ['super_admin', 'admin', 'lender_admin', 'lender'] },
                { name: 'Marketplace', icon: TrendingUp, href: '/dashboard/marketplace', color: 'text-cyan-600', bgColor: 'bg-cyan-50', desc: 'Lender marketplace', roles: ['super_admin', 'admin', 'lender_admin', 'lender'] },
                { name: 'Billing', icon: CreditCard, href: '/dashboard/billing', color: 'text-yellow-600', bgColor: 'bg-yellow-50', desc: 'Subscription & invoices', roles: ['super_admin', 'admin', 'lender_admin', 'lender', 'viewer'] },
              ].filter(m => !userRole || m.roles.includes(userRole)).map((module) => (
                <Link 
                  key={module.name} 
                  href={module.href}
                  className="group bg-white rounded-xl border border-neutral-200 p-4 hover:border-cashub-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${module.bgColor}`}>
                      <module.icon className={`w-5 h-5 ${module.color}`} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-cashub-500 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-neutral-900">{module.name}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{module.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Loans */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">Recent Loans</h3>
                <p className="text-sm text-neutral-500 mt-1">Latest loan applications and updates</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {recentLoans.length > 0 ? (
                      recentLoans.map((loan, index) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {loan.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {loan.borrower}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                            {loan.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(loan.riskLevel)}`}>
                              {loan.riskLevel}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                          No loans found. Start by creating your first loan application.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">System Alerts</h3>
                <p className="text-sm text-neutral-500 mt-1">Important notifications and updates</p>
              </div>
              <div className="p-6 space-y-4">
                {alerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {alert.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {alert.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                        {alert.type === 'error' && <XCircle className="w-5 h-5" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-75">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

