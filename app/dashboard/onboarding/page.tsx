"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Building, CheckCircle, XCircle, Clock, Eye, Search, Filter,
  Shield, Crown, Star, Users, FileText, AlertTriangle, Ban,
  RefreshCw, Mail, Phone, Calendar, MapPin, CreditCard,
  TrendingUp, Zap, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'

type OnboardingStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended'
type PackageTier = 'free-trial' | 'basic' | 'medium' | 'advanced' | 'starter' | 'professional' | 'enterprise'

interface LenderRequest {
  id: string
  company_name: string
  legal_name: string
  registration_number: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  namfisa_license?: string
  years_in_business: number
  total_borrowers?: number
  monthly_disbursement?: number
  package_tier: PackageTier
  status: OnboardingStatus
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  notes?: string
}

const PACKAGE_INFO: Record<PackageTier, { name: string; price: number; color: string; icon: React.ReactNode; features: string[] }> = {
  'free-trial': {
    name: 'Free Trial',
    price: 0,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: <Star className="w-4 h-4" />,
    features: ['30-day trial', '10 borrowers', 'Basic features']
  },
  'basic': {
    name: 'Basic',
    price: 499,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Users className="w-4 h-4" />,
    features: ['50 borrowers', 'View-only registry', 'Basic reports']
  },
  'medium': {
    name: 'Medium',
    price: 999,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <FileText className="w-4 h-4" />,
    features: ['200 borrowers', 'Full registry', 'Disputes', 'Reports']
  },
  'advanced': {
    name: 'Advanced',
    price: 1999,
    color: 'bg-cashub-100 text-cashub-700 border-cashub-200',
    icon: <Crown className="w-4 h-4" />,
    features: ['1000 borrowers', 'API access', 'NAMFISA reports', '5 users', 'Priority support']
  },
  'starter': {
    name: 'Starter',
    price: 250,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Star className="w-4 h-4" />,
    features: ['Up to 50 active loans', '2 loan officers', 'Basic reports', 'Shared registry access']
  },
  'professional': {
    name: 'Professional',
    price: 350,
    color: 'bg-cashub-100 text-cashub-700 border-cashub-200',
    icon: <Zap className="w-4 h-4" />,
    features: ['Up to 250 active loans', '10 loan officers', 'Advanced reports', 'NAMFISA compliance', 'Marketplace access']
  },
  'enterprise': {
    name: 'Enterprise',
    price: 500,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Crown className="w-4 h-4" />,
    features: ['Unlimited loans & staff', 'Full analytics suite', 'Priority support', 'Custom integrations', 'Multi-branch management']
  }
}


