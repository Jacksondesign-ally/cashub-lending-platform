import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Scale,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Ban,
  Gavel
} from 'lucide-react'

interface BlacklistRecord {
  id: string
  borrower_id: string
  lender_id: string
  reason: 'non_payment' | 'fraud' | 'false_information' | 'legal_issues' | 'other'
  description: string
  status: 'active' | 'resolved' | 'under_review' | 'dispute_filed'
  is_shared: boolean
  outstanding_amount: number
  blacklist_date: string
  expiry_date?: string
  evidence_documents?: string[]
  created_at: string
  borrower?: {
    first_name: string
    last_name: string
    id_number: string
    email: string
    phone: string
  }
  lender?: {
    legal_name: string
    registration_number: string
  }
}

interface DisputeRecord {
  id: string
  blacklist_id: string
  borrower_id: string
  dispute_number: string
  reason: string
  description: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  clearance_paid: boolean
  clearance_amount?: number
  clearance_date?: string
  created_at: string
}

export default function BlacklistPage() {
  const [activeTab, setActiveTab] = useState<'blacklist' | 'disputes'>('blacklist')
  const [blacklistRecords, setBlacklistRecords] = useState<BlacklistRecord[]>([])
  const [disputeRecords, setDisputeRecords] = useState<DisputeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BlacklistRecord | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch blacklist records with borrower and lender info
      const { data: blacklistData, error: blacklistError } = await supabase
        .from('borrower_blacklist')
        .select(`
          *,
          borrowers (
            first_name,
            last_name,
            id_number,
            email,
            phone
          ),
          lenders (
            legal_name,
            registration_number
          )
        `)
        .order('created_at', { ascending: false })

      if (blacklistError) throw blacklistError

      // Fetch dispute records
      const { data: disputeData, error: disputeError } = await supabase
        .from('borrower_disputes')
        .select('*')
        .order('created_at', { ascending: false })

      if (disputeError) throw disputeError

      setBlacklistRecords(blacklistData || [])
      setDisputeRecords(disputeData || [])
    } catch (error) {
      console.error('Error fetching blacklist data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'dispute_filed': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'non_payment': return 'bg-red-100 text-red-800'
      case 'fraud': return 'bg-purple-100 text-purple-800'
      case 'false_information': return 'bg-orange-100 text-orange-800'
      case 'legal_issues': return 'bg-indigo-100 text-indigo-800'
      case 'other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'non_payment': return 'Non-Payment'
      case 'fraud': return 'Fraud'
      case 'false_information': return 'False Information'
      case 'legal_issues': return 'Legal Issues'
      case 'other': return 'Other'
      default: return reason
    }
  }

  const filteredBlacklistRecords = blacklistRecords.filter(record => {
    const matchesSearch = 
      record.borrower?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.borrower?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.borrower?.id_number?.includes(searchTerm) ||
      record.lender?.legal_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesReason = reasonFilter === 'all' || record.reason === reasonFilter
    
    return matchesSearch && matchesStatus && matchesReason
  })

  const filteredDisputeRecords = disputeRecords.filter(record => {
    const matchesSearch = 
      record.dispute_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('borrower_blacklist')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error('Error updating blacklist status:', error)
    }
  }

  if (loading) {
    return (
      <Layout title="Blacklist & Dispute Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Blacklist & Dispute Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Blacklist & Dispute Management</h2>
            <p className="text-neutral-500">Manage borrower blacklisting and dispute resolution</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Blacklist Entry
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Blacklisted</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {blacklistRecords.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Disputes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {disputeRecords.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Gavel className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Under Review</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {blacklistRecords.filter(r => r.status === 'under_review').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Resolved</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {blacklistRecords.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('blacklist')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'blacklist'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Blacklist Registry
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {blacklistRecords.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('disputes')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'disputes'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Gavel className="w-4 h-4 mr-2" />
                  Dispute Resolution
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {disputeRecords.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Blacklist Tab Content */}
          {activeTab === 'blacklist' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by borrower name, ID, or lender..."
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
                    <option value="under_review">Under Review</option>
                    <option value="dispute_filed">Dispute Filed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="sm:w-40">
                  <select
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  >
                    <option value="all">All Reasons</option>
                    <option value="non_payment">Non-Payment</option>
                    <option value="fraud">Fraud</option>
                    <option value="false_information">False Information</option>
                    <option value="legal_issues">Legal Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Blacklist Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Lender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredBlacklistRecords.length > 0 ? (
                      filteredBlacklistRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-red-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-neutral-900">
                                  {record.borrower?.first_name} {record.borrower?.last_name}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  ID: {record.borrower?.id_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">
                              {record.lender?.legal_name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {record.lender?.registration_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(record.reason)}`}>
                              {getReasonLabel(record.reason)}
                            </span>
                            {record.description && (
                              <div className="text-xs text-neutral-500 mt-1 max-w-xs truncate">
                                {record.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900">
                              N$ {record.outstanding_amount.toLocaleString()}
                            </div>
                            {record.is_shared && (
                              <div className="text-xs text-blue-600">Shared</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                              {record.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">
                              {new Date(record.blacklist_date).toLocaleDateString()}
                            </div>
                            {record.expiry_date && (
                              <div className="text-xs text-neutral-500">
                                Expires: {new Date(record.expiry_date).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => setSelectedRecord(record)}
                                className="text-cashub-600 hover:text-cashub-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              {record.status === 'active' && (
                                <button 
                                  onClick={() => handleStatusUpdate(record.id, 'under_review')}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Start Review"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                          No blacklist records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Disputes Tab Content */}
          {activeTab === 'disputes' && (
            <div className="p-6">
              {/* Disputes Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Dispute Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Clearance Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Filed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredDisputeRecords.length > 0 ? (
                      filteredDisputeRecords.map((dispute) => (
                        <tr key={dispute.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900">
                              {dispute.dispute_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">
                              {dispute.reason}
                            </div>
                            {dispute.description && (
                              <div className="text-xs text-neutral-500 mt-1 max-w-xs truncate">
                                {dispute.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                              {dispute.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {dispute.clearance_amount ? (
                              <div className="text-sm font-medium text-neutral-900">
                                N$ {dispute.clearance_amount.toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-sm text-neutral-500">Not set</div>
                            )}
                            {dispute.clearance_paid && (
                              <div className="text-xs text-green-600">Paid</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">
                              {new Date(dispute.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-cashub-600 hover:text-cashub-900" title="View Details">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                          No dispute records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
