"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  Info,
  X
} from 'lucide-react'

interface SharedBorrower {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  id_number: string
  date_of_birth: string | null
  credit_score: number
  risk_level: 'low' | 'medium' | 'high'
  status: 'active' | 'inactive' | 'blacklisted' | 'cleared'
  join_date: string
  total_loans?: number
  active_loans_count?: number
  active_loans?: any[]
  total_borrowed?: number
  outstanding_balance?: number
  lenders?: LenderInfo[]
  blacklist_entries?: BlacklistEntry[]
  disputes?: DisputeEntry[]
}

interface LenderInfo {
  id: string
  name: string
  loans_count: number
  total_amount: number
  status: 'active' | 'completed' | 'defaulted'
  last_loan_date: string
}

interface BlacklistEntry {
  id: string
  lender_name: string
  reason: string
  date_blacklisted: string
  outstanding_amount: number
}

interface DisputeEntry {
  id: string
  lender_name: string
  dispute_reason: string
  status: 'open' | 'under_review' | 'resolved' | 'rejected'
  filed_date: string
}

export default function SharedRegistry() {
  const [borrowers, setBorrowers] = useState<SharedBorrower[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterLender, setFilterLender] = useState('all')
  const [uniqueLendersList, setUniqueLendersList] = useState<{id: string, name: string}[]>([])
  const [selectedBorrower, setSelectedBorrower] = useState<SharedBorrower | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchSharedRegistry()
  }, [])

  const fetchSharedRegistry = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      
      // Fetch borrowers with their loans, blacklist entries and disputes
      const { data: borrowersData, error: borrowersError } = await supabase
        .from('borrowers')
        .select(`
          *,
          loans (id, principal_amount, outstanding_balance, status, start_date, lender_id, lenders:lender_id(id, company_name, legal_name)),
          borrower_blacklist (
            id,
            status,
            reason,
            description,
            outstanding_amount,
            blacklist_date,
            lenders (id, legal_name)
          ),
          borrower_disputes (*)
        `)
        .order('last_name', { ascending: true })

      if (borrowersError) {
        console.error('Registry fetch error:', borrowersError)
        setFetchError(`Failed to load registry: ${borrowersError.message}. ${borrowersError.code === 'PGRST301' ? 'Access denied — check Supabase RLS policies for the borrowers table.' : ''}`)
        return
      }

      const allLenders = new Map<string, string>()

      // Transform the data to match our SharedBorrower interface
      const transformedBorrowers: SharedBorrower[] = (borrowersData || []).map((b: any) => {
        const loans = b.loans || []
        const totalBorrowed = loans.reduce((sum: number, l: any) => sum + (l.principal_amount || 0), 0)
        const activeLoans = loans.filter((l: any) => l.status === 'active' || l.status === 'overdue')
        const outstandingBalance = activeLoans.reduce((sum: number, l: any) => sum + (l.outstanding_balance || l.principal_amount || 0), 0)

        // Map blacklist entries from borrower_blacklist
        const blacklist_entries: BlacklistEntry[] = (b.borrower_blacklist || []).map((bl: any) => {
          if (bl.lenders?.id && bl.lenders?.legal_name) {
            allLenders.set(bl.lenders.id, bl.lenders.legal_name)
          }
          return {
            id: bl.id,
            lender_name: bl.lenders?.legal_name || 'Unknown Lender',
            reason: bl.reason,
            date_blacklisted: bl.blacklist_date,
            outstanding_amount: bl.outstanding_amount
          }
        })

        // Map disputes from borrower_disputes
        const disputes: DisputeEntry[] = (b.borrower_disputes || []).map((d: any) => ({
          id: d.id,
          lender_name: 'System Registry',
          dispute_reason: d.reason,
          status: d.status,
          filed_date: d.created_at
        }))

        // Derive unique lenders from loans
        const borrowerLenders = new Map()
        loans.forEach((l: any) => {
          const lenderName = l.lenders?.company_name || l.lenders?.legal_name || 'CasHuB Network'
          const lenderId = l.lender_id || 'unknown'
          allLenders.set(lenderId, lenderName)

          if (!borrowerLenders.has(lenderName)) {
            borrowerLenders.set(lenderName, {
              id: lenderId,
              name: lenderName,
              loans_count: 0,
              total_amount: 0,
              status: 'active',
              last_loan_date: l.start_date
            })
          }
          const stats = borrowerLenders.get(lenderName)
          stats.loans_count += 1
          stats.total_amount += l.principal_amount
          if (l.status === 'defaulted') stats.status = 'defaulted'
          if (new Date(l.start_date) > new Date(stats.last_loan_date)) {
            stats.last_loan_date = l.start_date
          }
        })

        return {
          ...b,
          total_loans: loans.length,
          active_loans_count: activeLoans.length,
          active_loans: activeLoans,
          total_borrowed: totalBorrowed,
          outstanding_balance: outstandingBalance,
          lenders: Array.from(borrowerLenders.values()),
          blacklist_entries,
          disputes
        }
      })

      setBorrowers(transformedBorrowers)
      setUniqueLendersList(Array.from(allLenders.entries()).map(([id, name]) => ({ id, name })))
    } catch (error: any) {
      console.error('Error fetching shared registry:', error)
      setFetchError(`Unexpected error: ${error?.message || 'Unknown error'}. Please try refreshing.`)
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
      case 'cleared': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = 
      borrower.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (borrower.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      borrower.id_number.includes(searchQuery) ||
      (borrower.phone?.includes(searchQuery) || false)
    
    const matchesRisk = filterRisk === 'all' || borrower.risk_level === filterRisk
    const matchesStatus = filterStatus === 'all' || borrower.status === filterStatus
    const matchesLender = filterLender === 'all' || (borrower.lenders?.some(l => 
      l.id === filterLender
    ) || false)
    
    return matchesSearch && matchesRisk && matchesStatus && matchesLender
  })

  return (
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
          <button 
            onClick={fetchSharedRegistry}
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Registry Load Error</p>
            <p className="text-xs text-red-700 mt-1">{fetchError}</p>
            <button onClick={fetchSharedRegistry} className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-800">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Registry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Borrowers</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{borrowers.length}</p>
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
                {borrowers.reduce((sum, b) => sum + (b.disputes?.length || 0), 0)}
              </p>
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
                {borrowers.reduce((sum, b) => sum + (b.lenders?.length || 0), 0)}
              </p>
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
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
              <option value="disputed">Disputed</option>
              <option value="cleared">Cleared</option>
            </select>

            <select
              value={filterLender}
              onChange={(e) => setFilterLender(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
            >
              <option value="all">All Lenders</option>
              {uniqueLendersList.map(lender => (
                <option key={lender.id} value={lender.id}>{lender.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Risk Assessment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Loan History</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Active Loans</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredBorrowers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                  No borrowers found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredBorrowers.map((borrower) => (
                <tr key={borrower.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{borrower.first_name} {borrower.last_name}</div>
                        <div className="text-xs text-neutral-500">{borrower.id_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${getRiskColor(borrower.risk_level)}`}>
                        {borrower.risk_level.toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-500 mt-1">Score: {borrower.credit_score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div>{borrower.total_loans} Loans Total</div>
                    <div className="text-xs">N$ {borrower.outstanding_balance?.toLocaleString() || 0} Outstanding</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(borrower.active_loans_count || 0) === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> None</span>
                    ) : (borrower.active_loans_count || 0) === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700"><FileText className="w-3 h-3" /> {borrower.active_loans_count} Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> {borrower.active_loans_count} Multi-lender!</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(borrower.status)}`}>
                      {borrower.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        setSelectedBorrower(borrower)
                        setShowDetailsModal(true)
                      }}
                      className="text-cashub-600 hover:text-cashub-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBorrower && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">Borrower Dossier</h3>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-neutral-400" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 text-center">
                      <div className="w-20 h-20 bg-cashub-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-cashub-600" />
                      </div>
                      <h4 className="font-bold text-lg text-neutral-900">{selectedBorrower.first_name} {selectedBorrower.last_name}</h4>
                      <p className="text-sm text-neutral-500">{selectedBorrower.id_number}</p>
                      <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBorrower.status)}`}>
                        {selectedBorrower.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-neutral-400 mr-3" />
                        <span className="text-neutral-600">{selectedBorrower.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-neutral-400 mr-3" />
                        <span className="text-neutral-600">{selectedBorrower.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-neutral-400 mr-3" />
                        <span className="text-neutral-600">DOB: {selectedBorrower.date_of_birth || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-neutral-200">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Credit Score</p>
                        <p className="text-2xl font-bold text-neutral-900 mt-1">{selectedBorrower.credit_score}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-neutral-200">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Risk Level</p>
                        <p className={`text-2xl font-bold mt-1 ${selectedBorrower.risk_level === 'high' ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedBorrower.risk_level.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Active Loans Warning */}
                    {(selectedBorrower.active_loans_count || 0) > 0 && (
                      <div className={`p-4 rounded-xl border ${(selectedBorrower.active_loans_count || 0) > 1 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                        <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${(selectedBorrower.active_loans_count || 0) > 1 ? 'text-red-600' : 'text-blue-600'}`} />
                          {(selectedBorrower.active_loans_count || 0) > 1
                            ? `⚠️ Multi-Lender Alert: ${selectedBorrower.active_loans_count} active loans across lenders`
                            : `1 Active Loan`}
                        </h5>
                        <div className="space-y-2">
                          {(selectedBorrower.active_loans || []).map((loan: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs bg-white rounded-lg p-2 border border-neutral-100">
                              <span className="font-medium">{loan.loan_number || `Loan ${i + 1}`}</span>
                              <span className="text-neutral-500">N$ {(loan.outstanding_balance || loan.principal_amount || 0).toLocaleString()} outstanding</span>
                              <span className={`font-bold ${loan.status === 'overdue' ? 'text-red-600' : 'text-blue-600'}`}>{loan.status?.toUpperCase()}</span>
                            </div>
                          ))}
                        </div>
                        {(selectedBorrower.active_loans_count || 0) > 1 && (
                          <p className="mt-2 text-xs font-semibold text-red-700">⚠ This borrower has active debt with multiple lenders. Exercise caution before lending.</p>
                        )}
                      </div>
                    )}

                    <div>
                      <h5 className="font-bold text-neutral-900 mb-3 flex items-center">
                        <Building className="w-4 h-4 mr-2 text-cashub-500" />
                        Connected Lenders
                      </h5>
                      <div className="space-y-3">
                        {selectedBorrower.lenders && selectedBorrower.lenders.length > 0 ? (
                          selectedBorrower.lenders.map((lender) => (
                            <div key={lender.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                              <div>
                                <p className="text-sm font-bold text-neutral-900">{lender.name}</p>
                                <p className="text-xs text-neutral-500">{lender.loans_count} loans • Last: {lender.last_loan_date}</p>
                              </div>
                              <span className={`text-xs font-bold ${lender.status === 'defaulted' ? 'text-red-600' : 'text-green-600'}`}>
                                {lender.status.toUpperCase()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-neutral-500 italic">No historical lender data available in registry.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-neutral-900 mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        Registry Flags & Blacklist
                      </h5>
                      <div className="space-y-3">
                        {selectedBorrower.blacklist_entries && selectedBorrower.blacklist_entries.length > 0 ? (
                          selectedBorrower.blacklist_entries.map((entry) => (
                            <div key={entry.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold text-red-900">{entry.reason.replace('_', ' ').toUpperCase()}</p>
                                  <p className="text-xs text-red-700">Reported by: {entry.lender_name}</p>
                                </div>
                                <span className="text-xs font-bold text-red-600">
                                  {new Date(entry.date_blacklisted).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-red-600 mt-2">Outstanding: N$ {entry.outstanding_amount.toLocaleString()}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            <p className="text-sm text-green-700">No active blacklist entries found.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-neutral-900 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Dispute History
                      </h5>
                      <div className="space-y-3">
                        {selectedBorrower.disputes && selectedBorrower.disputes.length > 0 ? (
                          selectedBorrower.disputes.map((dispute) => (
                            <div key={dispute.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold text-neutral-900">{dispute.dispute_reason}</p>
                                  <p className="text-xs text-neutral-500">Filed: {new Date(dispute.filed_date).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  dispute.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {dispute.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-neutral-500 italic">No dispute history found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-neutral-200">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-cashub-600 text-base font-medium text-white hover:bg-cashub-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cashub-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
