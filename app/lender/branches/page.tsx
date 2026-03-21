"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Building, Plus, MapPin, Phone, Mail, User, RefreshCw, CheckCircle, Lock, Edit, Trash2, X } from 'lucide-react'

interface Branch {
  id: string
  branch_name: string
  address: string
  city: string
  region: string
  phone?: string
  email?: string
  manager_name?: string
  is_active: boolean
  created_at: string
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState({ branch_name: '', address: '', city: '', region: '', phone: '', email: '', manager_name: '' })

  const isEnterprise = plan === 'enterprise'

  useEffect(() => {
    const p = localStorage.getItem('lenderPlan') || 'professional'
    setPlan(p)
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    setLoading(true)
    const lenderId = localStorage.getItem('lenderId')
    if (lenderId) {
      const { data } = await supabase.from('lender_branches').select('*').eq('lender_id', lenderId).order('created_at', { ascending: false })
      setBranches(data || [])
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const lenderId = localStorage.getItem('lenderId')
    try {
      if (editBranch) {
        await supabase.from('lender_branches').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editBranch.id)
      } else {
        await supabase.from('lender_branches').insert({ ...form, lender_id: lenderId, is_active: true })
      }
      await fetchBranches()
      setShowModal(false)
      setEditBranch(null)
      setForm({ branch_name: '', address: '', city: '', region: '', phone: '', email: '', manager_name: '' })
    } catch (err) { console.error('Branch save error:', err) }
    setSaving(false)
  }

  const handleEdit = (b: Branch) => {
    setEditBranch(b)
    setForm({ branch_name: b.branch_name, address: b.address, city: b.city, region: b.region, phone: b.phone || '', email: b.email || '', manager_name: b.manager_name || '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this branch?')) return
    await supabase.from('lender_branches').delete().eq('id', id)
    fetchBranches()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 animate-spin text-cashub-600" /></div>

  if (!isEnterprise) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Branch Management</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage multiple branch locations for your lending operation</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 mb-2">Enterprise Plan Required</h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-5">
            Multi-branch management is available on the Enterprise plan. Upgrade to manage unlimited branches, assign managers, and track performance per location.
          </p>
          <a href="/lender/billing" className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">
            Upgrade to Enterprise
          </a>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            {['Multiple Branch Locations', 'Per-branch Staff Assignment', 'Branch Performance Reports'].map(f => (
              <div key={f} className="bg-neutral-50 rounded-xl p-3 text-xs text-neutral-600 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Branch Management</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{branches.length} branch{branches.length !== 1 ? 'es' : ''} registered</p>
        </div>
        <button onClick={() => { setEditBranch(null); setForm({ branch_name: '', address: '', city: '', region: '', phone: '', email: '', manager_name: '' }); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <Building className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No branches added yet. Add your first branch location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{b.branch_name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(b)} className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-neutral-600">
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-neutral-400" />{b.address}, {b.city}, {b.region}</p>
                {b.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-neutral-400" />{b.phone}</p>}
                {b.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-neutral-400" />{b.email}</p>}
                {b.manager_name && <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-neutral-400" />Manager: {b.manager_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">{editBranch ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              {[
                { label: 'Branch Name *', key: 'branch_name', required: true, placeholder: 'e.g. Windhoek North Branch' },
                { label: 'Street Address *', key: 'address', required: true, placeholder: '123 Independence Ave' },
                { label: 'City *', key: 'city', required: true, placeholder: 'Windhoek' },
                { label: 'Region *', key: 'region', required: true, placeholder: 'Khomas' },
                { label: 'Phone', key: 'phone', required: false, placeholder: '+264 61 000 0000' },
                { label: 'Email', key: 'email', required: false, placeholder: 'branch@company.com' },
                { label: 'Branch Manager', key: 'manager_name', required: false, placeholder: 'Full name' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
                  <input type="text" required={f.required} value={(form as any)[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
