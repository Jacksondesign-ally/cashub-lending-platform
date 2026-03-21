"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserPlus, Mail, Send, CheckCircle, Copy, RefreshCw, Users, Link, MessageCircle } from 'lucide-react'

export default function LenderInvitePage() {
  const [form, setForm] = useState({ email: '', name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [invites, setInvites] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [lenderLogo, setLenderLogo] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    setLenderLogo(localStorage.getItem('lenderLogo') || '')
    setCompanyName(localStorage.getItem('lenderCompany') || '')
  }, [])

  const signupLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=lender&role=borrower` : ''

  const handleInvite = async () => {
    if (!form.email) { setError('Email is required'); return }
    setSending(true); setError('')
    try {
      const lenderId = localStorage.getItem('lenderId')
      const lenderName = localStorage.getItem('lenderCompany') || localStorage.getItem('userName') || 'Your Lender'
      await supabase.from('borrower_invites').insert({
        lender_id: lenderId,
        borrower_email: form.email,
        borrower_name: form.name || null,
        borrower_phone: form.phone || null,
        message: form.message || null,
        status: 'sent',
      })
      setInvites(prev => [{ email: form.email, name: form.name, status: 'sent', sent_at: new Date().toLocaleDateString() }, ...prev])
      setForm({ email: '', name: '', phone: '', message: '' })
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch (e: any) { setError(e.message || 'Failed to send invite') }
    setSending(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(signupLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendWhatsApp = () => {
    const phone = form.phone.replace(/[^0-9]/g, '')
    if (!phone) { setError('Phone number is required for WhatsApp'); return }
    const message = encodeURIComponent(
      `Hi ${form.name || 'there'}! ${companyName || 'We'} would like to invite you to apply for a loan through CasHuB.\n\n` +
      `${form.message || 'Register here to get started:'}\n\n${signupLink}`
    )
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`
    window.open(whatsappUrl, '_blank')
    handleInvite()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Company branding header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-neutral-200 bg-gradient-to-br from-cashub-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-md">
          {lenderLogo
            ? <img src={lenderLogo} alt="logo" className="w-full h-full object-contain bg-white p-0.5" />
            : <span className="text-xl font-black text-white">{(companyName || 'L').charAt(0).toUpperCase()}</span>
          }
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Invite Borrower</h1>
          <p className="text-sm text-neutral-500">{companyName ? `${companyName} · ` : ''}Invite clients to register on CasHuB</p>
        </div>
      </div>

      {/* Share Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold text-blue-900">Share Registration Link</h3>
          </div>
          {lenderLogo && (
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-200 bg-white">
              <img src={lenderLogo} alt="logo" className="w-full h-full object-contain p-0.5" />
            </div>
          )}
        </div>
        <p className="text-xs text-blue-700 mb-3">Share this link with borrowers so they can self-register and be linked to your company.</p>
        <div className="flex gap-2">
          <input readOnly value={signupLink} className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-neutral-700 font-mono" />
          <button onClick={copyLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Email Invite Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-cashub-600" />
          <h3 className="text-sm font-bold text-neutral-900">Send Email Invitation</h3>
        </div>

        {sent && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle className="w-4 h-4" /> Invitation recorded successfully!
          </div>
        )}
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address *</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="borrower@email.com"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone Number</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+264 81 000 0000"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Personal Message (optional)</label>
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Hi, we'd like to invite you to apply for a loan through CasHuB..."
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleInvite} disabled={sending}
            className="py-3 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Email Invite
          </button>
          <button onClick={sendWhatsApp} disabled={sending || !form.phone}
            className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Recent Invites */}
      {invites.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-bold text-neutral-900">Recent Invitations</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {invites.map((inv, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{inv.name || inv.email}</p>
                  <p className="text-xs text-neutral-500">{inv.email} · {inv.sent_at}</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold uppercase">{inv.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
