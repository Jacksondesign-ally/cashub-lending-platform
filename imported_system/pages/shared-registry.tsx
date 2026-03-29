import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Download,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react'

interface SharedBorrower {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  idNumber: string
  dateOfBirth: string
  creditScore: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'blacklisted' | 'disputed'
  joinDate: string
  lastActivity: string
  totalLoans: number
  totalBorrowed: number
  outstandingBalance: number
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor'
  defaultCount: number
  lenders: LenderInfo[]
  blacklistEntries?: BlacklistEntry[]
  disputes?: DisputeEntry[]
}

interface LenderInfo {
  id: string
  name: string
  registrationNumber: string
  loansCount: number
  totalAmount: number
  status: 'active' | 'completed' | 'defaulted'
  lastLoanDate: string
}

interface BlacklistEntry {
  id: string
  lenderId: string
  lenderName: string
  reason: string
  reasonCode: string
  dateBlacklisted: string
  evidenceCount: number
  status: 'active' | 'under_review' | 'resolved'
  outstandingAmount: number
}

interface DisputeEntry {
  id: string
  blacklistId: string
  lenderName: string
  disputeReason: string
  status: 'open' | 'under_review' | 'resolved' | 'rejected'
  filedDate: string
  resolutionDate?: string
}

export default function SharedRegistry() {
  const [borrowers, setBorrowers] = useState<SharedBorrower[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterLender, setFilterLender] = useState('')
  const [selectedBorrower, setSelectedBorrower] = useState<SharedBorrower | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchSharedRegistry()
  }, [])

  const fetchSharedRegistry = async () => {
    try {
      setLoading(true)
      
      // Mock shared registry data - in real app, fetch from Supabase with cross-lender data
      const mockBorrowers: SharedBorrower[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '+264 81 123456',
          idNumber: '9201015143087',
          dateOfBirth: '1992-01-01',
          creditScore: 720,
          riskLevel: 'low',
          status: 'active',
          joinDate: '2023-06-15',
          lastActivity: '2024-01-15',
          totalLoans: 5,
          totalBorrowed: 25000,
          outstandingBalance: 8500,
          paymentHistory: 'excellent',
          defaultCount: 0,
          lenders: [
            {
              id: 'lender1',
              name: 'QuickCash Finance',
              registrationNumber: 'RC2024001',
              loansCount: 3,
              totalAmount: 15000,
              status: 'active',
              lastLoanDate: '2024-01-10'
            },
            {
              id: 'lender2',
              name: 'Tech Loans Namibia',
              registrationNumber: 'RC2024002',
              loansCount: 2,
              totalAmount: 10000,
              status: 'completed',
              lastLoanDate: '2023-11-20'
            }
          ]
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@email.com',
          phone: '+264 81 789012',
          idNumber: '9503155234089',
          dateOfBirth: '1995-03-15',
          creditScore: 580,
          riskLevel: 'high',
          status: 'blacklisted',
          joinDate: '2023-08-20',
          lastActivity: '2024-01-05',
          totalLoans: 8,
          totalBorrowed: 40000,
          outstandingBalance: 15000,
          paymentHistory: 'poor',
          defaultCount: 3,
          lenders: [
            {
              id: 'lender1',
              name: 'QuickCash Finance',
              registrationNumber: 'RC2024001',
              loansCount: 4,
              totalAmount: 20000,
              status: 'defaulted',
              lastLoanDate: '2023-12-15'
            },
            {
              id: 'lender3',
              name: 'Premium Credit',
              registrationNumber: 'RC2024003',
              loansCount: 4,
              totalAmount: 20000,
              status: 'defaulted',
              lastLoanDate: '2024-01-05'
            }
          ],
          blacklistEntries: [
            {
              id: 'bl1',
              lenderId: 'lender1',
              lenderName: 'QuickCash Finance',
              reason: 'Default on loan repayment',
              reasonCode: 'DEFAULT',
              dateBlacklisted: '2024-01-10',
              evidenceCount: 3,
              status: 'active',
              outstandingAmount: 12000
            },
            {
              id: 'bl2',
              lenderId: 'lender3',
              lenderName: 'Premium Credit',
              reason: 'Multiple payment defaults',
              reasonCode: 'DEFAULT',
              dateBlacklisted: '2024-01-05',
              evidenceCount: 2,
              status: 'active',
              outstandingAmount: 8000
            }
          ]
        },
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.b@email.com',
          phone: '+264 81 345678',
          idNumber: '8807205145023',
          dateOfBirth: '1988-07-20',
          creditScore: 650,
          riskLevel: 'medium',
          status: 'disputed',
          joinDate: '2023-04-10',
          lastActivity: '2024-01-12',
          totalLoans: 3,
          totalBorrowed: 15000,
          outstandingBalance: 5000,
          paymentHistory: 'fair',
          defaultCount: 1,
          lenders: [
            {
              id: 'lender2',
              name: 'Tech Loans Namibia',
              registrationNumber: 'RC2024002',
              loansCount: 2,
              totalAmount: 10000,
              status: 'active',
              lastLoanDate: '2024-01-12'
            },
            {
              id: 'lender4',
              name: 'First Choice Loans',
              registrationNumber: 'RC2024004',
              loansCount: 1,
              totalAmount: 5000,
              status: 'completed',
              lastLoanDate: '2023-10-15'
            }
          ],
          disputes: [
            {
              id: 'disp1',
              blacklistId: 'bl3',
              lenderName: 'Tech Loans Namibia',
              disputeReason: 'Incorrect blacklist entry - loan was paid',
              status: 'under_review',
              filedDate: '2024-01-14'
            }
          ]
        }
      ]

      setBorrowers(mockBorrowers)
    } catch (error) {
      console.error('Error fetching shared registry:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'blacklisted': return 'bg-red-100 text-red-800'
      case 'disputed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentHistoryColor = (history: string) => {
    switch (history) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = 
      borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.idNumber.includes(searchQuery) ||
      borrower.phone.includes(searchQuery)
    
    const matchesRisk = filterRisk === 'all' || borrower.riskLevel === filterRisk
    const matchesStatus = filterStatus === 'all' || borrower.status === filterStatus
    const matchesLender = !filterLender || borrower.lenders.some(l => 
      l.name.toLowerCase().includes(filterLender.toLowerCase())
    )
    
    return matchesSearch && matchesRisk && matchesStatus && matchesLender
  })

  const viewBorrowerDetails = (borrower: SharedBorrower) => {
    setSelectedBorrower(borrower)
    setShowDetailsModal(true)
  }

  if (loading) {
    return (
      <Layout title="Shared Borrower Registry">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Shared Borrower Registry">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Shared Borrower Registry</h2>
            <p className="text-neutral-500">Cross-lender borrower information and loan history</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Registry
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Registry Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Borrowers</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{borrowers.length}</p>
                <p className="text-xs text-green-600 mt-1">+12 this month</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Blacklisted</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {borrowers.filter(b => b.status === 'blacklisted').length}
                </p>
                <p className="text-xs text-red-600 mt-1">High risk</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Active Disputes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {borrowers.filter(b => b.status === 'disputed').length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Under review</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Cross-Lender Loans</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {borrowers.reduce((sum, b) => sum + b.lenders.length, 0)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Total connections</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blacklisted">Blacklisted</option>
                <option value="disputed">Disputed</option>
              </select>
              
              <input
                type="text"
                placeholder="Filter by lender..."
                value={filterLender}
                onChange={(e) => setFilterLender(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
              />
            </div>
          </div>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Borrower Registry</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Showing {filteredBorrowers.length} of {borrowers.length} borrowers
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Borrower Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Risk Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Loan History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Lenders
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
                {filteredBorrowers.map((borrower) => (
                  <tr key={borrower.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {borrower.firstName} {borrower.lastName}
                        </div>
                        <div className="text-sm text-neutral-500">
                          ID: {borrower.idNumber}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {borrower.email} • {borrower.phone}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-neutral-900 mr-2">
                            Credit Score: {borrower.creditScore}
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(borrower.riskLevel)}`}>
                          {borrower.riskLevel.toUpperCase()}
                        </span>
                        <div className="text-xs text-neutral-500 mt-1">
                          Payment: {borrower.paymentHistory}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-neutral-900">
                          {borrower.totalLoans} loans
                        </div>
                        <div className="text-neutral-500">
                          N$ {borrower.totalBorrowed.toLocaleString()} borrowed
                        </div>
                        <div className="text-neutral-500">
                          N$ {borrower.outstandingBalance.toLocaleString()} outstanding
                        </div>
                        {borrower.defaultCount > 0 && (
                          <div className="text-red-600 text-xs">
                            {borrower.defaultCount} defaults
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-neutral-900">
                          {borrower.lenders.length} lenders
                        </div>
                        <div className="space-y-1">
                          {borrower.lenders.slice(0, 2).map((lender, index) => (
                            <div key={index} className="text-xs text-neutral-500">
                              {lender.name}
                            </div>
                          ))}
                          {borrower.lenders.length > 2 && (
                            <div className="text-xs text-neutral-400">
                              +{borrower.lenders.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(borrower.status)}`}>
                        {borrower.status.toUpperCase()}
                      </span>
                      {borrower.blacklistEntries && borrower.blacklistEntries.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {borrower.blacklistEntries.length} blacklist entries
                        </div>
                      )}
                      {borrower.disputes && borrower.disputes.length > 0 && (
                        <div className="text-xs text-yellow-600 mt-1">
                          {borrower.disputes.length} active disputes
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewBorrowerDetails(borrower)}
                          className="text-cashub-600 hover:text-cashub-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Borrower Details Modal */}
        {showDetailsModal && selectedBorrower && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">
                  Borrower Details: {selectedBorrower.firstName} {selectedBorrower.lastName}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Personal Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Full Name</p>
                    <p className="font-medium">{selectedBorrower.firstName} {selectedBorrower.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">ID Number</p>
                    <p className="font-medium">{selectedBorrower.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Date of Birth</p>
                    <p className="font-medium">{selectedBorrower.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="font-medium">{selectedBorrower.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Phone</p>
                    <p className="font-medium">{selectedBorrower.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Member Since</p>
                    <p className="font-medium">{new Date(selectedBorrower.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Risk Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Credit Score</p>
                    <p className="text-2xl font-bold">{selectedBorrower.creditScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Risk Level</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRiskColor(selectedBorrower.riskLevel)}`}>
                      {selectedBorrower.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Payment History</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentHistoryColor(selectedBorrower.paymentHistory)}`}>
                      {selectedBorrower.paymentHistory.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Default Count</p>
                    <p className="text-2xl font-bold text-red-600">{selectedBorrower.defaultCount}</p>
                  </div>
                </div>
              </div>

              {/* Loan History */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Loan Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Total Loans</p>
                    <p className="text-xl font-bold">{selectedBorrower.totalLoans}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Total Borrowed</p>
                    <p className="text-xl font-bold">N$ {selectedBorrower.totalBorrowed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Outstanding Balance</p>
                    <p className="text-xl font-bold">N$ {selectedBorrower.outstandingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Last Activity</p>
                    <p className="text-xl font-bold">{new Date(selectedBorrower.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Lender History */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Lender History</h4>
                <div className="space-y-3">
                  {selectedBorrower.lenders.map((lender, index) => (
                    <div key={index} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">{lender.name}</p>
                          <p className="text-sm text-neutral-500">Reg: {lender.registrationNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lender.status === 'active' ? 'bg-green-100 text-green-800' :
                            lender.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lender.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500">Loans: {lender.loansCount}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Amount: N$ {lender.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Last: {new Date(lender.lastLoanDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blacklist Entries */}
              {selectedBorrower.blacklistEntries && selectedBorrower.blacklistEntries.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-neutral-900 mb-4">Blacklist Entries</h4>
                  <div className="space-y-3">
                    {selectedBorrower.blacklistEntries.map((entry, index) => (
                      <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-800">{entry.lenderName}</p>
                            <p className="text-sm text-red-600">{entry.reason}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {entry.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-red-600">Date: {new Date(entry.dateBlacklisted).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-red-600">Evidence: {entry.evidenceCount} files</p>
                          </div>
                          <div>
                            <p className="text-red-600">Outstanding: N$ {entry.outstandingAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disputes */}
              {selectedBorrower.disputes && selectedBorrower.disputes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-4">Active Disputes</h4>
                  <div className="space-y-3">
                    {selectedBorrower.disputes.map((dispute, index) => (
                      <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-yellow-800">vs {dispute.lenderName}</p>
                            <p className="text-sm text-yellow-600">{dispute.disputeReason}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {dispute.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="text-yellow-600">
                            Filed: {new Date(dispute.filedDate).toLocaleDateString()}
                            {dispute.resolutionDate && ` • Resolved: ${new Date(dispute.resolutionDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
