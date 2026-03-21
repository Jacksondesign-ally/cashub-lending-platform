"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  Building,
  RefreshCw
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications' | 'lenders'>('browse')
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [lenders, setLenders] = useState<Lender[]>([])
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAmount, setFilterAmount] = useState({ min: 0, max: 50000 })
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [marketplaceBorrowers, setMarketplaceBorrowers] = useState<
    { id: string; name: string; risk_level: string; monthly_income: number | null }[]
  >([])
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [bidApp, setBidApp] = useState<LoanApplication | null>(null)
  const [bidForm, setBidForm] = useState({ interestRate: '', processingFee: '0', approvalTime: '24 hours' })
  const [bidSubmitting, setBidSubmitting] = useState(false)

  const submitBid = async () => {
    if (!bidApp) return
    setBidSubmitting(true)
    try {
      const lenderId = typeof window !== 'undefined' ? localStorage.getItem('lenderId') : null
      const rate = parseFloat(bidForm.interestRate) / 100
      const monthlyRate = rate / 12
      const n = bidApp.loanPeriod
      const principal = bidApp.requestedAmount
      const monthlyPayment = monthlyRate > 0
        ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -n))
        : principal / n
      const totalRepayable = monthlyPayment * n
      const { error } = await supabase.from('marketplace_bids').insert({
        application_id: bidApp.id,
        lender_id: lenderId,
        interest_rate: parseFloat(bidForm.interestRate),
        processing_fee: parseFloat(bidForm.processingFee) || 0,
        total_repayable: Math.round(totalRepayable),
        monthly_payment: Math.round(monthlyPayment),
        approval_time: bidForm.approvalTime,
        status: 'active'
      })
      if (error) throw error
      setShowBidModal(false)
      setBidApp(null)
      setBidForm({ interestRate: '', processingFee: '0', approvalTime: '24 hours' })
      await fetchMarketplaceData()
    } catch (err) {
      console.error('Error submitting bid:', err)
    }
    setBidSubmitting(false)
  }

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    const allowedRoles = ['super_admin', 'lender_admin', 'loan_officer']
    if (role && allowedRoles.includes(role)) {
      setAllowed(true)
      fetchMarketplaceData()
    } else {
      setAllowed(false)
    }
  }, [])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)

      // Fetch marketplace applications with borrower info and bids
      const { data: appsData, error: appsErr } = await supabase
        .from('marketplace_applications')
        .select(`
          *,
          borrowers (id, first_name, last_name, email, phone, credit_score, risk_level, monthly_income, employment_status)
        `)
        .order('created_at', { ascending: false })

      if (!appsErr && appsData) {
        const mappedApps: LoanApplication[] = await Promise.all(
          appsData.map(async (app: any) => {
            const borrower = app.borrowers || {}
            // Fetch bids for this application
            const { data: bidsData } = await supabase
              .from('marketplace_bids')
              .select('*, lenders (company_name, rating, total_loans, approval_rate, features, response_time)')
              .eq('application_id', app.id)
              .order('interest_rate', { ascending: true })

            const bids: Bid[] = (bidsData || []).map((b: any) => ({
              id: b.id,
              lenderId: b.lender_id,
              lenderName: b.lenders?.company_name || 'Unknown',
              interestRate: b.interest_rate,
              processingFee: b.processing_fee || 0,
              totalRepayable: b.total_repayable || 0,
              monthlyPayment: b.monthly_payment || 0,
              approvalTime: b.approval_time || 'N/A',
              lenderRating: b.lenders?.rating || 0,
              totalLoans: b.lenders?.total_loans || 0,
              approvalRate: b.lenders?.approval_rate || 0,
              features: b.lenders?.features || [],
              submittedAt: b.created_at,
              status: b.status || 'active'
            }))

            return {
              id: app.id,
              borrowerId: borrower.id || '',
              borrowerName: borrower.first_name ? `${borrower.first_name} ${borrower.last_name}` : 'Unknown',
              borrowerEmail: borrower.email || '',
              borrowerPhone: borrower.phone || '',
              requestedAmount: app.requested_amount,
              loanPeriod: app.loan_period,
              purpose: app.purpose || '',
              creditScore: borrower.credit_score || 0,
              riskLevel: borrower.risk_level || 'medium',
              income: borrower.monthly_income || 0,
              employmentStatus: borrower.employment_status || 'Unknown',
              applicationDate: app.created_at?.split('T')[0] || '',
              status: app.status || 'open',
              bids,
              bestBid: bids.length > 0 ? bids[0] : undefined,
              expiresAt: app.expires_at || ''
            }
          })
        )
        setApplications(mappedApps)
      } else {
        setApplications([])
      }

      // Fetch lenders for the lenders directory tab
      const { data: lendersData, error: lendersErr } = await supabase
        .from('lenders')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (!lendersErr && lendersData) {
        const mappedLenders: Lender[] = lendersData.map((l: any) => ({
          id: l.id,
          name: l.company_name || l.legal_name,
          logo: l.logo_url,
          registrationNumber: l.registration_number || '',
          totalLoans: l.total_loans || 0,
          approvalRate: l.approval_rate || 0,
          averageInterestRate: l.avg_interest_rate || 0,
          rating: l.rating || 0,
          features: l.features || [],
          responseTime: l.response_time || 'N/A',
          minLoanAmount: l.min_loan_amount || 0,
          maxLoanAmount: l.max_loan_amount || 0
        }))
        setLenders(mappedLenders)
      } else {
        setLenders([])
      }

      // Fetch marketplace-visible borrowers
      try {
        const { data, error } = await supabase
          .from('borrowers')
          .select('id, first_name, last_name, risk_level, monthly_income, visibility_mode')
          .eq('visibility_mode', 'marketplace')
          .limit(20)

        if (!error) {
          const mapped = (data || []).map((b: any) => ({
            id: b.id,
            name: `${b.first_name} ${b.last_name}`,
            risk_level: b.risk_level || 'medium',
            monthly_income: b.monthly_income ?? null
          }))
          setMarketplaceBorrowers(mapped)
          setMarketplaceError(null)
        } else {
          setMarketplaceBorrowers([])
        }
      } catch {
        setMarketplaceBorrowers([])
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
      setApplications([])
      setLenders([])
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

  if (allowed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Access restricted</h1>
        <p className="text-neutral-500 text-sm max-w-md">
          The lender marketplace is available to lender and system administrators only.
        </p>
      </div>
    )
  }

  if (loading || allowed === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
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

  return (
    <>
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

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Marketplace Borrowers</h3>
            <p className="text-xs text-neutral-500">
              Borrowers who have opted into being visible to other lenders.
            </p>
          </div>
          <span className="text-xs text-neutral-500">
            {marketplaceBorrowers.length} visible
          </span>
        </div>
        {marketplaceError && (
          <p className="text-xs text-red-600 mb-2">{marketplaceError}</p>
        )}
        {marketplaceBorrowers.length === 0 && !marketplaceError && (
          <p className="text-xs text-neutral-500">
            No borrowers have enabled marketplace visibility yet.
          </p>
        )}
        {marketplaceBorrowers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {marketplaceBorrowers.map((b) => (
              <div key={b.id} className="border border-neutral-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-neutral-900 truncate">{b.name}</p>
                <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                  <span>
                    Risk{' '}
                    <span className="font-medium uppercase">
                      {b.risk_level || 'MEDIUM'}
                    </span>
                  </span>
                  {b.monthly_income != null && (
                    <span>
                      Income N$ {b.monthly_income.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            {[
              { id: 'browse', label: 'Browse Applications', icon: Search, count: applications.length },
              { id: 'lenders', label: 'Lenders', icon: Building, count: lenders.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
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
                  className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm">
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
                              <div className="w-8 h-8 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">C</span>
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
                    {(application.status === 'open' || application.status === 'bidding') && (
                      <button
                        onClick={() => { setBidApp(application); setBidForm({ interestRate: '', processingFee: '0', approvalTime: '24 hours' }); setShowBidModal(true) }}
                        className="px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors text-sm">
                        Submit Bid
                      </button>
                    )}
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
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-lg font-bold text-white">C</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{lender.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-neutral-500">{lender.registrationNumber}</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-neutral-500">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="font-medium text-neutral-900">{lender.rating}</span>
                        <span className="ml-1">Rating</span>
                      </div>
                      <div className="text-sm text-neutral-500">
                        <span className="font-medium text-neutral-900">{lender.approvalRate}%</span>
                        <span className="ml-1">Approval</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider font-semibold">Offer Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-neutral-500">Avg. Rate</p>
                          <p className="text-sm font-bold text-neutral-900">{lender.averageInterestRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Response</p>
                          <p className="text-sm font-bold text-neutral-900">{lender.responseTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {lender.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 bg-cashub-50 text-cashub-700 text-[10px] font-medium rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <button className="w-full mt-4 py-2 border border-cashub-600 text-cashub-600 rounded-lg hover:bg-cashub-50 transition-colors text-sm font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Bid Submission Modal */}
    {showBidModal && bidApp && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Submit Bid</h2>
              <p className="text-xs text-neutral-500">{bidApp.borrowerName} — N$ {bidApp.requestedAmount.toLocaleString()} for {bidApp.loanPeriod} months</p>
            </div>
            <button onClick={() => setShowBidModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-lg text-sm">
              <div><span className="text-neutral-500">Requested:</span> <span className="font-semibold">N$ {bidApp.requestedAmount.toLocaleString()}</span></div>
              <div><span className="text-neutral-500">Term:</span> <span className="font-semibold">{bidApp.loanPeriod} months</span></div>
              <div><span className="text-neutral-500">Risk:</span> <span className={`font-semibold capitalize ${bidApp.riskLevel === 'low' ? 'text-green-600' : bidApp.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>{bidApp.riskLevel}</span></div>
              <div><span className="text-neutral-500">Credit:</span> <span className="font-semibold">{bidApp.creditScore}</span></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Interest Rate (% per annum) <span className="text-red-500">*</span></label>
              <input type="number" step="0.1" min="1" max="50" value={bidForm.interestRate}
                onChange={e => setBidForm({...bidForm, interestRate: e.target.value})}
                placeholder="e.g. 15" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Processing Fee (N$)</label>
              <input type="number" step="1" min="0" value={bidForm.processingFee}
                onChange={e => setBidForm({...bidForm, processingFee: e.target.value})}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Approval Time</label>
              <select value={bidForm.approvalTime} onChange={e => setBidForm({...bidForm, approvalTime: e.target.value})}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
                <option value="1 hour">1 hour</option>
                <option value="4 hours">4 hours</option>
                <option value="24 hours">24 hours</option>
                <option value="2 days">2 days</option>
                <option value="Same day">Same day</option>
              </select>
            </div>
            {bidForm.interestRate && (
              <div className="p-3 bg-cashub-50 border border-cashub-100 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-cashub-700">Estimated offer preview</p>
                <p>Monthly rate: {(parseFloat(bidForm.interestRate)/12).toFixed(2)}%</p>
                <p>Monthly payment: ≈ N$ {(() => {
                  const r = parseFloat(bidForm.interestRate) / 100 / 12
                  const n = bidApp.loanPeriod
                  const p = bidApp.requestedAmount
                  const mp = r > 0 ? p * r / (1 - Math.pow(1 + r, -n)) : p / n
                  return Math.round(mp).toLocaleString()
                })()}</p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-neutral-200 flex gap-3">
            <button onClick={() => setShowBidModal(false)}
              className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">Cancel</button>
            <button onClick={submitBid} disabled={!bidForm.interestRate || bidSubmitting}
              className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {bidSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" />Submitting...</> : <><CheckCircle className="w-4 h-4" />Submit Bid</>}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
