"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Ban, Plus, Search, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface BlacklistEntry {
  id: string
  borrower_id?: string
  id_number?: string
  full_name?: string
  reason?: string
  status?: string
  submitted_by?: string
  created_at: string
  borrower?: { first_name: string; last_name: string; id_number?: string }
}

export default function LenderBlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ id_number: '', full_name: '', reason: '', borrower_id: '' })
  const [borrowers, setBorrowers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const lenderEmail = localStorage.getItem('userName') || ''
      const lenderId = localStorage.getItem('lenderId')
      // Borrowers filter: only this lender's borrowers
      let borrowerQ = supabase.from('borrowers').select('id, first_name, last_name, id_number')
      if (lenderId) borrowerQ = borrowerQ.eq('lender_id', lenderId)
      else if (lenderEmail) borrowerQ = borrowerQ.eq('email', lenderEmail)
      // Blacklist filter: only entries submitted by this lender
      const [{ data: bData }, { data: blData }] = await Promise.all([
        borrowerQ,
        supabase.from('blacklist').select('*, borrower:borrower_id(first_name, last_name, id_number)').eq('submitted_by', lenderEmail).order('created_at', { ascending: false }),
      ])
      setBorrowers(bData || [])
      setEntries(blData || [])
    } catch (err) { console.error('[CasHuB Error]', err); setEntries([]) }
    setLoading(false)
  }

  const submitRequest = async () => {
    if (!form.reason) { setSaveError('Reason is required'); return }
    setSaving(true); setSaveError('')
    try {
      const lenderEmail = localStorage.getItem('userName') || ''
      const { error } = await supabase.from('blacklist').insert({
        borrower_id: form.borrower_id || null,
        id_number: form.id_number || null,
        full_name: form.full_name || null,
        reason: form.reason,
        submitted_by: lenderEmail,
        status: 'pending',
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
      setSaved(true)
      setTimeout(() => { setSaved(false); setShowModal(false); setForm({ id_number: '', full_name: '', reason: '', borrower_id: '' }); fetchData() }, 1200)
    } catch (err: any) { setSaveError(err.message || 'Error') }
    setSaving(false)
  }

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    const name = e.borrower ? `${e.borrower.first_name} ${e.borrower.last_name}` : e.full_name || ''
    return !q || name.toLowerCase().includes(q) || (e.id_number || e.borrower?.id_number || '').toLowerCase().includes(q)
  })

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-red-100 text-red-700',
    rejected: 'bg-gray-100 text-gray-600',
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Blacklist Requests</h2>
          <p className="text-neutral-500 text-sm">{entries.length} total requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Submit Blacklist Request
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Important</p>
          <p className="text-xs text-amber-700 mt-0.5">Blacklist requests are reviewed and approved by the CasHuB Super Admin before taking effect on the shared registry. Submitting a false request may result in penalties.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID number..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Ban className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No blacklist requests submitted</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const name = e.borrower ? `${e.borrower.first_name} ${e.borrower.last_name}` : e.full_name || 'Unknown'
            const idNo = e.borrower?.id_number || e.id_number || '—'
            const statusColor = STATUS_COLORS[e.status || 'pending'] || 'bg-gray-100 text-gray-600'
            return (
              <div key={e.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ban className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900">{name}</h3>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>{e.status || 'pending'}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">ID: {idNo}</p>
                      <p className="text-xs text-neutral-600 mt-1">{e.reason}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400">{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Submit Blacklist Request</h3>
            {saveError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{saveError}</div>}
            {saved && <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700">Request submitted!</span></div>}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Select Borrower (if registered)</label>
              <select value={form.borrower_id} onChange={e => setForm(p => ({ ...p, borrower_id: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
                <option value="">— Select borrower —</option>
                {borrowers.map(b => <option key={b.id} value={b.id}>{b.first_name} {b.last_name} ({b.id_number || 'N/A'})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Or Enter ID Number Manually</label>
              <input type="text" value={form.id_number} onChange={e => setForm(p => ({ ...p, id_number: e.target.value }))} placeholder="National ID number" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name (if not registered)</label>
              <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Full name" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Reason for Blacklisting *</label>
              <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={3} placeholder="Describe the reason for this blacklist request..." className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowModal(false); setSaveError('') }} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={submitRequest} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

