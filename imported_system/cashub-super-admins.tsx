import React, { useState } from 'react';
import { 
  Shield,
  Users,
  Building2,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  PlayCircle,
  Download,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // System-wide stats
  const systemStats = [
    { label: 'Total Lenders', value: 45, change: '+5', icon: Building2, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Subscriptions', value: 38, change: '+3', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Disputes', value: 7, change: '-2', icon: MessageSquare, color: 'from-orange-500 to-red-500' },
    { label: 'Monthly Revenue', value: 'NAD 285K', change: '+12%', icon: DollarSign, color: 'from-purple-500 to-pink-500' }
  ];

  // Lenders data
  const lenders = [
    {
      id: 'LEN-001',
      name: 'ABC Microfinance Ltd',
      registrationNumber: '2023/12345',
      email: 'admin@abcmicro.na',
      phone: '+264611234567',
      package: 'ADVANCED',
      status: 'ACTIVE',
      subscriptionExpiry: '2024-12-31',
      monthlyFee: 12000,
      activeBorrowers: 1234,
      totalLoans: 450,
      registeredDate: '2023-01-15',
      lastPayment: '2024-01-01',
      users: 5
    },
    {
      id: 'LEN-002',
      name: 'Quick Loans Namibia',
      registrationNumber: '2023/67890',
      email: 'info@quickloans.na',
      phone: '+264612345678',
      package: 'PROFESSIONAL',
      status: 'ACTIVE',
      subscriptionExpiry: '2024-11-30',
      monthlyFee: 5500,
      activeBorrowers: 456,
      totalLoans: 180,
      registeredDate: '2023-03-20',
      lastPayment: '2024-01-01',
      users: 1
    },
    {
      id: 'LEN-003',
      name: 'XYZ Credit Services',
      registrationNumber: '2023/11111',
      email: 'contact@xyzcredit.na',
      phone: '+264613456789',
      package: 'BASIC',
      status: 'SUSPENDED',
      subscriptionExpiry: '2024-01-15',
      monthlyFee: 2500,
      activeBorrowers: 89,
      totalLoans: 45,
      registeredDate: '2023-06-10',
      lastPayment: '2023-12-01',
      users: 1,
      suspensionReason: 'Payment overdue by 15 days'
    },
    {
      id: 'LEN-004',
      name: 'Community Finance Co-op',
      registrationNumber: '2023/22222',
      email: 'admin@commfinance.na',
      phone: '+264614567890',
      package: 'PROFESSIONAL',
      status: 'PENDING_APPROVAL',
      subscriptionExpiry: null,
      monthlyFee: 5500,
      activeBorrowers: 0,
      totalLoans: 0,
      registeredDate: '2024-01-20',
      lastPayment: null,
      users: 1
    }
  ];

  // Disputes data
  const disputes = [
    {
      id: 'DSP-2024-001',
      blacklistId: 'BL-2024-002',
      borrower: { name: 'Sarah Williams', id: '92030456789' },
      lender: 'XYZ Credit Services',
      reason: 'FRAUD',
      disputeReason: 'Documents were genuine. Error in verification process.',
      status: 'PENDING_REVIEW',
      filedDate: '2024-01-12',
      priority: 'HIGH',
      evidenceCount: 3
    },
    {
      id: 'DSP-2024-002',
      blacklistId: 'BL-2024-005',
      borrower: { name: 'James Peterson', id: '88070123456' },
      lender: 'ABC Microfinance Ltd',
      reason: 'DEFAULT',
      disputeReason: 'Payment was made but not recorded properly.',
      status: 'UNDER_INVESTIGATION',
      filedDate: '2024-01-18',
      priority: 'MEDIUM',
      evidenceCount: 2
    },
    {
      id: 'DSP-2024-003',
      blacklistId: 'BL-2024-008',
      borrower: { name: 'Mary Johnson', id: '90050298765' },
      lender: 'Quick Loans Namibia',
      reason: 'ABSCONDED',
      disputeReason: 'I relocated for work and informed the lender.',
      status: 'PENDING_REVIEW',
      filedDate: '2024-01-20',
      priority: 'LOW',
      evidenceCount: 1
    }
  ];

  // Pending approvals
  const pendingApprovals = [
    {
      id: 'APP-001',
      type: 'LENDER_REGISTRATION',
      lender: 'Community Finance Co-op',
      submittedDate: '2024-01-20',
      status: 'PENDING'
    },
    {
      id: 'APP-002',
      type: 'BLACKLIST_ENTRY',
      lender: 'ABC Microfinance Ltd',
      borrower: 'John Doe',
      submittedDate: '2024-01-22',
      status: 'PENDING'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
      SUSPENDED: 'bg-red-500/20 text-red-300 border-red-500/30',
      PENDING_APPROVAL: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      PENDING_REVIEW: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      UNDER_INVESTIGATION: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      RESOLVED: 'bg-green-500/20 text-green-300 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: 'text-red-400',
      MEDIUM: 'text-yellow-400',
      LOW: 'text-green-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'lenders', name: 'Lenders', icon: Building2 },
    { id: 'subscriptions', name: 'Subscriptions', icon: CreditCard },
    { id: 'disputes', name: 'Disputes', icon: MessageSquare },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield size={40} className="text-purple-400" />
                System Administrator
              </h1>
              <p className="text-purple-200">CasHuB Platform Management Console</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center gap-2">
                <Bell size={18} />
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center gap-2">
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-purple-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="border-b border-white/20 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`py-4 px-2 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    activeView === tab.id
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
            {activeView === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Actions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">New Lender Registration</p>
                          <p className="text-purple-200 text-sm">Community Finance Co-op</p>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm">
                          Review
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Dispute Awaiting Decision</p>
                          <p className="text-purple-200 text-sm">Sarah Williams vs XYZ Credit</p>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm">
                          Review
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Subscription Expiring Soon</p>
                          <p className="text-purple-200 text-sm">Quick Loans Namibia (15 days)</p>
                        </div>
                        <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm">
                          Notify
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200 text-sm">Active Lenders</span>
                          <span className="text-white font-semibold">84%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '84%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200 text-sm">Payment Success Rate</span>
                          <span className="text-white font-semibold">96%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '96%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200 text-sm">Dispute Resolution Rate</span>
                          <span className="text-white font-semibold">78%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: '78%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lenders Tab */}
            {activeView === 'lenders' && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                    <input
                      type="text"
                      placeholder="Search lenders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                    />
                  </div>
                  <button className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white flex items-center gap-2">
                    <Filter size={18} />
                    Filter
                  </button>
                </div>

                {lenders.map((lender) => (
                  <div key={lender.id} className="bg-white/5 rounded-lg border border-white/10 p-6 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{lender.name}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(lender.status)}`}>
                            {lender.status.replace('_', ' ')}
                          </span>
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            {lender.package}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-purple-200">Lender ID</p>
                            <p className="text-white font-medium">{lender.id}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Registration</p>
                            <p className="text-white font-medium">{lender.registrationNumber}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Active Borrowers</p>
                            <p className="text-white font-medium">{lender.activeBorrowers}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Monthly Fee</p>
                            <p className="text-white font-medium">NAD {lender.monthlyFee.toLocaleString()}</p>
                          </div>
                        </div>
                        {lender.status === 'SUSPENDED' && lender.suspensionReason && (
                          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-300 text-sm flex items-center gap-2">
                              <AlertCircle size={16} />
                              {lender.suspensionReason}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm flex items-center gap-2">
                          <Eye size={16} />
                          View
                        </button>
                        {lender.status === 'SUSPENDED' && (
                          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-2">
                            <PlayCircle size={16} />
                            Reactivate
                          </button>
                        )}
                        {lender.status === 'ACTIVE' && (
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm flex items-center gap-2">
                            <Ban size={16} />
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeView === 'subscriptions' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-purple-200 text-sm mb-1">Total MRR</p>
                    <p className="text-2xl font-bold text-white">NAD 285,000</p>
                    <p className="text-green-400 text-sm">+12% this month</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-purple-200 text-sm mb-1">Expiring This Month</p>
                    <p className="text-2xl font-bold text-yellow-400">5</p>
                    <p className="text-purple-200 text-sm">Need renewal</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-purple-200 text-sm mb-1">Overdue Payments</p>
                    <p className="text-2xl font-bold text-red-400">1</p>
                    <p className="text-purple-200 text-sm">Requires action</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Package Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Free Trial', count: 7, percentage: 16 },
                      { name: 'Basic', count: 12, percentage: 27 },
                      { name: 'Professional', count: 18, percentage: 40 },
                      { name: 'Advanced', count: 8, percentage: 17 }
                    ].map((pkg, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200">{pkg.name}</span>
                          <span className="text-white font-semibold">{pkg.count} lenders ({pkg.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: `${pkg.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disputes Tab */}
            {activeView === 'disputes' && (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="bg-white/5 rounded-lg border border-white/10 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">Dispute {dispute.id}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs font-semibold uppercase ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority} PRIORITY
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                          <div>
                            <p className="text-purple-200">Borrower</p>
                            <p className="text-white font-medium">{dispute.borrower.name}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Lender</p>
                            <p className="text-white font-medium">{dispute.lender}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Original Reason</p>
                            <p className="text-white font-medium">{dispute.reason}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Filed Date</p>
                            <p className="text-white font-medium">{dispute.filedDate}</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-purple-200 text-xs mb-1">Dispute Reason:</p>
                          <p className="text-white">{dispute.disputeReason}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm flex items-center gap-2">
                          <Eye size={16} />
                          Review
                        </button>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-2">
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm flex items-center gap-2">
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approvals Tab */}
            {activeView === 'approvals' && (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="bg-white/5 rounded-lg border border-white/10 p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{approval.type.replace('_', ' ')}</h3>
                        <p className="text-purple-200 text-sm">
                          {approval.lender} {approval.borrower && `• Borrower: ${approval.borrower}`}
                        </p>
                        <p className="text-purple-300 text-xs mt-1">Submitted: {approval.submittedDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Tab */}
            {activeView === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend (Last 6 Months)</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[180, 210, 245, 260, 275, 285].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                          style={{ height: `${(value / 285) * 100}%` }}
                        />
                        <p className="text-purple-200 text-xs mt-2">M{idx + 1}</p>
                        <p className="text-white text-xs font-semibold">{value}K</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;