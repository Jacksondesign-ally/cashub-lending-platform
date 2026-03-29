"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, User, DollarSign, Calendar, FileText, CheckCircle,
  XCircle, Clock, AlertCircle, Edit, Shield, Phone, Mail, Briefcase,
  CreditCard, Home, ThumbsUp, ThumbsDown, MessageSquare, Download,
  Send, Eye
} from 'lucide-react'

interface LoanDetail {
  id: string
  loan_number: string
  principal_amount: number
  interest_rate: number
  outstanding_balance: number
  status: string
  application_date: string
  purpose?: string
  term_months?: number
  monthly_payment?: number
  borrower?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    id_number?: string
    employer_name?: string
    job_title?: string
    monthly_income?: number
    city?: string
    risk_level?: string
    credit_score?: number
  }
}


export default function LoanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loan, setLoan] = useState<LoanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'borrower' | 'documents' | 'history' | 'notes'>('overview')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [officerSignature, setOfficerSignature] = useState('')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<{ user: string; date: string; text: string }[]>([])

  useEffect(() => {
    loadLoan()
  }, [params.id])

  const loadLoan = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*, borrower:borrower_id(first_name, last_name, email, phone, id_number, employer_name, job_title, monthly_income, city, risk_level, credit_score)')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        setLoan(null)
      } else {
        setLoan(data as LoanDetail)
      }
    } catch {
      setLoan(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => {
    setShowApproveModal(false)
    if (loan) setLoan({ ...loan, status: 'approved' })
  }

  const handleDecline = () => {
    if (!declineReason) return
    setShowDeclineModal(false)
    if (loan) setLoan({ ...loan, status: 'declined' })
    setDeclineReason('')
  }

  const handleAddNote = () => {
    if (!note.trim()) return
    setNotes([{ user: 'You', date: new Date().toISOString().split('T')[0], text: note }, ...notes])
    setNote('')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      declined: 'bg-red-100 text-red-700 border-red-200',
      defaulted: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = { low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700' }
    return colors[risk] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Loan not found</p>
        <Link href="/dashboard/loans" className="text-cashub-600 text-sm mt-2 inline-block">← Back to Loans</Link>
      </div>
    )
  }

  const b = loan.borrower

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/loans" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900">{loan.loan_number}</h2>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusColor(loan.status)}`}>
                {loan.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-neutral-500">Applied {loan.application_date}</p>
          </div>
        </div>
        {(loan.status === 'pending' || loan.status === 'pending_review') && (
          <div className="flex gap-2">
            <button onClick={() => setShowDeclineModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" /> Decline
            </button>
            <button onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 mb-1">Principal Amount</p>
          <p className="text-xl font-bold text-neutral-900">N$ {loan.principal_amount?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 mb-1">Outstanding Balance</p>
          <p className="text-xl font-bold text-neutral-900">N$ {loan.outstanding_balance?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 mb-1">Monthly Payment</p>
          <p className="text-xl font-bold text-neutral-900">N$ {(loan.monthly_payment || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 mb-1">Interest Rate</p>
          <p className="text-xl font-bold text-neutral-900">{loan.interest_rate}%</p>
          <p className="text-[10px] text-neutral-500">{loan.term_months || 12} months</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200 px-5">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview' as const, label: 'Overview', icon: Eye },
              { id: 'borrower' as const, label: 'Borrower Profile', icon: User },
              { id: 'documents' as const, label: 'Documents', icon: FileText },
              { id: 'history' as const, label: 'History', icon: Clock },
              { id: 'notes' as const, label: 'Notes', icon: MessageSquare },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'border-cashub-600 text-cashub-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Loan Details</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Purpose', value: loan.purpose || 'Not specified' },
                    { label: 'Term', value: `${loan.term_months || 12} months` },
                    { label: 'Interest Rate', value: `${loan.interest_rate}%` },
                    { label: 'Admin Fee (1.03%)', value: `N$ ${(loan.principal_amount * 0.0103).toFixed(2)}` },
                    { label: 'NAMFISA Levy', value: 'N$ 5.00' },
                    { label: 'Total Repayment', value: `N$ ${(loan.principal_amount + loan.principal_amount * (loan.interest_rate / 100) + loan.principal_amount * 0.0103 + 5).toLocaleString()}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-neutral-100 last:border-0">
                      <span className="text-sm text-neutral-500">{item.label}</span>
                      <span className="text-sm font-medium text-neutral-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2"><User className="w-4 h-4" /> Borrower Summary</h3>
                {b ? (
                  <div className="space-y-2">
                    {[
                      { label: 'Name', value: `${b.first_name} ${b.last_name}` },
                      { label: 'Email', value: b.email },
                      { label: 'Phone', value: b.phone || 'N/A' },
                      { label: 'Employer', value: b.employer_name || 'N/A' },
                      { label: 'Monthly Income', value: b.monthly_income ? `N$ ${b.monthly_income.toLocaleString()}` : 'N/A' },
                      { label: 'Risk Level', value: b.risk_level?.toUpperCase() || 'N/A' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-neutral-100 last:border-0">
                        <span className="text-sm text-neutral-500">{item.label}</span>
                        <span className="text-sm font-medium text-neutral-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">No borrower data available</p>
                )}
              </div>
            </div>
          )}

          {/* Borrower Profile */}
          {activeTab === 'borrower' && b && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Personal Info</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Full Name', value: `${b.first_name} ${b.last_name}` },
                    { label: 'ID Number', value: b.id_number || 'N/A' },
                    { label: 'Email', value: b.email },
                    { label: 'Phone', value: b.phone || 'N/A' },
                    { label: 'City', value: b.city || 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between"><span className="text-neutral-500">{item.label}</span><span className="font-medium text-neutral-900">{item.value}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Employment</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Employer', value: b.employer_name || 'N/A' },
                    { label: 'Job Title', value: b.job_title || 'N/A' },
                    { label: 'Monthly Income', value: b.monthly_income ? `N$ ${b.monthly_income.toLocaleString()}` : 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between"><span className="text-neutral-500">{item.label}</span><span className="font-medium text-neutral-900">{item.value}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Risk Assessment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500">Credit Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-neutral-900">{b.credit_score || 'N/A'}</span>
                      {b.credit_score && (
                        <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${(b.credit_score || 0) >= 70 ? 'bg-green-500' : (b.credit_score || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${b.credit_score}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500">Risk Level</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRiskColor(b.risk_level || 'unknown')}`}>
                      {(b.risk_level || 'unknown').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {[
                { name: 'ID Copy', status: 'verified', date: '2024-01-15' },
                { name: 'Payslip (Latest)', status: 'verified', date: '2024-01-15' },
                { name: 'Bank Statement (3 months)', status: 'verified', date: '2024-01-15' },
                { name: 'Proof of Residence', status: 'verified', date: '2024-01-15' },
                { name: 'Employment Letter', status: 'pending', date: '2024-01-16' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{doc.name}</p>
                      <p className="text-xs text-neutral-500">Uploaded {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{doc.status}</span>
                    <button className="text-neutral-400 hover:text-cashub-600"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="space-y-0">
              {[
                { type: 'review', date: '2024-01-16 15:00', text: 'Loan officer review completed' },
                { type: 'signature', date: '2024-01-16 14:20', text: 'Agreement signed by borrower' },
                { type: 'docs', date: '2024-01-15 10:30', text: 'All required documents uploaded' },
                { type: 'application', date: '2024-01-15 09:00', text: 'Loan application submitted' },
              ].map((event, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === 'review' ? 'bg-blue-100' : event.type === 'signature' ? 'bg-green-100' : 'bg-neutral-100'
                    }`}>
                      {event.type === 'review' ? <Eye className="w-4 h-4 text-blue-600" /> :
                       event.type === 'signature' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       <Clock className="w-4 h-4 text-neutral-500" />}
                    </div>
                    {i < 3 && <div className="w-0.5 flex-1 bg-neutral-200 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-neutral-900">{event.text}</p>
                    <p className="text-xs text-neutral-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                <button onClick={handleAddNote} className="px-4 py-2 bg-cashub-600 text-white rounded-lg text-sm font-medium hover:bg-cashub-700">
                  Add Note
                </button>
              </div>
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <div key={i} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-900">{n.user}</span>
                      <span className="text-[10px] text-neutral-500">{n.date}</span>
                    </div>
                    <p className="text-sm text-neutral-700">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ThumbsUp className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Approve Loan</h2>
              <p className="text-xs text-neutral-500">Are you sure you want to approve {loan.loan_number}?</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Borrower:</span><span className="font-medium">{b?.first_name} {b?.last_name}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Amount:</span><span className="font-bold text-green-700">N$ {loan.principal_amount?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Interest Rate:</span><span className="font-medium">{loan.interest_rate}%</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Term:</span><span className="font-medium">{loan.term_months || 12} months</span></div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-neutral-700 mb-1">Officer Signature <span className="text-red-500">*</span></label>
              <input type="text" value={officerSignature} onChange={e => setOfficerSignature(e.target.value)}
                placeholder="Type your full name to sign"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              <p className="text-[10px] text-neutral-400 mt-1">By typing your name, you digitally sign this approval</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowApproveModal(false); setOfficerSignature('') }} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={() => { handleApprove(); setOfficerSignature('') }} disabled={!officerSignature.trim()} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">Approve & Sign</button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ThumbsDown className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Decline Loan</h2>
              <p className="text-xs text-neutral-500">Please provide a reason for declining</p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-neutral-700 mb-1">Decline Reason</label>
              <select value={declineReason.startsWith('Other:') ? 'other' : declineReason} onChange={e => setDeclineReason(e.target.value === 'other' ? 'Other: ' : e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white mb-2">
                <option value="">Select a reason...</option>
                <option value="Insufficient income">Insufficient income</option>
                <option value="Poor credit history">Poor credit history</option>
                <option value="Incomplete documentation">Incomplete documentation</option>
                <option value="High existing debt">High existing debt</option>
                <option value="Blacklisted borrower">Blacklisted borrower</option>
                <option value="Failed verification">Failed verification</option>
                <option value="other">Other</option>
              </select>
            </div>
            <textarea value={declineReason.startsWith('Other:') ? declineReason.slice(7) : ''} 
              onChange={e => setDeclineReason('Other: ' + e.target.value)} rows={2} placeholder="Additional details..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowDeclineModal(false)} className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleDecline} disabled={!declineReason} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
