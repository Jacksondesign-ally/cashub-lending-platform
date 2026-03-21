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
  Search,
  Filter,
  Briefcase,
  CreditCard,
  Activity
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
        { name: 'Bank Statement', status: 'verified', uploadDate: '2024-01-22' }
      ],
      history: [
        { type: 'application', date: '2024-01-22 10:30', description: 'Application submitted' },
        { type: 'signature', date: '2024-01-23 14:20', description: 'Agreement signed by borrower' }
      ]
    }
  ];

  const stats = [
    { label: 'Pending Review', value: 3, icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { label: 'Approved Today', value: 5, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Value', value: 'NAD 450K', icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
    { label: 'High Risk', value: 1, icon: AlertCircle, color: 'from-red-500 to-pink-500' }
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
      verified: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Loan Review Dashboard</h1>
          <p className="text-purple-200">Review and approve loan applications</p>
        </div>

        {activeView === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} inline-block mb-4`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-purple-200 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="pending_review" className="bg-slate-800">Pending Review</option>
                </select>
              </div>
            </div>

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
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Risk</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loanApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{app.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{app.borrower.firstName} {app.borrower.lastName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold">NAD {app.loan.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRiskColor(app.riskLevel)}`}>
                            {app.riskLevel}
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

        {activeView === 'detail' && selectedLoan && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white"
            >
              ← Back to Dashboard
            </button>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedLoan.id}</h2>
                  <p className="text-purple-200">Application Date: {selectedLoan.loan.applicationDate}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2"
                  >
                    <ThumbsDown size={18} />
                    Decline
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium flex items-center gap-2"
                  >
                    <ThumbsUp size={18} />
                    Approve
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
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskColor(selectedLoan.riskLevel)}`}>
                    {selectedLoan.riskLevel}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-purple-200 text-sm mb-1">Credit Score</p>
                  <p className="text-2xl font-bold text-white">{selectedLoan.creditScore}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
              <div className="border-b border-white/20 px-6">
                <div className="flex gap-6">
                  {[
                    { id: 'profile', name: 'Profile', icon: User },
                    { id: 'documents', name: 'Documents', icon: FileText }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 font-medium border-b-2 flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-purple-400 text-white'
                          : 'border-transparent text-purple-200'
                      }`}
                    >
                      <tab.icon size={18} />
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Personal Info</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-200">Name:</span>
                          <span className="text-white">{selectedLoan.borrower.firstName} {selectedLoan.borrower.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">ID:</span>
                          <span className="text-white">{selectedLoan.borrower.idNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Email:</span>
                          <span className="text-white">{selectedLoan.borrower.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Employment</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-200">Employer:</span>
                          <span className="text-white">{selectedLoan.borrower.employer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Income:</span>
                          <span className="text-white">NAD {selectedLoan.borrower.monthlyIncome.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    {selectedLoan.documents.map((doc, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="text-purple-300" size={24} />
                          <div>
                            <p className="text-white font-medium">{doc.name}</p>
                            <p className="text-purple-200 text-sm">{doc.uploadDate}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showApproveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Approve Loan</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-purple-200 mb-2">Your Signature</label>
                <input
                  type="text"
                  value={officerSignature}
                  onChange={(e) => setOfficerSignature(e.target.value)}
                  placeholder="Type your full name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Loan approved!');
                    setShowApproveModal(false);
                    setActiveView('dashboard');
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 rounded-lg text-white"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeclineModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Decline Loan</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-purple-200 mb-2">Reason</label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="" className="bg-slate-800">Select...</option>
                  <option value="insufficient_income" className="bg-slate-800">Insufficient Income</option>
                  <option value="high_risk" className="bg-slate-800">High Risk</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Loan declined');
                    setShowDeclineModal(false);
                    setActiveView('dashboard');
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanOfficerDashboard;