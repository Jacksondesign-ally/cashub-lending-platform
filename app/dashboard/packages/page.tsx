"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit-logger'
import {
  Package, Plus, Edit2, Save, X, Check, RefreshCw, Users,
  Star, Zap, Crown, AlertCircle, ChevronDown, ChevronUp,
  Trash2, ToggleLeft, ToggleRight, Calendar, DollarSign,
  CheckCircle, TrendingUp, Lock
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
  company_name: string
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
      const { data: lendersData } = await supabase.from('lenders').select('id, company_name, legal_name, registration_number').eq('is_active', true).order('company_name')
      const { data: subsData } = await supabase.from('lender_subscriptions').select('lender_id, package_name, status, end_date, billing_cycle, amount')
      const subsMap = new Map<string, any>()
      for (const s of (subsData || [])) subsMap.set(s.lender_id, s)
      setLenders((lendersData || []).map((l: any) => ({
        id: l.id,
        company_name: l.company_name || l.legal_name,
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

  const deletePackage = (id: string, name: string) => {
    const lendersOnPlan = lenders.filter(l => l.currentPlan.toLowerCase() === name.toLowerCase())
    if (lendersOnPlan.length > 0) {
      setErrorMsg(`Cannot delete "${name}" — ${lendersOnPlan.length} lender(s) currently subscribed. Reassign them first.`)
      setTimeout(() => setErrorMsg(''), 5000)
      return
    }
    if (!confirm(`Delete package "${name}"? This cannot be undone.`)) return
    const updated = packages.filter(p => p.id !== id)
    savePackages(updated)
    setSuccessMsg(`Package "${name}" deleted.`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const assignPlan = async () => {
    if (!assigningPlan || !assigningPlan.pkg) return
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

  const TIER_STYLES: Record<string, { gradient: string; iconBg: string; icon: React.ReactNode; badge: string }> = {
    starter:      { gradient: 'from-blue-500 to-blue-700',    iconBg: 'bg-blue-400/20',   icon: <Star className="w-5 h-5 text-white" />,   badge: 'bg-blue-100 text-blue-700' },
    professional: { gradient: 'from-cashub-500 to-cashub-700', iconBg: 'bg-white/20',   icon: <Zap className="w-5 h-5 text-white" />,    badge: 'bg-cashub-100 text-cashub-700' },
    enterprise:   { gradient: 'from-violet-600 to-purple-800', iconBg: 'bg-violet-400/20', icon: <Crown className="w-5 h-5 text-white" />, badge: 'bg-violet-100 text-violet-700' },
  }

  const getTierStyle = (id: string) => TIER_STYLES[id] || { gradient: 'from-neutral-500 to-neutral-700', iconBg: 'bg-white/20', icon: <Package className="w-5 h-5 text-white" />, badge: 'bg-neutral-100 text-neutral-700' }

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

          {/* Existing Packages - Redesigned Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => {
              const isEditing = editingId === pkg.id
              const draft = isEditing ? editDraft! : pkg
              const annualMonthly = Math.round(pkg.price * (1 - ANNUAL_DISCOUNT))
              const annualTotal = annualMonthly * 12
              const tier = getTierStyle(pkg.id)

              return (
                <div key={pkg.id} className={`bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden transition-all hover:shadow-lg ${!pkg.active ? 'opacity-60' : ''}`}>
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-br ${tier.gradient} px-5 pt-5 pb-6 relative`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 ${tier.iconBg} rounded-xl flex items-center justify-center`}>
                        {tier.icon}
                      </div>
                      <div className="flex gap-1">
                        {!pkg.active && <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">INACTIVE</span>}
                        {pkg.popular && <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full">⭐ POPULAR</span>}
                        <button onClick={() => toggleActive(pkg.id)} className="p-1 bg-white/20 hover:bg-white/30 rounded-lg" title={pkg.active ? 'Deactivate' : 'Activate'}>
                          {pkg.active ? <ToggleRight className="w-4 h-4 text-white" /> : <ToggleLeft className="w-4 h-4 text-white" />}
                        </button>
                        {!isEditing && <button onClick={() => startEdit(pkg)} className="p-1 bg-white/20 hover:bg-white/30 rounded-lg" title="Edit"><Edit2 className="w-4 h-4 text-white" /></button>}
                        {!isEditing && <button onClick={() => deletePackage(pkg.id, pkg.name)} className="p-1 bg-white/20 hover:bg-red-500/80 rounded-lg" title="Delete package"><Trash2 className="w-4 h-4 text-white" /></button>}
                        {isEditing && (
                          <>
                            <button onClick={saveEdit} className="p-1 bg-green-500/80 hover:bg-green-500 rounded-lg"><Save className="w-4 h-4 text-white" /></button>
                            <button onClick={() => { setEditingId(null); setEditDraft(null) }} className="p-1 bg-white/20 hover:bg-white/30 rounded-lg"><X className="w-4 h-4 text-white" /></button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      {isEditing ? (
                        <input value={draft.name} onChange={e => setEditDraft(d => d ? { ...d, name: e.target.value } : d)}
                          className="text-xl font-bold text-white bg-white/20 border border-white/40 rounded-lg px-2 py-1 w-full focus:outline-none" />
                      ) : (
                        <h3 className="text-xl font-extrabold text-white">{pkg.name}</h3>
                      )}
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-white/70 text-sm">N$</span>
                          <input type="number" value={draft.price} onChange={e => setEditDraft(d => d ? { ...d, price: Number(e.target.value) } : d)}
                            className="w-24 text-2xl font-bold text-white bg-white/20 border border-white/40 rounded-lg px-2 py-0.5 focus:outline-none" />
                          <span className="text-white/70 text-sm">/mo</span>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="text-3xl font-extrabold text-white">N${pkg.price.toLocaleString()}</span>
                          <span className="text-white/70 text-sm ml-1">/month</span>
                        </div>
                      )}
                      <p className="text-white/80 text-xs mt-1">Annual: N${annualMonthly}/mo · <strong>N${annualTotal.toLocaleString()}/yr</strong> <span className="bg-white/20 px-1.5 py-0.5 rounded-full ml-1">20% off</span></p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Limits */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Borrowers', value: isEditing ? draft.maxBorrowers : pkg.maxBorrowers, field: 'maxBorrowers', icon: <Users className="w-3 h-3" /> },
                        { label: 'Loans', value: isEditing ? draft.maxLoans : pkg.maxLoans, field: 'maxLoans', icon: <TrendingUp className="w-3 h-3" /> },
                        { label: 'Staff', value: isEditing ? draft.maxUsers : pkg.maxUsers, field: 'maxUsers', icon: <Lock className="w-3 h-3" /> },
                      ].map(item => (
                        <div key={item.field} className="bg-neutral-50 border border-neutral-100 rounded-xl p-2">
                          <div className="flex items-center justify-center gap-1 text-neutral-400 mb-0.5">{item.icon}<span className="text-[10px]">{item.label}</span></div>
                          {isEditing ? (
                            <input type="number" value={item.value}
                              onChange={e => setEditDraft(d => d ? { ...d, [item.field]: Number(e.target.value) } : d)}
                              className="w-full text-base font-extrabold text-center border-b-2 border-cashub-400 focus:outline-none bg-transparent" />
                          ) : (
                            <p className="text-base font-extrabold text-neutral-900">{item.value === 0 ? '∞' : item.value.toLocaleString()}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-1.5">
                      {(isEditing ? draft.features : pkg.features).map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          {isEditing ? (
                            <input value={f} onChange={e => setEditDraft(d => d ? { ...d, features: d.features.map((fi, idx) => idx === i ? e.target.value : fi) } : d)}
                              className="flex-1 text-xs border-b border-cashub-200 focus:outline-none bg-transparent py-0.5" />
                          ) : (
                            <span className="text-xs text-neutral-600">{f}</span>
                          )}
                          {isEditing && (
                            <button onClick={() => setEditDraft(d => d ? { ...d, features: d.features.filter((_, fi) => fi !== i) } : d)} className="text-red-400 hover:text-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button onClick={() => setEditDraft(d => d ? { ...d, features: [...d.features, ''] } : d)}
                          className="text-xs text-cashub-600 hover:text-cashub-700 flex items-center gap-1 mt-1 font-medium">
                          <Plus className="w-3 h-3" /> Add feature
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── ASSIGN TO LENDERS TAB ─── */}
      {activeTab === 'assign' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-900">Assign Packages to Lenders</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Click a lender card to assign or change their subscription plan.</p>
            </div>
            <button onClick={fetchLenders} className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Annual savings (20% off):</strong> Starter N$2,400/yr · Professional N$3,360/yr · Enterprise N$4,800/yr
            </p>
          </div>

          {loadingLenders ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600" /></div>
          ) : lenders.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No active lenders found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lenders.map(lender => {
                const isAssigning = assigningPlan?.lenderId === lender.id
                const selectedPkgDef = isAssigning ? packages.find(p => p.id === assigningPlan.pkg) : null
                const previewCycle = isAssigning ? assigningPlan.cycle : 'monthly'
                const previewAmount = selectedPkgDef
                  ? previewCycle === 'annual'
                    ? Math.round(selectedPkgDef.price * (1 - ANNUAL_DISCOUNT)) * 12
                    : selectedPkgDef.price
                  : 0
                const hasWrongAnnualFee = lender.billingCycle === 'annual' && lender.amount !== null && lender.amount < 2000
                const planColor = lender.currentPlan === 'Enterprise' ? 'bg-violet-100 text-violet-700' : lender.currentPlan === 'Professional' ? 'bg-cashub-100 text-cashub-700' : lender.currentPlan === 'Starter' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-500'

                return (
                  <div key={lender.id} className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${isAssigning ? 'border-cashub-400 shadow-lg' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{(lender.company_name || '?').charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">{lender.company_name}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{lender.legal_name !== lender.company_name ? lender.legal_name + ' · ' : ''}{lender.registration_number}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${planColor}`}>{lender.currentPlan}</span>
                          <p className={`text-[10px] font-medium mt-0.5 ${lender.currentStatus === 'ACTIVE' ? 'text-green-600' : 'text-neutral-400'}`}>{lender.currentStatus}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500">
                        {lender.billingCycle && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="capitalize">{lender.billingCycle}</span>
                            {lender.amount !== null && <strong className="text-neutral-700">· N${lender.amount.toLocaleString()}</strong>}
                          </span>
                        )}
                        {lender.endDate && <span>Exp: {new Date(lender.endDate).toLocaleDateString()}</span>}
                      </div>

                      {hasWrongAnnualFee && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <p className="text-[10px] text-red-700 font-medium">Annual fee appears incorrect. Re-assign with \"Annual\" billing to fix.</p>
                        </div>
                      )}
                    </div>

                    {isAssigning ? (
                      <div className="border-t border-cashub-100 bg-cashub-50/40 p-4 space-y-3">
                        <p className="text-[10px] font-bold text-cashub-800 uppercase tracking-wider">Assign New Package</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-medium text-neutral-600 mb-1">Package</label>
                            <select
                              value={assigningPlan.pkg}
                              onChange={e => setAssigningPlan(prev => prev ? { ...prev, pkg: e.target.value } : prev)}
                              className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500 bg-white">
                              <option value="">Select...</option>
                              {packages.filter(p => p.active).map(p => (
                                <option key={p.id} value={p.id}>{p.name} — N${p.price}/mo</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-neutral-600 mb-1">Billing Cycle</label>
                            <select
                              value={assigningPlan.cycle}
                              onChange={e => setAssigningPlan(prev => prev ? { ...prev, cycle: e.target.value as 'monthly' | 'annual' } : prev)}
                              className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500 bg-white">
                              <option value="monthly">Monthly</option>
                              <option value="annual">Annual (20% off)</option>
                            </select>
                          </div>
                        </div>
                        {selectedPkgDef && (
                          <div className="bg-white border border-cashub-200 rounded-lg px-3 py-2 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">Total charge:</span>
                            <span className="text-sm font-extrabold text-cashub-700">N${previewAmount.toLocaleString()}/{previewCycle === 'annual' ? 'year' : 'month'}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => setAssigningPlan(null)} className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium">Cancel</button>
                          <button onClick={assignPlan} disabled={savingAssign || !assigningPlan.pkg}
                            className="flex-1 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1">
                            {savingAssign ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            {savingAssign ? 'Saving...' : 'Confirm Assign'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-neutral-100 px-4 py-2.5">
                        <button
                          onClick={() => setAssigningPlan({ lenderId: lender.id, pkg: '', cycle: 'monthly' })}
                          className="w-full py-1.5 text-xs font-semibold text-cashub-600 hover:bg-cashub-50 rounded-lg transition-colors">
                          + Assign / Change Plan
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
