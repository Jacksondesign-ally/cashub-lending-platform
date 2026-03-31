"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DollarSign, CreditCard, Banknote, Wallet, CheckCircle, AlertCircle,
  Search, Calendar, User, Hash, FileText, Download, Send, Clock,
  TrendingUp, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react'

interface LoanRecord {
  id: string
  loanUuid: string
  borrower: string
  borrowerId: string
  phone: string
  loanAmount: number
  outstanding: number
  monthlyPayment: number
  dueDate: string
  status: 'active' | 'overdue' | 'completed'
  daysOverdue: number
}

interface PaymentRecord {
  id: string
  borrower: string
  loanId: string
  amount: number
  method: string
  date: string
  time: string
  status: 'completed' | 'pending' | 'failed'
}

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-100 text-green-600' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
  { id: 'mobile_money', name: 'Mobile Money', icon: Wallet, color: 'bg-purple-100 text-purple-600' },
  { id: 'check', name: 'Check', icon: FileText, color: 'bg-orange-100 text-orange-600' },
]


export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentData, setPaymentData] = useState({ amount: '', paymentDate: new Date().toISOString().split('T')[0], reference: '', notes: '' })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch active loans with borrower info
      const { data: loansData, error: loansErr } = await supabase
        .from('loans')
        .select('*, borrower:borrower_id(first_name, last_name, phone, id_number)')
        .in('status', ['active', 'approved', 'defaulted'])
        .order('created_at', { ascending: false })

      if (!loansErr && loansData && loansData.length > 0) {
        const mapped: LoanRecord[] = loansData.map((l: any) => {
          const outstanding = l.outstanding_balance ?? l.principal_amount
          const monthly = l.monthly_payment ?? Math.round(l.principal_amount / (l.term_months || 12))
          const due = l.end_date || l.start_date || '-'
          const overdue = l.status === 'defaulted' ? 30 : 0
          return {
            id: l.loan_number || l.id,
            loanUuid: l.id,
            borrower: l.borrower ? `${l.borrower.first_name} ${l.borrower.last_name}` : 'Unknown',
            borrowerId: l.borrower_id || '',
            phone: l.borrower?.phone || '',
            loanAmount: l.principal_amount,
            outstanding,
            monthlyPayment: monthly,
            dueDate: due,
            status: l.status === 'defaulted' ? 'overdue' as const : l.status === 'active' ? 'active' as const : 'active' as const,
            daysOverdue: overdue,
          }
        })
        setLoans(mapped)
      } else {
        setLoans([])
      }

      // Fetch recent payments
      const { data: paymentsData, error: paymentsErr } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!paymentsErr && paymentsData && paymentsData.length > 0) {
        const mapped: PaymentRecord[] = paymentsData.map((p: any) => ({
          id: p.payment_number || p.id,
          borrower: p.borrower_name || 'Unknown',
          loanId: p.loan_id || '',
          amount: p.amount,
          method: p.payment_method || 'Cash',
          date: p.payment_date || p.created_at?.split('T')[0] || '',
          time: p.created_at?.split('T')[1]?.slice(0, 5) || '',
          status: p.status || 'completed',
        }))
        setRecentPayments(mapped)
      } else {
        setRecentPayments([])
      }
    } catch {
      setLoans([])
      setRecentPayments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLoans = loans.filter(loan =>
    loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.borrowerId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLoanSelect = (loan: LoanRecord) => {
    setSelectedLoan(loan)
    setPaymentData({ ...paymentData, amount: loan.monthlyPayment.toString() })
    setPaymentMethod('')
  }

  const handleProcessPayment = () => {
    if (!selectedLoan || !paymentMethod || !paymentData.amount) return
    setShowConfirmation(true)
  }

  const confirmPayment = async () => {
    const methodName = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod
    const amount = parseFloat(paymentData.amount)

    // Try to insert into Supabase
    try {
      await supabase.from('payments').insert({
        loan_id: selectedLoan!.loanUuid,
        borrower_name: selectedLoan!.borrower,
        amount,
        payment_method: methodName,
        payment_date: paymentData.paymentDate,
        reference: paymentData.reference || null,
        notes: paymentData.notes || null,
        status: 'completed',
      })
    } catch { /* fallback to local state */ }

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-3)}`,
      borrower: selectedLoan!.borrower,
      loanId: selectedLoan!.id,
      amount,
      method: methodName,
      date: paymentData.paymentDate,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed'
    }
    setRecentPayments([newPayment, ...recentPayments])
    setSelectedLoan(null)
    setPaymentMethod('')
    setPaymentData({ amount: '', paymentDate: new Date().toISOString().split('T')[0], reference: '', notes: '' })
    setShowConfirmation(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalCollected = recentPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding, 0)
  const overdueCount = loans.filter(l => l.status === 'overdue').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Payment Processing</h2>
        <p className="text-neutral-500">Record and manage loan payments</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Payment processed successfully!</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Today&apos;s Collections</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">N$ {totalCollected.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Outstanding</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">N$ {totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Loans</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{loans.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg"><FileText className="w-5 h-5 text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Search & Select Loan */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-3">1. Select Loan</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" placeholder="Search by borrower name, loan ID..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredLoans.map(loan => (
                <div key={loan.id} onClick={() => handleLoanSelect(loan)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedLoan?.id === loan.id ? 'border-cashub-500 bg-cashub-50 ring-1 ring-cashub-500' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{loan.borrower}</p>
                      <p className="text-xs text-neutral-500">{loan.id} &bull; {loan.borrowerId}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-neutral-500">Outstanding</p><p className="font-semibold text-neutral-900">N$ {loan.outstanding.toLocaleString()}</p></div>
                    <div><p className="text-neutral-500">Monthly</p><p className="font-semibold text-neutral-900">N$ {loan.monthlyPayment.toLocaleString()}</p></div>
                    <div><p className="text-neutral-500">Due</p><p className="font-semibold text-neutral-900">{loan.dueDate}</p></div>
                  </div>
                  {loan.daysOverdue > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" /><span>{loan.daysOverdue} days overdue</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          {selectedLoan && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <h3 className="text-sm font-bold text-neutral-900 mb-3">2. Payment Method</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map(method => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === method.id ? 'border-cashub-600 bg-cashub-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                    <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-neutral-700">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Details */}
          {selectedLoan && paymentMethod && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <h3 className="text-sm font-bold text-neutral-900 mb-3">3. Payment Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Amount (N$) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input type="number" value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input type="date" value={paymentData.paymentDate} onChange={e => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Reference Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input type="text" value={paymentData.reference} onChange={e => setPaymentData({ ...paymentData, reference: e.target.value })}
                      placeholder="Receipt or transaction reference" className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Notes</label>
                  <textarea value={paymentData.notes} onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                    placeholder="Additional notes..." rows={2}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <button onClick={handleProcessPayment} disabled={!paymentData.amount}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Process Payment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Payment Summary */}
          {selectedLoan && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <h3 className="text-sm font-bold text-neutral-900 mb-3">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <User className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-500 uppercase">Borrower</p>
                    <p className="text-sm font-medium text-neutral-900">{selectedLoan.borrower}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-500 uppercase">Loan ID</p>
                    <p className="text-sm font-medium text-neutral-900">{selectedLoan.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <DollarSign className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-500 uppercase">Outstanding Balance</p>
                    <p className="text-sm font-bold text-neutral-900">N$ {selectedLoan.outstanding.toLocaleString()}</p>
                  </div>
                </div>
                {paymentData.amount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-[10px] text-green-600 uppercase mb-1">Balance After Payment</p>
                    <p className="text-lg font-bold text-green-700">
                      N$ {(selectedLoan.outstanding - parseFloat(paymentData.amount || '0')).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-3">Recent Payments</h3>
            <div className="space-y-2">
              {recentPayments.slice(0, 5).map(payment => (
                <div key={payment.id} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{payment.borrower}</p>
                      <p className="text-xs text-neutral-500">{payment.loanId}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">N$ {payment.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-neutral-500">{payment.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-500">{payment.date}</p>
                      <p className="text-[10px] text-neutral-500">{payment.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Confirm Payment</h2>
              <p className="text-xs text-neutral-500">Please verify the payment details</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Borrower:</span><span className="font-medium text-neutral-900">{selectedLoan.borrower}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Loan ID:</span><span className="font-medium text-neutral-900">{selectedLoan.id}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Amount:</span><span className="font-bold text-green-700">N$ {parseFloat(paymentData.amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Method:</span><span className="font-medium text-neutral-900 capitalize">{paymentMethod.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Date:</span><span className="font-medium text-neutral-900">{paymentData.paymentDate}</span></div>
              {paymentData.reference && <div className="flex justify-between"><span className="text-neutral-500">Reference:</span><span className="font-medium text-neutral-900">{paymentData.reference}</span></div>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">
                Cancel
              </button>
              <button onClick={confirmPayment}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-all">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
