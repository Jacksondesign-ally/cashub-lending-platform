"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit-logger'
import {
  Package, Plus, Edit2, Save, X, Check, RefreshCw, Users,
  Star, Zap, Crown, AlertCircle, ChevronDown, ChevronUp,
  Trash2, ToggleLeft, ToggleRight, Calendar, DollarSign
} from 'lucide-react'

interface PackageDef {
  id: string
  name: string
  price: number
  features: string[]
  maxBorrowers: number
  maxLoans: number
  maxUsers: number
  popular: boolean
  active: boolean
}

interface LenderPlan {
  id: string
  legal_name: string
  registration_number: string
  currentPlan: string
  currentStatus: string
  endDate: string | null
  billingCycle: 'monthly' | 'annual' | null
  amount: number | null
}

const DEFAULT_PACKAGES: PackageDef[] = [
  { id: 'starter',      name: 'Starter',      price: 250,  features: ['Up to 50 borrowers', 'Up to 100 active loans', 'Basic reports', 'Email support'], maxBorrowers: 50,       maxLoans: 100,      maxUsers: 2,  popular: false, active: true },
  { id: 'professional', name: 'Professional', price: 350,  features: ['Up to 200 borrowers', 'Up to 500 active loans', 'Advanced reports & analytics', 'Priority support', 'Staff management', 'Marketplace listing'], maxBorrowers: 200, maxLoans: 500, maxUsers: 10, popular: true,  active: true },
  { id: 'enterprise',   name: 'Enterprise',   price: 500,  features: ['Unlimited borrowers', 'Unlimited active loans', 'Full compliance suite', 'Dedicated support', 'Staff management', 'API access', 'Custom branding'], maxBorrowers: 0, maxLoans: 0, maxUsers: 0, popular: false, active: true },
]

