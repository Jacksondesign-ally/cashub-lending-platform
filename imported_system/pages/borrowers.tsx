import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react'

interface Borrower {
  id: string
  id_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  monthly_income?: number
  credit_score: number
  risk_level: 'low' | 'medium' | 'high'
  status: 'active' | 'inactive' | 'blacklisted' | 'cleared'
  join_date: string
  employer_name?: string
  job_title?: string
  city?: string
  region?: string
  created_at: string
}

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null)

  useEffect(() => {
    fetchBorrowers()
  }, [])

  const fetchBorrowers = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('borrowers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBorrowers(data || [])
    } catch (error) {
      console.error('Error fetching borrowers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'blacklisted': return 'bg-red-100 text-red-800 border-red-200'
      case 'cleared': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getCreditScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600'
    if (score >= 600) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = 
      borrower.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.id_number.includes(searchTerm) ||
      borrower.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.phone?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || borrower.status === statusFilter
    const matchesRisk = riskFilter === 'all' || borrower.risk_level === riskFilter
    
    return matchesSearch && matchesStatus && matchesRisk
  })

  const handleViewDetails = (borrower: Borrower) => {
    setSelectedBorrower(borrower)
  }

  const handleStatusUpdate = async (borrowerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('borrowers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', borrowerId)

      if (error) throw error
      await fetchBorrowers()
    } catch (error) {
      console.error('Error updating borrower status:', error)
    }
  }

  if (loading) {
    return (
      <Layout title="Borrower Registry">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Borrower Registry">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Borrower Registry</h2>
            <p className="text-neutral-500">Manage borrower profiles and risk assessments</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Borrower
          </button>
        </div>

        {/* Stats Cards */}
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
                <p className="text-sm font-medium text-neutral-500">Active</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {borrowers.filter(b => b.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">High Risk</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {borrowers.filter(b => b.risk_level === 'high').length}
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
                <p className="text-sm font-medium text-neutral-500">Blacklisted</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {borrowers.filter(b => b.status === 'blacklisted').length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, ID number, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
                <option value="cleared">Cleared</option>
              </select>
            </div>
            <div className="sm:w-40">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Borrowers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Employment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Credit Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Risk Level
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
                {filteredBorrowers.length > 0 ? (
                  filteredBorrowers.map((borrower) => (
                    <tr key={borrower.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {borrower.first_name[0]}{borrower.last_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {borrower.first_name} {borrower.last_name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              ID: {borrower.id_number}
                            </div>
                            <div className="text-xs text-neutral-400">
                              Joined: {borrower.join_date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {borrower.email && (
                            <div className="flex items-center text-neutral-600 mb-1">
                              <Mail className="w-3 h-3 mr-1" />
                              {borrower.email}
                            </div>
                          )}
                          {borrower.phone && (
                            <div className="flex items-center text-neutral-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {borrower.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {borrower.employer_name && (
                            <div className="flex items-center text-neutral-600 mb-1">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {borrower.employer_name}
                            </div>
                          )}
                          {borrower.job_title && (
                            <div className="text-xs text-neutral-500">
                              {borrower.job_title}
                            </div>
                          )}
                          {borrower.monthly_income && (
                            <div className="text-xs text-neutral-500 mt-1">
                              N$ {borrower.monthly_income.toLocaleString()}/month
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className={`font-medium ${getCreditScoreColor(borrower.credit_score)}`}>
                            {borrower.credit_score}
                          </span>
                          <div className="text-xs text-neutral-500">
                            {borrower.credit_score >= 700 ? 'Excellent' :
                             borrower.credit_score >= 600 ? 'Good' :
                             borrower.credit_score >= 500 ? 'Fair' : 'Poor'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(borrower.risk_level)}`}>
                          {borrower.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(borrower.status)}`}>
                          {borrower.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewDetails(borrower)}
                            className="text-cashub-600 hover:text-cashub-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          {borrower.status === 'active' && (
                            <button 
                              onClick={() => handleStatusUpdate(borrower.id, 'blacklisted')}
                              className="text-red-600 hover:text-red-900"
                              title="Blacklist"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {borrower.status === 'blacklisted' && (
                            <button 
                              onClick={() => handleStatusUpdate(borrower.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                              title="Clear Blacklist"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                      No borrowers found. Start by adding your first borrower.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
