import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { 
  User, 
  FileText, 
  Calendar, 
  CreditCard, 
  Upload, 
  Download, 
  Bell, 
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Shield,
  MessageSquare,
  Camera
} from 'lucide-react'

interface BorrowerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  idNumber: string
  dateOfBirth: string
  maritalStatus: string
  address: string
  employmentStatus: string
  employerName: string
  monthlyIncome: number
  bankName: string
  bankAccount: string
  creditScore: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'inactive' | 'blacklisted'
  joinDate: string
}

interface Loan {
  id: string
  loanNumber: string
  principalAmount: number
  interestRate: number
  totalRepayable: number
  monthlyPayment: number
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
  applicationDate: string
  approvalDate?: string
  disbursementDate?: string
  firstPaymentDate?: string
  nextPaymentDate?: string
  outstandingBalance: number
  daysOverdue?: number
}

interface Document {
  id: string
  type: 'id' | 'payslip' | 'bank_statement' | 'proof_of_address' | 'contract'
  name: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
  fileUrl: string
}

export default function BorrowerPortal() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loans' | 'documents' | 'profile' | 'disputes'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [borrower, setBorrower] = useState<BorrowerProfile | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchBorrowerData()
  }, [])

  const fetchBorrowerData = async () => {
    try {
      setLoading(true)
      
      // Mock borrower data - in real app, fetch from Supabase
      const mockBorrower: BorrowerProfile = {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+264 81 123456',
        idNumber: '9201015143087',
        dateOfBirth: '1992-01-01',
        maritalStatus: 'Single',
        address: '123 Main Street, Windhoek, Namibia',
        employmentStatus: 'Employed',
        employerName: 'Tech Company Namibia',
        monthlyIncome: 15000,
        bankName: 'First National Bank',
        bankAccount: '62345678901',
        creditScore: 650,
        riskLevel: 'low',
        status: 'active',
        joinDate: '2023-06-15'
      }

      const mockLoans: Loan[] = [
        {
          id: '1',
          loanNumber: 'LN001',
          principalAmount: 5000,
          interestRate: 15.5,
          totalRepayable: 5775,
          monthlyPayment: 1925,
          status: 'active',
          applicationDate: '2024-01-10',
          approvalDate: '2024-01-12',
          disbursementDate: '2024-01-15',
          firstPaymentDate: '2024-02-15',
          nextPaymentDate: '2024-02-15',
          outstandingBalance: 3850,
          daysOverdue: 0
        },
        {
          id: '2',
          loanNumber: 'LN002',
          principalAmount: 3000,
          interestRate: 18.0,
          totalRepayable: 3270,
          monthlyPayment: 1090,
          status: 'completed',
          applicationDate: '2023-10-01',
          approvalDate: '2023-10-02',
          disbursementDate: '2023-10-05',
          firstPaymentDate: '2023-11-05',
          outstandingBalance: 0
        }
      ]

      const mockDocuments: Document[] = [
        {
          id: '1',
          type: 'id',
          name: 'National ID Card',
          uploadDate: '2023-06-15',
          status: 'approved',
          fileUrl: '/documents/id_card.pdf'
        },
        {
          id: '2',
          type: 'payslip',
          name: 'Latest Payslip',
          uploadDate: '2024-01-05',
          status: 'approved',
          fileUrl: '/documents/payslip.pdf'
        },
        {
          id: '3',
          type: 'bank_statement',
          name: 'Bank Statement',
          uploadDate: '2024-01-05',
          status: 'pending',
          fileUrl: '/documents/bank_statement.pdf'
        }
      ]

      setBorrower(mockBorrower)
      setLoans(mockLoans)
      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Error fetching borrower data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'defaulted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const handleFileUpload = async (file: File, type: string) => {
    try {
      // Mock file upload - in real app, upload to Supabase storage
      console.log('Uploading file:', file.name, 'Type:', type)
      
      // Add to documents list
      const newDoc: Document = {
        id: Date.now().toString(),
        type: type as any,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        fileUrl: URL.createObjectURL(file)
      }
      
      setDocuments([...documents, newDoc])
      setShowUploadModal(false)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Borrower Portal - CasHuB</title>
        <meta name="description" content="CasHuB Borrower Portal - Manage your loans and profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-cashub-600 to-accent-500 bg-clip-text text-transparent">
                  CasHuB Portal
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                  <Bell className="w-5 h-5 text-neutral-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {borrower?.firstName} {borrower?.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">Credit Score: {borrower?.creditScore}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'loans'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                My Loans
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('disputes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'disputes'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Disputes
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && borrower && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-cashub-600 to-accent-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Welcome back, {borrower.firstName}!
                    </h2>
                    <p className="text-cashub-100">
                      Your credit score is <span className="font-semibold">{borrower.creditScore}</span> - 
                      <span className="font-semibold"> {borrower.riskLevel.toUpperCase()}</span> risk level
                    </p>
                  </div>
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Active Loans</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {loans.filter(l => l.status === 'active').length}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Total Borrowed</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        N$ {loans.reduce((sum, loan) => sum + loan.principalAmount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Next Payment</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        N$ {loans.find(l => l.status === 'active')?.monthlyPayment.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Documents</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {documents.length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Loan LN001 Approved</p>
                      <p className="text-xs text-neutral-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Payslip Uploaded</p>
                      <p className="text-xs text-neutral-500">5 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">My Loans</h2>
                <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for New Loan
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Loan Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Monthly Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Next Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {loan.loanNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            N$ {loan.principalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            N$ {loan.monthlyPayment.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-cashub-600 hover:text-cashub-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">My Documents</h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-neutral-100 rounded-lg">
                        <FileText className="w-6 h-6 text-neutral-600" />
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-neutral-900 mb-2">{doc.name}</h3>
                    <p className="text-sm text-neutral-500 mb-4">Type: {doc.type}</p>
                    <p className="text-xs text-neutral-400 mb-4">Uploaded: {doc.uploadDate}</p>
                    <div className="flex items-center space-x-2">
                      <button className="text-cashub-600 hover:text-cashub-900 text-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 text-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && borrower && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-neutral-900">My Profile</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Full Name</label>
                        <p className="text-neutral-900">{borrower.firstName} {borrower.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Email</label>
                        <p className="text-neutral-900">{borrower.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Phone</label>
                        <p className="text-neutral-900">{borrower.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700">ID Number</label>
                        <p className="text-neutral-900">{borrower.idNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Financial Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Credit Score</label>
                        <p className="text-neutral-900">{borrower.creditScore}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Risk Level</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(borrower.riskLevel)}`}>
                          {borrower.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Monthly Income</label>
                        <p className="text-neutral-900">N$ {borrower.monthlyIncome.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700">Employer</label>
                        <p className="text-neutral-900">{borrower.employerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-neutral-900">Disputes & Name Clearance</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Active Disputes</h3>
                  <p className="text-neutral-500 mb-4">
                    You have no active disputes or blacklist entries.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Dispute
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload Document</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Document Type
                  </label>
                  <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500">
                    <option value="id">National ID</option>
                    <option value="payslip">Payslip</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="proof_of_address">Proof of Address</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Choose File
                  </label>
                  <input
                    type="file"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
