"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Activity, Users, DollarSign, TrendingUp, AlertCircle,
  RefreshCw, Calendar, CheckCircle, XCircle, Clock, Search, Package, ArrowRight
} from 'lucide-react'

interface SubscriberRecord {
  id: string
  company_name: string
  legal_name: string
  registration_number: string
  email: string
  package_name: string
  billing_cycle: 'monthly' | 'annual' | null
  amount: number | null
  status: string
  start_date: string
  end_date: string
  days_remaining: number
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => { fetchSubscribers() }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: lendersData, error: lErr } = await supabase
        .from('lenders')
        .select('id, company_name, legal_name, registration_number, email')
        .eq('is_active', true)
        .order('company_name')

      if (lErr) throw lErr

      const { data: subsData, error: sErr } = await supabase
        .from('lender_subscriptions')
        .select('lender_id, package_name, billing_cycle, amount, status, start_date, end_date')

      if (sErr) throw sErr

      const subsMap = new Map<string, any>()
      for (const s of (subsData || [])) subsMap.set(s.lender_id, s)

      const now = new Date()
      const records: SubscriberRecord[] = (lendersData || []).map((l: any) => {
        const sub = subsMap.get(l.id)
        const endDate = sub?.end_date ? new Date(sub.end_date) : null
        const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
        return {
          id: l.id,
          company_name: l.company_name || l.legal_name,
          legal_name: l.legal_name,
          registration_number: l.registration_number,
          email: l.email || '',
          package_name: sub?.package_name || 'No Plan',
          billing_cycle: sub?.billing_cycle || null,
          amount: sub?.amount || null,
          status: sub?.status || 'NONE',
          start_date: sub?.start_date || '',
          end_date: sub?.end_date || '',
          days_remaining: daysRemaining,
        }
      })

      setSubscribers(records)
    } catch (err: any) {
      setError(`Failed to load subscribers: ${err?.message || 'Unknown error'}`)
    }
    setLoading(false)
  }

  const filtered = subscribers.filter(s => {
    const matchSearch = (s.company_name || s.legal_name).toLowerCase().includes(search.toLowerCase()) ||
      s.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  // Revenue calculations
  const activeMonthly = subscribers.filter(s => s.status === 'ACTIVE' && s.billing_cycle === 'monthly')
  const activeAnnual = subscribers.filter(s => s.status === 'ACTIVE' && s.billing_cycle === 'annual')
  const totalMonthlyRevenue = activeMonthly.reduce((sum, s) => sum + (s.amount || 0), 0)
  const totalAnnualRevenue = activeAnnual.reduce((sum, s) => sum + (s.amount || 0), 0)
  const monthlyFromAnnual = Math.round(totalAnnualRevenue / 12)
  const totalMRR = totalMonthlyRevenue + monthlyFromAnnual
  const expiringSoon = subscribers.filter(s => s.status === 'ACTIVE' && s.days_remaining > 0 && s.days_remaining <= 14)

  // Enterprise/Professional lenders on monthly — could save 20% if converted to annual
  const ANNUAL_PRICES: Record<string, number> = { Enterprise: 4800, Professional: 3360, Starter: 2400 }
  const MONTHLY_PRICES: Record<string, number> = { Enterprise: 500, Professional: 350, Starter: 250 }
  const upgradeCandidates = subscribers.filter(s =>
    s.status === 'ACTIVE' &&
    s.billing_cycle !== 'annual' &&
    (s.package_name === 'Enterprise' || s.package_name === 'Professional')
  )
  const potentialAnnualRevenue = upgradeCandidates.reduce((sum, s) => sum + (ANNUAL_PRICES[s.package_name] || 0), 0)
  const currentAnnualisedRevenue = upgradeCandidates.reduce((sum, s) => sum + ((MONTHLY_PRICES[s.package_name] || 0) * 12), 0)
  const annualSaving = potentialAnnualRevenue - currentAnnualisedRevenue

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':    return 'bg-green-100 text-green-800'
      case 'EXPIRING':  return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':   return 'bg-red-100 text-red-800'
      case 'SUSPENDED': return 'bg-gray-100 text-gray-700'
      default:          return 'bg-neutral-100 text-neutral-500'
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':    return <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      case 'EXPIRING':  return <Clock className="w-3.5 h-3.5 text-yellow-600" />
      case 'EXPIRED':   return <XCircle className="w-3.5 h-3.5 text-red-500" />
      default:          return <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Subscribers</h2>
          <p className="text-sm text-neutral-500">Platform subscription overview and revenue from lenders</p>
        </div>
        <button onClick={fetchSubscribers} className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Load Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Monthly Recurring</p>
            <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">N${totalMRR.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">Combined MRR (monthly + annualised)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Annual Revenue</p>
            <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="w-4 h-4 text-blue-600" /></div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">N${totalAnnualRevenue.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">{activeAnnual.length} annual subscriber{activeAnnual.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Subscribers</p>
            <div className="p-2 bg-violet-50 rounded-lg"><Users className="w-4 h-4 text-violet-600" /></div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{subscribers.filter(s => s.status === 'ACTIVE').length}</p>
          <p className="text-xs text-neutral-400 mt-1">of {subscribers.length} total lenders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Expiring Soon</p>
            <div className="p-2 bg-amber-50 rounded-lg"><Calendar className="w-4 h-4 text-amber-600" /></div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{expiringSoon.length}</p>
          <p className="text-xs text-neutral-400 mt-1">within 14 days</p>
        </div>
      </div>

      {/* Billing Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">Billing Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cashub-500"></span>
                <span className="text-sm text-neutral-700">Monthly subscribers</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">{activeMonthly.length} lenders</p>
                <p className="text-xs text-neutral-500">N${totalMonthlyRevenue.toLocaleString()}/mo</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm text-neutral-700">Annual subscribers</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">{activeAnnual.length} lenders</p>
                <p className="text-xs text-neutral-500">N${totalAnnualRevenue.toLocaleString()}/yr</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-neutral-700">Total MRR</span>
              <span className="text-sm font-bold text-cashub-600">N${totalMRR.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>


        {expiringSoon.length > 0 && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Expiring Within 14 Days
            </h3>
            <div className="space-y-2">
              {expiringSoon.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{s.legal_name}</p>
                    <p className="text-xs text-neutral-500">{s.package_name} · {s.billing_cycle || 'monthly'}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700">{s.days_remaining}d left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="font-semibold text-neutral-900">All Lender Subscriptions</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 w-48"
                placeholder="Search lenders..." />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING">Expiring</option>
              <option value="EXPIRED">Expired</option>
              <option value="NONE">No Plan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  {['Lender', 'Package', 'Billing Cycle', 'Amount', 'Status', 'Start Date', 'End Date', 'Days Left'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-neutral-400">No subscribers found</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-neutral-900">{s.company_name || s.legal_name}</p>
                      <p className="text-xs text-neutral-400">{s.registration_number}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.package_name === 'No Plan' ? 'bg-neutral-100 text-neutral-500' : s.package_name === 'Enterprise' ? 'bg-violet-100 text-violet-700' : s.package_name === 'Professional' ? 'bg-cashub-100 text-cashub-700' : 'bg-blue-100 text-blue-700'}`}>
                        {s.package_name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm capitalize text-neutral-600">
                      {s.billing_cycle || '—'}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-neutral-900">
                      {s.amount ? `N$${s.amount.toLocaleString()}` : '—'}
                      {s.billing_cycle === 'annual' && s.amount && (
                        <span className="block text-xs text-emerald-600 font-normal">N${Math.round(s.amount / 12).toLocaleString()}/mo</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(s.status)}`}>
                        {statusIcon(s.status)} {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-500">
                      {s.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-500">
                      {s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {s.days_remaining > 0 ? (
                        <span className={`text-xs font-medium ${s.days_remaining <= 14 ? 'text-amber-600' : 'text-neutral-600'}`}>
                          {s.days_remaining}d
                        </span>
                      ) : s.status === 'ACTIVE' ? (
                        <span className="text-xs text-neutral-400">—</span>
                      ) : (
                        <span className="text-xs text-red-500">Expired</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
