"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Activity, Users, Building, TrendingUp, AlertCircle, CheckCircle,
  Clock, RefreshCw, Server, Database, Shield, Bell, AlertTriangle,
  DollarSign, FileText, Search, Filter, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Calendar, MapPin, Globe, Zap
} from 'lucide-react'

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  apiLatency: number
  databaseStatus: 'connected' | 'degraded' | 'down'
  lastBackup: string
  uptime: string
}

interface PlatformStats {
  totalLenders: number
  activeLenders: number
  totalBorrowers: number
  activeBorrowers: number
  totalLoans: number
  activeLoans: number
  totalVolume: number
  monthlyRevenue: number
  pendingKyc: number
  openDisputes: number
  scamAlerts: number
}

interface RecentActivity {
  id: string
  type: 'loan_created' | 'payment_received' | 'borrower_registered' | 'lender_onboarded' | 'dispute_filed' | 'blacklist_added'
  description: string
  entityName: string
  timestamp: string
  amount?: number
}

interface AlertItem {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

export default function AdminMonitoringDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Auto-refresh every 30s
    return () => clearInterval(interval)
  }, [selectedTimeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch platform stats
      const [
        { count: totalLenders },
        { count: activeLenders },
        { count: totalBorrowers },
        { count: activeBorrowers },
        { count: totalLoans },
        { count: activeLoans },
        { data: loansData },
        { data: subscriptionsData },
        { count: pendingKyc },
        { count: openDisputes },
        { count: scamAlerts }
      ] = await Promise.all([
        supabase.from('lenders').select('*', { count: 'exact', head: true }),
        supabase.from('lenders').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('borrowers').select('*', { count: 'exact', head: true }),
        supabase.from('borrowers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('loans').select('*', { count: 'exact', head: true }),
        supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('loans').select('principal_amount').eq('status', 'active'),
        supabase.from('lender_subscriptions').select('amount').eq('status', 'ACTIVE'),
        supabase.from('borrower_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('borrower_disputes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('scam_alerts').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ])

      const totalVolume = loansData?.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0) || 0
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0

      setStats({
        totalLenders: totalLenders || 0,
        activeLenders: activeLenders || 0,
        totalBorrowers: totalBorrowers || 0,
        activeBorrowers: activeBorrowers || 0,
        totalLoans: totalLoans || 0,
        activeLoans: activeLoans || 0,
        totalVolume,
        monthlyRevenue,
        pendingKyc: pendingKyc || 0,
        openDisputes: openDisputes || 0,
        scamAlerts: scamAlerts || 0
      })

      // System health based on actual DB connectivity
      const dbOk = totalLenders !== null && totalBorrowers !== null
      setHealth({
        status: dbOk ? 'healthy' : 'warning',
        apiLatency: 0,
        databaseStatus: dbOk ? 'connected' : 'degraded',
        lastBackup: 'N/A',
        uptime: 'N/A'
      })

      // Fetch recent activity
      await fetchRecentActivity()

      // Generate system alerts based on data
      generateAlerts({
        pendingKyc: pendingKyc || 0,
        openDisputes: openDisputes || 0,
        scamAlerts: scamAlerts || 0,
        totalVolume,
        activeLoans: activeLoans || 0
      })

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
    setLoading(false)
  }

  const fetchRecentActivity = async () => {
    try {
      // Fetch last loans with borrower info
      const { data: loans } = await supabase
        .from('loans')
        .select('id, loan_number, principal_amount, created_at, borrower_id')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch last payments
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount, created_at, loan_id')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch last registered borrowers
      const { data: newBorrowers } = await supabase
        .from('borrowers')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Create a map of borrower names
      const borrowerMap = new Map()
      newBorrowers?.forEach(b => {
        borrowerMap.set(b.id, `${b.first_name} ${b.last_name}`)
      })

      // Combine and sort activities
      const activities: RecentActivity[] = [
        ...(loans?.map(loan => ({
          id: loan.id,
          type: 'loan_created' as const,
          description: `Loan ${loan.loan_number} created`,
          entityName: borrowerMap.get(loan.borrower_id) || 'Unknown',
          timestamp: loan.created_at,
          amount: loan.principal_amount
        })) || []),
        ...(payments?.map(payment => ({
          id: payment.id,
          type: 'payment_received' as const,
          description: `Payment received`,
          entityName: 'Borrower',
          timestamp: payment.created_at,
          amount: payment.amount
        })) || []),
        ...(newBorrowers?.map(borrower => ({
          id: borrower.id,
          type: 'borrower_registered' as const,
          description: 'New borrower registered',
          entityName: `${borrower.first_name} ${borrower.last_name}`,
          timestamp: borrower.created_at
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

      setActivities(activities)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  const generateAlerts = (data: { pendingKyc: number; openDisputes: number; scamAlerts: number; totalVolume: number; activeLoans: number }) => {
    const newAlerts: AlertItem[] = []

    if (data.pendingKyc > 10) {
      newAlerts.push({
        id: 'kyc-backlog',
        severity: 'warning',
        title: 'KYC Backlog',
        message: `${data.pendingKyc} borrowers pending KYC verification`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }

    if (data.openDisputes > 5) {
      newAlerts.push({
        id: 'dispute-spike',
        severity: 'critical',
        title: 'High Dispute Volume',
        message: `${data.openDisputes} open disputes require attention`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }

    if (data.scamAlerts > 0) {
      newAlerts.push({
        id: 'scam-alert',
        severity: 'critical',
        title: 'Active Scam Alerts',
        message: `${data.scamAlerts} active scam alerts in the system`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }

    if (data.totalVolume > 1000000) {
      newAlerts.push({
        id: 'volume-milestone',
        severity: 'info',
        title: 'Volume Milestone',
        message: `Platform has exceeded N$1M in active loans`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      })
    }

    setAlerts(newAlerts)
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const formatCurrency = (amount: number) => {
    return `N$${amount.toLocaleString()}`
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Platform Monitoring</h2>
          <p className="text-sm text-neutral-500">Real-time overview of system health and platform activity</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
          >
            <option value="1h">Last 1 hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Last updated */}
      <div className="text-xs text-neutral-400">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* System Health Status */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`bg-white rounded-xl shadow-sm border-2 p-4 ${
            health.status === 'healthy' ? 'border-green-200' : 
            health.status === 'warning' ? 'border-yellow-200' : 'border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">System Status</p>
                <p className={`text-lg font-bold capitalize ${
                  health.status === 'healthy' ? 'text-green-600' : 
                  health.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {health.status}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                health.status === 'healthy' ? 'bg-green-100' : 
                health.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Server className={`w-5 h-5 ${
                  health.status === 'healthy' ? 'text-green-600' : 
                  health.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">API Latency</p>
                <p className="text-lg font-bold text-neutral-900">{health.apiLatency}ms</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">Database</p>
                <p className={`text-lg font-bold capitalize ${
                  health.databaseStatus === 'connected' ? 'text-green-600' : 
                  health.databaseStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {health.databaseStatus}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                health.databaseStatus === 'connected' ? 'bg-green-100' : 
                health.databaseStatus === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Database className={`w-5 h-5 ${
                  health.databaseStatus === 'connected' ? 'text-green-600' : 
                  health.databaseStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">Uptime</p>
                <p className="text-lg font-bold text-neutral-900">{health.uptime}</p>
              </div>
              <div className="p-2 bg-violet-50 rounded-lg">
                <Activity className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Last backup: {new Date(health.lastBackup).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Lenders</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalLenders}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-600 font-medium">{stats.activeLenders} active</span>
              <span className="text-xs text-neutral-400">• {stats.totalLenders - stats.activeLenders} inactive</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Borrowers</p>
              <div className="p-2 bg-violet-50 rounded-lg">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalBorrowers}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-600 font-medium">{stats.activeBorrowers} active</span>
              {stats.pendingKyc > 0 && (
                <span className="text-xs text-amber-600 ml-2">• {stats.pendingKyc} pending KYC</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Loans</p>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.activeLoans}</p>
            <p className="text-xs text-neutral-400 mt-1">of {stats.totalLoans} total loans</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Volume</p>
              <div className="p-2 bg-cashub-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-cashub-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalVolume)}</p>
            <p className="text-xs text-neutral-400 mt-1">Active loan portfolio</p>
          </div>
        </div>
      )}

      {/* Alerts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-neutral-900">System Alerts</h3>
            </div>
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {alerts.filter(a => !a.acknowledged).length}
              </span>
            )}
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No active alerts</p>
                <p className="text-xs text-neutral-400">System is operating normally</p>
              </div>
            ) : (
              alerts.filter(a => !a.acknowledged).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                    alert.severity === 'warning' ? 'bg-amber-50 border-amber-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {alert.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                       alert.severity === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> :
                       <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-sm font-semibold ${
                          alert.severity === 'critical' ? 'text-red-800' :
                          alert.severity === 'warning' ? 'text-amber-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cashub-600" />
              <h3 className="font-semibold text-neutral-900">Recent Activity</h3>
            </div>
            <button className="text-xs text-cashub-600 hover:text-cashub-700 font-medium">
              View All
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No recent activity</p>
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'loan_created' ? 'bg-emerald-100 text-emerald-600' :
                      activity.type === 'payment_received' ? 'bg-green-100 text-green-600' :
                      activity.type === 'borrower_registered' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'lender_onboarded' ? 'bg-violet-100 text-violet-600' :
                      activity.type === 'dispute_filed' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {activity.type === 'loan_created' ? <FileText className="w-4 h-4" /> :
                       activity.type === 'payment_received' ? <DollarSign className="w-4 h-4" /> :
                       activity.type === 'borrower_registered' ? <Users className="w-4 h-4" /> :
                       activity.type === 'lender_onboarded' ? <Building className="w-4 h-4" /> :
                       activity.type === 'dispute_filed' ? <AlertTriangle className="w-4 h-4" /> :
                       <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{activity.description}</p>
                      <p className="text-xs text-neutral-500">{activity.entityName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue & Compliance Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-cashub-500 to-cashub-700 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-cashub-100 uppercase">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-cashub-100 mt-2">From active subscriptions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">Open Disputes</p>
                <p className={`text-2xl font-bold ${stats.openDisputes > 5 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {stats.openDisputes}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stats.openDisputes > 5 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${stats.openDisputes > 5 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {stats.openDisputes > 5 ? 'Requires immediate attention' : 'Within normal range'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">Scam Alerts</p>
                <p className={`text-2xl font-bold ${stats.scamAlerts > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {stats.scamAlerts}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stats.scamAlerts > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Shield className={`w-5 h-5 ${stats.scamAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {stats.scamAlerts > 0 ? 'Active security alerts' : 'No active alerts'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
