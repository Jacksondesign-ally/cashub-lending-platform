import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign, 
  Star, 
  Shield, 
  Award,
  Search,
  Filter,
  Calendar,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  Crown,
  Building
} from 'lucide-react'

interface LoanApplication {
  id: string
  borrowerId: string
  borrowerName: string
  borrowerEmail: string
  borrowerPhone: string
  requestedAmount: number
  loanPeriod: number
  purpose: string
  creditScore: number
  riskLevel: 'low' | 'medium' | 'high'
  income: number
  employmentStatus: string
  applicationDate: string
  status: 'open' | 'bidding' | 'awarded' | 'expired'
  bids: Bid[]
  bestBid?: Bid
  expiresAt: string
}

interface Bid {
  id: string
  lenderId: string
  lenderName: string
  lenderLogo?: string
  interestRate: number
  processingFee: number
  totalRepayable: number
  monthlyPayment: number
  approvalTime: string
  lenderRating: number
  totalLoans: number
  approvalRate: number
  features: string[]
  submittedAt: string
  status: 'active' | 'withdrawn' | 'rejected'
}

interface Lender {
  id: string
  name: string
  logo?: string
  registrationNumber: string
  totalLoans: number
  approvalRate: number
  averageInterestRate: number
  rating: number
  features: string[]
  responseTime: string
  minLoanAmount: number
  maxLoanAmount: number
}

