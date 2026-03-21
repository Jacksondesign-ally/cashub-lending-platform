"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Download, RefreshCw, CheckCircle, FileText, BarChart3, Users, Calendar } from 'lucide-react'

export default function LenderCompliancePage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ loans: 0, borrowers: 0, payments: 0, period: '' })
  const [exported, setExported] = useState<string | null>(null)

  useEffect(() => { fetchSummary() }, [])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const lenderId = typeof window !== 'undefined' ? localStorage.getItem('lenderId') : null
      if (!lenderId) {
        console.warn('No lenderId found in localStorage — cannot fetch compliance data')
        setStats({ loans: 0, borrowers: 0, payments: 0, period: new Date().toLocaleDateString('en-NA', { month: 'long', year: 'numeric' }) })
        setLoading(false)
        return
      }
      const loanQ = supabase.from('loans').select('id').eq('lender_id', lenderId)
      const borrowerQ = supabase.from('borrowers').select('id').eq('lender_id', lenderId)
      const payQ = supabase.from('payments').select('id').eq('lender_id', lenderId)
      const [{ data: loans }, { data: borrowers }, { data: payments }] = await Promise.all([loanQ, borrowerQ, payQ])
      setStats({
        loans: loans?.length || 0,
        borrowers: borrowers?.length || 0,
        payments: payments?.length || 0,
        period: new Date().toLocaleDateString('en-NA', { month: 'long', year: 'numeric' }),
      })
    } catch (err) { console.error('Compliance fetch error:', err) }
    setLoading(false)
  }

  const exportReport = async (type: string) => {
    setLoading(true)
    try {
      const lenderId = typeof window !== 'undefined' ? localStorage.getItem('lenderId') : null
      let data: any[] = []
      let filename = ''

      if (type === 'loans') {
        let q = supabase.from('loans').select('loan_number, status, principal_amount, outstanding_balance, created_at')
        if (lenderId) q = q.eq('lender_id', lenderId)
        const { data: loans } = await q
        data = loans || []
        filename = `loans_export_${new Date().toISOString().slice(0, 10)}.csv`
      } else if (type === 'borrowers') {
        let q = supabase.from('borrowers').select('first_name, last_name, id_number, email, phone, risk_level, credit_score, status, created_at')
        if (lenderId) q = q.eq('lender_id', lenderId)
        const { data: borrowers } = await q
        data = borrowers || []
        filename = `borrowers_export_${new Date().toISOString().slice(0, 10)}.csv`
      } else if (type === 'payments') {
        let q = supabase.from('payments').select('amount, payment_method, payment_date, status, notes, created_at')
        if (lenderId) q = q.eq('lender_id', lenderId)
        const { data: payments } = await q
        data = payments || []
        filename = `payments_export_${new Date().toISOString().slice(0, 10)}.csv`
      }

      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',')
        const rows = data.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(',')).join('\n')
        const csv = `${headers}\n${rows}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        setExported(type)
        setTimeout(() => setExported(null), 3000)
      }
    } catch (err) { console.error('Export error:', err) }
    setLoading(false)
  }

  const exports = [
    { key: 'loans', label: 'Loan Portfolio Export', desc: `${stats.loans} loan records`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'borrowers', label: 'Borrower Register Export', desc: `${stats.borrowers} borrower records`, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { key: 'payments', label: 'Payment History Export', desc: `${stats.payments} payment records`, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Compliance Exports</h2>
        <p className="text-neutral-500 text-sm">Export data for NAMFISA compliance and internal audits</p>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-teal-900">NAMFISA Compliance</p>
          <p className="text-xs text-teal-700 mt-0.5">All exports are in CSV format as required for NAMFISA quarterly submissions. Ensure you review and validate the data before submitting to regulators. Current period: <span className="font-semibold">{stats.period}</span>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exports.map(exp => (
          <div key={exp.key} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${exp.bg}`}><exp.icon className={`w-5 h-5 ${exp.color}`} /></div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{exp.label}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{exp.desc}</p>
              </div>
            </div>
            <button
              onClick={() => exportReport(exp.key)}
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${exported === exp.key ? 'bg-green-100 text-green-700' : 'bg-neutral-900 hover:bg-neutral-800 text-white'} disabled:opacity-50`}
            >
              {exported === exp.key ? (
                <><CheckCircle className="w-4 h-4" /> Exported!</>
              ) : (
                <><Download className="w-4 h-4" /> Export CSV</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-neutral-500" /> Compliance Checklist</h3>
        <div className="space-y-3">
          {[
            { task: 'Verify all active loans have signed loan agreements', done: true },
            { task: 'Ensure all borrowers have verified ID documents on file', done: false },
            { task: 'Submit quarterly NAMFISA report', done: false },
            { task: 'Review and update NAMFISA license renewal status', done: true },
            { task: 'Confirm all loan officers have valid certifications', done: true },
            { task: 'Audit interest rates comply with NAMFISA caps', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${item.done ? 'bg-green-500' : 'border-2 border-neutral-300'}`}>
                {item.done && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <p className={`text-xs ${item.done ? 'text-neutral-500 line-through' : 'text-neutral-800 font-medium'}`}>{item.task}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
