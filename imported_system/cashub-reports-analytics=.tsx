import React, { useState } from 'react';
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
  LineChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LineChart as RechartsLine, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const ReportsAnalytics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Sample data
  const loanTrendData = [
    { month: 'Jan', disbursed: 450000, collected: 380000, outstanding: 150000 },
    { month: 'Feb', disbursed: 520000, collected: 420000, outstanding: 165000 },
    { month: 'Mar', disbursed: 480000, collected: 460000, outstanding: 158000 },
    { month: 'Apr', disbursed: 550000, collected: 490000, outstanding: 172000 },
    { month: 'May', disbursed: 600000, collected: 520000, outstanding: 185000 },
    { month: 'Jun', disbursed: 580000, collected: 550000, outstanding: 178000 }
  ];

  const portfolioDistribution = [
    { name: 'Active Loans', value: 45, color: '#3b82f6' },
    { name: 'Completed', value: 30, color: '#10b981' },
    { name: 'Overdue', value: 15, color: '#ef4444' },
    { name: 'Defaulted', value: 10, color: '#6b7280' }
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 55, color: '#10b981' },
    { name: 'Medium Risk', value: 30, color: '#f59e0b' },
    { name: 'High Risk', value: 12, color: '#ef4444' },
    { name: 'Critical', value: 3, color: '#7f1d1d' }
  ];

  const collectionRateData = [
    { week: 'Week 1', rate: 92 },
    { week: 'Week 2', rate: 88 },
    { week: 'Week 3', rate: 94 },
    { week: 'Week 4', rate: 96 }
  ];

  const kpiCards = [
    {
      title: 'Total Portfolio Value',
      value: 'NAD 4.2M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Borrowers',
      value: '1,234',
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Collection Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Default Rate',
      value: '2.8%',
      change: '-0.5%',
      trend: 'down',
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const topPerformers = [
    { name: 'John Doe', loans: 5, totalValue: 125000, paymentRate: 100, creditScore: 85 },
    { name: 'Sarah Johnson', loans: 4, totalValue: 98000, paymentRate: 98, creditScore: 82 },
    { name: 'David Smith', loans: 6, totalValue: 145000, paymentRate: 96, creditScore: 80 },
    { name: 'Emma Brown', loans: 3, totalValue: 75000, paymentRate: 100, creditScore: 88 },
    { name: 'Michael Wilson', loans: 4, totalValue: 92000, paymentRate: 95, creditScore: 79 }
  ];

  const riskAlerts = [
    { borrower: 'Maria Santos', issue: '3 consecutive late payments', severity: 'high', daysOverdue: 12 },
    { borrower: 'Peter Williams', issue: 'Payment 7 days overdue', severity: 'medium', daysOverdue: 7 },
    { borrower: 'Lisa Anderson', issue: 'Credit score declined to 45', severity: 'high', daysOverdue: 0 },
    { borrower: 'James Taylor', issue: 'Missed payment deadline', severity: 'medium', daysOverdue: 3 }
  ];

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'loans', name: 'Loan Analysis', icon: FileText },
    { id: 'collections', name: 'Collections', icon: DollarSign },
    { id: 'risk', name: 'Risk Assessment', icon: AlertCircle },
    { id: 'performance', name: 'Performance', icon: TrendingUp }
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return colors[severity] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#6b7280'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
              <p className="text-purple-200">Comprehensive insights into your lending operations</p>
            </div>
            <div className="flex gap-3">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-purple-400"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white backdrop-blur-sm transition-all hover:scale-105 flex items-center gap-2">
                <Filter size={18} />
                Filters
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-all hover:scale-105 flex items-center gap-2 shadow-lg">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-4 mb-6">
          <div className="flex gap-3 overflow-x-auto">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  reportType === type.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <type.icon size={18} />
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                  <kpi.icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {kpi.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{kpi.value}</h3>
              <p className="text-purple-200 text-sm">{kpi.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Loan Trends Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <LineChart size={24} />
              Loan Performance Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={loanTrendData}>
                <defs>
                  <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#c084fc" />
                <YAxis stroke="#c084fc" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 27, 75, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="disbursed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDisbursed)" name="Disbursed" />
                <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart size={24} />
              Portfolio Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 27, 75, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={24} />
              Risk Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#c084fc" />
                <YAxis stroke="#c084fc" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 27, 75, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Collection Rate Trend */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={24} />
              Collection Rate Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLine data={collectionRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="week" stroke="#c084fc" />
                <YAxis stroke="#c084fc" domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 27, 75, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Collection Rate %"
                />
              </RechartsLine>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={24} />
              Top Performing Borrowers
            </h2>
            <div className="space-y-3">
              {topPerformers.map((performer, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{performer.name}</h3>
                      <p className="text-purple-200 text-sm">{performer.loans} active loans</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">NAD {performer.totalValue.toLocaleString()}</p>
                      <p className="text-green-400 text-sm">{performer.paymentRate}% on-time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${performer.creditScore}%` }}
                      />
                    </div>
                    <span className="text-purple-200 text-xs">Score: {performer.creditScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Alerts */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={24} />
              Risk Alerts
            </h2>
            <div className="space-y-3">
              {riskAlerts.map((alert, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{alert.borrower}</h3>
                      <p className="text-purple-200 text-sm">{alert.issue}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  {alert.daysOverdue > 0 && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <Clock size={14} />
                      <span>{alert.daysOverdue} days overdue</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all">
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;