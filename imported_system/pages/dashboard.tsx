import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    {
      title: 'Total Borrowers',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Loans',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Portfolio',
      value: 'N$ 0',
      change: '+0%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Default Rate',
      value: '0%',
      change: '0%',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    }
  ])
  const [recentLoans, setRecentLoans] = useState([])
  const [alerts, setAlerts] = useState([])

  // Fetch data from Supabase
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch borrowers count
      const { count: borrowersCount } = await supabase
        .from('borrowers')
        .select('*', { count: 'exact', head: true })

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

      const totalPortfolio = portfolioData?.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0) || 0
      const activeLoans = portfolioData?.filter(loan => loan.status === 'active').length || 0
      const defaultedLoans = portfolioData?.filter(loan => loan.status === 'defaulted').length || 0
      const defaultRate = portfolioData?.length > 0 ? (defaultedLoans / portfolioData.length) * 100 : 0

      // Update stats
      setStats([
        {
          title: 'Total Borrowers',
          value: borrowersCount?.toLocaleString() || '0',
          change: '+12.5%',
          changeType: 'positive',
          icon: Users,
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50'
        },
        {
          title: 'Active Loans',
          value: activeLoans.toString(),
          change: '+8.2%',
          changeType: 'positive',
          icon: FileText,
          color: 'bg-green-500',
          bgColor: 'bg-green-50'
        },
        {
          title: 'Total Portfolio',
          value: `N$ ${(totalPortfolio / 1000000).toFixed(1)}M`,
          change: '+15.3%',
          changeType: 'positive',
          icon: DollarSign,
          color: 'bg-purple-500',
          bgColor: 'bg-purple-50'
        },
        {
          title: 'Default Rate',
          value: `${defaultRate.toFixed(1)}%`,
          change: '-0.8%',
          changeType: defaultRate > 5 ? 'negative' : 'positive',
          icon: AlertCircle,
          color: 'bg-red-500',
          bgColor: 'bg-red-50'
        }
      ])

      // Format recent loans with borrower info
      const formattedLoans = await Promise.all(
        (loansData || []).map(async (loan) => {
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

      // Mock alerts for now
      setAlerts([
        {
          type: 'warning',
          title: 'High Risk Application',
          message: 'Loan application requires manual review',
          time: '2 hours ago'
        },
        {
          type: 'error',
          title: 'Payment Overdue',
          message: `${defaultedLoans} loans are more than 30 days overdue`,
          time: '5 hours ago'
        },
        {
          type: 'success',
          title: 'Compliance Report Ready',
          message: 'Q4 2023 NAMFISA report is ready for review',
          time: '1 day ago'
        }
      ])

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
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
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

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center p-4 bg-cashub-50 hover:bg-cashub-100 text-cashub-600 rounded-lg transition-colors">
                <FileText className="w-5 h-5 mr-2" />
                New Loan Application
              </button>
              <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                <Users className="w-5 h-5 mr-2" />
                Add Borrower
              </button>
              <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors">
                <Shield className="w-5 h-5 mr-2" />
                Blacklist Entry
              </button>
              <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors">
                <CreditCard className="w-5 h-5 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
