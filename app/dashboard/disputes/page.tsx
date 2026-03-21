"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Gavel, Search, RefreshCw, CheckCircle, XCircle, Clock, Eye, AlertTriangle, Shield, User, Building, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

type DisputeStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed'

interface Dispute {
  id: string
  dispute_number: string
  reason: string
  evidence_description?: string
  status: DisputeStatus
  clearance_paid: boolean
  created_at: string
  resolved_at?: string
  resolution_notes?: string
  blacklist_id?: string
  borrowers?: { first_name: string; last_name: string; id_number?: string }
  lenders?: { company_name: string; legal_name: string }
}

const STATUS_COLORS: Record<DisputeStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  dismissed: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DisputeStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [showResolveModal, setShowResolveModal] = useState<{ id: string; action: 'resolved' | 'dismissed' } | null>(null)

  useEffect(() => { fetchDisputes() }, [])

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('borrower_disputes')
        .select(`*, borrower_blacklist(*, borrowers(first_name, last_name, id_number), lenders(company_name, legal_name))`)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setDisputes(data.map((d: any) => ({
          ...d,
          borrowers: d.borrower_blacklist?.borrowers,
          lenders: d.borrower_blacklist?.lenders,
        })))
      } else setDisputes([])
    } catch { setDisputes([]) }
    setLoading(false)
  }

  const handleResolve = async () => {
    if (!showResolveModal) return
    setActionLoading(showResolveModal.id)
    await supabase.from('borrower_disputes').update({
      status: showResolveModal.action,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNote,
    }).eq('id', showResolveModal.id)
    setDisputes(prev => prev.map(d => d.id === showResolveModal.id ? { ...d, status: showResolveModal.action, resolution_notes: resolutionNote } : d))
    setShowResolveModal(null)
    setResolutionNote('')
    setActionLoading(null)
  }

  const markUnderReview = async (id: string) => {
    setActionLoading(id)
    await supabase.from('borrower_disputes').update({ status: 'under_review' }).eq('id', id)
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'under_review' as DisputeStatus } : d))
    setActionLoading(null)
  }

  const filtered = disputes.filter(d => {
    const q = search.toLowerCase()
    const name = `${d.borrowers?.first_name || ''} ${d.borrowers?.last_name || ''}`.toLowerCase()
    const matchSearch = !q || d.dispute_number?.toLowerCase().includes(q) || name.includes(q) || d.lenders?.company_name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    under_review: disputes.filter(d => d.status === 'under_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Disputes</h2>
          <p className="text-neutral-500 text-sm">Platform-level dispute resolution and oversight</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">{stats.pending} Pending</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{stats.under_review} In Review</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Under Review', value: stats.under_review, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex items-center justify-between">
            <div><p className="text-xs font-medium text-neutral-500">{s.label}</p><p className="text-2xl font-bold text-neutral-900">{s.value}</p></div>
            <div className={`p-2.5 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by dispute number, borrower, lender..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <button onClick={fetchDisputes} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Gavel className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No disputes found</p>
            <p className="text-neutral-400 text-sm mt-1">Disputes filed by borrowers will appear here for review.</p>
          </div>
        )}
        {filtered.map(dispute => (
          <div key={dispute.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-5 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === dispute.id ? null : dispute.id)}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-neutral-900">{dispute.dispute_number || `DS-${dispute.id?.slice(0, 6).toUpperCase()}`}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[dispute.status]}`}>
                      {dispute.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {dispute.clearance_paid && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">CLEARANCE PAID</span>}
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 max-w-md line-clamp-1">{dispute.reason}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{dispute.borrowers ? `${dispute.borrowers.first_name} ${dispute.borrowers.last_name}` : 'Unknown Borrower'}</span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" />{dispute.lenders?.company_name || 'Unknown Lender'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">{new Date(dispute.created_at).toLocaleDateString()}</span>
                {expandedId === dispute.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </div>
            </div>
            {expandedId === dispute.id && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Dispute Details</h4>
                  <div className="space-y-2">
                    <div className="text-xs"><span className="text-neutral-500">Reason: </span><span className="text-neutral-800 font-medium">{dispute.reason}</span></div>
                    <div className="text-xs"><span className="text-neutral-500">Evidence: </span><span className="text-neutral-800">{dispute.evidence_description || 'No details provided'}</span></div>
                    {dispute.resolution_notes && <div className="bg-green-50 border border-green-200 rounded-lg p-2"><p className="text-[10px] font-bold text-green-800 mb-0.5">Resolution Notes:</p><p className="text-[10px] text-green-700">{dispute.resolution_notes}</p></div>}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Admin Actions</h4>
                  <div className="space-y-2">
                    {dispute.status === 'pending' && (
                      <button onClick={() => markUnderReview(dispute.id)} disabled={actionLoading === dispute.id} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                        {actionLoading === dispute.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />} Mark Under Review
                      </button>
                    )}
                    {(dispute.status === 'pending' || dispute.status === 'under_review') && (
                      <>
                        <button onClick={() => setShowResolveModal({ id: dispute.id, action: 'resolved' })} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve Dispute
                        </button>
                        <button onClick={() => setShowResolveModal({ id: dispute.id, action: 'dismissed' })} className="w-full py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Dismiss Dispute
                        </button>
                      </>
                    )}
                    {(dispute.status === 'resolved' || dispute.status === 'dismissed') && (
                      <div className="bg-neutral-100 rounded-lg p-3 text-center text-xs text-neutral-500">
                        This dispute has been {dispute.status}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">{showResolveModal.action === 'resolved' ? 'Resolve Dispute' : 'Dismiss Dispute'}</h3>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Resolution Notes <span className="text-red-500">*</span></label>
              <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} rows={4} placeholder="Provide the resolution details or reason for dismissal..." className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowResolveModal(null); setResolutionNote('') }} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleResolve} disabled={!resolutionNote.trim() || !!actionLoading} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${showResolveModal.action === 'resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-neutral-600 hover:bg-neutral-700'}`}>
                {actionLoading ? 'Saving...' : showResolveModal.action === 'resolved' ? 'Resolve' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