export default function LenderOnboardingPage() {
  const [requests, setRequests] = useState<LenderRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OnboardingStatus>('all')
  const [packageFilter, setPackageFilter] = useState<'all' | PackageTier>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'unsuspend'>('approve')
  const [actionTarget, setActionTarget] = useState<LenderRequest | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    if (role === 'super_admin' || role === 'admin') {
      setAllowed(true)
      fetchRequests()
    } else {
      setAllowed(false)
    }
  }, [])

  const syncLenderNames = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const { data: onboarding } = await supabase
        .from('lender_onboarding')
        .select('email, company_name, legal_name')
        .eq('status', 'approved')
      if (!onboarding?.length) { setSyncMsg('No approved lenders to sync.'); setSyncing(false); return }
      let updated = 0
      for (const o of onboarding) {
        const { error } = await supabase
          .from('lenders')
          .update({ company_name: o.company_name, legal_name: o.legal_name || o.company_name })
          .eq('email', o.email)
        if (!error) updated++
      }
      setSyncMsg(`✓ Synced ${updated} of ${onboarding.length} lender names successfully.`)
      setTimeout(() => setSyncMsg(''), 5000)
    } catch (err: any) {
      setSyncMsg(`Error: ${err.message}`)
    }
    setSyncing(false)
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('lender_onboarding')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (!error && data) {
        setRequests(data as LenderRequest[])
      } else {
        setRequests([])
      }
    } catch {
      setRequests([])
    }
    setLoading(false)
  }

  const handleAction = async () => {
    if (!actionTarget) return
    setActionSubmitting(true)
    try {
      const newStatus = actionType === 'unsuspend' ? 'approved' : actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'suspended'
      
      // Update onboarding status
      await supabase.from('lender_onboarding').update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: localStorage.getItem('userName') || 'Super Admin',
        rejection_reason: actionType === 'reject' ? actionReason : undefined,
        notes: actionType === 'suspend' ? actionReason : actionTarget.notes,
      }).eq('id', actionTarget.id)

      // If approving, activate lender in lenders table and create subscription
      if (actionType === 'approve') {
        // Find lender by email
        const { data: lenders } = await supabase.from('lenders').select('id').eq('email', actionTarget.email).limit(1)
        if (lenders && lenders.length > 0) {
          const lenderId = lenders[0].id
          // Activate lender
          await supabase.from('lenders').update({ is_active: true }).eq('id', lenderId)
          // Create subscription record - map old tiers to new pricing
          const tierMap: Record<PackageTier, { id: string; name: string; price: number }> = {
            'free-trial': { id: 'starter', name: 'Starter', price: 250 },
            'basic': { id: 'starter', name: 'Starter', price: 250 },
            'medium': { id: 'professional', name: 'Professional', price: 350 },
            'advanced': { id: 'enterprise', name: 'Enterprise', price: 500 },
            'starter': { id: 'starter', name: 'Starter', price: 250 },
            'professional': { id: 'professional', name: 'Professional', price: 350 },
            'enterprise': { id: 'enterprise', name: 'Enterprise', price: 500 },
          }
          const plan = tierMap[actionTarget.package_tier]
          await supabase.from('lender_subscriptions').upsert({
            lender_id: lenderId,
            package_id: plan.id,
            package_name: plan.name,
            plan_type: plan.id,
            amount: plan.price,
            status: 'ACTIVE',
            payment_status: 'paid',
            start_date: new Date().toISOString().split('T')[0],
          })
        }
      }

      setRequests(prev => prev.map(r =>
        r.id === actionTarget.id ? {
          ...r,
          status: newStatus as OnboardingStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: localStorage.getItem('userName') || 'Super Admin',
          rejection_reason: actionType === 'reject' ? actionReason : r.rejection_reason,
          notes: actionType === 'suspend' ? actionReason : r.notes,
        } : r
      ))
    } catch { /* local fallback already applied above */ }
    setShowActionModal(false)
    setActionTarget(null)
    setActionReason('')
    setActionSubmitting(false)
  }

  const openAction = (type: 'approve' | 'reject' | 'suspend' | 'unsuspend', request: LenderRequest) => {
    setActionType(type)
    setActionTarget(request)
    setActionReason('')
    setShowActionModal(true)
  }

  const getStatusColor = (status: OnboardingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'under_review': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      case 'suspended': return 'bg-orange-100 text-orange-700 border-orange-200'
    }
  }

  const getStatusIcon = (status: OnboardingStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />
      case 'under_review': return <Eye className="w-3.5 h-3.5" />
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />
      case 'suspended': return <Ban className="w-3.5 h-3.5" />
    }
  }

  const filtered = requests.filter(r => {
    const matchesSearch = r.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesPkg = packageFilter === 'all' || r.package_tier === packageFilter
    return matchesSearch && matchesStatus && matchesPkg
  })

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    underReview: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    suspended: requests.filter(r => r.status === 'suspended').length,
  }

  if (allowed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="w-12 h-12 text-neutral-300 mb-3" />
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Super Admin Access Only</h1>
        <p className="text-neutral-500 text-sm max-w-md">Lender onboarding management is restricted to super administrators.</p>
      </div>
    )
  }

  if (loading || allowed === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Lender Onboarding</h2>
          <p className="text-neutral-500">Review and manage lender registration requests</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
            {stats.pending} Pending
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            {stats.underReview} In Review
          </span>
          <button onClick={syncLenderNames} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Lender Names'}
          </button>
        </div>
        {syncMsg && <p className={`text-xs mt-1 ${syncMsg.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'} font-medium`}>{syncMsg}</p>}
      </div>

      {/* Workflow Steps */}
      <div className="bg-gradient-to-r from-cashub-50 to-violet-50 border border-cashub-100 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-cashub-700 uppercase tracking-wider mb-4">Workflow 1: Lender Subscription & Onboarding</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { step: 1, label: 'Company Registers', icon: Building, desc: 'Signup form' },
            { step: 2, label: 'KYC / Business Docs', icon: FileText, desc: 'License, registration' },
            { step: 3, label: 'Choose Package', icon: Star, desc: 'Starter / Pro / Enterprise' },
            { step: 4, label: 'Pay Subscription', icon: CreditCard, desc: 'Monthly fee' },
            { step: 5, label: 'Admin Reviews', icon: Eye, desc: 'Verify & approve' },
            { step: 6, label: 'Admin Activates', icon: CheckCircle, desc: 'Tenant workspace created' },
            { step: 7, label: 'Create Users', icon: Users, desc: 'Loan officers, admins' },
            { step: 8, label: 'Start Operating', icon: Zap, desc: 'Fully independent' },
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-cashub-100 shadow-sm">
                <div className="w-6 h-6 bg-cashub-100 rounded-full flex items-center justify-center text-[10px] font-black text-cashub-700">{s.step}</div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-800">{s.label}</p>
                  <p className="text-[10px] text-neutral-400">{s.desc}</p>
                </div>
              </div>
              {i < 7 && <div className="text-neutral-300 font-bold text-sm hidden sm:block">›</div>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-cashub-600 mt-3 font-medium">✅ System Admin controls platform access only — lenders operate their tenants independently after activation.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'In Review', value: stats.underReview, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Suspended', value: stats.suspended, icon: Ban, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500">{s.label}</p>
                <p className="text-xl font-bold text-neutral-900 mt-0.5">{s.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by company, contact, registration..."
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={packageFilter} onChange={e => setPackageFilter(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
            <option value="all">All Packages</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
            <option value="free-trial">Free Trial (Legacy)</option>
            <option value="basic">Basic (Legacy)</option>
            <option value="medium">Medium (Legacy)</option>
            <option value="advanced">Advanced (Legacy)</option>
          </select>
        </div>
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <Building className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500">No lender requests match your filters.</p>
          </div>
        )}

        {filtered.map(req => {
          const pkg = PACKAGE_INFO[req.package_tier]
          const isExpanded = expandedId === req.id
          return (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              {/* Card Header */}
              <div className="p-5 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-lg font-bold text-white">{req.company_name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-neutral-900">{req.company_name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)} {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${pkg.color}`}>
                        {pkg.icon} {pkg.name} — N$ {pkg.price}/mo
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{req.legal_name} &bull; {req.registration_number}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{req.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{req.phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.city}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400">{new Date(req.submitted_at).toLocaleDateString()}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-neutral-100 bg-neutral-50/50">
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Company Details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Company Details</h4>
                      {[
                        { label: 'Contact Person', value: req.contact_person },
                        { label: 'Email', value: req.email },
                        { label: 'Phone', value: req.phone },
                        { label: 'Address', value: `${req.address}, ${req.city}` },
                        { label: 'NAMFISA License', value: req.namfisa_license || 'Not provided' },
                        { label: 'Years in Business', value: `${req.years_in_business} year${req.years_in_business !== 1 ? 's' : ''}` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-neutral-500">{item.label}</span>
                          <span className="font-medium text-neutral-900 text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Business Metrics */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Business Metrics</h4>
                      {[
                        { label: 'Total Borrowers', value: req.total_borrowers?.toLocaleString() || 'N/A' },
                        { label: 'Monthly Disbursement', value: req.monthly_disbursement ? `N$ ${req.monthly_disbursement.toLocaleString()}` : 'N/A' },
                        { label: 'Submitted', value: new Date(req.submitted_at).toLocaleString() },
                        { label: 'Reviewed', value: req.reviewed_at ? new Date(req.reviewed_at).toLocaleString() : 'Pending' },
                        { label: 'Reviewed By', value: req.reviewed_by || 'N/A' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-neutral-500">{item.label}</span>
                          <span className="font-medium text-neutral-900 text-right">{item.value}</span>
                        </div>
                      ))}
                      {!req.namfisa_license && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-red-700">No NAMFISA license provided. Verify before approving.</p>
                        </div>
                      )}
                    </div>

                    {/* Package & Actions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Subscribed Package</h4>
                      <div className={`rounded-xl border p-3 ${pkg.color}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {pkg.icon}
                          <span className="text-sm font-bold">{pkg.name}</span>
                          <span className="ml-auto text-sm font-bold">N$ {pkg.price}/mo</span>
                        </div>
                        <div className="space-y-1">
                          {pkg.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px]">
                              <CheckCircle className="w-3 h-3 flex-shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      {req.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-[10px] font-bold text-red-800 mb-0.5">Rejection Reason:</p>
                          <p className="text-[10px] text-red-700">{req.rejection_reason}</p>
                        </div>
                      )}

                      {req.notes && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                          <p className="text-[10px] font-bold text-orange-800 mb-0.5">Admin Notes:</p>
                          <p className="text-[10px] text-orange-700">{req.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2">
                        {(req.status === 'pending' || req.status === 'under_review') && (
                          <>
                            <button onClick={() => openAction('approve', req)}
                              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Approve Lender
                            </button>
                            <button onClick={() => openAction('reject', req)}
                              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Reject Application
                            </button>
                          </>
                        )}
                        {req.status === 'approved' && (
                          <button onClick={() => openAction('suspend', req)}
                            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                            <Ban className="w-3.5 h-3.5" /> Suspend Lender
                          </button>
                        )}
                        {req.status === 'suspended' && (
                          <button onClick={() => openAction('unsuspend', req)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Unsuspend Lender
                          </button>
                        )}
                        {req.status === 'pending' && (
                          <button onClick={async () => {
                            await supabase.from('lender_onboarding').update({ status: 'under_review' }).eq('id', req.id)
                            setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'under_review' as OnboardingStatus } : r))
                          }}
                            className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Mark as Under Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ═══ ACTION MODAL ═══ */}
      {showActionModal && actionTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">
                {actionType === 'approve' && 'Approve Lender'}
                {actionType === 'reject' && 'Reject Application'}
                {actionType === 'suspend' && 'Suspend Lender'}
                {actionType === 'unsuspend' && 'Unsuspend Lender'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {actionTarget.company_name} &bull; {actionTarget.registration_number}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{actionTarget.company_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{actionTarget.company_name}</p>
                    <p className="text-xs text-neutral-500">{PACKAGE_INFO[actionTarget.package_tier].name} — N$ {PACKAGE_INFO[actionTarget.package_tier].price}/mo</p>
                  </div>
                </div>
              </div>

              {actionType === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">This will grant the lender full access to the CasHuB platform with their selected package features. They will receive an email notification.</p>
                </div>
              )}

              {(actionType === 'reject' || actionType === 'suspend') && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    {actionType === 'reject' ? 'Rejection Reason' : 'Suspension Reason'} <span className="text-red-500">*</span>
                  </label>
                  <textarea value={actionReason} onChange={e => setActionReason(e.target.value)}
                    rows={3} placeholder={actionType === 'reject' ? 'Explain why this application is being rejected...' : 'Explain why this lender is being suspended...'}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
              )}

              {actionType === 'unsuspend' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">This will restore the lender&apos;s access to the CasHuB platform. Their subscription and data will remain intact.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button onClick={() => { setShowActionModal(false); setActionTarget(null) }}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700">
                Cancel
              </button>
              <button onClick={handleAction}
                disabled={((actionType === 'reject' || actionType === 'suspend') && !actionReason.trim()) || actionSubmitting}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  actionType === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}>
                {actionSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {actionType === 'approve' && 'Approve'}
                {actionType === 'reject' && 'Reject'}
                {actionType === 'suspend' && 'Suspend'}
                {actionType === 'unsuspend' && 'Unsuspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
