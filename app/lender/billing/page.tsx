"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CreditCard, CheckCircle, Clock, AlertCircle, Download, RefreshCw, Zap, Building, Star } from 'lucide-react'

const PLANS = [
  { id: 'starter', name: 'Starter', price: 250, currency: 'N$', period: 'month', maxLoans: 50, maxStaff: 2, features: ['Up to 50 active loans', '2 loan officers', 'Basic reports', 'Shared registry access'] },
  { id: 'professional', name: 'Professional', price: 350, currency: 'N$', period: 'month', maxLoans: 250, maxStaff: 10, features: ['Up to 250 active loans', '10 loan officers', 'Advanced reports', 'Shared registry access', 'NAMFISA compliance exports', 'Marketplace access'] },
  { id: 'enterprise', name: 'Enterprise', price: 500, currency: 'N$', period: 'month', maxLoans: 0, maxStaff: 0, features: ['Unlimited loans', 'Unlimited staff', 'Full analytics suite', 'Priority support', 'Custom integrations', 'Dedicated account manager', 'Multi-branch management'] },
]
const ANNUAL_DISCOUNT = 0.20

export default function LenderBillingPage() {
  const [currentPlan, setCurrentPlan] = useState('professional')
  const [status, setStatus] = useState<'active' | 'trial' | 'suspended'>('active')
  const [nextBilling, setNextBilling] = useState('')
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    const lenderId = localStorage.getItem('lenderId')
    const today = new Date()
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    setNextBilling(next.toLocaleDateString('en-NA', { day: '2-digit', month: 'short', year: 'numeric' }))
    if (lenderId) {
      supabase.from('lender_subscriptions').select('*').eq('lender_id', lenderId).order('created_at', { ascending: false }).then(({ data }) => {
        if (data && data.length > 0) {
          setCurrentPlan(data[0].plan_type || data[0].package_id || 'professional')
          setStatus((data[0].status || 'active').toLowerCase() as 'active' | 'trial' | 'suspended')
          setInvoices(data.map((d: any) => ({ id: d.id, date: d.created_at?.split('T')[0], plan: d.plan_type || d.package_id || 'professional', amount: d.amount || 350, status: d.payment_status || 'paid' })))
        }
      })
    }
    setLoading(false)
  }, [])

  const handleUpgrade = (planId: string) => {
    alert('To change your subscription plan, please contact support at support@cashub.com or call +264 61 123 4567')
  }, { onConflict: 'lender_id' })
      setCurrentPlan(planId)
    }
    setUpgrading('')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 animate-spin text-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Billing & Subscription</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage your CasHuB subscription plan and payment history</p>
      </div>

      {/* Current Plan Banner */}
      <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${status === 'active' ? 'bg-emerald-50 border border-emerald-200' : status === 'trial' ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${status === 'active' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
            {status === 'active' ? <CheckCircle className="w-5 h-5 text-emerald-700" /> : <Clock className="w-5 h-5 text-blue-700" />}
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">Current Plan: <span className="capitalize">{currentPlan}</span></p>
            <p className="text-xs text-neutral-500 mt-0.5">Status: <span className={`font-semibold capitalize ${status === 'active' ? 'text-emerald-700' : 'text-blue-700'}`}>{status}</span> · Next billing: {nextBilling}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download Invoice
          </button>
        </div>
      </div>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-neutral-700">Available Plans</h2>
          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
            <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('annual')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${billingCycle === 'annual' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>
              Annual <span className="text-emerald-600 font-bold">-20%</span>
            </button>
          </div>
        </div>
        {billingCycle === 'annual' && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-3 font-medium">🎉 Annual billing saves you 20% — billed as one upfront payment.</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 p-5 flex flex-col ${plan.id === currentPlan ? 'border-cashub-500 shadow-lg' : 'border-neutral-200'}`}>
              {plan.id === currentPlan && <div className="self-start mb-2 px-2 py-0.5 bg-cashub-100 text-cashub-700 text-[10px] font-bold rounded-full uppercase tracking-wide">Current</div>}
              {plan.id === 'professional' && plan.id !== currentPlan && <div className="self-start mb-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1"><Star className="w-2.5 h-2.5" />Popular</div>}
              <h3 className="text-base font-bold text-neutral-900">{plan.name}</h3>
              <div className="my-3">
                <span className="text-3xl font-black text-neutral-900">
                  {plan.currency} {billingCycle === 'annual' ? Math.round(plan.price * (1 - ANNUAL_DISCOUNT)).toLocaleString() : plan.price.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500">/{billingCycle === 'annual' ? 'mo · billed annually' : 'month'}</span>
                {billingCycle === 'annual' && (
                  <>
                    <p className="text-sm font-bold text-cashub-600 mt-1">Total: N$ {Math.round(plan.price * (1 - ANNUAL_DISCOUNT) * 12).toLocaleString()}/year</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Save N$ {Math.round(plan.price * ANNUAL_DISCOUNT * 12).toLocaleString()}/year</p>
                  </>
                )}
              </div>
              <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-600">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {plan.id !== currentPlan ? (
                <button onClick={() => handleUpgrade(plan.id)} disabled={upgrading === plan.id}
                  className="w-full py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {upgrading === plan.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  'Contact Support to Change Plan'
                </button>
              ) : (
                <button disabled className="w-full py-2.5 bg-neutral-100 text-neutral-400 rounded-xl text-sm font-semibold">Active Plan</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No invoices yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50"><tr>{['Date', 'Plan', 'Amount', 'Status', ''].map(h => <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-neutral-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-xs text-neutral-600">{inv.date}</td>
                  <td className="px-4 py-3 text-xs font-medium text-neutral-900 capitalize">{inv.plan}</td>
                  <td className="px-4 py-3 text-xs font-bold text-neutral-900">N$ {(inv.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span></td>
                  <td className="px-4 py-3"><button className="text-xs text-cashub-600 hover:underline flex items-center gap-1"><Download className="w-3 h-3" />PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

