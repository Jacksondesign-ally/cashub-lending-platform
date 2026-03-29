"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Plus, Search, RefreshCw, CheckCircle, Trash2 } from 'lucide-react'

interface ScamAlert {
  id: string
  title?: string
  description?: string
  suspect_name?: string
  suspect_id?: string
  status?: string
  submitted_by?: string
  alert_type?: string
  created_at: string
}

export default function LenderScamAlertsPage() {
  const [alerts, setAlerts] = useState<ScamAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [myEmail, setMyEmail] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', suspect_name: '', suspect_id: '', alert_type: 'fraud' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || localStorage.getItem('userName') || ''
    setMyEmail(email)
    fetchAlerts()
  }, [])

  const deleteAlert = async (id: string) => {
    if (!confirm('Delete this scam alert? This action cannot be undone.')) return
    setDeleting(id)
    await supabase.from('scam_alerts').delete().eq('id', id)
    setAlerts(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('scam_alerts')
        .select('*')
        .order('created_at', { ascending: false })
      setAlerts(data || [])
    } catch (err) { console.error('[CasHuB Error]', err); setAlerts([]) }
    setLoading(false)
  }

  const submitAlert = async () => {
    if (!form.title || !form.description) { setSaveError('Title and description are required'); return }
    setSaving(true); setSaveError('')
    try {
      const lenderEmail = localStorage.getItem('userEmail') || localStorage.getItem('userName') || ''
      const { error } = await supabase.from('scam_alerts').insert({
        title: form.title,
        description: form.description,
        suspect_name: form.suspect_name || null,
        suspect_id: form.suspect_id || null,
        alert_type: form.alert_type,
        submitted_by: lenderEmail,
        status: 'pending',
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
      setSaved(true)
      setTimeout(() => { setSaved(false); setShowModal(false); setForm({ title: '', description: '', suspect_name: '', suspect_id: '', alert_type: 'fraud' }); fetchAlerts() }, 1200)
    } catch (err: any) { setSaveError(err.message || 'Error') }
    setSaving(false)
  }

  const filtered = alerts.filter(a => {
    const q = search.toLowerCase()
    return !q || (a.title || '').toLowerCase().includes(q) || (a.suspect_name || '').toLowerCase().includes(q)
  })

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-red-100 text-red-700',
    dismissed: 'bg-gray-100 text-gray-600',
  }

  const TYPE_COLORS: Record<string, string> = {
    fraud: 'bg-red-50 text-red-700 border-red-200',
    identity_theft: 'bg-orange-50 text-orange-700 border-orange-200',
    default_escape: 'bg-amber-50 text-amber-700 border-amber-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200',
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Scam Alert Submissions</h2>
          <p className="text-neutral-500 text-sm">{alerts.length} alerts from all lenders</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Submit Scam Alert
        </button>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-rose-900">Protect the Lending Community</p>
          <p className="text-xs text-rose-700 mt-0.5">Submit alerts about suspected fraudsters, identity thieves, or loan defaulters who have fled. All alerts are reviewed by CasHuB and shared with the lender network once verified.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <button onClick={fetchAlerts} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No scam alerts submitted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const statusColor = STATUS_COLORS[alert.status || 'pending'] || 'bg-gray-100 text-gray-600'
            const typeColor = TYPE_COLORS[alert.alert_type || 'other'] || TYPE_COLORS.other
            const isOwn = alert.submitted_by === myEmail
            return (
              <div key={alert.id} className={`bg-white rounded-xl border-2 p-4 ${isOwn ? 'border-rose-300' : 'border-neutral-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-neutral-900">{alert.title}</h3>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${typeColor}`}>{(alert.alert_type || 'other').replace('_', ' ')}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>{alert.status || 'pending'}</span>
                        {isOwn && <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">Your Alert</span>}
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">{alert.description}</p>
                      {(alert.suspect_name || alert.suspect_id) && (
                        <p className="text-xs text-neutral-500 mt-1">Suspect: <strong>{alert.suspect_name || ''}</strong> {alert.suspect_id ? `(ID: ${alert.suspect_id})` : ''}</p>
                      )}
                      <p className="text-[10px] text-neutral-400 mt-1.5">Posted by: {alert.submitted_by || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap">{new Date(alert.created_at).toLocaleDateString()}</span>
                    {isOwn && (
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        disabled={deleting === alert.id}
                        className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete your alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-900">Submit Scam Alert</h3>
            {saveError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{saveError}</div>}
            {saved && <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700">Alert submitted for review!</span></div>}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Alert Type</label>
              <select value={form.alert_type} onChange={e => setForm(p => ({ ...p, alert_type: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
                <option value="fraud">Fraud</option>
                <option value="identity_theft">Identity Theft</option>
                <option value="default_escape">Default / Escape</option>
                <option value="other">Other</option>
              </select>
            </div>
            {[
              { key: 'title', label: 'Alert Title *', type: 'text', placeholder: 'e.g. Suspected fraudulent loan application' },
              { key: 'suspect_name', label: 'Suspect Full Name', type: 'text', placeholder: 'Full name of suspect' },
              { key: 'suspect_id', label: 'Suspect ID Number', type: 'text', placeholder: 'National ID if known' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the incident in detail..." className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowModal(false); setSaveError('') }} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={submitAlert} disabled={saving} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

