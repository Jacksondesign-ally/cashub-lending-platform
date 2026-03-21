import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Save, X, ChevronDown, Tag, AlertCircle } from 'lucide-react';

const AdvancedSearchUI = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    riskLevel: [],
    behaviorClassification: [],
    incomeType: [],
    tags: [],
    minMonthlyIncome: '',
    maxMonthlyIncome: '',
    minCreditScore: '',
    maxCreditScore: '',
    city: [],
    hasActiveLoans: null,
    hasOverdueLoans: null,
    isBlacklisted: null,
    hasAllKYCDocuments: null,
    page: 1,
    limit: 20
  });

  const [quickFilters] = useState([
    { name: 'High Risk', icon: '⚠️', filter: { riskLevel: ['high', 'critical'] } },
    { name: 'Overdue', icon: '⏰', filter: { status: ['overdue'] } },
    { name: 'Good Payers', icon: '✅', filter: { behaviorClassification: ['good_payer'] } },
    { name: 'Missing KYC', icon: '📄', filter: { hasAllKYCDocuments: false } },
    { name: 'Blacklisted', icon: '🚫', filter: { isBlacklisted: true } },
    { name: 'New Applicants', icon: '🆕', filter: { status: ['new_applicant', 'kyc_pending'] } }
  ]);

  const statusOptions = [
    'new_applicant', 'kyc_pending', 'approved', 'active_borrower',
    'completed', 'overdue', 'defaulted', 'blacklisted', 'closed'
  ];

  const riskLevelOptions = ['low', 'medium', 'high', 'critical'];
  
  const behaviorOptions = [
    'good_payer', 'late_payer', 'chronic_late', 'defaulter', 'recovered_client'
  ];

  const incomeTypeOptions = [
    'salaried', 'self_employed', 'informal_trader', 'farmer', 'sme_owner'
  ];

  const cityOptions = ['Windhoek', 'Swakopmund', 'Walvis Bay', 'Oshakati', 'Rundu'];

  const handleSearch = async () => {
    setLoading(true);
    try {
      // API call would go here
      // const response = await fetch('/api/v1/search/borrowers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const data = await response.json();
      
      // Mock data for demo
      setTimeout(() => {
        setSearchResults([
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            idNumber: '850***345',
            phone: '+264811234567',
            status: 'active_borrower',
            riskLevel: 'medium',
            creditScore: 72,
            behaviorClassification: 'good_payer',
            incomeType: 'salaried',
            monthlyIncome: 15000,
            activeLoansCount: 2,
            totalOutstanding: 12500,
            onTimePaymentRate: 95.5,
            tags: ['RepeatClient', 'SalaryBacked'],
            hasKYCComplete: true
          },
          {
            id: '2',
            firstName: 'Maria',
            lastName: 'Santos',
            idNumber: '920***678',
            phone: '+264812345678',
            status: 'overdue',
            riskLevel: 'high',
            creditScore: 45,
            behaviorClassification: 'late_payer',
            incomeType: 'self_employed',
            monthlyIncome: 8500,
            activeLoansCount: 1,
            totalOutstanding: 5200,
            onTimePaymentRate: 68.2,
            tags: ['HighRisk', 'RequiresFollowup'],
            hasKYCComplete: true
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  };

  const applyQuickFilter = (quickFilter) => {
    setFilters({ ...filters, ...quickFilter.filter, page: 1 });
    setTimeout(() => handleSearch(), 100);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      riskLevel: [],
      behaviorClassification: [],
      incomeType: [],
      tags: [],
      minMonthlyIncome: '',
      maxMonthlyIncome: '',
      minCreditScore: '',
      maxCreditScore: '',
      city: [],
      hasActiveLoans: null,
      hasOverdueLoans: null,
      isBlacklisted: null,
      hasAllKYCDocuments: null,
      page: 1,
      limit: 20
    });
  };

  const toggleArrayFilter = (field, value) => {
    const currentValues = filters[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilters({ ...filters, [field]: newValues });
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active_borrower: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      new_applicant: 'bg-purple-100 text-purple-800',
      blacklisted: 'bg-black text-white'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Borrower Search & Classification</h1>
          <p className="text-purple-200">Advanced filtering and client management</p>
        </div>

        {/* Quick Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-4 mb-6">
          <h3 className="text-sm font-semibold text-purple-200 mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((qf) => (
              <button
                key={qf.name}
                onClick={() => applyQuickFilter(qf)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium text-white transition-all hover:scale-105 flex items-center gap-2 border border-white/20"
              >
                <span>{qf.icon}</span>
                {qf.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID number, or phone..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-200"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105 text-white border border-white/20"
            >
              <Filter size={20} />
              Filters
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Status</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto bg-white/10 rounded-lg p-3 border border-white/20">
                    {statusOptions.map(status => (
                      <label key={status} className="flex items-center hover:bg-white/10 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleArrayFilter('status', status)}
                          className="mr-2 rounded text-purple-600"
                        />
                        <span className="text-sm capitalize text-white">{status.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Risk Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Risk Level</label>
                  <div className="space-y-1 bg-white/10 rounded-lg p-3 border border-white/20">
                    {riskLevelOptions.map(risk => (
                      <label key={risk} className="flex items-center hover:bg-white/10 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.riskLevel.includes(risk)}
                          onChange={() => toggleArrayFilter('riskLevel', risk)}
                          className="mr-2 rounded text-purple-600"
                        />
                        <span className="text-sm capitalize text-white">{risk}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Behavior Classification */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Behavior</label>
                  <div className="space-y-1 bg-white/10 rounded-lg p-3 border border-white/20">
                    {behaviorOptions.map(behavior => (
                      <label key={behavior} className="flex items-center hover:bg-white/10 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.behaviorClassification.includes(behavior)}
                          onChange={() => toggleArrayFilter('behaviorClassification', behavior)}
                          className="mr-2 rounded text-purple-600"
                        />
                        <span className="text-sm capitalize text-white">{behavior.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Income Type */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Income Type</label>
                  <div className="space-y-1 bg-white/10 rounded-lg p-3 border border-white/20">
                    {incomeTypeOptions.map(income => (
                      <label key={income} className="flex items-center hover:bg-white/10 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.incomeType.includes(income)}
                          onChange={() => toggleArrayFilter('incomeType', income)}
                          className="mr-2 rounded text-purple-600"
                        />
                        <span className="text-sm capitalize text-white">{income.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Income Range */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Monthly Income Range</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min (NAD)"
                      value={filters.minMonthlyIncome}
                      onChange={(e) => setFilters({ ...filters, minMonthlyIncome: e.target.value })}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-sm text-white placeholder-purple-200"
                    />
                    <input
                      type="number"
                      placeholder="Max (NAD)"
                      value={filters.maxMonthlyIncome}
                      onChange={(e) => setFilters({ ...filters, maxMonthlyIncome: e.target.value })}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-sm text-white placeholder-purple-200"
                    />
                  </div>
                </div>

                {/* Credit Score Range */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Credit Score Range</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min (0-100)"
                      value={filters.minCreditScore}
                      onChange={(e) => setFilters({ ...filters, minCreditScore: e.target.value })}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-sm text-white placeholder-purple-200"
                    />
                    <input
                      type="number"
                      placeholder="Max (0-100)"
                      value={filters.maxCreditScore}
                      onChange={(e) => setFilters({ ...filters, maxCreditScore: e.target.value })}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-sm text-white placeholder-purple-200"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition-all border border-white/20"
                >
                  Clear All
                </button>
                <button
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium flex items-center gap-2 transition-all text-white border border-white/20"
                >
                  <Save size={16} />
                  Save Filter Preset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
          <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <h3 className="font-semibold text-white">
              Search Results <span className="text-purple-300">({searchResults.length})</span>
            </h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all hover:scale-105 text-white border border-white/20">
                <Download size={16} />
                Export CSV
              </button>
              <button className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all hover:scale-105 text-white border border-white/20">
                <Download size={16} />
                Export Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-400/30 border-t-purple-400"></div>
              <p className="mt-4 text-purple-200">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-12 text-center text-purple-200">
              <Search size={48} className="mx-auto mb-4 text-purple-300/50" />
              <p>No results found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Borrower</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Credit Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Income</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Active Loans</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Outstanding</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {searchResults.map((borrower) => (
                    <tr key={borrower.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-white">{borrower.firstName} {borrower.lastName}</div>
                          <div className="text-sm text-purple-200">{borrower.idNumber}</div>
                          <div className="text-sm text-purple-200">{borrower.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(borrower.status)}`}>
                          {borrower.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(borrower.riskLevel)}`}>
                          {borrower.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{borrower.creditScore}</span>
                          <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${borrower.creditScore >= 70 ? 'bg-green-400' : borrower.creditScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${borrower.creditScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">NAD {borrower.monthlyIncome.toLocaleString()}</div>
                          <div className="text-purple-200 capitalize">{borrower.incomeType.replace('_', ' ')}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-white">{borrower.activeLoansCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-white">NAD {borrower.totalOutstanding.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {borrower.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-purple-500/30 text-purple-100 rounded-full border border-purple-400/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-purple-300 hover:text-purple-100 text-sm font-medium transition-colors">
                          View Details
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
    </div>
  );
};

export default AdvancedSearchUI;