"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Users, Search, RefreshCw, Plus, Mail, Phone, ChevronDown, ChevronUp, Edit, Trash2, CheckCircle, Briefcase, Building2, CreditCard, Users2 } from 'lucide-react'

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
  const [form, setForm] = useState({
    first_name: '', last_name: '', id_number: '', email: '', phone: '', employment_status: '', monthly_income: '',
    postal_address: '', tel_no: '', marital_status: '', occupation: '',
    employer_name: '', employer_tel: '', employer_address: '', payslip_employee_no: '',
    bank_name: '', bank_branch: '', bank_account_no: '', bank_account_type: '',
    reference1_name: '', reference1_tel: '', reference2_name: '', reference2_tel: '',
  })
  const [regTab, setRegTab] = useState<'basic'|'employment'|'banking'|'references'>('basic')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [idLookupLoading, setIdLookupLoading] = useState(false)
  const [idAutofillMsg, setIdAutofillMsg] = useState('')
  const [editBorrower, setEditBorrower] = useState<Borrower | null>(null)
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', id_number: '', email: '', phone: '', employment_status: '', monthly_income: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSaved, setEditSaved] = useState(false)

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
    } catch (err) { console.error('[CasHuB Error]', err); setBorrowers([]) }
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
        postal_address: form.postal_address || null,
        tel_no: form.tel_no || null,
        marital_status: form.marital_status || null,
        occupation: form.occupation || null,
        employer_name: form.employer_name || null,
        employer_tel: form.employer_tel || null,
        employer_address: form.employer_address || null,
        payslip_employee_no: form.payslip_employee_no || null,
        bank_name: form.bank_name || null,
        bank_branch: form.bank_branch || null,
        bank_account_no: form.bank_account_no || null,
        bank_account_type: form.bank_account_type || null,
        reference1_name: form.reference1_name || null,
        reference1_tel: form.reference1_tel || null,
        reference2_name: form.reference2_name || null,
        reference2_tel: form.reference2_tel || null,
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
      setForm({ first_name: '', last_name: '', id_number: '', email: '', phone: '', employment_status: '', monthly_income: '', postal_address: '', tel_no: '', marital_status: '', occupation: '', employer_name: '', employer_tel: '', employer_address: '', payslip_employee_no: '', bank_name: '', bank_branch: '', bank_account_no: '', bank_account_type: '', reference1_name: '', reference1_tel: '', reference2_name: '', reference2_tel: '' })
      setRegTab('basic')
      fetchBorrowers()
    } catch (err: any) { setSaveError(err.message || 'Error') }
    setSaving(false)
  }

  const handleIdLookup = async (idNumber: string) => {
    if (!idNumber || idNumber.length < 5) { setIdAutofillMsg(''); return }
    setIdLookupLoading(true)
    try {
      const { data } = await supabase.from('borrowers').select('*').eq('id_number', idNumber).limit(1)
      if (data && data.length > 0) {
        const b = data[0]
        setForm(p => ({
          ...p,
          first_name: b.first_name || p.first_name,
          last_name: b.last_name || p.last_name,
          email: b.email || p.email,
          phone: b.phone || p.phone,
          employment_status: b.employment_status || p.employment_status,
          monthly_income: b.monthly_income?.toString() || p.monthly_income,
          postal_address: b.postal_address || p.postal_address,
          tel_no: b.tel_no || p.tel_no,
          marital_status: b.marital_status || p.marital_status,
          occupation: b.occupation || p.occupation,
          employer_name: b.employer_name || p.employer_name,
          employer_tel: b.employer_tel || p.employer_tel,
          employer_address: b.employer_address || p.employer_address,
          payslip_employee_no: b.payslip_employee_no || p.payslip_employee_no,
          bank_name: b.bank_name || p.bank_name,
          bank_branch: b.bank_branch || p.bank_branch,
          bank_account_no: b.bank_account_no || p.bank_account_no,
          bank_account_type: b.bank_account_type || p.bank_account_type,
          reference1_name: b.reference1_name || p.reference1_name,
          reference1_tel: b.reference1_tel || p.reference1_tel,
          reference2_name: b.reference2_name || p.reference2_name,
          reference2_tel: b.reference2_tel || p.reference2_tel,
        }))
        setIdAutofillMsg(`✓ Found existing record for ${b.first_name} ${b.last_name} — fields autofilled`)
      } else {
        setIdAutofillMsg('')
      }
    } catch { setIdAutofillMsg('') }
    setIdLookupLoading(false)
  }

  const handleEdit = (b: Borrower) => {
    setEditBorrower(b)
    setEditForm({
      first_name: b.first_name || '',
      last_name: b.last_name || '',
      id_number: b.id_number || '',
      email: (b as any).email || '',
      phone: (b as any).phone || '',
      employment_status: (b as any).employment_status || '',
      monthly_income: (b as any).monthly_income?.toString() || '',
    })
    setEditError('')
    setEditSaved(false)
  }

  const handleUpdate = async () => {
    if (!editBorrower) return
    if (!editForm.first_name || !editForm.last_name) { setEditError('First name and last name are required'); return }
    setEditSaving(true); setEditError('')
    try {
      const { error } = await supabase.from('borrowers').update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        id_number: editForm.id_number,
        email: editForm.email || null,
        phone: editForm.phone || null,
        employment_status: editForm.employment_status || null,
        monthly_income: editForm.monthly_income ? parseFloat(editForm.monthly_income) : null,
        updated_at: new Date().toISOString(),
      }).eq('id', editBorrower.id)
      if (error) { setEditError(error.message); setEditSaving(false); return }
      setEditSaved(true)
      fetchBorrowers()
      setTimeout(() => { setEditBorrower(null); setEditSaved(false) }, 1200)
    } catch (err: any) { setEditError(err.message || 'Error') }
    setEditSaving(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove borrower ${name}? This will archive them but preserve all loan history.`)) return
    await supabase.from('borrowers').update({ status: 'inactive' }).eq('id', id)
    fetchBorrowers()
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
                <button onClick={e => { e.stopPropagation(); handleEdit(b) }} className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={e => { e.stopPropagation(); handleDelete(b.id, `${b.first_name} ${b.last_name}`) }} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* Edit Borrower Modal */}
      {editBorrower && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-900">Edit Borrower</h3>
            {editError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{editError}</div>}
            {editSaved && <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700">Borrower updated!</span></div>}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'first_name', label: 'First Name *', type: 'text' },
                { key: 'last_name', label: 'Last Name *', type: 'text' },
                { key: 'id_number', label: 'ID Number', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'monthly_income', label: 'Monthly Income (N$)', type: 'number' },
              ].map(field => (
                <div key={field.key} className={field.key === 'id_number' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{field.label}</label>
                  <input type={field.type} value={(editForm as any)[field.key]} onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Employment Status</label>
                <select value={editForm.employment_status} onChange={e => setEditForm(prev => ({ ...prev, employment_status: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditBorrower(null)} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleUpdate} disabled={editSaving} className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Register New Borrower</h3>
              <span className="text-xs text-neutral-400">All fields used in loan agreements</span>
            </div>
            {saveError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{saveError}</div>}

            {/* Tabs */}
            <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
              {([['basic','Basic Info',Users],['employment','Employment',Briefcase],['banking','Banking',CreditCard],['references','References',Users2]] as const).map(([id,label,Icon])=>(
                <button key={id} onClick={()=>setRegTab(id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    regTab===id ? 'bg-white shadow-sm text-cashub-700' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {/* BASIC INFO TAB */}
            {regTab==='basic' && (
              <div className="grid grid-cols-2 gap-3">
                {[{key:'first_name',label:'First Name *',type:'text',pl:'John'},{key:'last_name',label:'Last Name *',type:'text',pl:'Doe'},{key:'email',label:'Email',type:'email',pl:'john@email.com'},{key:'phone',label:'Mobile Phone',type:'tel',pl:'+264 81 234 5678'},{key:'tel_no',label:'Telephone No',type:'tel',pl:'+264 61 123 456'},{key:'monthly_income',label:'Monthly Income (N$)',type:'number',pl:'5000'}].map(f=>(
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.pl} value={(form as any)[f.key]}
                      onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">ID Number * (autofills if known)</label>
                  <input type="text" placeholder="XXXXXXXXXXXXXXXXXX" value={form.id_number}
                    onChange={e=>{setForm(p=>({...p,id_number:e.target.value}));handleIdLookup(e.target.value)}}
                    className="w-full px-3 py-2 border border-cashub-300 bg-cashub-50 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  {idLookupLoading && <p className="text-xs text-neutral-400 mt-0.5">Looking up...</p>}
                  {idAutofillMsg && <p className="text-xs text-emerald-600 mt-0.5 font-medium">{idAutofillMsg}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Marital Status</label>
                  <select value={form.marital_status} onChange={e=>setForm(p=>({...p,marital_status:e.target.value}))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Employment Status</label>
                  <select value={form.employment_status} onChange={e=>setForm(p=>({...p,employment_status:e.target.value}))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                    <option value="">Select</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Postal Address</label>
                  <input type="text" placeholder="P.O. Box 1234, Windhoek" value={form.postal_address}
                    onChange={e=>setForm(p=>({...p,postal_address:e.target.value}))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Residential Address</label>
                  <input type="text" placeholder="15 Independence Ave, Windhoek" value={(form as any).address||''}
                    onChange={e=>setForm(p=>({...p,address:e.target.value}))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
              </div>
            )}

            {/* EMPLOYMENT TAB */}
            {regTab==='employment' && (
              <div className="grid grid-cols-2 gap-3">
                {[{k:'occupation',l:'Occupation',p:'Accountant'},{k:'employer_name',l:'Employer Name',p:'ABC Company Ltd'},{k:'employer_tel',l:'Employer Tel No',p:'+264 61 234 5678'},{k:'employer_address',l:'Employer Address',p:'12 Business Ave, Windhoek'},{k:'payslip_employee_no',l:'Payslip / Employee No',p:'EMP-001'}].map(f=>(
                  <div key={f.k} className={f.k==='employer_address'||f.k==='payslip_employee_no'?'col-span-2':''}>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">{f.l}</label>
                    <input type="text" placeholder={f.p} value={(form as any)[f.k]}
                      onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  </div>
                ))}
              </div>
            )}

            {/* BANKING TAB */}
            {regTab==='banking' && (
              <div className="grid grid-cols-2 gap-3">
                {[{k:'bank_name',l:'Bank Name',p:'First National Bank'},{k:'bank_branch',l:'Branch',p:'Windhoek Main'},{k:'bank_account_no',l:'Bank Account No',p:'62000000000'},{k:'bank_account_type',l:'Type of Account',p:''}].map(f=>(
                  <div key={f.k} className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-700 mb-1">{f.l}</label>
                    {f.k==='bank_account_type' ? (
                      <select value={form.bank_account_type} onChange={e=>setForm(p=>({...p,bank_account_type:e.target.value}))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                        <option value="">Select type</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Savings">Savings</option>
                        <option value="Transmission">Transmission</option>
                      </select>
                    ) : (
                      <input type="text" placeholder={f.p} value={(form as any)[f.k]}
                        onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                    )}
                  </div>
                ))}
                <div className="col-span-2 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                  <strong>Note:</strong> Bank details are used for automatic debit authorization in the loan agreement.
                </div>
              </div>
            )}

            {/* REFERENCES TAB */}
            {regTab==='references' && (
              <div className="space-y-4">
                {[{n:'1',nk:'reference1_name',tk:'reference1_tel'},{n:'2',nk:'reference2_name',tk:'reference2_tel'}].map(r=>(
                  <div key={r.n} className="bg-neutral-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-neutral-700">Reference {r.n}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
                        <input type="text" placeholder="Jane Smith" value={(form as any)[r.nk]}
                          onChange={e=>setForm(p=>({...p,[r.nk]:e.target.value}))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Tel No</label>
                        <input type="tel" placeholder="+264 81 234 5678" value={(form as any)[r.tk]}
                          onChange={e=>setForm(p=>({...p,[r.tk]:e.target.value}))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

