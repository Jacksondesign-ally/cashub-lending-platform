import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, 
  CheckCircle, Clock, BarChart3, PieChart, Download, Bell,
  Shield, CreditCard, FileText, Settings, Calendar, Award
} from 'lucide-react';

const CompleteDashboard = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Mock data - would come from API
  const dashboardData = {
    // Subscription Info
    subscription: {
      plan: 'Advanced',
      status: 'active',
      daysRemaining: 23,
      usage: {
        loans: { used: 142, limit: 200, percentage: 71 },
        blacklists: { used: 8, limit: 20, percentage: 40 },
        storage: { used: 3.2, limit: 10, percentage: 32 },
        users: { used: 4, limit: 10, percentage: 40 }
      }
    },

    // Key Metrics
    metrics: {
      totalLoans: 245,
      totalDisbursed: 2450000,
      outstandingBalance: 980000,
      collectionRate: 87.5,
      defaultRate: 4.9,
      portfolioGrowth: 12.5,
      activeBorrowers: 189,
      newBorrowers: 34,
      avgLoanSize: 10000,
      avgInterestRate: 15.5
    },

    // Portfolio Health
    portfolioHealth: {
      performing: { count: 198, amount: 1980000, percentage: 81 },
      overdue: { count: 32, amount: 320000, percentage: 13 },
      defaulted: { count: 15, amount: 150000, percentage: 6 }
    },

    // Risk Distribution
    riskDistribution: {
      low: { count: 98, percentage: 52 },
      medium: { count: 67, percentage: 35 },
      high: { count: 19, percentage: 10 },
      critical: { count: 5, percentage: 3 }
    },

    // Recent Activity
    recentActivity: [
      { type: 'loan_approved', borrower: 'John Doe', amount: 15000, time: '10 minutes ago', status: 'success' },
      { type: 'payment_received', borrower: 'Maria Santos', amount: 2500, time: '1 hour ago', status: 'success' },
      { type: 'loan_overdue', borrower: 'Peter Smith', amount: 5000, time: '2 hours ago', status: 'warning' },
      { type: 'dispute_opened', borrower: 'Alice Johnson', amount: 7500, time: '3 hours ago', status: 'info' },
      { type: 'blacklist_created', borrower: 'David Brown', amount: 12000, time: '5 hours ago', status: 'error' }
    ],

    // Alerts & Notifications
    alerts: [
      { type: 'subscription', message: 'Subscription renews in 23 days', priority: 'medium', unread: true },
      { type: 'limit', message: 'Approaching monthly loan limit (142/200)', priority: 'low', unread: true },
      { type: 'overdue', message: '5 loans are more than 30 days overdue', priority: 'high', unread: true },
      { type: 'dispute', message: '2 new disputes require your response', priority: 'high', unread: false }
    ],

    // Top Performers
    topBorrowers: [
      { name: 'Sarah Williams', loans: 5, totalBorrowed: 50000, repaid: 45000, score: 95 },
      { name: 'Michael Chen', loans: 4, totalBorrowed: 40000, repaid: 40000, score: 92 },
      { name: 'Emma Davis', loans: 3, totalBorrowed: 30000, repaid: 28000, score: 88 }
    ]
  };

  const MetricCard = ({ icon: Icon, title, value, change, changeType, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <Icon size={16} />
            <span>{title}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {changeType === 'positive' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}%
          </div>
        )}
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency: 'NAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CasHuB Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, ABC Microfinance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Subscription Badge */}
            <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Award className="text-blue-600" size={16} />
                <div>
                  <p className="text-xs text-blue-600 font-medium">{dashboardData.subscription.plan} Plan</p>
                  <p className="text-xs text-blue-500">{dashboardData.subscription.daysRemaining} days remaining</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Subscription Usage Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Subscription Usage</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(dashboardData.subscription.usage).map(([key, data]) => (
              <div key={key} className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-xs text-blue-100 mb-1 capitalize">{key}</p>
                <p className="text-2xl font-bold mb-2">{data.used}/{data.limit}</p>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-blue-100 mt-1">{data.percentage}% used</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {dashboardData.alerts.filter(a => a.unread).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">Active Alerts</h3>
                <div className="space-y-2">
                  {dashboardData.alerts.filter(a => a.unread).map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <p className="text-sm text-yellow-800">{alert.message}</p>
                      <button className="text-xs text-yellow-700 hover:text-yellow-900 font-medium">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={DollarSign}
            title="Total Disbursed"
            value={formatCurrency(dashboardData.metrics.totalDisbursed)}
            change={dashboardData.metrics.portfolioGrowth}
            changeType="positive"
            subtitle={`${dashboardData.metrics.totalLoans} loans`}
          />
          <MetricCard
            icon={CreditCard}
            title="Outstanding Balance"
            value={formatCurrency(dashboardData.metrics.outstandingBalance)}
            subtitle={`${dashboardData.metrics.collectionRate}% collection rate`}
          />
          <MetricCard
            icon={Users}
            title="Active Borrowers"
            value={dashboardData.metrics.activeBorrowers}
            change={18}
            changeType="positive"
            subtitle={`${dashboardData.metrics.newBorrowers} new this month`}
          />
          <MetricCard
            icon={AlertTriangle}
            title="Default Rate"
            value={`${dashboardData.metrics.defaultRate}%`}
            change={-0.5}
            changeType="positive"
            subtitle="Below industry average"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Health */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio Health</h3>
            <div className="space-y-4">
              {Object.entries(dashboardData.portfolioHealth).map(([key, data]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className="text-sm text-gray-600">{data.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className={`rounded-full h-2 ${
                        key === 'performing' ? 'bg-green-500' :
                        key === 'overdue' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{data.count} loans</span>
                    <span>{formatCurrency(data.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(dashboardData.riskDistribution).map(([level, data]) => (
                <div key={level} className={`p-4 rounded-lg border-2 ${
                  level === 'low' ? 'border-green-200 bg-green-50' :
                  level === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  level === 'high' ? 'border-orange-200 bg-orange-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <p className={`text-xs font-medium mb-1 uppercase ${
                    level === 'low' ? 'text-green-700' :
                    level === 'medium' ? 'text-yellow-700' :
                    level === 'high' ? 'text-orange-700' :
                    'text-red-700'
                  }`}>{level} Risk</p>
                  <p className="text-2xl font-bold">{data.count}</p>
                  <p className="text-xs text-gray-600">{data.percentage}% of portfolio</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Borrowers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.borrower} • {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Borrowers */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top Borrowers</h3>
            <div className="space-y-4">
              {dashboardData.topBorrowers.map((borrower, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{borrower.name}</p>
                    <p className="text-xs text-gray-600">
                      {borrower.loans} loans • Score: {borrower.score}
                    </p>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 rounded-full h-1.5"
                          style={{ width: `${(borrower.repaid / borrower.totalBorrowed) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(borrower.repaid)} / {formatCurrency(borrower.totalBorrowed)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'New Loan Application', color: 'blue' },
              { icon: Download, label: 'Generate NAMFISA Report', color: 'green' },
              { icon: Shield, label: 'Review Disputes', color: 'yellow' },
              { icon: BarChart3, label: 'View Analytics', color: 'purple' }
            ].map((action, idx) => (
              <button
                key={idx}
                className={`p-4 border-2 border-gray-200 rounded-lg hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-all group`}
              >
                <action.icon className={`mx-auto mb-2 text-gray-400 group-hover:text-${action.color}-600`} size={24} />
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* NAMFISA Compliance Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">NAMFISA Compliance</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Up to Date
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Last Report Submitted</p>
              <p className="text-lg font-bold">Q4 2024</p>
              <p className="text-xs text-gray-500 mt-1">December 15, 2024</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Next Report Due</p>
              <p className="text-lg font-bold">Q1 2025</p>
              <p className="text-xs text-gray-500 mt-1">April 15, 2025</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Compliance Score</p>
              <p className="text-lg font-bold text-green-600">98%</p>
              <p className="text-xs text-gray-500 mt-1">Excellent standing</p>
            </div>
          </div>
          <button className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <Download size={16} />
            Generate Q1 2025 Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteDashboard;