"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserCog, Plus, Search, RefreshCw, Mail, Phone, Shield, Trash2, CheckCircle } from 'lucide-react'

interface StaffMember {
  id: string
  full_name?: string
  email: string
  role: string
  phone?: string
  status?: string
  created_at: string
  lender_id?: string
}

export default function LenderStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'loan_officer', phone: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const lenderId = localStorage.getItem('lenderId')
      let query = supabase
        .from('users')
        .select('*')
        .in('role', ['loan_officer', 'lender_admin'])
        .order('created_at', { ascending: false })
      if (lenderId) query = query.eq('lender_id', lenderId)
      const { data } = await query
      setStaff(data || [])
    } catch (err) { console.error('[CasHuB Error]', err); setStaff([]) }
    setLoading(false)
  }

  const inviteStaff = async () => {
    if (!form.email || !form.full_name) { setSaveError('Name and email are required'); return }
    setSaving(true); setSaveError(''); setSaveMsg('')
    try {
      const { data: existing } = await supabase.from('users').select('id').eq('email', form.email).maybeSingle()
      if (existing) { setSaveError('A user with this email already exists'); setSaving(false); return }
      const { error } = await supabase.from('users').insert({
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        phone: form.phone || null,
        status: 'invited',
        lender_id: localStorage.getItem('lenderId') || null,
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
      setSaveMsg('Staff member invited successfully!')
      setTimeout(() => { setSaveMsg(''); setShowModal(false); setForm({ full_name: '', email: '', role: 'loan_officer', phone: '' }); fetchStaff() }, 1500)
    } catch (err: any) { setSaveError(err.message || 'Error inviting staff') }
    setSaving(false)
  }

  const removeStaff = async (id: string) => {
    if (!confirm('Remove this staff member? They will be deactivated but their data will be preserved.')) return
    await supabase.from('users').update({ is_active: false }).eq('id', id)
    setStaff(prev => prev.filter(s => s.id !== id))
  }

  const filtered = staff.filter(s => {
    const q = search.toLowerCase()
    return !q || (s.full_name || '').toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  })

  const ROLE_LABELS: Record<string, string> = {
    loan_officer: 'Loan Officer',
    lender_admin: 'Lender Admin',
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Loan Staff</h2>
          <p className="text-neutral-500 text-sm">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-900">Role Definitions</p>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
          <div><span className="font-bold">Lender Admin:</span> Full access to company portal, can manage staff and settings.</div>
          <div><span className="font-bold">Loan Officer:</span> Can process loans, manage borrowers, and record repayments.</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff by name or email..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <button onClick={fetchStaff} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <UserCog className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No staff members yet</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-cashub-600 text-sm hover:underline">Add your first staff member →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{(member.full_name || member.email).charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{member.full_name || 'Staff Member'}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-semibold">
                      <Shield className="w-3 h-3" />{ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>
                </div>
                <button onClick={() => removeStaff(member.id)} className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1.5 text-xs text-neutral-500">
                <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{member.email}</div>
                {member.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{member.phone}</div>}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${member.status === 'active' ? 'bg-green-100 text-green-700' : member.status === 'invited' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {member.status || 'active'}
                  </span>
                  <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Add Staff Member</h3>
            {saveError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{saveError}</div>}
            {saveMsg && <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700">{saveMsg}</span></div>}
            {[
              { key: 'full_name', label: 'Full Name *', type: 'text' },
              { key: 'email', label: 'Email Address *', type: 'email' },
              { key: 'phone', label: 'Phone Number', type: 'tel' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
                <option value="loan_officer">Loan Officer</option>
                <option value="lender_admin">Lender Admin</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowModal(false); setSaveError('') }} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={inviteStaff} disabled={saving} className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

