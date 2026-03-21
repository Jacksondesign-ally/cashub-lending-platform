import React, { useState } from 'react';
import { 
  FileText,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Download,
  MessageSquare,
  Shield,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Edit3,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Home,
  CreditCard,
  Activity,
  ArrowRight
} from 'lucide-react';

const LoanOfficerDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [officerSignature, setOfficerSignature] = useState('');

  // Loan applications
  const loanApplications = [
    {
      id: 'L-2024-001',
      borrower: {
        firstName: 'John',
        lastName: 'Doe',
        idNumber: '85010112345',
        email: 'john.doe@email.com',
        phone: '+264811234567',
        address: '123 Main Street, Windhoek',
        employer: 'ABC Corporation',
        jobTitle: 'Manager',
        monthlyIncome: 25000,
        employmentDuration: '5 years',
        bankName: 'Bank Windhoek',
        accountNumber: '****5678'
      },
      loan: {
        amount: 50000,
        period: 12,
        interestRate: 15,
        monthlyPayment: 4792,
        purpose: 'Business Investment',
        applicationDate: '2024-01-22',
        signedDate: '2024-01-23'
      },
      status: 'pending_review',
      riskLevel: 'low',
      creditScore: 78,
      documents: [
        { name: 'ID Copy', status: 'verified', uploadDate: '2024-01-22' },
        { name: 'Payslip', status: 'verified', uploadDate: '2024-01-22' },
        { name: 'Bank Statement', status: 'verified', uploadDate: '2024-01-22' },
        { name: 'Proof of Residence', status: 'verified', uploadDate: '2024-01-22' }
      ],
      history: [
        { type: 'application', date: '2024-01-22 10:30', description: 'Application submitted' },
        { type: 'signature', date: '2024-01-23 14:20', description: 'Agreement signed by borrower' },
        { type: 'review', date: '2024-01-23 15:00', description: 'Pending loan officer review' }
      ],
      notes: []
    },
    {
      id: 'L-2024-002',
      borrower: {
        firstName: 'Maria',
        lastName: 'Santos',
        idNumber: '92010567890',
        email: 'maria.s@email.com',
        phone: '+264812345678',
        address: '456 Park Avenue, Swakopmund',
        employer: 'XYZ Trading',
        jobTitle: 'Sales Manager',
        monthlyIncome: 18000,
        employmentDuration: '3 years',
        bankName: 'Standard Bank',
        accountNumber: '****9012'
      },
      loan: {
        amount: 30000,
        period: 18,
        interestRate: 16,
        monthlyPayment: 2150,
        purpose: 'Home Improvement',
        applicationDate: '2024-01-21',
        signedDate: '2024-01-22'
      },
      status: 'pending_review',
      riskLevel: 'medium',
      creditScore: 65,
      documents: [
        { name: 'ID Copy', status: 'verified', uploadDate: '2024-01-21' },
        { name: 'Payslip', status: 'pending', uploadDate: '2024-01-21' },
        { name: 'Bank Statement', status: 'verified', uploadDate: '2024-01-21' },
        { name: 'Proof of Residence', status: 'verified', uploadDate: '2024-01-21' }
      ],
      history: [
        { type: 'application', date: '2024-01-21 09:15', description: 'Application submitted' },
        { type: 'signature', date: '2024-01-22 11:30', description: 'Agreement signed by borrower' }
      ],
      notes: []
    },
    {
      id: 'L-2024-003',
      borrower: {
        firstName: 'David',
        lastName: 'Smith',
        idNumber: '88050398765',
        email: 'david.smith@email.com',
        phone: '+264813456789',
        address: '789 Ocean Drive, Walvis Bay',
        employer: 'Tech Solutions',
        jobTitle: 'IT Specialist',
        monthlyIncome: 22000,
        employmentDuration: '2 years',
        bankName: 'FNB',
        accountNumber: '****3456'
      },
      loan: {
        amount: 75000,
        period: 24,
        interestRate: 14,
        monthlyPayment: 3920,
        purpose: 'Education',
        applicationDate: '2024-01-20',
        signedDate: '2024-01-21'
      },
      status: 'pending_review',
      riskLevel: 'high',
      creditScore: 52,
      documents: [
        { name: 'ID Copy', status: 'verified', uploadDate: '2024-01-20' },
        { name: 'Payslip', status: 'verified', uploadDate: '2024-01-20' },
        { name: 'Bank Statement', status: 'rejected', uploadDate: '2024-01-20' },
        { name: 'Proof of Residence', status: 'verified', uploadDate: '2024-01-20' }
      ],
      history: [
        { type: 'application', date: '2024-01-20 13:45', description: 'Application submitted' },
        { type: 'signature', date: '2024-01-21 16:20', description: 'Agreement signed by borrower' },
        { type: 'issue', date: '2024-01-21 16:30', description: 'Bank statement needs clarification' }
      ],
      notes: [
        { user: 'Officer Smith', date: '2024-01-21', note: 'Bank statement shows irregular deposits - need verification' }
      ]
    }
  ];

  // Dashboard stats
  const stats = [
    {
      label: 'Pending Review',
      value: loanApplications.filter(l => l.status === 'pending_review').length,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      change: '+3'
    },
    {
      label: 'Approved Today',
      value: 5,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      change: '+2'
    },
    {
      label: 'Total Value',
      value: 'NAD 450K',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      label: 'High Risk',
      value: loanApplications.filter(l => l.riskLevel === 'high').length,
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      change: '1'
    }
  ];

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-green-500/20 text-green-300 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_review: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-300 border-green-500/30',
      declined: 'bg-red-500/20 text-red-300 border-red-500/30',
      disbursed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      verified: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const handleApproveLoan = () => {
    if (!officerSignature) {
      alert('Please provide your signature');
      return;
    }
    alert('Loan approved and agreement signed!');
    setShowApproveModal(false);
    setActiveView('dashboard');
  };

  const handleDeclineLoan = () => {
    if (!declineReason) {
      alert('Please provide a reason for decline');
      return;
    }
    alert('Loan declined');
    setShowDeclineModal(false);
    setActiveView('dashboard');
  };

  const filteredApplications = loanApplications.filter(app => {
    const matchesSearch = 
      app.borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Loan Review Dashboard</h1>
          <p className="text-purple-200">Review and approve loan applications</p>
        </div>

        {activeView === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
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

            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or loan ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="pending_review" className="bg-slate-800">Pending Review</option>
                  <option value="approved" className="bg-slate-800">Approved</option>
                  <option value="declined" className="bg-slate-800">Declined</option>
                </select>
                <button className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center justify-center gap-2">
                  <Filter size={18} />
                  More Filters
                </button>
              </div>
            </div>

            {/* Loan Applications Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white">Loan Applications</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Loan ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Borrower</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Risk Level</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Credit Score</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{app.id}</p>
                          <p className="text-purple-200 text-xs">{app.loan.applicationDate}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                              {app.borrower.firstName[0]}{app.borrower.lastName[0]}
                            </div>
                            <div>
                              <p className="text-white font-medium">{app.borrower.firstName} {app.borrower.lastName}</p>
                              <p className="text-purple-200 text-xs">{app.borrower.idNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold">NAD {app.loan.amount.toLocaleString()}</p>
                          <p className="text-purple-200 text-xs">{app.loan.period} months</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border uppercase ${getRiskColor(app.riskLevel)}`}>
                            {app.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{app.creditScore}</span>
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${app.creditScore >= 70 ? 'bg-green-500' : app.creditScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${app.creditScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedLoan(app);
                              setActiveView('detail');
                            }}
                            className="text-purple-300 hover:text-purple-100 font-medium text-sm flex items-center gap-1"
                          >
                            <Eye size={16} />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Loan Detail View */}
        {activeView === 'detail' && selectedLoan && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>

            {/* Loan Summary Header */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedLoan.id}</h2>
                  <p className="text-purple-200">Application Date: {selectedLoan.loan.applicationDate}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                  >
                    <ThumbsDown size={18} />
                    Decline
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                  >
                    <ThumbsUp size={18} />
                    Approve & Sign
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-purple-200 text-sm mb-1">Loan Amount</p>
                  <p className="text-2xl font-bold text-white">NAD {selectedLoan.loan.amount.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-purple-200 text-sm mb-1">Monthly Payment</p>
                  <p className="text-2xl font-bold text-white">NAD {selectedLoan.loan.monthlyPayment.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-purple-200 text-sm mb-1">Risk Level</p>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border uppercase ${getRiskColor(selectedLoan.riskLevel)}`}>
                    {selectedLoan.riskLevel}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-purple-200 text-sm mb-1">Credit Score</p>
                  <p className="text-2xl font-bold text-white">{selectedLoan.creditScore}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
              <div className="border-b border-white/20 px-6">
                <div className="flex gap-6 overflow-x-auto">
                  {[
                    { id: 'profile', name: 'Borrower Profile', icon: User },
                    { id: 'risk', name: 'Risk & History', icon: Shield },
                    { id: 'documents', name: 'Documents', icon: FileText },
                    { id: 'agreement', name: 'Agreement Preview', icon: FileText },
                    { id: 'notes', name: 'Notes', icon: MessageSquare }
                  ].map(tab => (
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
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <User size={20} />
                          Personal Information
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-200">Full Name:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.firstName} {selectedLoan.borrower.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">ID Number:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.idNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Email:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Phone:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Address:</span>
                            <span className="text-white font-medium text-right">{selectedLoan.borrower.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Employment Information */}
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Briefcase size={20} />
                          Employment Information
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-200">Employer:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.employer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Job Title:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.jobTitle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Monthly Income:</span>
                            <span className="text-white font-medium">NAD {selectedLoan.borrower.monthlyIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Duration:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.employmentDuration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Banking Information */}
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <CreditCard size={20} />
                          Banking Information
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-200">Bank Name:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Account Number:</span>
                            <span className="text-white font-medium">{selectedLoan.borrower.accountNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Loan Details */}
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <DollarSign size={20} />
                          Loan Details
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-200">Purpose:</span>
                            <span className="text-white font-medium">{selectedLoan.loan.purpose}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Period:</span>
                            <span className="text-white font-medium">{selectedLoan.loan.period} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-200">Interest Rate:</span>
                            <span className="text-white font-medium">{selectedLoan.loan.interestRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk & History Tab */}
                {activeTab === 'risk' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h3 className="text-white font-semibold mb-4">Credit Score</h3>
                        <div className="text-center mb-4">
                          <p className="text-4xl font-bold text-white mb-2">{selectedLoan.creditScore}</p>
                          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${selectedLoan.creditScore >= 70 ? 'bg-green-500' : selectedLoan.creditScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${selectedLoan.creditScore}%` }}
                            />
                          </div>
                        