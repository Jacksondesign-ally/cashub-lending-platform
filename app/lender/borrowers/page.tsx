"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Users, Search, RefreshCw, Plus, Mail, Phone, Calendar, ChevronDown, ChevronUp, Eye, Shield } from 'lucide-react'

interface Borrower {
  id: string
  first_name: string
  last_name: string
  id_number?: string
  email?: string
  phone?: string
  risk_level?: string
  credit_score?: number
  status?: string
  created_at: string
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

export default function LenderBorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', id_number: '', email: '', phone: '', employment_status: '', monthly_income: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => { fetchBorrowers() }, [])

  const fetchBorrowers = async () => {
    setLoading(true)
    try {
      const lenderId = localStorage.getItem('lenderId')
      const lenderEmail = localStorage.getItem('userName') || ''
      let query = supabase.from('borrowers').select('*').order('created_at', { ascending: false })
      if (lenderId) query = query.eq('lender_id', lenderId)
      const { data, error } = await query
      if (!error && data) setBorrowers(data)
      else setBorrowers([])
    } catch { setBorrowers([]) }
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.id_number) { setSaveError('First name, last name and ID number are required'); return }
    setSaving(true); setSaveError('')
    try {
      const lenderId = localStorage.getItem('lenderId') || null
      const { error } = await supabase.from('borrowers').insert({
        first_name: form.first_name,
        last_name: form.last_name,
        id_number: form.id_number,
        email: form.email || null,
        phone: form.phone || null,
        employment_status: form.employment_status || null,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
        status: 'active',
        risk_level: 'medium',
        lender_id: lenderId,
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
      // Generate invite link for the borrower
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const emailParam = form.email ? `&email=${encodeURIComponent(form.email)}` : ''
      const link = `${baseUrl}/signup?role=borrower${emailParam}`
      setInviteLink(link)
      setForm({ first_name: '', last_name: '', id_number: '', email: '', phone: '', employment_status: '', monthly_income: '' })
      fetchBorrowers()
    } catch (err: any) { setSaveError(err.message || 'Error') }
    setSaving(false)
  }

  const copyInviteLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink).then(() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000) })
  }

  const filtered = borrowers.filter(b => {
    const q = search.toLowerCase()
    return !q || `${b.first_name} ${b.last_name}`.toLowerCase().includes(q) || b.id_number?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q) || b.phone?.toLowerCase().includes(q)
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Borrowers</h2>
          <p className="text-neutral-500 text-sm">{borrowers.length} registered borrowers</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Register Borrower
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, email, phone..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <button onClick={fetchBorrowers} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No borrowers found</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-cashub-600 text-sm hover:underline">Register your first borrower →</button>
          </div>
        )}
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{b.first_name?.charAt(0)}{b.last_name?.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-neutral-900">{b.first_name} {b.last_name}</h3>
                    {b.risk_level && <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${RISK_COLORS[b.risk_level] || 'bg-gray-100 text-gray-600'}`}>{b.risk_level?.toUpperCase()} RISK</span>}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.status || 'active'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400 flex-wrap">
                    <span>ID: {b.id_number || 'N/A'}</span>
                    {b.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{b.email}</span>}
                    {b.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{b.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">{b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}</span>
                {expandedId === b.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </div>
            </div>
            {expandedId === b.id && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><p className="text-neutral-500 mb-0.5">Credit Score</p><p className="font-bold text-neutral-900">{b.credit_score || '—'}</p></div>
                <div><p className="text-neutral-500 mb-0.5">Risk Level</p><p className="font-bold text-neutral-900 capitalize">{b.risk_level || '—'}</p></div>
                <div><p className="text-neutral-500 mb-0.5">Status</p><p className="font-bold text-neutral-900 capitalize">{b.status || '—'}</p></div>
                <div><p className="text-neutral-500 mb-0.5">Registered</p><p className="font-bold text-neutral-900">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</p></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-900">Register New Borrower</h3>
            {saveError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{saveError}</div>}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'first_name', label: 'First Name *', type: 'text', placeholder: 'John' },
                { key: 'last_name', label: 'Last Name *', type: 'text', placeholder: 'Doe' },
                { key: 'id_number', label: 'ID Number *', type: 'text', placeholder: 'XXXXXXXXXXXXXXXXXX' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@email.com' },
                { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+264 81 234 5678' },
                { key: 'monthly_income', label: 'Monthly Income (N$)', type: 'number', placeholder: '5000' },
              ].map(field => (
                <div key={field.key} className={field.key === 'id_number' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={(form as any)[field.key]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Employment Status</label>
                <select value={form.employment_status} onChange={e => setForm(prev => ({ ...prev, employment_status: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
            {inviteLink && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-emerald-800">✅ Borrower registered! Send this portal link:</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={inviteLink} className="flex-1 text-xs px-2 py-1.5 border border-emerald-300 rounded-lg bg-white text-neutral-700 truncate" />
                  <button onClick={copyInviteLink} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copiedLink ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}>
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-700">Share this link so the borrower can create their portal account.</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAddModal(false); setSaveError(''); setInviteLink('') }} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Close</button>
              {!inviteLink && (
                <button onClick={handleRegister} disabled={saving} className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {saving ? 'Registering...' : 'Register Borrower'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
