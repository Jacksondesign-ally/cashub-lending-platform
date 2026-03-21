"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Send, Copy, CheckCircle, Mail, Phone, User, Link2,
  AlertCircle, ArrowLeft, MessageSquare, Smartphone
} from 'lucide-react'

export default function InviteBorrowerPage() {
  const [method, setMethod] = useState<'link' | 'email' | 'sms' | 'whatsapp'>('link')
  const [borrowerEmail, setBorrowerEmail] = useState('')
  const [borrowerPhone, setBorrowerPhone] = useState('')
  const [borrowerName, setBorrowerName] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const lenderName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Lender' : 'Lender'
  const lenderCompany = typeof window !== 'undefined' ? localStorage.getItem('lenderCompany') || lenderName : lenderName
  
  const inviteToken = btoa(`${lenderName}|${borrowerEmail || borrowerName}|${loanAmount}|${Date.now()}|${lenderCompany}`)
  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/invite/${inviteToken}`
    : `/invite/${inviteToken}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleSendInvite = async () => {
    setSending(true)
    if (method === 'whatsapp') {
      const phone = borrowerPhone.replace(/[^\d+]/g, '')
      const message = encodeURIComponent(
        `Hi ${borrowerName || 'there'}! You've been invited by ${lenderName} to apply for a loan${loanAmount ? ` of N$ ${parseInt(loanAmount).toLocaleString()}` : ''} on CasHuB.\n\nClick here to get started: ${inviteLink}`
      )
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/borrowers" className="text-sm text-cashub-600 hover:text-cashub-700 font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Borrowers
        </Link>
        <div className="max-w-lg mx-auto mt-12">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Invite Sent!</h2>
            <p className="text-sm text-neutral-500 mb-4">
              {method === 'link' 
                ? 'The invite link has been generated. Share it with the borrower.'
                : method === 'email'
                ? `An invite email has been sent to ${borrowerEmail}`
                : method === 'whatsapp'
                ? `A WhatsApp message has been sent to ${borrowerPhone}`
                : `An SMS invite has been sent to ${borrowerPhone}`
              }
            </p>
            <p className="text-xs text-neutral-400 mb-6">
              The borrower will need to register or log in to accept the loan invitation.
            </p>
            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Invite Link</p>
              <div className="flex items-center gap-2">
                <input readOnly value={inviteLink} className="flex-1 text-xs bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-700" />
                <button onClick={handleCopyLink} className="px-3 py-2 bg-cashub-600 text-white rounded-lg text-xs font-medium hover:bg-cashub-700 flex items-center gap-1">
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/borrowers/invite" onClick={() => { setSent(false); setBorrowerEmail(''); setBorrowerPhone(''); setBorrowerName(''); setLoanAmount('') }}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200">
                Send Another
              </Link>
              <Link href="/dashboard/borrowers" className="px-4 py-2 bg-cashub-600 text-white rounded-lg text-sm font-medium hover:bg-cashub-700">
                View Borrowers
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Invite Borrower</h2>
          <p className="text-neutral-500">Send a loan invitation link to a borrower</p>
        </div>
        <Link href="/dashboard/borrowers" className="text-sm text-cashub-600 hover:text-cashub-700 font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="max-w-2xl">
        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How Borrower Invites Work</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
              <li>You generate an invite link with loan details</li>
              <li>Send the link to the borrower via your preferred method</li>
              <li>The borrower clicks the link and registers or logs in</li>
              <li>Once registered, the loan application appears in their portal</li>
              <li>You can then process the loan from your dashboard</li>
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          {/* Borrower Details */}
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Borrower Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Borrower Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={borrowerName} onChange={e => setBorrowerName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Loan Amount (N$)</label>
              <input value={loanAmount} onChange={e => setLoanAmount(e.target.value)} type="number"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                placeholder="5000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={borrowerEmail} onChange={e => setBorrowerEmail(e.target.value)} type="email"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="borrower@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={borrowerPhone} onChange={e => setBorrowerPhone(e.target.value)} type="tel"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="+264 81 123 4567" />
              </div>
            </div>
          </div>

          {/* Send Method */}
          <h3 className="text-sm font-bold text-neutral-900 mb-3">How to Send</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            <button onClick={() => setMethod('link')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                method === 'link' ? 'border-cashub-600 bg-cashub-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <Link2 className={`w-6 h-6 mb-2 ${method === 'link' ? 'text-cashub-600' : 'text-neutral-400'}`} />
              <span className={`text-xs font-medium ${method === 'link' ? 'text-cashub-700' : 'text-neutral-600'}`}>Copy Link</span>
            </button>
            <button onClick={() => setMethod('email')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                method === 'email' ? 'border-cashub-600 bg-cashub-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <Mail className={`w-6 h-6 mb-2 ${method === 'email' ? 'text-cashub-600' : 'text-neutral-400'}`} />
              <span className={`text-xs font-medium ${method === 'email' ? 'text-cashub-700' : 'text-neutral-600'}`}>Send Email</span>
            </button>
            <button onClick={() => setMethod('sms')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                method === 'sms' ? 'border-cashub-600 bg-cashub-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <MessageSquare className={`w-6 h-6 mb-2 ${method === 'sms' ? 'text-cashub-600' : 'text-neutral-400'}`} />
              <span className={`text-xs font-medium ${method === 'sms' ? 'text-cashub-700' : 'text-neutral-600'}`}>Send SMS</span>
            </button>
            <button onClick={() => setMethod('whatsapp')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                method === 'whatsapp' ? 'border-green-600 bg-green-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <Smartphone className={`w-6 h-6 mb-2 ${method === 'whatsapp' ? 'text-green-600' : 'text-neutral-400'}`} />
              <span className={`text-xs font-medium ${method === 'whatsapp' ? 'text-green-700' : 'text-neutral-600'}`}>WhatsApp</span>
            </button>
          </div>

          {/* Generated Link */}
          {(borrowerName || borrowerEmail) && (
            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Generated Invite Link</p>
              <div className="flex items-center gap-2">
                <input readOnly value={inviteLink} className="flex-1 text-xs bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-600 truncate" />
                <button onClick={handleCopyLink} className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-xs font-medium text-neutral-700 flex items-center gap-1 whitespace-nowrap">
                  {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSendInvite} disabled={sending || (!borrowerName && !borrowerEmail)}
            className="w-full py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <><Send className="w-4 h-4" /> {method === 'link' ? 'Generate & Copy Link' : method === 'email' ? 'Send Email Invite' : method === 'whatsapp' ? 'Send via WhatsApp' : 'Send SMS Invite'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
