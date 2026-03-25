"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Search, RefreshCw, Plus, ArrowRight, CheckCircle, Clock, XCircle, DollarSign, FileText, Users, Building, ShieldCheck, X } from 'lucide-react'

interface MarketplaceApp {
  id: string
  borrower_name?: string
  borrower_email?: string
  loan_amount?: number
  loan_purpose?: string
  loan_term?: number
  status?: string
  is_anonymous?: boolean
  created_at: string
}

export default function LenderMarketplacePage() {
  const [myListings, setMyListings] = useState<MarketplaceApp[]>([])
  const [openApps, setOpenApps] = useState<MarketplaceApp[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'my'>('open')
  const [search, setSearch] = useState('')
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [lenderLogo, setLenderLogo] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [showKycReminder, setShowKycReminder] = useState(false)
  const [kycBorrowerName, setKycBorrowerName] = useState('')

  useEffect(() => {
    setLenderLogo(localStorage.getItem('lenderLogo') || '')
    setCompanyName(localStorage.getItem('lenderCompany') || '')
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const lenderEmail = localStorage.getItem('userName') || ''
    try {
      const [{ data: open }, { data: mine }] = await Promise.all([
        supabase.from('marketplace_applications').select('*').eq('status', 'open').order('created_at', { ascending: false }),
        supabase.from('marketplace_applications').select('*').eq('lender_email', lenderEmail).order('created_at', { ascending: false }),
      ])
      setOpenApps(open || [])
      setMyListings(mine || [])
    } catch {
      setOpenApps([])
      setMyListings([])
    }
    setLoading(false)
  }

  const acceptApplication = async (id: string, app: MarketplaceApp) => {
    setAcceptingId(id)
    const lenderEmail = localStorage.getItem('userName') || ''
    const lenderId = localStorage.getItem('lenderId') || null
    const company = localStorage.getItem('lenderCompany') || lenderEmail

    // 1. Mark marketplace application as offer_made (not immediately accepted)
    await supabase.from('marketplace_applications').update({ status: 'offer_made', lender_email: lenderEmail }).eq('id', id)

    // 2. Ensure borrower record exists, linked to this lender
    if (app.borrower_email) {
      const { data: existing } = await supabase.from('borrowers').select('id').eq('email', app.borrower_email).maybeSingle()
      if (!existing) {
        const nameParts = (app.borrower_name || '').trim().split(' ')
        await supabase.from('borrowers').insert({
          first_name: nameParts[0] || 'Unknown',
          last_name: nameParts.slice(1).join(' ') || '',
          email: app.borrower_email,
          lender_id: lenderId,
          status: 'active',
          risk_level: 'medium',
        })
      } else {
        await supabase.from('borrowers').update({ lender_id: lenderId }).eq('id', existing.id).is('lender_id', null)
      }
    }

    // 3. Create a loan_application record so borrower sees the offer and can accept/decline
    await supabase.from('loan_applications').insert({
      borrower_first_name: (app.borrower_name || '').split(' ')[0] || 'Borrower',
      borrower_last_name: (app.borrower_name || '').split(' ').slice(1).join(' ') || '',
      borrower_email: app.borrower_email || null,
      loan_amount: app.loan_amount || 0,
      loan_purpose: app.loan_purpose || 'General',
      loan_term: app.loan_term || 12,
      lender_id: lenderId,
      lender_email: lenderEmail,
      status: 'offer_pending',
      notes: `Offer from ${company} via marketplace. Please review and accept or decline.`,
      marketplace_application_id: id,
    })

    setOpenApps(prev => prev.filter(a => a.id !== id))
    setAcceptingId(null)
    // Show second KYC reminder after accepting a marketplace application
    setKycBorrowerName(app.borrower_name || 'this borrower')
    setShowKycReminder(true)
    setTimeout(() => setShowKycReminder(false), 12000)
    fetchData()
  }

  const currentList = tab === 'open' ? openApps : myListings
  const filtered = currentList.filter(a => {
    const q = search.toLowerCase()
    return !q || (a.borrower_name || '').toLowerCase().includes(q) || (a.loan_purpose || '').toLowerCase().includes(q)
  })

  const STATUS_COLORS: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    accepted: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      {/* ── Second KYC Floating Reminder ── */}
      {showKycReminder && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
          <div className="bg-white border-l-4 border-amber-500 rounded-xl shadow-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900">Second KYC Required</p>
              <p className="text-xs text-neutral-600 mt-1">
                You accepted <span className="font-semibold">{kycBorrowerName}</span> from the marketplace. Please conduct a <strong>second KYC verification</strong> before disbursing funds to strengthen security and reduce fraud risk.
              </p>
              <button onClick={() => setShowKycReminder(false)} className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-900 underline">
                Acknowledged
              </button>
            </div>
            <button onClick={() => setShowKycReminder(false)} className="flex-shrink-0 text-neutral-400 hover:text-neutral-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-neutral-200 bg-gradient-to-br from-cashub-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            {lenderLogo
              ? <img src={lenderLogo} alt="logo" className="w-full h-full object-contain bg-white p-0.5" />
              : <Building className="w-5 h-5 text-white" />
            }
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Marketplace</h2>
            <p className="text-neutral-500 text-sm">{companyName ? `${companyName} · ` : ''}Browse open loan requests from borrowers</p>
          </div>
        </div>
        {!lenderLogo && (
          <a href="/lender/settings" className="text-xs text-cashub-600 hover:underline flex items-center gap-1">
            + Add company logo
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Open Requests</p>
          <p className="text-2xl font-bold text-green-600 mt-0.5">{openApps.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">My Accepted</p>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">{myListings.filter(a => a.status === 'accepted').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 md:col-span-1 col-span-2">
          <p className="text-xs text-neutral-500">Total Value</p>
          <p className="text-2xl font-bold text-cashub-700 mt-0.5">N$ {openApps.reduce((s, a) => s + (a.loan_amount || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        {(['open', 'my'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
            {t === 'open' ? `Open Requests (${openApps.length})` : `My Accepted (${myListings.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by borrower or purpose..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Store className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">{tab === 'open' ? 'No open loan requests in the marketplace' : 'You have not accepted any marketplace applications'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(app => {
            const statusColor = STATUS_COLORS[app.status || 'open'] || 'bg-gray-100 text-gray-600'
            return (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{app.is_anonymous ? 'Anonymous Borrower' : (app.borrower_name || 'Borrower')}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{app.loan_purpose || 'General'}</p>
                    {app.is_anonymous && <p className="text-[10px] text-purple-600 mt-0.5 italic">Identity revealed after acceptance</p>}
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>{app.status || 'open'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-neutral-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Loan Amount</p>
                    <p className="text-base font-bold text-neutral-900 mt-0.5">N$ {(app.loan_amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Term</p>
                    <p className="text-base font-bold text-neutral-900 mt-0.5">{app.loan_term || '—'} months</p>
                  </div>
                </div>
                {tab === 'open' && app.status === 'open' && (
                  <button onClick={() => acceptApplication(app.id, app)} disabled={acceptingId === app.id} className="w-full py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                    {acceptingId === app.id ? 'Accepting...' : <><CheckCircle className="w-4 h-4" /> Accept & Contact Borrower</>}
                  </button>
                )}
                {tab === 'my' && (
                  <div className="text-xs text-neutral-500 text-right">Accepted {new Date(app.created_at).toLocaleDateString()}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
