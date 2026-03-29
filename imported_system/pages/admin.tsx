import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Eye, 
  Ban,
  Activity,
  Database,
  FileText,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Globe,
  Clock,
  DollarSign,
  UserCheck,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalLenders: number
  totalBorrowers: number
  totalLoans: number
  totalPortfolio: number
  activeSubscriptions: number
  expiringSubscriptions: number
  suspendedAccounts: number
  fraudAlerts: number
  auditLogs: number
}

interface FraudAlert {
  id: string
  type: 'duplicate_account' | 'device_mismatch' | 'location_anomaly' | 'document_fraud'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId: string
  userEmail: string
  createdAt: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  details: any
}

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  timestamp: string
  details: any
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'fraud' | 'audit' | 'subscriptions' | 'analytics'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Mock system stats - in real app, fetch from Supabase
      const mockStats: SystemStats = {
        totalUsers: 1247,
        totalLenders: 45,
        totalBorrowers: 1202,
        totalLoans: 3456,
        totalPortfolio: 15420000,
        activeSubscriptions: 38,
        expiringSubscriptions: 5,
        suspendedAccounts: 7,
        fraudAlerts: 12,
        auditLogs: 45678
      }

      const mockFraudAlerts: FraudAlert[] = [
        {
          id: '1',
          type: 'duplicate_account',
          severity: 'high',
          description: 'Multiple accounts detected with same ID number',
          userId: 'user123',
          userEmail: 'john.doe@email.com',
          createdAt: '2024-01-15T10:30:00Z',
          status: 'investigating',
          details: {
            accounts: ['user123', 'user456'],
            idNumber: '9201015143087',
            devices: ['iPhone 12', 'Samsung Galaxy']
          }
        },
        {
          id: '2',
          type: 'location_anomaly',
          severity: 'medium',
          description: 'Login from unusual location detected',
          userId: 'user789',
          userEmail: 'jane.smith@email.com',
          createdAt: '2024-01-15T09:15:00Z',
          status: 'open',
          details: {
            normalLocation: 'Windhoek, Namibia',
            currentLocation: 'Cape Town, South Africa',
            distance: '1500km'
          }
        }
      ]

      const mockAuditLogs: AuditLog[] = [
        {
          id: '1',
          action: 'LOAN_APPROVED',
          entity: 'loan',
          entityId: 'loan123',
          userId: 'lender1',
          userEmail: 'lender@company.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: '2024-01-15T14:30:00Z',
          details: { loanAmount: 5000, borrowerId: 'borrower123' }
        },
        {
          id: '2',
          action: 'BLACKLIST_CREATED',
          entity: 'blacklist',
          entityId: 'blacklist456',
          userId: 'lender2',
          userEmail: 'admin@bank.com',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          timestamp: '2024-01-15T13:45:00Z',
          details: { reason: 'DEFAULT', evidenceCount: 2 }
        }
      ]

      setStats(mockStats)
      setFraudAlerts(mockFraudAlerts)
      setAuditLogs(mockAuditLogs)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'false_positive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h2>
            <p className="text-neutral-500">System oversight and management</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Total Users</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {stats.totalLenders} lenders, {stats.totalBorrowers} borrowers
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Total Portfolio</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">
                    N$ {(stats.totalPortfolio / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {stats.totalLoans} active loans
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.activeSubscriptions}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {stats.expiringSubscriptions} expiring soon
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Fraud Alerts</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.fraudAlerts}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {stats.suspendedAccounts} suspended accounts
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('fraud')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'fraud'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Fraud Detection
                  <span className="ml-2 bg-red-100 text-red-600 py-1 px-2 rounded-full text-xs">
                    {fraudAlerts.filter(a => a.status === 'open').length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Audit Logs
                </div>
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'subscriptions'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscriptions
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analytics
                </div>
              </button>
            </nav>
          </div>

          {/* Fraud Detection Tab */}
          {activeTab === 'fraud' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fraud Detection Alerts</h3>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search alerts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                      />
                    </div>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">{alert.description}</h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            User: {alert.userEmail} • {new Date(alert.createdAt).toLocaleString()}
                          </p>
                          <div className="mt-2 text-sm text-neutral-500">
                            <p>Type: {alert.type.replace('_', ' ').toUpperCase()}</p>
                            {alert.details && (
                              <div className="mt-1">
                                {Object.entries(alert.details).map(([key, value]) => (
                                  <span key={key} className="mr-4">
                                    {key}: {JSON.stringify(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button className="text-cashub-600 hover:text-cashub-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Audit Logs</h3>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search audit logs..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {log.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900">
                          <div>
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span className="font-medium text-green-800">Database Connection</span>
                      </div>
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span className="font-medium text-green-800">API Services</span>
                      </div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                        <span className="font-medium text-yellow-800">Storage Usage</span>
                      </div>
                      <span className="text-sm text-yellow-600">78% Full</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent System Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <Activity className="w-4 h-4 text-neutral-600" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">New lender registration</p>
                        <p className="text-xs text-neutral-500">QuickCash Finance • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <CreditCard className="w-4 h-4 text-neutral-600" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Subscription upgrade</p>
                        <p className="text-xs text-neutral-500">Tech Loans • 5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <Shield className="w-4 h-4 text-neutral-600" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Fraud alert resolved</p>
                        <p className="text-xs text-neutral-500">Duplicate account • 1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
