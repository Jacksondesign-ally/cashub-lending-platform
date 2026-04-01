"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Building, Search, CheckCircle, Ban, RefreshCw, Phone, Mail, Globe, MapPin, ChevronDown, ChevronUp, Users, Calendar, AlertTriangle, Shield, UserPlus, Send, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react'
import { logAudit } from '@/lib/audit-logger'

interface Lender {
  id: string
  company_name: string
  legal_name: string
  registration_number?: string
  namfisa_license?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  website?: string
  about?: string
  is_active: boolean
  created_at: string
}

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchLenders()
    const onFocus = () => fetchLenders()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const fetchLenders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('lenders').select('*').order('created_at', { ascending: false })
      if (!error && data) setLenders(data)
      else setLenders([])
    } catch (err) { console.error('[CasHuB Error]', err); setLenders([]) }
    setLoading(false)
  }

  const deleteLender = async (id: string, companyName: string) => {
    if (!confirm(`Permanently delete lender "${companyName}"? All their data will remain in the database but they will be removed from the platform.`)) return
    setDeletingId(id)
    await supabase.from('lenders').update({ is_active: false }).eq('id', id)
    await logAudit({
      action: 'settings.updated',
      entity_type: 'staff',
      entity_id: id,
      details: { company_name: companyName, action: 'deleted' },
    })
    setLenders(prev => prev.filter(l => l.id !== id))
    setDeletingId(null)
  }

  const toggleActive = async (id: string, current: boolean, companyName: string) => {
    setActionLoading(id)
    await supabase.from('lenders').update({ is_active: !current }).eq('id', id)
    await logAudit({
      action: current ? 'borrower.blacklisted' : 'borrower.removed_from_blacklist',
      entity_type: 'staff',
      entity_id: id,
      details: { company_name: companyName, action: current ? 'suspended' : 'reactivated' },
    })
    setLenders(prev => prev.map(l => l.id === id ? { ...l, is_active: !current } : l))
    setActionLoading(null)
  }

  const filtered = lenders.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.company_name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.registration_number?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? l.is_active : !l.is_active)
    return matchSearch && matchStatus
  })

  const stats = { total: lenders.length, active: lenders.filter(l => l.is_active).length, inactive: lenders.filter(l => !l.is_active).length }
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Lenders</h2>
          <p className="text-neutral-500 text-sm">All subscribed lending companies on the platform</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">{stats.active} Active</span>
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{stats.inactive} Suspended</span>
          <Link href="/dashboard/lenders/invite" className="inline-flex items-center gap-1.5 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold transition-all">
            <UserPlus className="w-4 h-4" /> Invite Lender
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Lenders', value: stats.total, icon: Building, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Suspended', value: stats.inactive, icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex items-center justify-between">
            <div><p className="text-xs font-medium text-neutral-500">{s.label}</p><p className="text-2xl font-bold text-neutral-900 mt-0.5">{s.value}</p></div>
            <div className={`p-2.5 rounded-lg ${s.bg}`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, registration..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Suspended</option>
        </select>
        <button onClick={fetchLenders} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Building className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No lenders found</p>
            <p className="text-neutral-400 text-sm mt-1">Lenders will appear here once they register and are approved.</p>
          </div>
        )}
        {paginated.map(lender => (
          <div key={lender.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-5 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === lender.id ? null : lender.id)}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-white">{lender.company_name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-neutral-900">{lender.company_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${lender.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                      {lender.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {lender.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{lender.legal_name} {lender.registration_number ? `• ${lender.registration_number}` : ''}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400 flex-wrap">
                    {lender.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lender.email}</span>}
                    {lender.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lender.phone}</span>}
                    {lender.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lender.city}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">{lender.created_at ? new Date(lender.created_at).toLocaleDateString() : ''}</span>
                {expandedId === lender.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </div>
            </div>
            {expandedId === lender.id && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Company Details</h4>
                  {[
                    { label: 'Legal Name', value: lender.legal_name },
                    { label: 'Reg Number', value: lender.registration_number || 'N/A' },
                    { label: 'NAMFISA License', value: lender.namfisa_license || 'Not provided' },
                    { label: 'Region', value: lender.region || 'N/A' },
                    { label: 'Website', value: lender.website || 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-neutral-500">{item.label}</span>
                      <span className="font-medium text-neutral-900 text-right max-w-[180px] truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">About</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">{lender.about || 'No description provided.'}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Actions</h4>
                  {!lender.namfisa_license && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-amber-700">No NAMFISA license on record.</p>
                    </div>
                  )}
                  <button
                    onClick={() => toggleActive(lender.id, lender.is_active, lender.company_name)}
                    disabled={actionLoading === lender.id}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${lender.is_active ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  >
                    {actionLoading === lender.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : lender.is_active ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {lender.is_active ? 'Suspend Lender' : 'Reactivate Lender'}
                  </button>
                  <button
                    onClick={() => deleteLender(lender.id, lender.company_name)}
                    disabled={deletingId === lender.id}
                    className="w-full py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    {deletingId === lender.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Remove from Platform
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-neutral-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} lenders
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4 text-neutral-500" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium border ${
                  p === currentPage ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

