"use client"

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import {
  LineChart as RechartsLine,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { supabase } from '@/lib/supabase'

export default function ReportsAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('month')
  const [reportType, setReportType] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPortfolio: 0,
    activeBorrowers: 0,
    collectionRate: 94.2,
    defaultRate: 2.8,
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    completedLoans: 0,
  })

  const [loanTrendData, setLoanTrendData] = useState<{month: string; disbursed: number; collected: number; outstanding: number}[]>([])

  const portfolioDistribution = [
    { name: 'Active Loans', value: stats.activeLoans, color: '#3b82f6' },
    { name: 'Completed', value: stats.completedLoans, color: '#10b981' },
    { name: 'Overdue', value: stats.overdueLoans, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const [riskDistribution, setRiskDistribution] = useState<{name: string; value: number; color: string}[]>([])
  const [collectionRateData, setCollectionRateData] = useState<{week: string; rate: number}[]>([])

  const kpiCards = [
    { title: 'Total Portfolio Value', value: `N$ ${stats.totalPortfolio.toLocaleString()}`, change: '', trend: 'up' as const, icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
    { title: 'Active Borrowers', value: stats.activeBorrowers.toLocaleString(), change: '', trend: 'up' as const, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { title: 'Collection Rate', value: `${stats.collectionRate}%`, change: '', trend: 'up' as const, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { title: 'Default Rate', value: `${stats.defaultRate}%`, change: '', trend: 'down' as const, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
  ]

  const [topPerformers, setTopPerformers] = useState<{name: string; loans: number; totalValue: number; paymentRate: number; creditScore: number}[]>([])
  const [riskAlerts, setRiskAlerts] = useState<{borrower: string; issue: string; severity: string; daysOverdue: number}[]>([])

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'loans', name: 'Loan Analysis', icon: FileText },
    { id: 'collections', name: 'Collections', icon: DollarSign },
    { id: 'risk', name: 'Risk Assessment', icon: AlertCircle },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data: loans } = await supabase.from('loans').select('principal_amount, outstanding_balance, status')
      const { data: borrowers } = await supabase.from('borrowers').select('id, status, risk_level')

      if (loans && loans.length > 0) {
        const totalPortfolio = loans.reduce((s: number, l: any) => s + (l.principal_amount || 0), 0)
        const activeLoans = loans.filter((l: any) => l.status === 'active').length
        const overdueLoans = loans.filter((l: any) => l.status === 'defaulted' || l.status === 'overdue').length
        const completedLoans = loans.filter((l: any) => l.status === 'completed').length
        const totalOutstanding = loans.reduce((s: number, l: any) => s + (l.outstanding_balance || 0), 0)
        const collRate = totalPortfolio > 0 ? Math.round(((totalPortfolio - totalOutstanding) / totalPortfolio) * 1000) / 10 : 0
        const defRate = loans.length > 0 ? Math.round((overdueLoans / loans.length) * 1000) / 10 : 0
        setStats({
          totalPortfolio,
          totalLoans: loans.length,
          activeLoans,
          overdueLoans,
          completedLoans,
          activeBorrowers: 0,
          collectionRate: collRate,
          defaultRate: defRate,
        })
      }

      if (borrowers && borrowers.length > 0) {
        const activeBorrowers = borrowers.filter((b: any) => b.status !== 'inactive').length
        setStats(prev => ({ ...prev, activeBorrowers }))

        // Build risk distribution from real borrower data
        const low = borrowers.filter((b: any) => b.risk_level === 'low').length
        const med = borrowers.filter((b: any) => b.risk_level === 'medium').length
        const high = borrowers.filter((b: any) => b.risk_level === 'high').length
        setRiskDistribution([
          { name: 'Low Risk', value: low, color: '#10b981' },
          { name: 'Medium Risk', value: med, color: '#f59e0b' },
          { name: 'High Risk', value: high, color: '#ef4444' },
        ].filter(d => d.value > 0))
      }

      // Fetch overdue loans for risk alerts
      const { data: overdueData } = await supabase
        .from('loans')
        .select('*, borrower:borrower_id(first_name, last_name)')
        .in('status', ['defaulted', 'overdue'])
        .order('days_overdue', { ascending: false })
        .limit(10)

      if (overdueData && overdueData.length > 0) {
        setRiskAlerts(overdueData.map((l: any) => ({
          borrower: l.borrower ? `${l.borrower.first_name} ${l.borrower.last_name}` : 'Unknown',
          issue: l.status === 'defaulted' ? 'Loan defaulted' : `Payment overdue`,
          severity: (l.days_overdue || 0) > 14 ? 'high' : 'medium',
          daysOverdue: l.days_overdue || 0,
        })))
      }

      // Fetch top borrowers by credit score for performers
      const { data: topData } = await supabase
        .from('borrowers')
        .select('first_name, last_name, credit_score')
        .order('credit_score', { ascending: false })
        .limit(5)

      if (topData && topData.length > 0) {
        setTopPerformers(topData.map((b: any) => ({
          name: `${b.first_name} ${b.last_name}`,
          loans: 0, totalValue: 0, paymentRate: 0,
          creditScore: b.credit_score || 0,
        })))
      }
    } catch (err) {
      console.error('Error fetching report stats:', err)
    }
    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    }
    return colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h2>
          <p className="text-neutral-500">Comprehensive insights into your lending operations</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <select value={timeframe} onChange={e => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50">
            <Filter className="w-4 h-4 mr-1" /> Filters
          </button>
          <button className="inline-flex items-center px-3 py-2 bg-cashub-600 text-white rounded-lg text-sm hover:bg-cashub-700">
            <Download className="w-4 h-4 mr-1" /> Export
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-3">
        <div className="flex gap-2 overflow-x-auto">
          {reportTypes.map(type => (
            <button key={type.id} onClick={() => setReportType(type.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                reportType === type.id
                  ? 'bg-cashub-600 text-white shadow-sm'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}>
              <type.icon className="w-4 h-4" />
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-0.5">{kpi.value}</h3>
            <p className="text-sm text-neutral-500">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Loan Performance Trends
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={loanTrendData}>
              <defs>
                <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="disbursed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDisbursed)" name="Disbursed" />
              <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" /> Portfolio Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPie>
              <Pie
                data={portfolioDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name || ''} ${((props.percent || 0) * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-600" /> Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Rate Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" /> Collection Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsLine data={collectionRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[80, 100]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} name="Collection Rate %" />
            </RechartsLine>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Top Performing Borrowers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((performer, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 hover:border-neutral-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{performer.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{performer.name}</p>
                      <p className="text-[10px] text-neutral-500">{performer.loans} active loans</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">N$ {performer.totalValue.toLocaleString()}</p>
                    <p className="text-[10px] text-green-600 font-medium">{performer.paymentRate}% on-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${performer.creditScore}%` }} />
                  </div>
                  <span className="text-[10px] text-neutral-500">Score: {performer.creditScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" /> Risk Alerts
          </h3>
          <div className="space-y-3">
            {riskAlerts.map((alert, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{alert.borrower}</p>
                    <p className="text-xs text-neutral-500">{alert.issue}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                {alert.daysOverdue > 0 && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{alert.daysOverdue} days overdue</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-600 font-medium hover:bg-neutral-50 transition-all">
            View All Alerts
          </button>
        </div>
      </div>
    </div>
  )
}
