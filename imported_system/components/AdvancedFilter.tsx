import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users, 
  Shield, 
  FileText, 
  MapPin, 
  Briefcase,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Building,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'

interface FilterOptions {
  searchQuery: string
  name: string
  idNumber: string
  phone: string
  email: string
  riskLevel: string[]
  loanStatus: string[]
  borrowedAmountMin: number
  borrowedAmountMax: number
  outstandingBalanceMin: number
  outstandingBalanceMax: number
  paymentHistory: string
  month: string
  year: string
  location: string
  loanOfficer: string
  incomeType: string
  borrowerType: string
  hasDocuments: boolean
  missingDocuments: boolean
  dateFrom: string
  dateTo: string
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  onReset: () => void
  onExport: () => void
}

export default function AdvancedFilter({ onFilterChange, onReset, onExport }: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    name: '',
    idNumber: '',
    phone: '',
    email: '',
    riskLevel: [],
    loanStatus: [],
    borrowedAmountMin: 0,
    borrowedAmountMax: 50000,
    outstandingBalanceMin: 0,
    outstandingBalanceMax: 50000,
    paymentHistory: 'all',
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    location: '',
    loanOfficer: '',
    incomeType: 'all',
    borrowerType: 'all',
    hasDocuments: false,
    missingDocuments: false,
    dateFrom: '',
    dateTo: ''
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleMultiSelect = (key: keyof FilterOptions, value: string) => {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    handleFilterChange(key, newValues)
  }

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      searchQuery: '',
      name: '',
      idNumber: '',
      phone: '',
      email: '',
      riskLevel: [],
      loanStatus: [],
      borrowedAmountMin: 0,
      borrowedAmountMax: 50000,
      outstandingBalanceMin: 0,
      outstandingBalanceMax: 50000,
      paymentHistory: 'all',
      month: new Date().getMonth().toString(),
      year: new Date().getFullYear().toString(),
      location: '',
      loanOfficer: '',
      incomeType: 'all',
      borrowerType: 'all',
      hasDocuments: false,
      missingDocuments: false,
      dateFrom: '',
      dateTo: ''
    }
    setFilters(defaultFilters)
    onReset()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.name) count++
    if (filters.idNumber) count++
    if (filters.phone) count++
    if (filters.email) count++
    if (filters.riskLevel.length > 0) count++
    if (filters.loanStatus.length > 0) count++
    if (filters.borrowedAmountMin > 0 || filters.borrowedAmountMax < 50000) count++
    if (filters.outstandingBalanceMin > 0 || filters.outstandingBalanceMax < 50000) count++
    if (filters.paymentHistory !== 'all') count++
    if (filters.location) count++
    if (filters.loanOfficer) count++
    if (filters.incomeType !== 'all') count++
    if (filters.borrowerType !== 'all') count++
    if (filters.hasDocuments || filters.missingDocuments) count++
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      {/* Quick Search Bar */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Quick search: Name, ID, Phone, Email..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
            />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-cashub-600 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-cashub-500 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Search by name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={filters.idNumber}
                  onChange={(e) => handleFilterChange('idNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="ID number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={filters.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Loan Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Risk Level */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Risk Level</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.riskLevel.includes(level)}
                        onChange={() => handleMultiSelect('riskLevel', level)}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Loan Status */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Loan Status</label>
                <div className="space-y-2">
                  {['pending', 'approved', 'active', 'completed', 'defaulted', 'rejected'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.loanStatus.includes(status)}
                        onChange={() => handleMultiSelect('loanStatus', status)}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment History */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Payment History</label>
                <select
                  value={filters.paymentHistory}
                  onChange={(e) => handleFilterChange('paymentHistory', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="all">All</option>
                  <option value="ontime">Always On Time</option>
                  <option value="late">Sometimes Late</option>
                  <option value="default">In Default</option>
                </select>
              </div>
            </div>

            {/* Amount Ranges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Borrowed Amount Range</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    value={filters.borrowedAmountMin}
                    onChange={(e) => handleFilterChange('borrowedAmountMin', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    placeholder="Min"
                  />
                  <span className="text-neutral-500">to</span>
                  <input
                    type="number"
                    value={filters.borrowedAmountMax}
                    onChange={(e) => handleFilterChange('borrowedAmountMax', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Outstanding Balance Range</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    value={filters.outstandingBalanceMin}
                    onChange={(e) => handleFilterChange('outstandingBalanceMin', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    placeholder="Min"
                  />
                  <span className="text-neutral-500">to</span>
                  <input
                    type="number"
                    value={filters.outstandingBalanceMax}
                    onChange={(e) => handleFilterChange('outstandingBalanceMax', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Time & Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="">All Months</option>
                  <option value="0">January</option>
                  <option value="1">February</option>
                  <option value="2">March</option>
                  <option value="3">April</option>
                  <option value="4">May</option>
                  <option value="5">June</option>
                  <option value="6">July</option>
                  <option value="7">August</option>
                  <option value="8">September</option>
                  <option value="9">October</option>
                  <option value="10">November</option>
                  <option value="11">December</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="City, Region"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Loan Officer</label>
                <input
                  type="text"
                  value={filters.loanOfficer}
                  onChange={(e) => handleFilterChange('loanOfficer', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Officer name"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Income Type</label>
                <select
                  value={filters.incomeType}
                  onChange={(e) => handleFilterChange('incomeType', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="all">All Types</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="informal">Informal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Borrower Type</label>
                <select
                  value={filters.borrowerType}
                  onChange={(e) => handleFilterChange('borrowerType', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="all">All Types</option>
                  <option value="good">Good Borrower</option>
                  <option value="bad">Bad Borrower</option>
                  <option value="new">New Borrower</option>
                  <option value="returning">Returning Borrower</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Documents</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasDocuments}
                      onChange={(e) => handleFilterChange('hasDocuments', e.target.checked)}
                      className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Has Documents</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.missingDocuments}
                      onChange={(e) => handleFilterChange('missingDocuments', e.target.checked)}
                      className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Missing Documents</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-neutral-600" />
                <span className="text-sm text-neutral-600">
                  {getActiveFiltersCount()} active filters
                </span>
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-cashub-600 hover:text-cashub-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