const ANNUAL_DISCOUNT = 0.20

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageDef[]>(DEFAULT_PACKAGES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<PackageDef | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPkg, setNewPkg] = useState<Partial<PackageDef>>({ name: '', price: 0, features: [], maxBorrowers: 0, maxLoans: 0, maxUsers: 0, popular: false, active: true })
  const [newFeatureText, setNewFeatureText] = useState('')

  const [lenders, setLenders] = useState<LenderPlan[]>([])
  const [loadingLenders, setLoadingLenders] = useState(false)
  const [assigningPlan, setAssigningPlan] = useState<{ lenderId: string; pkg: string; cycle: 'monthly' | 'annual' } | null>(null)
  const [savingAssign, setSavingAssign] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [activeTab, setActiveTab] = useState<'packages' | 'assign'>('packages')

  useEffect(() => {
    const saved = localStorage.getItem('adminPackages')
    if (saved) { try { setPackages(JSON.parse(saved)) } catch {} }
    fetchLenders()
  }, [])

  const savePackages = (updated: PackageDef[]) => {
    setPackages(updated)
    localStorage.setItem('adminPackages', JSON.stringify(updated))
  }

  const fetchLenders = async () => {
    setLoadingLenders(true)
    try {
      const { data: lendersData } = await supabase.from('lenders').select('id, legal_name, registration_number').eq('is_active', true).order('legal_name')
      const { data: subsData } = await supabase.from('lender_subscriptions').select('lender_id, package_name, status, end_date, billing_cycle, amount')
      const subsMap = new Map<string, any>()
      for (const s of (subsData || [])) subsMap.set(s.lender_id, s)
      setLenders((lendersData || []).map((l: any) => ({
        id: l.id,
        legal_name: l.legal_name,
        registration_number: l.registration_number,
        currentPlan: subsMap.get(l.id)?.package_name || 'None',
        currentStatus: subsMap.get(l.id)?.status || 'NONE',
        endDate: subsMap.get(l.id)?.end_date || null,
        billingCycle: subsMap.get(l.id)?.billing_cycle || null,
        amount: subsMap.get(l.id)?.amount || null,
      })))
    } catch (err) { console.error('Error fetching lenders:', err) }
    setLoadingLenders(false)
  }

  const assignPlan = async () => {
    if (!assigningPlan) return
    setSavingAssign(true)
    setErrorMsg('')
    try {
      const pkg = packages.find(p => p.id === assigningPlan.pkg)
      if (!pkg) return

      const isAnnual = assigningPlan.cycle === 'annual'
      const monthlyPrice = pkg.price
      const annualMonthlyPrice = Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT))
      const amount = isAnnual ? annualMonthlyPrice * 12 : monthlyPrice
      const durationDays = isAnnual ? 365 : 30

      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { error } = await supabase.from('lender_subscriptions').upsert({
        lender_id: assigningPlan.lenderId,
        package_id: pkg.id,
        package_name: pkg.name,
        status: 'ACTIVE',
        start_date: startDate,
        end_date: endDate,
        billing_cycle: assigningPlan.cycle,
        amount,
        auto_renew: false,
      }, { onConflict: 'lender_id' })

      if (error) throw error

      await logAudit({
        action: 'settings.updated',
        entity_type: 'settings',
        entity_id: assigningPlan.lenderId,
        details: { plan: pkg.name, billing_cycle: assigningPlan.cycle, amount, end_date: endDate },
      })

      setSuccessMsg(`${pkg.name} (${isAnnual ? 'Annual' : 'Monthly'}) assigned successfully — N$${amount.toLocaleString()} total`)
      setAssigningPlan(null)
      await fetchLenders()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setErrorMsg(`Failed to assign plan: ${err?.message || 'Unknown error'}`)
    }
    setSavingAssign(false)
  }

  const startEdit = (pkg: PackageDef) => {
    setEditingId(pkg.id)
    setEditDraft({ ...pkg, features: [...pkg.features] })
  }

  const saveEdit = () => {
    if (!editDraft) return
    const updated = packages.map(p => p.id === editDraft.id ? editDraft : p)
    savePackages(updated)
    setEditingId(null)
    setEditDraft(null)
    setSuccessMsg('Package updated successfully')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const addNewPackage = () => {
    if (!newPkg.name || !newPkg.price) { setErrorMsg('Name and price are required'); return }
    const pkg: PackageDef = {
      id: newPkg.name!.toLowerCase().replace(/\s+/g, '-'),
      name: newPkg.name!,
      price: Number(newPkg.price),
      features: newPkg.features || [],
      maxBorrowers: Number(newPkg.maxBorrowers) || 0,
      maxLoans: Number(newPkg.maxLoans) || 0,
      maxUsers: Number(newPkg.maxUsers) || 0,
      popular: newPkg.popular || false,
      active: true,
    }
    savePackages([...packages, pkg])
    setNewPkg({ name: '', price: 0, features: [], maxBorrowers: 0, maxLoans: 0, maxUsers: 0, popular: false, active: true })
    setShowAddForm(false)
    setSuccessMsg('New package created')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const toggleActive = (id: string) => {
    const updated = packages.map(p => p.id === id ? { ...p, active: !p.active } : p)
    savePackages(updated)
  }

  const iconMap: Record<string, React.ReactNode> = {
    starter: <Star className="w-5 h-5" />,
    professional: <Zap className="w-5 h-5" />,
    enterprise: <Crown className="w-5 h-5" />,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Package Management</h2>
          <p className="text-sm text-neutral-500">Create, modify and assign subscription packages to lenders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAddForm(true); setActiveTab('packages') }}
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4 mr-2" /> New Package
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
        {[{ id: 'packages', label: 'Packages', icon: Package }, { id: 'assign', label: 'Assign to Lenders', icon: Users }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ─── PACKAGES TAB ─── */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {/* Add New Package Form */}
          {showAddForm && (
            <div className="bg-white border-2 border-cashub-300 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">New Package</h3>
                <button onClick={() => setShowAddForm(false)}><X className="w-4 h-4 text-neutral-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600">Package Name *</label>
                  <input value={newPkg.name} onChange={e => setNewPkg(p => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" placeholder="e.g. Premium" />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600">Monthly Price (N$) *</label>
                  <input type="number" value={newPkg.price} onChange={e => setNewPkg(p => ({ ...p, price: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600">Max Borrowers (0 = unlimited)</label>
                  <input type="number" value={newPkg.maxBorrowers} onChange={e => setNewPkg(p => ({ ...p, maxBorrowers: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600">Max Active Loans (0 = unlimited)</label>
                  <input type="number" value={newPkg.maxLoans} onChange={e => setNewPkg(p => ({ ...p, maxLoans: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600">Max Staff Users (0 = unlimited)</label>
                  <input type="number" value={newPkg.maxUsers} onChange={e => setNewPkg(p => ({ ...p, maxUsers: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="popular-new" checked={newPkg.popular} onChange={e => setNewPkg(p => ({ ...p, popular: e.target.checked }))}
                    className="h-4 w-4 text-cashub-600 rounded" />
                  <label htmlFor="popular-new" className="text-xs font-medium text-neutral-600">Mark as Popular</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600">Features</label>
                <div className="flex gap-2 mt-1">
                  <input value={newFeatureText} onChange={e => setNewFeatureText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newFeatureText.trim()) { setNewPkg(p => ({ ...p, features: [...(p.features || []), newFeatureText.trim()] })); setNewFeatureText('') }}}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" placeholder="Type feature and press Enter" />
                  <button onClick={() => { if (newFeatureText.trim()) { setNewPkg(p => ({ ...p, features: [...(p.features || []), newFeatureText.trim()] })); setNewFeatureText('') }}}
                    className="px-3 py-2 bg-cashub-100 text-cashub-700 rounded-lg text-sm font-medium hover:bg-cashub-200">Add</button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(newPkg.features || []).map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-cashub-50 text-cashub-700 text-xs rounded-full">
                      {f}
                      <button onClick={() => setNewPkg(p => ({ ...p, features: (p.features || []).filter((_, fi) => fi !== i) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm hover:bg-neutral-50">Cancel</button>
                <button onClick={addNewPackage} className="px-4 py-2 bg-cashub-600 text-white rounded-lg text-sm font-medium hover:bg-cashub-700">Create Package</button>
              </div>
            </div>
          )}

          {/* Existing Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map(pkg => {
              const isEditing = editingId === pkg.id
              const draft = isEditing ? editDraft! : pkg
              const annualMonthly = Math.round(pkg.price * (1 - ANNUAL_DISCOUNT))
              const annualTotal = annualMonthly * 12

              return (
                <div key={pkg.id} className={`bg-white rounded-xl shadow-sm border-2 p-5 transition-all ${!pkg.active ? 'opacity-50 border-neutral-200' : pkg.popular ? 'border-cashub-400' : 'border-neutral-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${pkg.popular ? 'bg-cashub-100 text-cashub-600' : 'bg-neutral-100 text-neutral-600'}`}>
                        {iconMap[pkg.id] || <Package className="w-5 h-5" />}
                      </div>
                      {isEditing ? (
                        <input value={draft.name} onChange={e => setEditDraft(d => d ? { ...d, name: e.target.value } : d)}
                          className="text-base font-bold border-b border-cashub-400 focus:outline-none bg-transparent" />
                      ) : (
                        <h3 className="font-bold text-neutral-900">{pkg.name}</h3>
                      )}
                      {pkg.popular && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Popular</span>}
                    </div>
                    <div className="flex gap-1">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setEditingId(null); setEditDraft(null) }} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(pkg)} className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => toggleActive(pkg.id)} className="p-1.5 rounded-lg hover:bg-neutral-200" title={pkg.active ? 'Deactivate' : 'Activate'}>
                            {pkg.active ? <ToggleRight className="w-3.5 h-3.5 text-green-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-neutral-400" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-neutral-500">N$</span>
                        <input type="number" value={draft.price} onChange={e => setEditDraft(d => d ? { ...d, price: Number(e.target.value) } : d)}
                          className="w-20 text-xl font-bold border-b border-cashub-400 focus:outline-none bg-transparent" />
                        <span className="text-xs text-neutral-400">/month</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-neutral-900">N${pkg.price.toLocaleString()}</span>
                        <span className="text-xs text-neutral-400 ml-1">/month</span>
                        <p className="text-xs text-emerald-600 mt-0.5">Annual: N${annualMonthly}/mo · N${annualTotal.toLocaleString()}/yr (20% off)</p>
                      </div>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    {[
                      { label: 'Borrowers', value: isEditing ? draft.maxBorrowers : pkg.maxBorrowers, field: 'maxBorrowers' },
                      { label: 'Loans', value: isEditing ? draft.maxLoans : pkg.maxLoans, field: 'maxLoans' },
                      { label: 'Staff', value: isEditing ? draft.maxUsers : pkg.maxUsers, field: 'maxUsers' },
                    ].map(item => (
                      <div key={item.field} className="bg-neutral-50 rounded-lg p-2">
                        <p className="text-[10px] text-neutral-500">{item.label}</p>
                        {isEditing ? (
                          <input type="number" value={item.value}
                            onChange={e => setEditDraft(d => d ? { ...d, [item.field]: Number(e.target.value) } : d)}
                            className="w-full text-sm font-bold text-center border-b border-cashub-400 focus:outline-none bg-transparent" />
                        ) : (
                          <p className="text-sm font-bold text-neutral-900">{item.value === 0 ? '∞' : item.value.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    {(isEditing ? draft.features : pkg.features).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {isEditing ? (
                          <input value={f} onChange={e => setEditDraft(d => d ? { ...d, features: d.features.map((fi, idx) => idx === i ? e.target.value : fi) } : d)}
                            className="flex-1 text-xs border-b border-cashub-200 focus:outline-none bg-transparent" />
                        ) : (
                          <span className="text-xs text-neutral-600">{f}</span>
                        )}
                        {isEditing && (
                          <button onClick={() => setEditDraft(d => d ? { ...d, features: d.features.filter((_, fi) => fi !== i) } : d)}>
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button onClick={() => setEditDraft(d => d ? { ...d, features: [...d.features, ''] } : d)}
                        className="text-xs text-cashub-600 hover:underline flex items-center gap-1 mt-1">
                        <Plus className="w-3 h-3" /> Add feature
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── ASSIGN TO LENDERS TAB ─── */}
      {activeTab === 'assign' && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <div>
              <h3 className="font-semibold text-neutral-900">Assign Packages to Lenders</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Select a package and billing cycle for each lender. Annual billing applies 20% discount.</p>
            </div>
            <button onClick={fetchLenders} className="inline-flex items-center px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </button>
          </div>

          {/* Annual discount info */}
          <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>Annual Billing = 20% Discount.</strong> Starter: N$2,400/yr (was N$3,000) · Professional: N$3,360/yr (was N$4,200) · Enterprise: N$4,800/yr (was N$6,000).
              Amount saved is reflected accurately in subscriber reports.
            </div>
          </div>

          {loadingLenders ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600" /></div>
          ) : lenders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No active lenders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase">Lender</th>
                    <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase">Current Plan</th>
                    <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase">Billing Cycle</th>
                    <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase">Expires</th>
                    <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase">Assign New Package</th>
                    <th className="pb-3 text-xs font-semibold text-neutral-500 uppercase">Cycle</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {lenders.map(lender => {
                    const isAssigning = assigningPlan?.lenderId === lender.id
                    const selectedPkgDef = isAssigning ? packages.find(p => p.id === assigningPlan.pkg) : null
                    const cycle = isAssigning ? assigningPlan.cycle : 'monthly'
                    const previewAmount = selectedPkgDef
                      ? cycle === 'annual'
                        ? Math.round(selectedPkgDef.price * (1 - ANNUAL_DISCOUNT)) * 12
                        : selectedPkgDef.price
                      : 0

                    return (
                      <tr key={lender.id} className="hover:bg-neutral-50">
                        <td className="py-3 pr-4">
                          <p className="text-sm font-medium text-neutral-900">{lender.legal_name}</p>
                          <p className="text-xs text-neutral-400">{lender.registration_number}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${lender.currentPlan === 'None' ? 'bg-neutral-100 text-neutral-500' : lender.currentPlan === 'Enterprise' ? 'bg-violet-100 text-violet-700' : lender.currentPlan === 'Professional' ? 'bg-cashub-100 text-cashub-700' : 'bg-blue-100 text-blue-700'}`}>
                            {lender.currentPlan}
                          </span>
                          <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full ${lender.currentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : lender.currentStatus === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-500'}`}>
                            {lender.currentStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-neutral-500 capitalize">
                          {lender.billingCycle || '—'}
                          {lender.amount ? <span className="ml-1 text-neutral-400">(N${lender.amount.toLocaleString()})</span> : null}
                        </td>
                        <td className="py-3 pr-4 text-xs text-neutral-500">
                          {lender.endDate ? new Date(lender.endDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-2">
                          <select
                            defaultValue=""
                            onChange={e => e.target.value && setAssigningPlan({ lenderId: lender.id, pkg: e.target.value, cycle: isAssigning ? assigningPlan!.cycle : 'monthly' })}
                            className="px-2 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500 bg-white min-w-[130px]">
                            <option value="">Select package...</option>
                            {packages.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name} — N${p.price}/mo</option>)}
                          </select>
                        </td>
                        <td className="py-3 pr-2">
                          {isAssigning && (
                            <div className="flex flex-col gap-1">
                              <select
                                value={assigningPlan.cycle}
                                onChange={e => setAssigningPlan(prev => prev ? { ...prev, cycle: e.target.value as 'monthly' | 'annual' } : prev)}
                                className="px-2 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500 bg-white">
                                <option value="monthly">Monthly</option>
                                <option value="annual">Annual (20% off)</option>
                              </select>
                              {selectedPkgDef && (
                                <span className="text-[10px] text-emerald-600 font-medium">
                                  Total: N${previewAmount.toLocaleString()}/{cycle === 'annual' ? 'yr' : 'mo'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3">
                          {isAssigning && (
                            <button onClick={assignPlan} disabled={savingAssign}
                              className="px-3 py-1.5 bg-cashub-600 text-white rounded-lg text-xs hover:bg-cashub-700 disabled:opacity-50 flex items-center gap-1 font-medium whitespace-nowrap">
                              {savingAssign ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
