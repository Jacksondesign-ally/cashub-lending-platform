import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
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
  Activity,
  Edit,
  Calendar
} from 'lucide-react'

interface Loan {
  id: string
  loan_number: string
  borrower_id: string
  lender_id: string
  principal_amount: number
  interest_rate: number
  finance_charges?: number
  total_repayable?: number
  monthly_payment?: number
  loan_period: number
  purpose?: string
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
  outstanding_balance?: number
  days_overdue?: number
  application_date: string
  approval_date?: string
  disbursement_date?: string
  first_payment_date?: string
  last_payment_date?: string
  created_at: string
  updated_at: string
  borrower?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    id_number: string
    risk_level: string
    credit_score: number
    monthly_income?: number
    employment_status?: string
    employer_name?: string
    job_title?: string
  }
}

const LoanOfficerDashboardIntegrated = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      
      const { data: loansData, error } = await supabase
        .from('loans')
        .select(`
          *,
          borrowers (
            id,
            first_name,
            last_name,
            email,
            phone,
            id_number,
            risk_level,
            credit_score,
            monthly_income,
            employment_status,
            employer_name,
            job_title
          )
        `)
        .order('application_date', { ascending: false });

      if (error) throw error;
      setLoans(loansData || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculations
  const stats = {
    totalApplications: loans.length,
    pendingReview: loans.filter(l => l.status === 'pending').length,
    approvedToday: loans.filter(l => 
      l.status === 'approved' && 
      new Date(l.approval_date || '').toDateString() === new Date().toDateString()
    ).length,
    avgProcessingTime: '2.5 days'
  };

  // Filter loans based on search and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.loan_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrower?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrower?.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrower?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: 'approved',
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (error) throw error;
      await fetchLoans(); // Refresh the list
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleDecline = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (error) throw error;
      setShowDeclineModal(false);
      setDeclineReason('');
      await fetchLoans(); // Refresh the list
    } catch (error) {
      console.error('Error declining loan:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'defaulted': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout title="Loan Officer Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Loan Officer Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Loan Officer Dashboard</h2>
            <p className="text-neutral-500">Review and approve loan applications</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Applications</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.totalApplications}</p>
                <p className="text-xs text-neutral-500 mt-1">This month</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Review</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.pendingReview}</p>
                <p className="text-xs text-yellow-600 mt-1">Require action</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Approved Today</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.approvedToday}</p>
                <p className="text-xs text-green-600 mt-1">+{stats.approvedToday} from yesterday</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Avg Processing</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.avgProcessingTime}</p>
                <p className="text-xs text-neutral-500 mt-1">Per application</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by loan number, borrower name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loan Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Loan Applications</h3>
            <p className="text-sm text-neutral-500 mt-1">Review and manage loan applications</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Loan Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{loan.loan_number}</div>
                          <div className="text-sm text-neutral-500">
                            Applied: {new Date(loan.application_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900">
                              {loan.borrower?.first_name} {loan.borrower?.last_name}
                            </div>
                            <div className="text-sm text-neutral-500">{loan.borrower?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-neutral-900">
                            N$ {loan.principal_amount.toLocaleString()}
                          </div>
                          <div className="text-neutral-500">
                            {loan.interest_rate}% • {loan.loan_period} months
                          </div>
                          {loan.purpose && (
                            <div className="text-xs text-neutral-500 mt-1">
                              {loan.purpose}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(loan.borrower?.risk_level || 'medium')}`}>
                            {loan.borrower?.risk_level?.toUpperCase() || 'MEDIUM'}
                          </span>
                          <div className="text-xs text-neutral-500 mt-1">
                            Score: {loan.borrower?.credit_score}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedLoan(loan);
                              setActiveView('details');
                            }}
                            className="text-cashub-600 hover:text-cashub-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {loan.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(loan.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setShowDeclineModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Decline"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      No loan applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decline Modal */}
        {showDeclineModal && selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Decline Loan Application</h3>
              <div className="mb-4">
                <p className="text-sm text-neutral-600 mb-2">
                  Loan: {selectedLoan.loan_number}
                </p>
                <p className="text-sm text-neutral-600">
                  Borrower: {selectedLoan.borrower?.first_name} {selectedLoan.borrower?.last_name}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reason for decline
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Please provide a reason for declining this loan application..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason('');
                    setSelectedLoan(null);
                  }}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedLoan && handleDecline(selectedLoan.id)}
                  disabled={!declineReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Decline Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanOfficerDashboardIntegrated;
