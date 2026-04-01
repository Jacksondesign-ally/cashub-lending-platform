"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  FileText, CheckCircle, Clock, Download, Send, 
  BarChart3, RefreshCw, Upload, AlertTriangle, 
  FileCheck, Building2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LenderOption { id: string; legal_name: string; registration_number: string; namfisa_license?: string }

// Part D3: Income/Revenue - Other Income (micro-lender relevant fields)
interface PartD3 {
  bad_debts_recovered: string
  other_recoveries: string
  default_interest: string
  interest_on_loans_micro: string
  sub_total_d3: string
  grand_total_d: string
}

// Part 1.1: Current Liabilities
interface Part11 {
  staff_costs: string
  external_audit_fees: string
  internal_audit_fees: string
  namfisa_levy: string
  namfisa_penalties: string
  consulting_fees: string
  withholding_tax_liability: string
  sundry_creditors: string
  dividends_payable: string
  accrued_expenses: string
  other_current_loans: string
  subtotal: string
}

// Part 14: MicroLending Additional Financial Information
interface Part14 {
  loan_book_opening: string
  disbursement_1mo: string
  disbursement_2mo: string
  disbursement_3mo: string
  disbursement_4mo: string
  disbursement_5mo: string
  disbursement_6mo: string
  disbursement_12mo: string
  disbursement_24mo: string
  disbursement_36mo: string
  disbursement_48mo: string
  disbursement_60mo: string
  fees_namfisa_levies: string
  fees_stamp_duties: string
  fees_insurance: string
  fees_other: string
  interest_charged_end_quarter: string
  repayment_payroll: string
  repayment_debit_orders: string
  repayment_cash: string
  repayment_other: string
  bad_debts_opening: string
  loans_written_off: string
  bad_debts_provision: string
  bad_debts_closing: string
  loans_rescheduled: string
  book_end_current: string
  arrears_30_60: string
  arrears_60_90: string
  arrears_90_120: string
  arrears_120_plus: string
  loan_book_closing: string
}

// Part 15: Gender breakdown
interface Part15 {
  male_1_10k: string; female_1_10k: string
  male_10_20k: string; female_10_20k: string
  male_20_30k: string; female_20_30k: string
  male_30_40k: string; female_30_40k: string
  male_40_50k: string; female_40_50k: string
  male_50k_plus: string; female_50k_plus: string
  male_salary_1_10k: string; female_salary_1_10k: string
  male_salary_10_20k: string; female_salary_10_20k: string
  male_salary_20_30k: string; female_salary_20_30k: string
  male_salary_30_40k: string; female_salary_30_40k: string
  male_salary_40_50k: string; female_salary_40_50k: string
  male_salary_50k_plus: string; female_salary_50k_plus: string
}

// Declaration
interface Declaration {
  signatory_name: string
  capacity: string
  signature_url: string
  signed_date: string
  attachment_url: string
}

interface NamfisaReportRow {
  id: string
  lender_id: string
  report_period?: string
  reporting_period?: string
  status: string
  submitted_at?: string
  notes?: string
  created_at: string
  lenders?: { legal_name: string; registration_number: string; namfisa_license?: string }
}

type Section = 'sci' | 'sfp' | 'afi' | 'declaration'

// ─── Helper ───────────────────────────────────────────────────────────────────

function n(v: string) { return parseFloat(v) || 0 }

function Field({ label, value, onChange, required, readOnly, wide }: {
  label: string; value: string; onChange?: (v: string) => void
  required?: boolean; readOnly?: boolean; wide?: boolean
}) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-neutral-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="number"
        step="0.01"
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 outline-none ${
          readOnly ? 'bg-neutral-100 border-neutral-200 font-semibold text-neutral-700' : 'border-neutral-300'
        }`}
        placeholder="0"
      />
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-2 mb-4">
      <p className="text-sm font-bold text-neutral-800">{title}</p>
      {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
  const [activeSection, setActiveSection] = useState<Section>('sci')
  const [reports, setReports] = useState<NamfisaReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [lenderOptions, setLenderOptions] = useState<LenderOption[]>([])
  const [selectedLenderId, setSelectedLenderId] = useState('')
  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [reportQuarter, setReportQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3))
  const fileRef = useRef<HTMLInputElement>(null)

  const [partD3, setPartD3] = useState<PartD3>({
    bad_debts_recovered: '', other_recoveries: '', default_interest: '',
    interest_on_loans_micro: '', sub_total_d3: '', grand_total_d: ''
  })

  const [part11, setPart11] = useState<Part11>({
    staff_costs: '', external_audit_fees: '', internal_audit_fees: '',
    namfisa_levy: '', namfisa_penalties: '', consulting_fees: '',
    withholding_tax_liability: '', sundry_creditors: '', dividends_payable: '',
    accrued_expenses: '', other_current_loans: '', subtotal: ''
  })

  const [part14, setPart14] = useState<Part14>({
    loan_book_opening: '', disbursement_1mo: '', disbursement_2mo: '',
    disbursement_3mo: '', disbursement_4mo: '', disbursement_5mo: '',
    disbursement_6mo: '', disbursement_12mo: '', disbursement_24mo: '',
    disbursement_36mo: '', disbursement_48mo: '', disbursement_60mo: '',
    fees_namfisa_levies: '', fees_stamp_duties: '', fees_insurance: '', fees_other: '',
    interest_charged_end_quarter: '',
    repayment_payroll: '', repayment_debit_orders: '', repayment_cash: '', repayment_other: '',
    bad_debts_opening: '', loans_written_off: '', bad_debts_provision: '', bad_debts_closing: '',
    loans_rescheduled: '', book_end_current: '', arrears_30_60: '', arrears_60_90: '',
    arrears_90_120: '', arrears_120_plus: '', loan_book_closing: ''
  })

  const [part15, setPart15] = useState<Part15>({
    male_1_10k: '', female_1_10k: '', male_10_20k: '', female_10_20k: '',
    male_20_30k: '', female_20_30k: '', male_30_40k: '', female_30_40k: '',
    male_40_50k: '', female_40_50k: '', male_50k_plus: '', female_50k_plus: '',
    male_salary_1_10k: '', female_salary_1_10k: '', male_salary_10_20k: '', female_salary_10_20k: '',
    male_salary_20_30k: '', female_salary_20_30k: '', male_salary_30_40k: '', female_salary_30_40k: '',
    male_salary_40_50k: '', female_salary_40_50k: '', male_salary_50k_plus: '', female_salary_50k_plus: ''
  })

  const [decl, setDecl] = useState<Declaration>({
    signatory_name: '', capacity: '', signature_url: '', signed_date: '', attachment_url: ''
  })

  useEffect(() => { loadData() }, [])

  // Auto-calculate derived totals
  useEffect(() => {
    const sub = n(partD3.bad_debts_recovered) + n(partD3.other_recoveries) + n(partD3.default_interest) + n(partD3.interest_on_loans_micro)
    setPartD3(p => ({ ...p, sub_total_d3: sub.toFixed(2) }))
  }, [partD3.bad_debts_recovered, partD3.other_recoveries, partD3.default_interest, partD3.interest_on_loans_micro])

  useEffect(() => {
    const sub = n(part11.staff_costs) + n(part11.external_audit_fees) + n(part11.internal_audit_fees) +
      n(part11.namfisa_levy) + n(part11.namfisa_penalties) + n(part11.consulting_fees) +
      n(part11.withholding_tax_liability) + n(part11.sundry_creditors) + n(part11.dividends_payable) +
      n(part11.accrued_expenses) + n(part11.other_current_loans)
    setPart11(p => ({ ...p, subtotal: sub.toFixed(2) }))
  }, [part11.staff_costs, part11.external_audit_fees, part11.internal_audit_fees, part11.namfisa_levy,
      part11.namfisa_penalties, part11.consulting_fees, part11.withholding_tax_liability,
      part11.sundry_creditors, part11.dividends_payable, part11.accrued_expenses, part11.other_current_loans])

  useEffect(() => {
    const closing = n(part14.book_end_current) + n(part14.arrears_30_60) + n(part14.arrears_60_90) + n(part14.arrears_90_120) + n(part14.arrears_120_plus)
    const badClose = n(part14.bad_debts_opening) - n(part14.loans_written_off) + n(part14.bad_debts_provision)
    setPart14(p => ({ ...p, loan_book_closing: closing.toFixed(2), bad_debts_closing: badClose.toFixed(2) }))
  }, [part14.book_end_current, part14.arrears_30_60, part14.arrears_60_90, part14.arrears_90_120, part14.arrears_120_plus,
      part14.bad_debts_opening, part14.loans_written_off, part14.bad_debts_provision])

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data: lendersData }, { data: reportsData }] = await Promise.all([
        supabase.from('lenders').select('id, legal_name, registration_number, namfisa_license').order('legal_name'),
        supabase.from('namfisa_reports').select('*, lenders(legal_name, registration_number, namfisa_license)').order('created_at', { ascending: false })
      ])
      setLenderOptions(lendersData || [])
      setReports(reportsData || [])

      // Auto-populate Part 14 from system data
      if (lendersData && lendersData.length > 0) {
        const { data: loans } = await supabase.from('loans').select('principal_amount, term_months, status').order('created_at')
        if (loans) {
          const active = loans.filter(l => ['active', 'disbursed'].includes(l.status))
          const defaulted = loans.filter(l => l.status === 'defaulted')
          const bookValue = active.reduce((s, l) => s + (l.principal_amount || 0), 0)
          const byTerm = (mo: number) => loans.filter(l => l.term_months === mo).reduce((s, l) => s + (l.principal_amount || 0), 0)
          setPart14(p => ({
            ...p,
            loan_book_opening: bookValue.toFixed(2),
            disbursement_1mo: byTerm(1).toFixed(2),
            disbursement_2mo: byTerm(2).toFixed(2),
            disbursement_3mo: byTerm(3).toFixed(2),
            disbursement_4mo: byTerm(4).toFixed(2),
            disbursement_5mo: byTerm(5).toFixed(2),
            disbursement_6mo: byTerm(6).toFixed(2),
            disbursement_12mo: byTerm(12).toFixed(2),
            disbursement_24mo: byTerm(24).toFixed(2),
            disbursement_36mo: byTerm(36).toFixed(2),
            disbursement_48mo: byTerm(48).toFixed(2),
            disbursement_60mo: byTerm(60).toFixed(2),
            book_end_current: active.reduce((s, l) => s + (l.principal_amount || 0), 0).toFixed(2),
            bad_debts_opening: defaulted.reduce((s, l) => s + (l.principal_amount || 0), 0).toFixed(2),
          }))
        }
      }
    } catch (err) {
      console.error('loadData error:', err)
    }
    setLoading(false)
  }

  const handleAttachmentUpload = async (file: File) => {
    const path = `namfisa-attachments/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('lender-docs').upload(path, file)
    if (error) return ''
    const { data } = supabase.storage.from('lender-docs').getPublicUrl(path)
    return data.publicUrl
  }

  const saveDraft = async () => {
    if (!selectedLenderId) { setSaveMsg('Please select a lender first.'); return }
    setSaving(true); setSaveMsg('')
    try {
      const period = `${reportYear}-Q${reportQuarter}`
      const payload = {
        lender_id: selectedLenderId,
        report_type: 'quarterly',
        report_period: period,
        status: 'draft',
        notes: JSON.stringify({ partD3, part11, part14, part15, decl }),
      }
      const { error } = await supabase.from('namfisa_reports').insert(payload)
      if (error) throw error
      setSaveMsg('Draft saved successfully.')
      await loadData()
    } catch (e: any) {
      setSaveMsg(`Save failed: ${e.message}`)
    }
    setSaving(false)
  }

  const submitReport = async () => {
    if (!selectedLenderId) { setSaveMsg('Please select a lender first.'); return }
    if (!decl.signatory_name) { setSaveMsg('Signatory name is required on the Declaration tab.'); return }
    setSaving(true); setSaveMsg('')
    try {
      const period = `${reportYear}-Q${reportQuarter}`
      const payload = {
        lender_id: selectedLenderId,
        report_type: 'quarterly',
        report_period: period,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        due_date: new Date(reportYear, reportQuarter * 3, 0).toISOString().split('T')[0],
        notes: JSON.stringify({ partD3, part11, part14, part15, decl }),
      }
      const { error } = await supabase.from('namfisa_reports').insert(payload)
      if (error) throw error
      setSaveMsg('Report submitted to NAMFISA successfully!')
      await loadData()
      setActiveTab('history')
    } catch (e: any) {
      setSaveMsg(`Submission failed: ${e.message}`)
    }
    setSaving(false)
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      draft: 'bg-neutral-100 text-neutral-700',
      submitted: 'bg-blue-50 text-blue-700',
      under_review: 'bg-yellow-50 text-yellow-700',
      approved: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-700',
    }
    return map[s] || 'bg-neutral-100 text-neutral-600'
  }

  const selectedLender = lenderOptions.find(l => l.id === selectedLenderId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">NAMFISA Compliance</h1>
          <p className="text-neutral-500 text-sm">Quarterly Return – COA Submission Pack · MicroLending</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'submit' ? 'bg-cashub-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
            <Send className="w-4 h-4 inline mr-1.5" />New Report
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-cashub-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
            <BarChart3 className="w-4 h-4 inline mr-1.5" />History ({reports.length})
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Submitted', value: reports.filter(r => r.status === 'submitted').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Drafts', value: reports.filter(r => r.status === 'draft').length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Lenders', value: lenderOptions.length, icon: Building2, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-neutral-500">{s.label}</p><p className="text-xl font-bold text-neutral-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* ── SUBMIT TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          {/* Report header / lender + period selector */}
          <div className="p-6 border-b border-neutral-100 bg-neutral-50 rounded-t-xl">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Report Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Institution <span className="text-red-500">*</span></label>
                <select value={selectedLenderId} onChange={e => setSelectedLenderId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                  <option value="">Select lender…</option>
                  {lenderOptions.map(l => <option key={l.id} value={l.id}>{l.legal_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Report Year</label>
                <input type="number" min={2020} max={2035} value={reportYear}
                  onChange={e => setReportYear(+e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Quarter</label>
                <select value={reportQuarter} onChange={e => setReportQuarter(+e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
                  <option value={1}>Q1 – January to March</option>
                  <option value={2}>Q2 – April to June</option>
                  <option value={3}>Q3 – July to September</option>
                  <option value={4}>Q4 – October to December</option>
                </select>
              </div>
            </div>
            {selectedLender && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
                <span><span className="font-medium text-neutral-700">Company:</span> {selectedLender.legal_name}</span>
                <span><span className="font-medium text-neutral-700">License:</span> {selectedLender.namfisa_license || selectedLender.registration_number}</span>
                <span><span className="font-medium text-neutral-700">Reporting Period:</span> {reportYear}-Q{reportQuarter}</span>
              </div>
            )}
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-neutral-200 overflow-x-auto">
            {([
              { id: 'sci', label: 'SCI – Part D3', sub: 'Income / Revenue' },
              { id: 'sfp', label: 'SFP – Part 1.1', sub: 'Current Liabilities' },
              { id: 'afi', label: 'AFI – Parts 14 & 15', sub: 'Additional Financial Info' },
              { id: 'declaration', label: 'Declaration', sub: 'DEC' },
            ] as { id: Section; label: string; sub: string }[]).map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                className={`flex-shrink-0 px-5 py-3 text-left border-b-2 transition-colors ${
                  activeSection === tab.id ? 'border-cashub-600 bg-cashub-50' : 'border-transparent hover:bg-neutral-50'
                }`}>
                <p className={`text-xs font-semibold ${activeSection === tab.id ? 'text-cashub-700' : 'text-neutral-700'}`}>{tab.label}</p>
                <p className="text-[10px] text-neutral-400">{tab.sub}</p>
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── SCI Part D3 ──────────────────────────────────────────────────── */}
            {activeSection === 'sci' && (
              <div>
                <SectionHeader title="Quarterly Return – SCI | Part D3: Other Income (MicroLending)" subtitle="Amount in N$'000 · Fields marked * are required by NAMFISA" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Bad Debts Recovered" required value={partD3.bad_debts_recovered} onChange={v => setPartD3(p => ({ ...p, bad_debts_recovered: v }))} />
                  <Field label="Other Recoveries" required value={partD3.other_recoveries} onChange={v => setPartD3(p => ({ ...p, other_recoveries: v }))} />
                  <Field label="Default Interest" required value={partD3.default_interest} onChange={v => setPartD3(p => ({ ...p, default_interest: v }))} />
                  <Field label="Interest on Loans and Advances – Micro Lenders" required value={partD3.interest_on_loans_micro} onChange={v => setPartD3(p => ({ ...p, interest_on_loans_micro: v }))} />
                  <Field label="Sub-total (Other Income – Part D3)" readOnly value={partD3.sub_total_d3} />
                  <Field label="Grand Total – Part D (enter if known)" value={partD3.grand_total_d} onChange={v => setPartD3(p => ({ ...p, grand_total_d: v }))} />
                </div>
              </div>
            )}

            {/* ── SFP Part 1.1 ─────────────────────────────────────────────────── */}
            {activeSection === 'sfp' && (
              <div>
                <SectionHeader title="Quarterly Return – SFP | Part 1.1: Current Liabilities" subtitle="Amount in N$'000 · Fields marked * are required by NAMFISA" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Staff Costs" required value={part11.staff_costs} onChange={v => setPart11(p => ({ ...p, staff_costs: v }))} />
                  <Field label="External Audit Fees" required value={part11.external_audit_fees} onChange={v => setPart11(p => ({ ...p, external_audit_fees: v }))} />
                  <Field label="Internal Audit Fees" required value={part11.internal_audit_fees} onChange={v => setPart11(p => ({ ...p, internal_audit_fees: v }))} />
                  <Field label="NAMFISA Levy" required value={part11.namfisa_levy} onChange={v => setPart11(p => ({ ...p, namfisa_levy: v }))} />
                  <Field label="NAMFISA Penalties" required value={part11.namfisa_penalties} onChange={v => setPart11(p => ({ ...p, namfisa_penalties: v }))} />
                  <Field label="Consulting Fees" required value={part11.consulting_fees} onChange={v => setPart11(p => ({ ...p, consulting_fees: v }))} />
                  <Field label="Withholding Tax Liability" required value={part11.withholding_tax_liability} onChange={v => setPart11(p => ({ ...p, withholding_tax_liability: v }))} />
                  <Field label="Sundry Creditors / Suppliers" required value={part11.sundry_creditors} onChange={v => setPart11(p => ({ ...p, sundry_creditors: v }))} />
                  <Field label="Dividends Payable" required value={part11.dividends_payable} onChange={v => setPart11(p => ({ ...p, dividends_payable: v }))} />
                  <Field label="Accrued Expenses" required value={part11.accrued_expenses} onChange={v => setPart11(p => ({ ...p, accrued_expenses: v }))} />
                  <Field label="Other Current Loans" required value={part11.other_current_loans} onChange={v => setPart11(p => ({ ...p, other_current_loans: v }))} />
                  <Field label="Subtotal – Current Liabilities" readOnly value={part11.subtotal} />
                </div>
              </div>
            )}

            {/* ── AFI Parts 14 & 15 ──────────────────────────────────────────── */}
            {activeSection === 'afi' && (
              <div className="space-y-8">
                {/* Part 14 */}
                <div>
                  <SectionHeader title="Additional Financial Information – Part 14: MicroLending" subtitle="Amount in N$'000" />

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-4 mb-2">Loan Book</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Total Value of Loan Book – Beginning of Reporting Period" value={part14.loan_book_opening} onChange={v => setPart14(p => ({ ...p, loan_book_opening: v }))} />
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-5 mb-2">Loan Disbursement Breakdown (by length of period)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: '1 Month', key: 'disbursement_1mo' },
                      { label: '2 Months', key: 'disbursement_2mo' },
                      { label: '3 Months', key: 'disbursement_3mo' },
                      { label: '4 Months', key: 'disbursement_4mo' },
                      { label: '5 Months', key: 'disbursement_5mo' },
                      { label: '6 Months', key: 'disbursement_6mo' },
                      { label: '12 Months', key: 'disbursement_12mo' },
                      { label: '24 Months', key: 'disbursement_24mo' },
                      { label: '36 Months', key: 'disbursement_36mo' },
                      { label: '48 Months', key: 'disbursement_48mo' },
                      { label: '60 Months', key: 'disbursement_60mo' },
                    ].map(({ label, key }) => (
                      <Field key={key} required label={`Disbursement – ${label}`}
                        value={(part14 as any)[key]}
                        onChange={v => setPart14(p => ({ ...p, [key]: v }))} />
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-5 mb-2">Other Fees Charged to Borrowers During the Quarter</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="NAMFISA Levies" required value={part14.fees_namfisa_levies} onChange={v => setPart14(p => ({ ...p, fees_namfisa_levies: v }))} />
                    <Field label="Stamp Duties" required value={part14.fees_stamp_duties} onChange={v => setPart14(p => ({ ...p, fees_stamp_duties: v }))} />
                    <Field label="Insurance" required value={part14.fees_insurance} onChange={v => setPart14(p => ({ ...p, fees_insurance: v }))} />
                    <Field label="Other Fee's" required value={part14.fees_other} onChange={v => setPart14(p => ({ ...p, fees_other: v }))} />
                    <Field label="Interest Charged on Loans Outstanding at End of Quarter" required value={part14.interest_charged_end_quarter} onChange={v => setPart14(p => ({ ...p, interest_charged_end_quarter: v }))} wide />
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-5 mb-2">Total Value of Repayments Received in Reporting Period</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Repayment by Payroll Deduction" required value={part14.repayment_payroll} onChange={v => setPart14(p => ({ ...p, repayment_payroll: v }))} />
                    <Field label="Repayment by Debit Orders" required value={part14.repayment_debit_orders} onChange={v => setPart14(p => ({ ...p, repayment_debit_orders: v }))} />
                    <Field label="Repayment by Cash Collection" required value={part14.repayment_cash} onChange={v => setPart14(p => ({ ...p, repayment_cash: v }))} />
                    <Field label="Other Repayment Method" required value={part14.repayment_other} onChange={v => setPart14(p => ({ ...p, repayment_other: v }))} />
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-5 mb-2">Movement in Provision for Bad Debts</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Provision for Bad Debts – Beginning of Period" required value={part14.bad_debts_opening} onChange={v => setPart14(p => ({ ...p, bad_debts_opening: v }))} />
                    <Field label="Loans Written-Off During the Period" required value={part14.loans_written_off} onChange={v => setPart14(p => ({ ...p, loans_written_off: v }))} />
                    <Field label="Provision for Bad Debts During the Period" required value={part14.bad_debts_provision} onChange={v => setPart14(p => ({ ...p, bad_debts_provision: v }))} />
                    <Field label="Provision for Bad Debts – End of Period (auto)" readOnly value={part14.bad_debts_closing} />
                    <Field label="Value of Loans Rescheduled During the Period" required value={part14.loans_rescheduled} onChange={v => setPart14(p => ({ ...p, loans_rescheduled: v }))} />
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-5 mb-2">Total Value of Loan Book – End of Reporting Period</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Current" required value={part14.book_end_current} onChange={v => setPart14(p => ({ ...p, book_end_current: v }))} />
                    <Field label="Loans in Arrears 30–60 Days" required value={part14.arrears_30_60} onChange={v => setPart14(p => ({ ...p, arrears_30_60: v }))} />
                    <Field label="Loans in Arrears 60–90 Days" required value={part14.arrears_60_90} onChange={v => setPart14(p => ({ ...p, arrears_60_90: v }))} />
                    <Field label="Loans in Arrears 90–120 Days" required value={part14.arrears_90_120} onChange={v => setPart14(p => ({ ...p, arrears_90_120: v }))} />
                    <Field label="Loans in Arrears More than 120 Days" required value={part14.arrears_120_plus} onChange={v => setPart14(p => ({ ...p, arrears_120_plus: v }))} />
                    <Field label="Total Loan Book – End of Period (auto)" readOnly value={part14.loan_book_closing} />
                  </div>
                </div>

                {/* Part 15 */}
                <div>
                  <SectionHeader title="Additional Financial Information – Part 15: Loan Disbursement & Borrower Salaries by Gender" subtitle="Amount in N$ · Breakdown by loan size range" />

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-2 mb-3">Loan Disbursement by Gender (Total Value of Loans by Range N$)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="px-3 py-2 text-left font-semibold text-neutral-600">Gender</th>
                          {['N$1–10,000', 'N$10,001–20,000', 'N$20,001–30,000', 'N$30,001–40,000', 'N$40,001–50,000', 'More than N$50,001'].map(r => (
                            <th key={r} className="px-3 py-2 text-center font-semibold text-neutral-600">{r}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Male', keys: ['male_1_10k','male_10_20k','male_20_30k','male_30_40k','male_40_50k','male_50k_plus'] },
                          { label: 'Female', keys: ['female_1_10k','female_10_20k','female_20_30k','female_30_40k','female_40_50k','female_50k_plus'] },
                        ].map(row => (
                          <tr key={row.label} className="border-b border-neutral-100">
                            <td className="px-3 py-2 font-medium text-neutral-700">{row.label}</td>
                            {row.keys.map(k => (
                              <td key={k} className="px-2 py-1">
                                <input type="number" step="0.01" placeholder="0" value={(part15 as any)[k]}
                                  onChange={e => setPart15(p => ({ ...p, [k]: e.target.value }))}
                                  className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-cashub-500" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-5 mb-3">Borrower Salaries by Gender (Total Value of Gross Salaries N$)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="px-3 py-2 text-left font-semibold text-neutral-600">Borrowers</th>
                          {['N$1–10,000', 'N$10,001–20,000', 'N$20,001–30,000', 'N$30,001–40,000', 'N$40,001–50,000', 'More than N$50,001'].map(r => (
                            <th key={r} className="px-3 py-2 text-center font-semibold text-neutral-600">{r}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Male Borrowers', keys: ['male_salary_1_10k','male_salary_10_20k','male_salary_20_30k','male_salary_30_40k','male_salary_40_50k','male_salary_50k_plus'] },
                          { label: 'Female Borrowers', keys: ['female_salary_1_10k','female_salary_10_20k','female_salary_20_30k','female_salary_30_40k','female_salary_40_50k','female_salary_50k_plus'] },
                        ].map(row => (
                          <tr key={row.label} className="border-b border-neutral-100">
                            <td className="px-3 py-2 font-medium text-neutral-700">{row.label}</td>
                            {row.keys.map(k => (
                              <td key={k} className="px-2 py-1">
                                <input type="number" step="0.01" placeholder="0" value={(part15 as any)[k]}
                                  onChange={e => setPart15(p => ({ ...p, [k]: e.target.value }))}
                                  className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-cashub-500" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Declaration ──────────────────────────────────────────────────── */}
            {activeSection === 'declaration' && (
              <div>
                <SectionHeader title="Declaration – DEC" subtitle="By signing this document I guarantee that all the above information is true and accurate and can be relied on, and that I will disclose all necessary material information that may be required by the Registrar. I also confirm that I have completed the form based on NAMFISA standards." />
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5 text-xs text-blue-800">
                  SIGNED ON BEHALF OF THE BOARD OF DIRECTORS / MEMBERS / TRUSTEES
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Company Name</label>
                    <input type="text" readOnly value={selectedLender?.legal_name || ''}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Reporting Period</label>
                    <input type="text" readOnly value={`${reportYear}-Q${reportQuarter}`}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Name <span className="text-red-500">*</span></label>
                    <input type="text" value={decl.signatory_name}
                      onChange={e => setDecl(d => ({ ...d, signatory_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Capacity</label>
                    <input type="text" value={decl.capacity} placeholder="e.g. Director"
                      onChange={e => setDecl(d => ({ ...d, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Date</label>
                    <input type="date" value={decl.signed_date}
                      onChange={e => setDecl(d => ({ ...d, signed_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Attach Monthly Management Reports</label>
                    <div className="flex items-center gap-3">
                      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.xlsx,.xls,.doc,.docx"
                        onChange={async e => {
                          const f = e.target.files?.[0]; if (!f) return
                          const url = await handleAttachmentUpload(f)
                          setDecl(d => ({ ...d, attachment_url: url }))
                        }} />
                      <button onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                        <Upload className="w-4 h-4" />Choose File
                      </button>
                      {decl.attachment_url && (
                        <a href={decl.attachment_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-cashub-600 hover:underline flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />File uploaded
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-5 border-t border-neutral-100 bg-neutral-50 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            {saveMsg && (
              <p className={`text-sm font-medium ${saveMsg.includes('fail') || saveMsg.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMsg}
              </p>
            )}
            <div className="flex gap-3 ml-auto">
              <button onClick={saveDraft} disabled={saving || !selectedLenderId}
                className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> : null}Save Draft
              </button>
              <button onClick={submitReport} disabled={saving || !selectedLenderId}
                className="px-5 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Validate &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Submitted NAMFISA Reports</h2>
            <button onClick={loadData} className="text-xs text-cashub-600 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />Refresh
            </button>
          </div>
          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No reports submitted yet.</p>
              <button onClick={() => setActiveTab('submit')} className="mt-3 text-cashub-600 text-sm hover:underline">Submit your first report</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase text-neutral-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Report Period</th>
                  <th className="px-6 py-3 text-left">Institution</th>
                  <th className="px-6 py-3 text-left">Submitted</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-900">{r.reporting_period || r.report_period}</p>
                      <p className="text-xs text-neutral-500">Quarterly Return · MicroLending</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutral-900">{r.lenders?.legal_name || '—'}</p>
                      <p className="text-xs text-neutral-400">{r.lenders?.registration_number}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs text-cashub-600 hover:underline flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
