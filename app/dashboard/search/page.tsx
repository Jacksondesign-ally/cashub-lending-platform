"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Search, Filter, Download, Save, X, ChevronDown, Tag, AlertCircle,
  Users, Shield, RefreshCw, Eye, TrendingUp
} from 'lucide-react'

interface BorrowerResult {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  phone: string
  email: string
  status: string
  riskLevel: string
  creditScore: number
  behaviorClassification: string
  incomeType: string
  monthlyIncome: number
  activeLoansCount: number
  totalOutstanding: number
  onTimePaymentRate: number
  tags: string[]
  hasKYCComplete: boolean
}


export default function AdvancedSearchPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<BorrowerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    riskLevel: [] as string[],
    behaviorClassification: [] as string[],
    incomeType: [] as string[],
    tags: [] as string[],
    minMonthlyIncome: '',
    maxMonthlyIncome: '',
    minCreditScore: '',
    maxCreditScore: '',
    city: [] as string[],
    hasActiveLoans: null as boolean | null,
    hasOverdueLoans: null as boolean | null,
    isBlacklisted: null as boolean | null,
    hasAllKYCDocuments: null as boolean | null,
  })

  const quickFilters = [
    { name: 'High Risk', icon: '⚠️', filter: { riskLevel: ['high', 'critical'] } },
    { name: 'Overdue', icon: '⏰', filter: { status: ['overdue'] } },
    { name: 'Good Payers', icon: '✅', filter: { behaviorClassification: ['good_payer'] } },
    { name: 'Missing KYC', icon: '📄', filter: { hasAllKYCDocuments: false } },
    { name: 'Blacklisted', icon: '🚫', filter: { isBlacklisted: true } },
    { name: 'New Applicants', icon: '🆕', filter: { status: ['new_applicant', 'kyc_pending'] } },
  ]

  const statusOptions = [
    'new_applicant', 'kyc_pending', 'approved', 'active_borrower',
    'completed', 'overdue', 'defaulted', 'blacklisted', 'closed'
  ]
  const riskLevelOptions = ['low', 'medium', 'high', 'critical']
  const behaviorOptions = ['good_payer', 'late_payer', 'chronic_late', 'defaulter', 'recovered_client']
  const incomeTypeOptions = ['salaried', 'self_employed', 'informal_trader', 'farmer', 'sme_owner']

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    const allowedRoles = ['admin', 'lender_admin', 'lender', 'super_admin']
    if (role && allowedRoles.includes(role)) {
      setAllowed(true)
    } else {
      setAllowed(false)
    }
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('borrowers')
        .select('*, loans(principal_amount, status)')
        .order('last_name', { ascending: true })
        .limit(50)

      if (!error && data && data.length > 0) {
        const results: BorrowerResult[] = data.map((b: any) => {
          const loans = b.loans || []
          const activeLoans = loans.filter((l: any) => l.status === 'active')
          const totalOutstanding = activeLoans.reduce((s: number, l: any) => s + (l.principal_amount || 0), 0)

          return {
            id: b.id,
            firstName: b.first_name,
            lastName: b.last_name,
            idNumber: b.id_number ? `${b.id_number.slice(0, 3)}***${b.id_number.slice(-3)}` : '---',
            phone: b.phone || '',
            email: b.email || '',
            status: b.status || 'active_borrower',
            riskLevel: b.risk_level || 'medium',
            creditScore: b.credit_score || 50,
            behaviorClassification: b.behavior_classification || 'good_payer',
            incomeType: b.employment_status || 'salaried',
            monthlyIncome: b.monthly_income || 0,
            activeLoansCount: activeLoans.length,
            totalOutstanding,
            onTimePaymentRate: loans.length > 0 ? Math.round(((loans.length - loans.filter((l: any) => l.status === 'overdue' || l.status === 'defaulted').length) / loans.length) * 100) : 100,
            tags: b.risk_level === 'high' ? ['high-risk'] : b.risk_level === 'critical' ? ['high-risk', 'review'] : [],
            hasKYCComplete: !!(b.id_number && b.phone),
          }
        })

        // Apply client-side filters
        let filtered = results
        if (filters.search) {
          const q = filters.search.toLowerCase()
          filtered = filtered.filter(r =>
            r.firstName.toLowerCase().includes(q) ||
            r.lastName.toLowerCase().includes(q) ||
            r.phone.includes(q) ||
            r.email.toLowerCase().includes(q)
          )
        }
        if (filters.status.length > 0) filtered = filtered.filter(r => filters.status.includes(r.status))
        if (filters.riskLevel.length > 0) filtered = filtered.filter(r => filters.riskLevel.includes(r.riskLevel))
        if (filters.behaviorClassification.length > 0) filtered = filtered.filter(r => filters.behaviorClassification.includes(r.behaviorClassification))
        if (filters.minCreditScore) filtered = filtered.filter(r => r.creditScore >= parseInt(filters.minCreditScore))
        if (filters.maxCreditScore) filtered = filtered.filter(r => r.creditScore <= parseInt(filters.maxCreditScore))
        if (filters.minMonthlyIncome) filtered = filtered.filter(r => r.monthlyIncome >= parseInt(filters.minMonthlyIncome))
        if (filters.maxMonthlyIncome) filtered = filtered.filter(r => r.monthlyIncome <= parseInt(filters.maxMonthlyIncome))
        if (filters.isBlacklisted === true) filtered = filtered.filter(r => r.status === 'blacklisted')

        setSearchResults(filtered)
      } else {
        setSearchResults([])
      }
    } catch {
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const applyQuickFilter = (quickFilter: any) => {
    setFilters({ ...filters, ...quickFilter.filter })
    setTimeout(() => handleSearch(), 100)
  }

  const clearFilters = () => {
    setFilters({
      search: '', status: [], riskLevel: [], behaviorClassification: [],
      incomeType: [], tags: [], minMonthlyIncome: '', maxMonthlyIncome: '',
      minCreditScore: '', maxCreditScore: '', city: [],
      hasActiveLoans: null, hasOverdueLoans: null, isBlacklisted: null, hasAllKYCDocuments: null,
    })
    setSearchResults([])
  }

  const toggleArrayFilter = (field: string, value: string) => {
    const currentValues = (filters as any)[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]
    setFilters({ ...filters, [field]: newValues })
  }

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[level] || 'bg-neutral-100 text-neutral-800'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active_borrower: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      new_applicant: 'bg-purple-100 text-purple-800',
      blacklisted: 'bg-neutral-900 text-white',
      completed: 'bg-emerald-100 text-emerald-800',
      defaulted: 'bg-red-200 text-red-900',
    }
    return colors[status] || 'bg-neutral-100 text-neutral-800'
  }

  if (allowed === null) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-cashub-600" /></div>
  if (allowed === false) return <div className="flex items-center justify-center h-64"><p className="text-red-600 font-medium">Access denied.</p></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Advanced Borrower Search</h2>
          <p className="text-neutral-500 text-sm">Search, filter, and classify borrowers across the network</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button onClick={() => { setSearchResults([]); handleSearch() }}
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg text-sm font-medium hover:bg-cashub-700 transition-all">
            <RefreshCw className="w-4 h-4 mr-2" /> Load All
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((qf) => (
            <button key={qf.name} onClick={() => applyQuickFilter(qf)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700 transition-all flex items-center gap-1.5 border border-neutral-200">
              <span>{qf.icon}</span> {qf.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar + Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input type="text" placeholder="Search by name, ID number, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border border-neutral-200">
            <Filter className="w-4 h-4" /> Filters
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={handleSearch} disabled={loading}
            className="px-6 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Status</label>
                <div className="space-y-1 max-h-40 overflow-y-auto bg-neutral-50 rounded-lg p-2.5 border border-neutral-200">
                  {statusOptions.map(status => (
                    <label key={status} className="flex items-center hover:bg-neutral-100 p-1 rounded cursor-pointer">
                      <input type="checkbox" checked={filters.status.includes(status)}
                        onChange={() => toggleArrayFilter('status', status)}
                        className="mr-2 rounded text-cashub-600 focus:ring-cashub-500" />
                      <span className="text-xs capitalize text-neutral-700">{status.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Risk Level</label>
                <div className="space-y-1 bg-neutral-50 rounded-lg p-2.5 border border-neutral-200">
                  {riskLevelOptions.map(risk => (
                    <label key={risk} className="flex items-center hover:bg-neutral-100 p-1 rounded cursor-pointer">
                      <input type="checkbox" checked={filters.riskLevel.includes(risk)}
                        onChange={() => toggleArrayFilter('riskLevel', risk)}
                        className="mr-2 rounded text-cashub-600 focus:ring-cashub-500" />
                      <span className="text-xs capitalize text-neutral-700">{risk}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Behavior */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Behavior</label>
                <div className="space-y-1 bg-neutral-50 rounded-lg p-2.5 border border-neutral-200">
                  {behaviorOptions.map(behavior => (
                    <label key={behavior} className="flex items-center hover:bg-neutral-100 p-1 rounded cursor-pointer">
                      <input type="checkbox" checked={filters.behaviorClassification.includes(behavior)}
                        onChange={() => toggleArrayFilter('behaviorClassification', behavior)}
                        className="mr-2 rounded text-cashub-600 focus:ring-cashub-500" />
                      <span className="text-xs capitalize text-neutral-700">{behavior.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Income Type */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Income Type</label>
                <div className="space-y-1 bg-neutral-50 rounded-lg p-2.5 border border-neutral-200">
                  {incomeTypeOptions.map(income => (
                    <label key={income} className="flex items-center hover:bg-neutral-100 p-1 rounded cursor-pointer">
                      <input type="checkbox" checked={filters.incomeType.includes(income)}
                        onChange={() => toggleArrayFilter('incomeType', income)}
                        className="mr-2 rounded text-cashub-600 focus:ring-cashub-500" />
                      <span className="text-xs capitalize text-neutral-700">{income.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Income Range */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Monthly Income Range (N$)</label>
                <div className="space-y-2">
                  <input type="number" placeholder="Min" value={filters.minMonthlyIncome}
                    onChange={(e) => setFilters({ ...filters, minMonthlyIncome: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500" />
                  <input type="number" placeholder="Max" value={filters.maxMonthlyIncome}
                    onChange={(e) => setFilters({ ...filters, maxMonthlyIncome: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500" />
                </div>
              </div>

              {/* Credit Score Range */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Credit Score Range (0-100)</label>
                <div className="space-y-2">
                  <input type="number" placeholder="Min" value={filters.minCreditScore}
                    onChange={(e) => setFilters({ ...filters, minCreditScore: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500" />
                  <input type="number" placeholder="Max" value={filters.maxCreditScore}
                    onChange={(e) => setFilters({ ...filters, maxCreditScore: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={clearFilters}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg text-sm font-medium transition-all border border-neutral-200">
                Clear All
              </button>
              <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border border-neutral-200">
                <Save className="w-3.5 h-3.5" /> Save Filter Preset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-neutral-900 text-sm">
            Search Results <span className="text-neutral-500">({searchResults.length})</span>
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-all border border-neutral-200 font-medium">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-all border border-neutral-200 font-medium">
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-10 h-10 animate-spin text-cashub-400 mx-auto" />
            <p className="mt-3 text-sm text-neutral-500">Searching borrowers...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No results found. Use the search bar or quick filters above to find borrowers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Credit Score</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Income</th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Active Loans</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Outstanding</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Tags</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {searchResults.map((borrower) => (
                  <tr key={borrower.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{borrower.firstName} {borrower.lastName}</p>
                        <p className="text-xs text-neutral-500">{borrower.idNumber}</p>
                        <p className="text-xs text-neutral-400">{borrower.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${getStatusColor(borrower.status)}`}>
                        {borrower.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${getRiskColor(borrower.riskLevel)}`}>
                        {borrower.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${borrower.creditScore >= 70 ? 'text-green-600' : borrower.creditScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {borrower.creditScore}
                        </span>
                        <div className="w-14 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${borrower.creditScore >= 70 ? 'bg-green-500' : borrower.creditScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${borrower.creditScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-neutral-900">N$ {borrower.monthlyIncome.toLocaleString()}</p>
                      <p className="text-[10px] text-neutral-500 capitalize">{borrower.incomeType.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-neutral-900">{borrower.activeLoansCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-neutral-900">N$ {borrower.totalOutstanding.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {borrower.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-cashub-50 text-cashub-700 rounded-full border border-cashub-200 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-cashub-600 hover:text-cashub-700 text-xs font-medium flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
