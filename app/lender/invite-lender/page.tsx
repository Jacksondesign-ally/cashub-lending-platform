"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Copy, CheckCircle, Building, Send, Link2, RefreshCw, UserPlus, Share2, MessageCircle, Phone } from 'lucide-react'

export default function InviteLenderPage() {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState<{ email: string; company: string; sent_at: string; status: string }[]>([])
  const [myCompany, setMyCompany] = useState('')

  const registrationLink = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?role=lender&ref=${encodeURIComponent(myCompany || 'cashub')}`
    : ''

  useEffect(() => {
    setMyCompany(localStorage.getItem('lenderCompany') || '')
    const saved = JSON.parse(localStorage.getItem('lenderInvites') || '[]')
    setInvites(saved)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (!cleanPhone) { setError('Phone number is required for WhatsApp'); return }
    const message = encodeURIComponent(
      `Hi! ${myCompany || 'CasHuB'} invites ${companyName || 'your company'} to join our lending platform.\n\n` +
      `Register here: ${registrationLink}`
    )
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`
    window.open(whatsappUrl, '_blank')
    handleSend(new Event('submit') as any)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setError('')
    try {
      await supabase.from('lender_invitations').insert({
        invited_email: email,
        invited_company: companyName || null,
        invited_by: localStorage.getItem('userName') || '',
        status: 'pending',
        invite_link: registrationLink,
      })
      const newInvite = { email, company: companyName, sent_at: new Date().toISOString(), status: 'pending' }
      const updated = [newInvite, ...invites]
      setInvites(updated)
      localStorage.setItem('lenderInvites', JSON.stringify(updated))
      setSent(true)
      setEmail('')
      setCompanyName('')
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError('Could not save invite — share the link manually below.')
      setSent(true)
      setTimeout(() => { setSent(false); setError('') }, 5000)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Invite a Lender</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Invite another lender to join CasHuB. They will receive a registration link to set up their account.</p>
      </div>

      {/* Share Link */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-neutral-900">Your Invitation Link</h3>
        </div>
        <p className="text-xs text-neutral-500">Share this link directly — anyone who registers via this link will be linked to your referral.</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-600 font-mono truncate">
            {registrationLink}
          </div>
          <button onClick={handleCopy}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Email Invite Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-neutral-900">Send Invitation by Email</h3>
        </div>

        {sent && !error && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">Invitation recorded! Share the link above to send it via email or messaging.</p>
          </div>
        )}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">{error}</div>
        )}

        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Lender Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="lender@company.com"
                className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Company Name (optional)</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="Their company name"
                className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number (for WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+264 81 000 0000"
                className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="submit" disabled={sending || !email}
              className="py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Email Invite
            </button>
            <button type="button" onClick={sendWhatsApp} disabled={sending || !phone}
              className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </form>
      </div>

      {/* Invite History */}
      {invites.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-neutral-900">Sent Invitations ({invites.length})</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {invites.map((inv, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{inv.email}</p>
                  {inv.company && <p className="text-xs text-neutral-500">{inv.company}</p>}
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold capitalize">{inv.status}</span>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(inv.sent_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