export default function LoanMarketplace() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications' | 'lenders'>('browse')
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [lenders, setLenders] = useState<Lender[]>([])
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAmount, setFilterAmount] = useState({ min: 0, max: 50000 })
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketplaceData()
  }, [])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      
      // Mock marketplace data - in real app, fetch from Supabase
      const mockApplications: LoanApplication[] = [
        {
          id: '1',
          borrowerId: 'borrower1',
          borrowerName: 'John Smith',
          borrowerEmail: 'john.smith@email.com',
          borrowerPhone: '+264 81 123456',
          requestedAmount: 10000,
          loanPeriod: 6,
          purpose: 'Business Expansion',
          creditScore: 720,
          riskLevel: 'low',
          income: 25000,
          employmentStatus: 'Employed',
          applicationDate: '2024-01-15',
          status: 'bidding',
          bids: [
            {
              id: 'bid1',
              lenderId: 'lender1',
              lenderName: 'QuickCash Finance',
              interestRate: 12.5,
              processingFee: 200,
              totalRepayable: 11200,
              monthlyPayment: 1866.67,
              approvalTime: '2 hours',
              lenderRating: 4.8,
              totalLoans: 1250,
              approvalRate: 92,
              features: ['Instant approval', 'No collateral', 'Flexible terms'],
              submittedAt: '2024-01-15T14:30:00Z',
              status: 'active'
            },
            {
              id: 'bid2',
              lenderId: 'lender2',
              lenderName: 'Tech Loans Namibia',
              interestRate: 11.8,
              processingFee: 150,
              totalRepayable: 11130,
              monthlyPayment: 1855,
              approvalTime: '1 hour',
              lenderRating: 4.6,
              totalLoans: 890,
              approvalRate: 88,
              features: ['Low rates', 'Fast processing', 'Digital only'],
              submittedAt: '2024-01-15T15:45:00Z',
              status: 'active'
            }
          ],
          bestBid: {
            id: 'bid2',
            lenderId: 'lender2',
            lenderName: 'Tech Loans Namibia',
            interestRate: 11.8,
            processingFee: 150,
            totalRepayable: 11130,
            monthlyPayment: 1855,
            approvalTime: '1 hour',
            lenderRating: 4.6,
            totalLoans: 890,
            approvalRate: 88,
            features: ['Low rates', 'Fast processing', 'Digital only'],
            submittedAt: '2024-01-15T15:45:00Z',
            status: 'active'
          },
          expiresAt: '2024-01-20T23:59:59Z'
        },
        {
          id: '2',
          borrowerId: 'borrower2',
          borrowerName: 'Sarah Johnson',
          borrowerEmail: 'sarah.j@email.com',
          borrowerPhone: '+264 81 789012',
          requestedAmount: 5000,
          loanPeriod: 3,
          purpose: 'Emergency Medical',
          creditScore: 680,
          riskLevel: 'medium',
          income: 15000,
          employmentStatus: 'Employed',
          applicationDate: '2024-01-16',
          status: 'open',
          bids: [],
          expiresAt: '2024-01-21T23:59:59Z'
        }
      ]

      const mockLenders: Lender[] = [
        {
          id: 'lender1',
          name: 'QuickCash Finance',
          registrationNumber: 'RC2024001',
          totalLoans: 1250,
          approvalRate: 92,
          averageInterestRate: 14.5,
          rating: 4.8,
          features: ['Instant approval', 'No collateral', 'Flexible terms'],
          responseTime: '2 hours',
          minLoanAmount: 1000,
          maxLoanAmount: 50000
        },
        {
          id: 'lender2',
          name: 'Tech Loans Namibia',
          registrationNumber: 'RC2024002',
          totalLoans: 890,
          approvalRate: 88,
          averageInterestRate: 13.2,
          rating: 4.6,
          features: ['Low rates', 'Fast processing', 'Digital only'],
          responseTime: '1 hour',
          minLoanAmount: 500,
          maxLoanAmount: 30000
        },
        {
          id: 'lender3',
          name: 'Premium Credit',
          registrationNumber: 'RC2024003',
          totalLoans: 2100,
          approvalRate: 95,
          averageInterestRate: 12.8,
          rating: 4.9,
          features: ['Premium service', 'Low rates', 'Dedicated support'],
          responseTime: '30 minutes',
          minLoanAmount: 2000,
          maxLoanAmount: 100000
        }
      ]

      setApplications(mockApplications)
      setLenders(mockLenders)
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
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
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'bidding': return 'bg-yellow-100 text-yellow-800'
      case 'awarded': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) return `${diffDays} days`
    return `${diffHours} hours`
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAmount = 
      app.requestedAmount >= filterAmount.min && 
      app.requestedAmount <= filterAmount.max
    
    const matchesRisk = filterRisk === 'all' || app.riskLevel === filterRisk
    
    return matchesSearch && matchesAmount && matchesRisk
  })

  if (loading) {
    return (
      <Layout title="Loan Marketplace">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Loan Marketplace">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Loan Marketplace</h2>
            <p className="text-neutral-500">Compare offers from multiple lenders and get the best rates</p>
          </div>
          <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
            <Target className="w-4 h-4 mr-2" />
            Create Loan Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Active Applications</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {applications.filter(a => a.status === 'open' || a.status === 'bidding').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Active Lenders</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{lenders.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Avg. Interest Rate</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">13.5%</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Success Rate</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">89%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Applications
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {applications.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('lenders')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'lenders'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Lenders
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {lenders.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Browse Applications Tab */}
          {activeTab === 'browse' && (
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search applications..."
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
                  <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Applications Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          {application.borrowerName}
                        </h3>
                        <p className="text-sm text-neutral-600">{application.purpose}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.toUpperCase()}
                        </span>
                        <p className="text-xs text-neutral-500 mt-1">
                          {getTimeRemaining(application.expiresAt)} left
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-500">Requested Amount</p>
                        <p className="text-lg font-bold text-neutral-900">
                          N$ {application.requestedAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Loan Period</p>
                        <p className="text-lg font-bold text-neutral-900">{application.loanPeriod} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Credit Score</p>
                        <p className="text-lg font-bold text-neutral-900">{application.creditScore}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Risk Level</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(application.riskLevel)}`}>
                          {application.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {application.bids.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-neutral-700">
                            {application.bids.length} Bids Received
                          </p>
                          {application.bestBid && (
                            <span className="text-sm text-green-600 font-medium">
                              Best: {application.bestBid.interestRate}%
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {application.bids.slice(0, 2).map((bid) => (
                            <div key={bid.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-cashub-100 rounded-full flex items-center justify-center">
                                  <Building className="w-4 h-4 text-cashub-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-neutral-900">{bid.lenderName}</p>
                                  <div className="flex items-center space-x-2 text-xs text-neutral-500">
                                    <span>{bid.interestRate}% interest</span>
                                    <span>•</span>
                                    <span>{bid.approvalTime}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-neutral-900">
                                  N$ {bid.monthlyPayment.toLocaleString()}/mo
                                </p>
                                <div className="flex items-center text-xs text-neutral-500">
                                  <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                  {bid.lenderRating}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="text-cashub-600 hover:text-cashub-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Place Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lenders Tab */}
          {activeTab === 'lenders' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lenders.map((lender) => (
                  <div key={lender.id} className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{lender.name}</h3>
                        <p className="text-xs text-neutral-500">{lender.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Rating</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{lender.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Total Loans</span>
                        <span className="text-sm font-medium">{lender.totalLoans.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Approval Rate</span>
                        <span className="text-sm font-medium">{lender.approvalRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Avg. Rate</span>
                        <span className="text-sm font-medium">{lender.averageInterestRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Response Time</span>
                        <span className="text-sm font-medium">{lender.responseTime}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-900 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {lender.features.map((feature, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Loan Application Details</h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Application details would go here */}
              <div className="text-center py-8">
                <p className="text-neutral-600">Application details view coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
