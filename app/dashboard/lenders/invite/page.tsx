"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { UserPlus, Mail, Send, CheckCircle, Copy, RefreshCw, Building, ArrowLeft, Link as LinkIcon } from 'lucide-react'

export default function InviteLenderPage() {
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [recentInvites, setRecentInvites] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  const signupLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?role=lender` : ''

  const handleSend = async () => {
    if (!form.email || !form.company_name) { setError('Company name and email are required'); return }
    setSending(true); setError('')
    try {
      await supabase.from('lender_invites').insert({
        company_name: form.company_name,
        contact_name: form.contact_name || null,
        email: form.email,
        phone: form.phone || null,
        message: form.message || null,
        invited_by: localStorage.getItem('userName') || 'System Admin',
        status: 'sent',
      })
      setRecentInvites(prev => [{ company: form.company_name, email: form.email, date: new Date().toLocaleDateString() }, ...prev])
      setForm({ company_name: '', contact_name: '', email: '', phone: '', message: '' })
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch (e: any) { setError(e.message || 'Failed to send') }
    setSending(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(signupLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lenders" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Invite Lender</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Invite a lending company to register on CasHuB</p>
        </div>
      </div>

      {/* Share Signup Link */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <LinkIcon className="w-4 h-4 text-violet-700" />
          <h3 className="text-sm font-bold text-violet-900">Share Lender Registration Link</h3>
        </div>
        <p className="text-xs text-violet-700 mb-3">Lenders can self-register using this direct link. They will complete KYC and package selection during onboarding.</p>
        <div className="flex gap-2">
          <input readOnly value={signupLink} className="flex-1 px-3 py-2 bg-white border border-violet-200 rounded-lg text-xs text-neutral-700 font-mono" />
          <button onClick={copyLink} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Email Invite Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-cashub-600" />
          <h3 className="text-sm font-bold text-neutral-900">Send Direct Invitation</h3>
        </div>

        {sent && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle className="w-4 h-4" /> Invitation recorded successfully!
          </div>
        )}
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Company Name *</label>
            <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="ABC Lending Ltd"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Contact Person</label>
            <input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="John Smith"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address *</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="info@abclending.com"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone Number</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+264 61 000 0000"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Message (optional)</label>
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3}
            placeholder="We'd like to invite your company to join CasHuB, Namibia's lending platform..."
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cashub-300 resize-none" />
        </div>
        <button onClick={handleSend} disabled={sending}
          className="w-full py-3 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
          {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Invitation
        </button>
      </div>

      {recentInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-bold text-neutral-900">Sent This Session</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentInvites.map((inv, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{inv.company}</p>
                  <p className="text-xs text-neutral-500">{inv.email} · {inv.date}</p>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold uppercase">Sent</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
