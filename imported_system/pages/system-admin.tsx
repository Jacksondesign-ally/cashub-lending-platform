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
  PieChart,
  Lock,
  Unlock,
  Plus,
  Building
} from 'lucide-react'

interface SystemUser {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  status: 'active' | 'suspended' | 'pending'
  lastLogin: string
  createdAt: string
  lenderId?: string
  lenderName?: string
  actions: number
}

interface SystemAlert {
  id: string
  type: 'security' | 'performance' | 'compliance' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  createdAt: string
  status: 'active' | 'resolved' | 'ignored'
  actionRequired: boolean
}

interface LenderAccount {
  id: string
  name: string
  registrationNumber: string
  email: string
  status: 'active' | 'suspended' | 'expired' | 'pending'
  subscriptionPlan: string
  subscriptionExpiry: string
  users: number
  loans: number
  portfolio: number
  complianceScore: number
  flags: number
}

export default function SystemAdmin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'lenders' | 'alerts'>('overview')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<SystemUser[]>([])
  const [lenders, setLenders] = useState<LenderAccount[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])

  useEffect(() => {
    fetchSystemData()
  }, [])

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      
      // Mock system data
      const mockUsers: SystemUser[] = [
        {
          id: '1',
          email: 'admin@cashub.com',
          role: 'super_admin',
          status: 'active',
          lastLogin: '2024-01-15T14:30:00Z',
          createdAt: '2023-01-01T00:00:00Z',
          actions: 1250
        },
        {
          id: '2',
          email: 'support@cashub.com',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-15T16:45:00Z',
          createdAt: '2023-02-15T00:00:00Z',
          actions: 890
        }
      ]

      const mockLenders: LenderAccount[] = [
        {
          id: 'lender1',
          name: 'QuickCash Finance',
          registrationNumber: 'RC2024001',
          email: 'admin@quickcash.com',
          status: 'active',
          subscriptionPlan: 'Advanced',
          subscriptionExpiry: '2024-02-15',
          users: 3,
          loans: 1250,
          portfolio: 15420000,
          complianceScore: 92,
          flags: 2
        },
        {
          id: 'lender2',
          name: 'Tech Loans Namibia',
          registrationNumber: 'RC2024002',
          email: 'contact@techloans.com',
          status: 'suspended',
          subscriptionPlan: 'Medium',
          subscriptionExpiry: '2024-01-10',
          users: 1,
          loans: 890,
          portfolio: 8900000,
          complianceScore: 78,
          flags: 5
        }
      ]

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'security',
          severity: 'high',
          title: 'Multiple Failed Login Attempts',
          message: 'User has 10 failed login attempts in the last hour',
          createdAt: '2024-01-15T15:30:00Z',
          status: 'active',
          actionRequired: true
        },
        {
          id: '2',
          type: 'compliance',
          severity: 'medium',
          title: 'NAMFISA Report Due Soon',
          message: '3 lenders have quarterly reports due in 5 days',
          createdAt: '2024-01-15T12:00:00Z',
          status: 'active',
          actionRequired: true
        }
      ]

      setUsers(mockUsers)
      setLenders(mockLenders)
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error fetching system data:', error)
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
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout title="System Administration">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="System Administration">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">System Administration</h2>
            <p className="text-neutral-500">Complete system oversight and management</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Active Lenders</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{lenders.filter(l => l.status === 'active').length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Active Alerts</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{alerts.filter(a => a.status === 'active').length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">System Health</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">98%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

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
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  System Users
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {users.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('lenders')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'lenders'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Lender Accounts
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {lenders.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'alerts'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  System Alerts
                  <span className="ml-2 bg-red-100 text-red-600 py-1 px-2 rounded-full text-xs">
                    {alerts.filter(a => a.status === 'active').length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent System Alerts</h3>
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 mt-0.5" />
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm mt-1">{alert.message}</p>
                              <p className="text-xs mt-2">
                                {new Date(alert.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {alert.actionRequired && (
                            <span className="text-xs font-medium bg-red-600 text-white px-2 py-1 rounded">
                              ACTION
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Health</h3>
                  <div className="space-y-3">
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
              </div>
            </div>
          )}

          {/* System Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{user.email}</div>
                          <div className="text-xs text-neutral-400">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {user.actions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lender Accounts Tab */}
          {activeTab === 'lenders' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Lender Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Lender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Portfolio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Compliance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {lenders.map((lender) => (
                      <tr key={lender.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{lender.name}</div>
                          <div className="text-sm text-neutral-500">{lender.registrationNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{lender.subscriptionPlan}</div>
                          <div className="text-xs text-neutral-500">
                            {lender.users} users • Expires: {new Date(lender.subscriptionExpiry).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">
                            N$ {lender.portfolio.toLocaleString()}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {lender.loans} loans
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-neutral-900 mr-2">
                              {lender.complianceScore}%
                            </span>
                            {lender.flags > 0 && (
                              <span className="text-xs text-red-600">
                                {lender.flags} flags
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lender.status)}`}>
                            {lender.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Alerts</h3>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm mt-1">{alert.message}</p>
                          <p className="text-xs mt-2">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.actionRequired && (
                          <span className="text-xs font-medium">ACTION REQUIRED</span>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.status === 'active' ? 'bg-red-100 text-red-800' :
                          alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
