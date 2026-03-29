"use client"

import { useState, useEffect } from 'react'
import { 
  Search, Plus, Shield, Gavel, Clock, CheckCircle, 
  Ban, Eye, Edit, User, Filter, Download, AlertTriangle,
  Upload, MessageSquare, XCircle, Info, Phone, Mail, RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  settlement_amount?: number | null
  settlement_date?: string | null
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
  dispute_number: string
  reason: string
  description: string
  status: 'pending' | 'under_review' | 'resolved' | 'rejected'
  clearance_amount?: number
  clearance_paid: boolean
  created_at: string
}

interface NotificationItem {
  id: string
  type: 'blacklist' | 'dispute'
  title: string
  message: string
  time: string
}

export default function BlacklistPage() {
  const [activeTab, setActiveTab] = useState<'blacklist' | 'disputes'>('blacklist')
  const [blacklistRecords, setBlacklistRecords] = useState<BlacklistRecord[]>([])
  const [disputeRecords, setDisputeRecords] = useState<DisputeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BlacklistRecord | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)
  const [newEntry, setNewEntry] = useState({ borrowerName: '', borrowerIdNumber: '', borrowerEmail: '', borrowerPhone: '', reason: 'non_payment' as const, description: '', outstandingAmount: '', isShared: true })
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(typeof window !== 'undefined' ? localStorage.getItem('userRole') : null)
    fetchData()
  }, [])

  const isSuperAdmin = role === 'super_admin' || role === 'admin'

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: blacklistData, error: blacklistError } = await supabase
        .from('borrower_blacklist')
        .select(`
          *,
          borrowers (first_name, last_name, id_number, email, phone),
          lenders (legal_name, registration_number)
        `)
        .order('created_at', { ascending: false })

      if (blacklistError) throw blacklistError

      const { data: disputeData, error: disputeError } = await supabase
        .from('borrower_disputes')
        .select('*')
        .order('created_at', { ascending: false })

      if (disputeError) throw disputeError

      const blacklistSafe = (blacklistData || []) as BlacklistRecord[]
      const disputesSafe = (disputeData || []) as DisputeRecord[]

      setBlacklistRecords(blacklistSafe)
      setDisputeRecords(disputesSafe)

      const newNotifications: NotificationItem[] = []

      blacklistSafe.forEach((record) => {
        if (
          record.status === 'active' ||
          record.status === 'under_review' ||
          record.status === 'dispute_filed' ||
          record.status === 'resolved'
        ) {
          const title =
            record.status === 'active'
              ? 'New blacklist record'
              : record.status === 'dispute_filed'
              ? 'Dispute filed on blacklist'
              : record.status === 'resolved'
              ? 'Blacklist cleared'
              : 'Blacklist under review'

          const lenderName = record.lender?.legal_name || 'Unknown lender'
          const borrowerName = record.borrower
            ? `${record.borrower.first_name} ${record.borrower.last_name}`
            : 'Unknown borrower'

          newNotifications.push({
            id: `blacklist-${record.id}`,
            type: 'blacklist',
            title,
            message: `${borrowerName} • ${lenderName} • ${getReasonLabel(record.reason)}`,
            time: record.blacklist_date || record.created_at
          })
        }
      })

      disputesSafe.forEach((dispute) => {
        if (dispute.status === 'pending' || dispute.status === 'under_review') {
          newNotifications.push({
            id: `dispute-${dispute.id}`,
            type: 'dispute',
            title: dispute.status === 'pending' ? 'New dispute filed' : 'Dispute under review',
            message: dispute.reason,
            time: dispute.created_at
          })
        }
      })

      newNotifications.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      )

      setNotifications(newNotifications)
    } catch (error) {
      console.error('Error fetching blacklist data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSettlement = async (record: BlacklistRecord) => {
    try {
      const { error } = await supabase
        .from('borrower_blacklist')
        .update({
          status: 'resolved',
          outstanding_amount: 0,
          settlement_amount: record.outstanding_amount,
          settlement_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', record.id)

      if (error) {
        console.error('Error recording settlement:', error)
        return
      }
      await fetchData()
    } catch (error) {
      console.error('Error recording settlement:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-50 text-red-700 border-red-100'
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100'
      case 'under_review': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'dispute_filed': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-100'
    }
  }

  const getReasonLabel = (reason: string) => {
    return reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const filteredBlacklistRecords = blacklistRecords.filter(record => {
    const matchesSearch = (
      record.borrower?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.borrower?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.borrower?.id_number.includes(searchTerm) ||
      record.lender?.legal_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesReason = reasonFilter === 'all' || record.reason === reasonFilter
    return matchesSearch && matchesStatus && matchesReason
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Blacklist & Dispute Management</h1>
          <p className="text-neutral-500">Manage borrower blacklisting and dispute resolution</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
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

      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-cashub-600 mr-2" />
              <h2 className="text-sm font-semibold text-neutral-900">Recent Alerts</h2>
            </div>
            <span className="text-xs text-neutral-500">
              {notifications.length} item{notifications.length !== 1 && 's'}
            </span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {notifications.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-start p-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="mt-0.5 mr-2">
                  {item.type === 'blacklist' ? (
                    <Shield className="w-4 h-4 text-red-500" />
                  ) : (
                    <Gavel className="w-4 h-4 text-cashub-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.message}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {new Date(item.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('blacklist')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
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
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
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
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 outline-none"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="under_review">Under Review</option>
                  <option value="dispute_filed">Dispute Filed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="sm:w-48">
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 outline-none"
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
                <thead className="bg-neutral-50 border-y border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Borrower</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Lender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredBlacklistRecords.length > 0 ? (
                    filteredBlacklistRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-neutral-50 transition-colors">
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
                          <div className="text-sm text-neutral-900">{record.lender?.legal_name}</div>
                          <div className="text-sm text-neutral-500">{record.lender?.registration_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-neutral-900">{getReasonLabel(record.reason)}</span>
                          {record.description && (
                            <div className="text-xs text-neutral-500 mt-1 max-w-xs truncate">{record.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">
                            N$ {record.outstanding_amount.toLocaleString()}
                          </div>
                          {record.is_shared && (
                            <div className="text-xs text-blue-600 flex items-center mt-1">
                              <Shield className="w-3 h-3 mr-1" />
                              Shared
                            </div>
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
                            <button className="text-neutral-400 hover:text-cashub-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-neutral-400 hover:text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            {record.status === 'active' && (
                              <button 
                                onClick={() => handleStatusUpdate(record.id, 'under_review')}
                                className="text-neutral-400 hover:text-yellow-600 transition-colors"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                            {record.status === 'active' && (
                              <button
                                onClick={() => handleSettlement(record)}
                                className="text-neutral-400 hover:text-green-600 transition-colors"
                                title="Mark as Settled"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {(record.status === 'active' || record.status === 'under_review') && (
                              <button
                                onClick={() => { setSelectedRecord(record); setShowDisputeModal(true); setDisputeReason('') }}
                                className="text-neutral-400 hover:text-orange-600 transition-colors"
                                title="File Dispute"
                              >
                                <Gavel className="w-4 h-4" />
                              </button>
                            )}
                            {isSuperAdmin && record.status !== 'resolved' && (
                              <button
                                onClick={async () => {
                                  if (!confirm('Force remove this blacklist entry? This action cannot be undone.')) return
                                  await supabase.from('borrower_blacklist').delete().eq('id', record.id)
                                  await fetchData()
                                }}
                                className="text-neutral-400 hover:text-red-600 transition-colors"
                                title="Force Remove (Admin)"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                        <div className="flex flex-col items-center justify-center">
                          <Ban className="w-12 h-12 text-neutral-200 mb-4" />
                          <p>No blacklist records found matching your filters.</p>
                        </div>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-y border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dispute #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Clearance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Filed Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {disputeRecords.length > 0 ? (
                    disputeRecords.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-900">
                          {dispute.dispute_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{dispute.reason}</div>
                          {dispute.description && (
                            <div className="text-xs text-neutral-500 mt-1 max-w-xs truncate">{dispute.description}</div>
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
                            <div className="text-sm text-neutral-500">Pending assessment</div>
                          )}
                          {dispute.clearance_paid && (
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-neutral-400 hover:text-cashub-600 transition-colors" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            {isSuperAdmin && (dispute.status === 'pending' || dispute.status === 'under_review') && (
                              <>
                                <button
                                  onClick={async () => {
                                    await supabase.from('borrower_disputes').update({ status: 'resolved' }).eq('id', dispute.id)
                                    if (dispute.blacklist_id) {
                                      await supabase.from('borrower_blacklist').update({ status: 'resolved', outstanding_amount: 0, updated_at: new Date().toISOString() }).eq('id', dispute.blacklist_id)
                                    }
                                    await fetchData()
                                  }}
                                  className="text-neutral-400 hover:text-green-600 transition-colors" title="Resolve Dispute (clear blacklist)">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    await supabase.from('borrower_disputes').update({ status: 'rejected' }).eq('id', dispute.id)
                                    await fetchData()
                                  }}
                                  className="text-neutral-400 hover:text-red-600 transition-colors" title="Reject Dispute">
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    await supabase.from('borrower_disputes').update({ status: 'under_review' }).eq('id', dispute.id)
                                    await fetchData()
                                  }}
                                  className="text-neutral-400 hover:text-yellow-600 transition-colors" title="Mark Under Review">
                                  <Clock className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {isSuperAdmin && dispute.status === 'resolved' && (
                              <span className="text-[10px] text-green-600 font-medium">Resolved</span>
                            )}
                            {isSuperAdmin && dispute.status === 'rejected' && (
                              <span className="text-[10px] text-red-600 font-medium">Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                        <div className="flex flex-col items-center justify-center">
                          <Gavel className="w-12 h-12 text-neutral-200 mb-4" />
                          <p>No disputes found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══ FILE DISPUTE MODAL ═══ */}
      {showDisputeModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">File Dispute</h2>
                <p className="text-xs text-neutral-500">Challenge blacklist record {selectedRecord.id}</p>
              </div>
              <button onClick={() => { setShowDisputeModal(false); setSelectedRecord(null) }} className="p-1.5 hover:bg-neutral-100 rounded-lg">
                <XCircle className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Record Summary */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wide">Record Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-neutral-500 text-xs">Borrower</p><p className="font-medium">{selectedRecord.borrower?.first_name} {selectedRecord.borrower?.last_name}</p></div>
                  <div><p className="text-neutral-500 text-xs">ID Number</p><p className="font-medium">{selectedRecord.borrower?.id_number}</p></div>
                  <div><p className="text-neutral-500 text-xs">Reason</p><p className="font-medium">{getReasonLabel(selectedRecord.reason)}</p></div>
                  <div><p className="text-neutral-500 text-xs">Outstanding</p><p className="font-medium text-red-600">N$ {selectedRecord.outstanding_amount.toLocaleString()}</p></div>
                </div>
              </div>

              {/* Dispute Reason */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dispute Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why you believe this blacklist entry is incorrect or unfair..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Supporting Evidence</label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-cashub-400 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600 font-medium">Click to upload documents</p>
                  <p className="text-[10px] text-neutral-400">Payment receipts, communications, agreements (PDF, JPG, PNG)</p>
                </div>
              </div>

              {/* Process Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold mb-1">Dispute Process:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Reviewed within 5-7 business days</li>
                      <li>Both parties notified of outcome</li>
                      <li>Entry marked as &quot;DISPUTED&quot; during review</li>
                      <li>You may be contacted for more information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button onClick={() => { setShowDisputeModal(false); setSelectedRecord(null) }}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!disputeReason.trim()) return
                  setDisputeSubmitting(true)
                  try {
                    await supabase.from('borrower_disputes').insert({
                      blacklist_id: selectedRecord.id,
                      dispute_number: `DS-${Date.now().toString().slice(-6)}`,
                      reason: disputeReason,
                      description: disputeReason,
                      status: 'pending',
                      clearance_paid: false,
                    })
                    await handleStatusUpdate(selectedRecord.id, 'dispute_filed')
                  } catch { /* local fallback */ }
                  setShowDisputeModal(false)
                  setSelectedRecord(null)
                  setDisputeReason('')
                  setDisputeSubmitting(false)
                  await fetchData()
                }}
                disabled={!disputeReason.trim() || disputeSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {disputeSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                File Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD BLACKLIST ENTRY MODAL ═══ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Add Blacklist Entry</h2>
                <p className="text-xs text-neutral-500">Register a new borrower on the blacklist</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg">
                <XCircle className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Borrower Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={newEntry.borrowerName} onChange={e => setNewEntry({...newEntry, borrowerName: e.target.value})}
                    placeholder="John Doe" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">ID Number <span className="text-red-500">*</span></label>
                  <input type="text" value={newEntry.borrowerIdNumber} onChange={e => setNewEntry({...newEntry, borrowerIdNumber: e.target.value})}
                    placeholder="85010112345" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Phone</label>
                  <input type="tel" value={newEntry.borrowerPhone} onChange={e => setNewEntry({...newEntry, borrowerPhone: e.target.value})}
                    placeholder="+264 81 123 4567" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Email</label>
                  <input type="email" value={newEntry.borrowerEmail} onChange={e => setNewEntry({...newEntry, borrowerEmail: e.target.value})}
                    placeholder="borrower@email.com" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Outstanding Amount (N$)</label>
                  <input type="number" value={newEntry.outstandingAmount} onChange={e => setNewEntry({...newEntry, outstandingAmount: e.target.value})}
                    placeholder="45000" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Reason <span className="text-red-500">*</span></label>
                <select value={newEntry.reason} onChange={e => setNewEntry({...newEntry, reason: e.target.value as any})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
                  <option value="non_payment">Non-Payment</option>
                  <option value="fraud">Fraud</option>
                  <option value="false_information">False Information</option>
                  <option value="legal_issues">Legal Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea value={newEntry.description} onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                  rows={3} placeholder="Describe the reason for blacklisting..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newEntry.isShared} onChange={e => setNewEntry({...newEntry, isShared: e.target.checked})}
                  className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500" />
                <span className="text-sm text-neutral-700">Share with all lenders on the platform</span>
              </label>
            </div>

            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newEntry.borrowerName || !newEntry.borrowerIdNumber || !newEntry.description) return
                  setAddSubmitting(true)
                  try {
                    await supabase.from('borrower_blacklist').insert({
                      reason: newEntry.reason,
                      description: newEntry.description,
                      status: 'active',
                      is_shared: newEntry.isShared,
                      outstanding_amount: parseFloat(newEntry.outstandingAmount) || 0,
                      blacklist_date: new Date().toISOString().split('T')[0],
                    })
                  } catch { /* fallback */ }
                  setShowAddModal(false)
                  setNewEntry({ borrowerName: '', borrowerIdNumber: '', borrowerEmail: '', borrowerPhone: '', reason: 'non_payment', description: '', outstandingAmount: '', isShared: true })
                  setAddSubmitting(false)
                  await fetchData()
                }}
                disabled={!newEntry.borrowerName || !newEntry.description || addSubmitting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {addSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Add to Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
