"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Banknote, Search, RefreshCw, Plus, CheckCircle } from 'lucide-react'

interface Payment {
  id: string
  loan_id?: string
  amount: number
  payment_date?: string
  payment_method?: string
  status?: string
  notes?: string
  created_at: string
  loan?: { loan_number?: string; borrower?: { first_name: string; last_name: string } }
}

export default function LenderRepaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ loan_id: '', borrower_id: '', amount: '', payment_method: 'bank_transfer', notes: '' })
  const [loans, setLoans] = useState<any[]>([])
  const [borrowers, setBorrowers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const lenderId = localStorage.getItem('lenderId')
      // Fetch payments
      const payQuery = supabase.from('payments').select('*, loan:loan_id(loan_number, borrower:borrower_id(first_name, last_name))').order('created_at', { ascending: false })
      const { data: pData } = await (lenderId ? payQuery.eq('lender_id', lenderId) : payQuery)
      setPayments(pData || [])
      // Fetch active loans for this lender
      let loanQuery = supabase.from('loans').select('id, loan_number, borrower:borrower_id(id, first_name, last_name)').eq('status', 'active')
      if (lenderId) loanQuery = loanQuery.eq('lender_id', lenderId)
      const { data: lData } = await loanQuery
      setLoans(lData || [])
      // Fetch borrowers for direct selection
      let bQuery = supabase.from('borrowers').select('id, first_name, last_name, email').order('first_name')
      if (lenderId) bQuery = bQuery.eq('lender_id', lenderId)
      const { data: bData } = await bQuery
      setBorrowers(bData || [])
    } catch { setPayments([]) }
    setLoading(false)
  }

  const recordPayment = async () => {
    if (!form.amount) return
    setSaving(true); setSaveError('')
    const lenderId = localStorage.getItem('lenderId') || null
    // Get borrower_id from selected loan if not directly set
    let borrowerId = form.borrower_id || null
    if (!borrowerId && form.loan_id) {
      const loan = loans.find(l => l.id === form.loan_id)
      borrowerId = loan?.borrower?.id || null
    }
    const { error } = await supabase.from('payments').insert({
      loan_id: form.loan_id || null,
      borrower_id: borrowerId,
      lender_id: lenderId,
      amount: parseFloat(form.amount),
      payment_method: form.payment_method,
      notes: form.notes || null,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'completed',
    })
    if (error) { setSaveError(error.message); setSaving(false); return }
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false); setForm({ loan_id: '', borrower_id: '', amount: '', payment_method: 'bank_transfer', notes: '' }); fetchData() }, 1200)
    setSaving(false)
  }

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0)
  const thisMonth = payments.filter(p => p.status === 'completed' && p.created_at?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, p) => s + (p.amount || 0), 0)

  const filtered = payments.filter(p => {
    const q = search.toLowerCase()
    const borrowerName = p.loan?.borrower ? `${p.loan.borrower.first_name} ${p.loan.borrower.last_name}` : ''
    return !q || borrowerName.toLowerCase().includes(q) || (p.loan?.loan_number || '').toLowerCase().includes(q)
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Repayments</h2>
          <p className="text-neutral-500 text-sm">{payments.length} payment records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Total Collected</p>
          <p className="text-xl font-bold text-green-600 mt-0.5">N$ {totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">This Month</p>
          <p className="text-xl font-bold text-cashub-700 mt-0.5">N$ {thisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Total Records</p>
          <p className="text-xl font-bold text-neutral-900 mt-0.5">{payments.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by borrower or loan number..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {['Borrower', 'Loan', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-neutral-400"><Banknote className="w-10 h-10 text-neutral-200 mx-auto mb-2" />No payment records yet</td></tr>
            )}
            {filtered.map(p => {
              const borrowerName = p.loan?.borrower ? `${p.loan.borrower.first_name} ${p.loan.borrower.last_name}` : 'N/A'
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">{borrowerName}</td>
                  <td className="px-4 py-3 text-xs font-mono text-neutral-500">{p.loan?.loan_number || '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-900">N$ {(p.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600 capitalize">{(p.payment_method || '—').replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{p.payment_date || new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status || 'pending'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Record Payment</h3>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Select Borrower</label>
              <select value={form.borrower_id} onChange={e => setForm(p => ({ ...p, borrower_id: e.target.value, loan_id: '' }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
                <option value="">— Select borrower —</option>
                {borrowers.map(b => <option key={b.id} value={b.id}>{b.first_name} {b.last_name}{b.email ? ` (${b.email})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Loan (optional)</label>
              <select value={form.loan_id} onChange={e => setForm(p => ({ ...p, loan_id: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
                <option value="">— Select loan —</option>
                {loans
                  .filter(l => !form.borrower_id || l.borrower?.id === form.borrower_id)
                  .map(l => <option key={l.id} value={l.id}>{l.loan_number} — {l.borrower ? `${l.borrower.first_name} ${l.borrower.last_name}` : 'Unknown'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Amount (N$) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 3500" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            {saveError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">{saveError}</div>}
            {saved && <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-xs text-green-700 font-medium">Payment recorded!</span></div>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={recordPayment} disabled={saving} className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
