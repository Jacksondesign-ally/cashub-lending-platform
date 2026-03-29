import React, { useState } from 'react';
import { 
  Shield,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Send,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Eye,
  RefreshCw,
  Upload,
  Award,
  XCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NAMFISACompliance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuarter, setSelectedQuarter] = useState('Q4-2024');

  // Compliance status
  const complianceStatus = {
    overallScore: 92,
    status: 'COMPLIANT',
    lastAudit: '2024-01-15',
    nextAudit: '2024-04-15',
    outstandingIssues: 2,
    resolvedIssues: 18
  };

  // Quarterly reports
  const quarterlyReports = [
    {
      quarter: 'Q4-2024',
      status: 'DRAFT',
      dueDate: '2025-01-31',
      submittedDate: null,
      metrics: {
        totalLoans: 234,
        totalDisbursed: 4250000,
        totalCollected: 3890000,
        activeLoans: 156,
        overdueLoans: 23,
        defaultRate: 2.8,
        collectionRate: 94.3
      }
    },
    {
      quarter: 'Q3-2024',
      status: 'SUBMITTED',
      dueDate: '2024-10-31',
      submittedDate: '2024-10-28',
      metrics: {
        totalLoans: 218,
        totalDisbursed: 3980000,
        totalCollected: 3650000,
        activeLoans: 142,
        overdueLoans: 19,
        defaultRate: 2.5,
        collectionRate: 93.8
      }
    },
    {
      quarter: 'Q2-2024',
      status: 'APPROVED',
      dueDate: '2024-07-31',
      submittedDate: '2024-07-25',
      approvedDate: '2024-08-10',
      metrics: {
        totalLoans: 201,
        totalDisbursed: 3650000,
        totalCollected: 3420000,
        activeLoans: 128,
        overdueLoans: 16,
        defaultRate: 2.3,
        collectionRate: 94.1
      }
    },
    {
      quarter: 'Q1-2024',
      status: 'APPROVED',
      dueDate: '2024-04-30',
      submittedDate: '2024-04-22',
      approvedDate: '2024-05-08',
      metrics: {
        totalLoans: 189,
        totalDisbursed: 3420000,
        totalCollected: 3180000,
        activeLoans: 115,
        overdueLoans: 14,
        defaultRate: 2.1,
        collectionRate: 94.5
      }
    }
  ];

  // Compliance requirements
  const requirements = [
    {
      id: 1,
      title: 'Quarterly Financial Reporting',
      status: 'PENDING',
      dueDate: '2025-01-31',
      description: 'Submit Q4 2024 financial statements',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Annual License Renewal',
      status: 'COMPLIANT',
      dueDate: '2024-12-31',
      completedDate: '2024-12-15',
      description: 'NAMFISA license renewed for 2025',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Customer Complaint Register',
      status: 'COMPLIANT',
      dueDate: '2025-01-15',
      completedDate: '2025-01-10',
      description: 'Monthly complaint register updated',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Anti-Money Laundering Training',
      status: 'OVERDUE',
      dueDate: '2024-12-31',
      description: 'Staff AML training certification',
      priority: 'high'
    },
    {
      id: 5,
      title: 'Risk Assessment Report',
      status: 'COMPLIANT',
      dueDate: '2024-11-30',
      completedDate: '2024-11-20',
      description: 'Annual risk assessment completed',
      priority: 'medium'
    }
  ];

  // Trend data
  const trendData = [
    { quarter: 'Q1', defaultRate: 2.1, collectionRate: 94.5, activeLoans: 115 },
    { quarter: 'Q2', defaultRate: 2.3, collectionRate: 94.1, activeLoans: 128 },
    { quarter: 'Q3', defaultRate: 2.5, collectionRate: 93.8, activeLoans: 142 },
    { quarter: 'Q4', defaultRate: 2.8, collectionRate: 94.3, activeLoans: 156 }
  ];

  // Loan portfolio distribution
  const portfolioData = [
    { name: 'Performing', value: 133, color: '#10b981' },
    { name: 'Overdue (1-30)', value: 15, color: '#f59e0b' },
    { name: 'Overdue (31-90)', value: 6, color: '#ef4444' },
    { name: 'Defaulted (90+)', value: 2, color: '#7f1d1d' }
  ];

  // Alerts
  const alerts = [
    {
      type: 'warning',
      message: 'Q4 2024 report due in 9 days',
      icon: Calendar,
      priority: 'high'
    },
    {
      type: 'error',
      message: 'AML training certification overdue',
      icon: AlertCircle,
      priority: 'high'
    },
    {
      type: 'info',
      message: 'Annual audit scheduled for April 15, 2025',
      icon: Shield,
      priority: 'medium'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'reports', name: 'Quarterly Reports', icon: FileText },
    { id: 'requirements', name: 'Requirements', icon: CheckCircle },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  const getStatusColor = (status) => {
    const colors = {
      COMPLIANT: 'bg-green-500/20 text-green-300 border-green-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      OVERDUE: 'bg-red-500/20 text-red-300 border-red-500/30',
      DRAFT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      SUBMITTED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      APPROVED: 'bg-green-500/20 text-green-300 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLIANT':
      case 'APPROVED':
        return <CheckCircle size={20} />;
      case 'PENDING':
      case 'DRAFT':
        return <Clock size={20} />;
      case 'OVERDUE':
      case 'REJECTED':
        return <XCircle size={20} />;
      case 'SUBMITTED':
        return <Send size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getAlertColor = (type) => {
    const colors = {
      info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
      error: 'bg-red-500/10 border-red-500/30 text-red-200'
    };
    return colors[type] || 'bg-gray-500/10 border-gray-500/30 text-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield size={40} />
                NAMFISA Compliance
              </h1>
              <p className="text-purple-200">Regulatory compliance monitoring and reporting</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center gap-2">
                <RefreshCw size={18} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-all hover:scale-105 flex items-center gap-2 shadow-lg">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`rounded-lg p-4 border ${getAlertColor(alert.type)} flex items-start gap-3`}>
                <alert.icon className="flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                </div>
                <span className={`text-xs font-medium uppercase ${getPriorityColor(alert.priority)}`}>
                  {alert.priority}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Compliance Score Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - complianceStatus.overallScore / 100)}`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{complianceStatus.overallScore}%</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">Overall Score</h3>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border inline-block ${getStatusColor(complianceStatus.status)}`}>
                {complianceStatus.status}
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="text-purple-300" size={24} />
                <div>
                  <p className="text-purple-200 text-sm">Last Audit</p>
                  <p className="text-white font-semibold">{complianceStatus.lastAudit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-300" size={24} />
                <div>
                  <p className="text-purple-200 text-sm">Next Audit</p>
                  <p className="text-white font-semibold">{complianceStatus.nextAudit}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <p className="text-purple-200 text-sm">Resolved Issues</p>
                  <p className="text-white font-bold text-2xl">{complianceStatus.resolvedIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="text-red-400" size={24} />
                <div>
                  <p className="text-purple-200 text-sm">Outstanding Issues</p>
                  <p className="text-white font-bold text-2xl">{complianceStatus.outstandingIssues}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="border-b border-white/20 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-purple-200 hover:text-white'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Trends */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="quarter" stroke="#c084fc" />
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
                        <Line 
                          type="monotone" 
                          dataKey="collectionRate" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Collection Rate %"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="defaultRate" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="Default Rate %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Portfolio Distribution */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Loan Portfolio Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={portfolioData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {portfolioData.map((entry, index) => (
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

                {/* Recent Compliance Activities */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Compliance Activities</h3>
                  <div className="space-y-3">
                    {requirements.slice(0, 5).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(req.status)}
                          <div>
                            <p className="text-white font-medium">{req.title}</p>
                            <p className="text-purple-200 text-sm">{req.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <p className="text-purple-200 text-xs mt-1">
                            {req.completedDate ? `Completed: ${req.completedDate}` : `Due: ${req.dueDate}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quarterly Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Quarterly Reports</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all flex items-center gap-2">
                    <Upload size={18} />
                    Submit New Report
                  </button>
                </div>

                <div className="space-y-4">
                  {quarterlyReports.map((report) => (
                    <div key={report.quarter} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">{report.quarter} Report</h4>
                          <p className="text-purple-200 text-sm">
                            Due: {report.dueDate}
                            {report.submittedDate && ` | Submitted: ${report.submittedDate}`}
                            {report.approvedDate && ` | Approved: ${report.approvedDate}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-purple-200 text-xs mb-1">Total Loans</p>
                          <p className="text-white font-bold text-lg">{report.metrics.totalLoans}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-purple-200 text-xs mb-1">Disbursed</p>
                          <p className="text-white font-bold text-lg">NAD {(report.metrics.totalDisbursed / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-purple-200 text-xs mb-1">Collection Rate</p>
                          <p className="text-green-400 font-bold text-lg">{report.metrics.collectionRate}%</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-purple-200 text-xs mb-1">Default Rate</p>
                          <p className="text-red-400 font-bold text-lg">{report.metrics.defaultRate}%</p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
                          <Eye size={16} />
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
                          <Download size={16} />
                          Download PDF
                        </button>
                        {report.status === 'DRAFT' && (
                          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
                            <Send size={16} />
                            Submit to NAMFISA
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Compliance Requirements</h3>
                  <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-400">
                    <option value="all" className="bg-slate-800">All</option>
                    <option value="pending" className="bg-slate-800">Pending</option>
                    <option value="compliant" className="bg-slate-800">Compliant</option>
                    <option value="overdue" className="bg-slate-800">Overdue</option>
                  </select>
                </div>

                {requirements.map((req) => (
                  <div key={req.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{req.title}</h4>
                          <span className={`text-xs font-medium uppercase ${getPriorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </div>
                        <p className="text-purple-200 text-sm mb-2">{req.description}</p>
                        <p className="text-purple-300 text-xs">
                          {req.completedDate ? (
                            <>Completed: {req.completedDate}</>
                          ) : (
                            <>Due: {req.dueDate}</>
                          )}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-2 ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)}
                        {req.status}
                      </span>
                    </div>

                    {req.status === 'PENDING' || req.status === 'OVERDUE' ? (
                      <button className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white text-sm font-medium transition-all">
                        Complete Requirement
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quarterly Comparison */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Quarterly Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="quarter" stroke="#c084fc" />
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
                        <Bar dataKey="activeLoans" fill="#3b82f6" name="Active Loans" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200">Collection Rate</span>
                          <span className="text-white font-semibold">94.3%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '94.3%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200">Default Rate