"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { 
  CreditCard, 
  Crown, 
  Star, 
  Check, 
  X, 
  TrendingUp, 
  Users, 
  FileText, 
  Shield, 
  Zap,
  AlertCircle,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react'

interface SubscriptionPackage {
  id: string
  name: string
  price: number
  duration: number
  maxBorrowers: number
  maxUsers: number
  features: string[]
  popular?: boolean
  color: string
  icon: React.ReactNode
}

interface Subscription {
  id: string
  packageId: string
  packageName: string
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'SUSPENDED'
  startDate: string
  endDate: string
  autoRenew: boolean
  lender?: {
    legal_name: string
    registration_number: string
  }
}

export default function BillingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'history' | 'usage' | 'lender_plans'>('overview')
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [role, setRole] = useState<string | null>(null)
  const previewMode = !isSupabaseConfigured

  const ANNUAL_DISCOUNT = 0.20
  const isSuperAdmin = role === 'super_admin'

  const [packageOrder, setPackageOrder] = useState<string[]>(['starter', 'professional', 'enterprise'])
  const [lenderPlans, setLenderPlans] = useState<{ id: string; legal_name: string; registration_number: string; currentPlan: string; currentStatus: string }[]>([])
  const [lenderPlansLoading, setLenderPlansLoading] = useState(false)
  const [assigningPlan, setAssigningPlan] = useState<{ lenderId: string; pkg: string } | null>(null)
  const [planAssigning, setPlanAssigning] = useState(false)

  const fetchLenderPlans = async () => {
    setLenderPlansLoading(true)
    try {
      const { data: lendersData } = await supabase
        .from('lenders')
        .select('id, legal_name, registration_number')
        .eq('is_active', true)
        .order('legal_name')
      const lenders = lendersData || []
      const { data: subsData } = await supabase
        .from('lender_subscriptions')
        .select('lender_id, package_name, status')
      const subsMap = new Map<string, { package_name: string; status: string }>()
      for (const s of (subsData || [])) subsMap.set(s.lender_id, s)
      setLenderPlans(lenders.map((l: any) => ({
        id: l.id, legal_name: l.legal_name, registration_number: l.registration_number,
        currentPlan: subsMap.get(l.id)?.package_name || 'none',
        currentStatus: subsMap.get(l.id)?.status || 'NONE',
      })))
    } catch (err) { console.error('Error fetching lender plans:', err) }
    setLenderPlansLoading(false)
  }

  const assignPlan = async () => {
    if (!assigningPlan) return
    setPlanAssigning(true)
    try {
      const pkg = allPackages.find(p => p.id === assigningPlan.pkg)!
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + pkg.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      await supabase.from('lender_subscriptions').upsert({
        lender_id: assigningPlan.lenderId,
        package_id: pkg.id,
        package_name: pkg.name,
        status: 'ACTIVE',
        start_date: startDate,
        end_date: endDate,
        amount: pkg.price,
        auto_renew: false,
      }, { onConflict: 'lender_id' })
      setAssigningPlan(null)
      await fetchLenderPlans()
    } catch (err) { console.error('Error assigning plan:', err) }
    setPlanAssigning(false)
  }

  const allPackages: SubscriptionPackage[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 250,
      duration: 30,
      maxBorrowers: 50,
      maxUsers: 2,
      features: [
        'Up to 50 active loans',
        '2 loan officers',
        'Basic reports',
        'Shared registry access',
        'Standard support'
      ],
      color: 'from-blue-500 to-blue-600',
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 350,
      duration: 30,
      maxBorrowers: 250,
      maxUsers: 10,
      features: [
        'Up to 250 active loans',
        '10 loan officers',
        'Advanced reports & analytics',
        'NAMFISA compliance exports',
        'Marketplace access',
        'Dispute participation'
      ],
      popular: true,
      color: 'from-cashub-600 to-accent-500',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 500,
      duration: 30,
      maxBorrowers: 0,
      maxUsers: 0,
      features: [
        'Unlimited loans & staff',
        'Full analytics suite',
        'Priority support',
        'Custom integrations',
        'Multi-branch management',
        'Dedicated account manager'
      ],
      color: 'from-violet-600 to-purple-700',
      icon: <Crown className="w-6 h-6" />
    }
  ]

  const packages = packageOrder.map(id => allPackages.find(p => p.id === id)!).filter(Boolean)

  const movePackage = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...packageOrder]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newOrder.length) return
    ;[newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
    setPackageOrder(newOrder)
    localStorage.setItem('packageOrder', JSON.stringify(newOrder))
  }

  useEffect(() => {
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    setRole(userRole)
    const savedOrder = typeof window !== 'undefined' ? localStorage.getItem('packageOrder') : null
    if (savedOrder) { try { setPackageOrder(JSON.parse(savedOrder)) } catch (err) { console.error('Billing parse error:', err) } }
    const allowedRoles = ['super_admin', 'lender_admin', 'loan_officer']
    if (userRole && allowedRoles.includes(userRole)) {
      setAllowed(true)
      fetchSubscriptionData()
    } else {
      setAllowed(false)
    }
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (previewMode) {
        setCurrentSubscription(null)
        setError('Supabase is not configured. Please set up environment variables.')
        return
      }

      const { data, error } = await supabase
        .from('lender_subscriptions')
        .select('id, package_id, package_name, status, start_date, end_date, auto_renew, amount')
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching subscription:', error)
        setCurrentSubscription(null)
        return
      }

      if (!data) {
        setCurrentSubscription(null)
        return
      }

      const mapped: Subscription = {
        id: data.id,
        packageId: data.package_id || 'custom',
        packageName: data.package_name || 'Custom Plan',
        status: (data.status || 'ACTIVE') as Subscription['status'],
        startDate: data.start_date || '',
        endDate: data.end_date || '',
        autoRenew: !!data.auto_renew
      }

      setCurrentSubscription(mapped)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      setCurrentSubscription(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'EXPIRING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200'
      case 'SUSPENDED': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleUpgrade = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg)
    setShowUpgradeModal(true)
  }

  const processUpgrade = async () => {
    if (!selectedPackage) return
    
    try {
      // Mock upgrade process - in real app, integrate with payment gateway
      console.log('Processing upgrade to:', selectedPackage.name)
      setShowUpgradeModal(false)
      setSelectedPackage(null)
      await fetchSubscriptionData()
    } catch (error) {
      console.error('Error processing upgrade:', error)
    }
  }

  if (allowed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Access restricted</h1>
        <p className="text-neutral-500 text-sm max-w-md">
          Subscription and billing settings are restricted to lender and system administrators.
        </p>
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
          <h2 className="text-2xl font-bold text-neutral-900">Subscription & Billing</h2>
          <p className="text-neutral-500">Manage your subscription and billing</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Subscription Overview */}
      {currentSubscription && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Current Subscription</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentSubscription.status)}`}>
              {currentSubscription.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Package</p>
              <p className="font-semibold text-neutral-900">{currentSubscription.packageName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Period</p>
              <p className="font-semibold text-neutral-900">
                {new Date(currentSubscription.startDate).toLocaleDateString()} - {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Days Remaining</p>
              <p className="font-semibold text-neutral-900">
                {getDaysUntilExpiry(currentSubscription.endDate)} days
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Auto-renew</p>
              <p className="font-semibold text-neutral-900">
                {currentSubscription.autoRenew ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>

          {currentSubscription.status === 'EXPIRING' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">Subscription Expiring Soon</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription will expire in {getDaysUntilExpiry(currentSubscription.endDate)} days. 
                    Upgrade now to avoid service interruption.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            {[
              { id: 'packages', label: 'Packages', icon: CreditCard },
              { id: 'history', label: 'Payment History', icon: Calendar },
              { id: 'usage', label: 'Usage Statistics', icon: TrendingUp },
              ...(isSuperAdmin ? [{ id: 'lender_plans', label: 'Lender Plans', icon: Users }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); if (tab.id === 'lender_plans') fetchLenderPlans() }}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="p-6">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center bg-neutral-100 rounded-xl p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative z-10 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`relative z-10 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    billingCycle === 'annual'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Annual
                </button>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                  SAVE 20%
                </span>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-violet-700"><strong>Super Admin:</strong> Use the arrows on each package card to reorder how packages are displayed to lenders.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg, pkgIndex) => {
                const monthlyPrice = pkg.price
                const annualMonthlyPrice = Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT))
                const annualTotalPrice = annualMonthlyPrice * 12
                const displayPrice = billingCycle === 'annual' ? annualMonthlyPrice : monthlyPrice
                const savings = billingCycle === 'annual' ? (monthlyPrice * 12) - annualTotalPrice : 0

                return (
                  <div key={pkg.id} className={`relative bg-white rounded-xl shadow-sm border-2 ${
                    pkg.popular ? 'border-cashub-500' : 'border-neutral-200'
                  } p-6 hover:shadow-lg transition-shadow`}>
                    {isSuperAdmin && (
                      <div className="absolute top-2 right-2 flex flex-col gap-0.5 z-10">
                        <button onClick={() => movePackage(pkgIndex, 'up')} disabled={pkgIndex === 0}
                          className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 transition-colors" title="Move Left">
                          <ArrowUp className="w-3 h-3 text-neutral-600" />
                        </button>
                        <button onClick={() => movePackage(pkgIndex, 'down')} disabled={pkgIndex === packages.length - 1}
                          className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 transition-colors" title="Move Right">
                          <ArrowDown className="w-3 h-3 text-neutral-600" />
                        </button>
                      </div>
                    )}
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-cashub-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${pkg.color} text-white mb-4`}>
                        {pkg.icon}
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-neutral-900">
                        N$ {displayPrice.toLocaleString()}
                        <span className="text-sm font-normal text-neutral-500">/month</span>
                      </div>
                      {billingCycle === 'annual' && monthlyPrice > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-xs text-neutral-400 line-through">
                            N$ {monthlyPrice.toLocaleString()}/month
                          </p>
                          <p className="text-xs font-semibold text-green-600">
                            N$ {annualTotalPrice.toLocaleString()}/year — Save N$ {savings.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {billingCycle === 'annual' && monthlyPrice === 0 && (
                        <p className="mt-1.5 text-xs text-neutral-400">Free for 30 days</p>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-neutral-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm text-neutral-500 mb-6">
                      <div className="flex justify-between">
                        <span>Max Borrowers:</span>
                        <span className="font-medium text-neutral-900">{pkg.maxBorrowers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Users:</span>
                        <span className="font-medium text-neutral-900">{pkg.maxUsers}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgrade(pkg)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        currentSubscription?.packageId === pkg.id
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : pkg.popular
                          ? 'bg-cashub-600 text-white hover:bg-cashub-700'
                          : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                      }`}
                      disabled={currentSubscription?.packageId === pkg.id}
                    >
                      {currentSubscription?.packageId === pkg.id ? 'Current Plan' : 'Upgrade Now'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Jan 1, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Free Trial Activation
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      N$ 0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      System
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lender Plans Tab — super_admin only */}
        {activeTab === 'lender_plans' && isSuperAdmin && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Lender Subscription Management</h3>
                <p className="text-sm text-neutral-500">Manually assign or change billing packages for registered lenders</p>
              </div>
              <button onClick={fetchLenderPlans} className="inline-flex items-center px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm">
                <RefreshCw className="w-4 h-4 mr-2" />Refresh
              </button>
            </div>
            {lenderPlansLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600" /></div>
            ) : lenderPlans.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No lenders found. <button onClick={fetchLenderPlans} className="text-cashub-600 underline">Load lenders</button></p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Lender</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Reg. Number</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Current Plan</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Assign Package</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {lenderPlans.map(lender => (
                      <tr key={lender.id} className="hover:bg-neutral-50">
                        <td className="px-5 py-3 text-sm font-medium text-neutral-900">{lender.legal_name}</td>
                        <td className="px-5 py-3 text-xs text-neutral-500">{lender.registration_number}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            lender.currentPlan === 'none' ? 'bg-neutral-100 text-neutral-600' :
                            lender.currentPlan === 'Enterprise' ? 'bg-violet-100 text-violet-700' :
                            lender.currentPlan === 'Professional' ? 'bg-cashub-100 text-cashub-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{lender.currentPlan === 'none' ? 'No Plan' : lender.currentPlan}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            lender.currentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            lender.currentStatus === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                            lender.currentStatus === 'EXPIRING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-neutral-100 text-neutral-500'
                          }`}>{lender.currentStatus}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue=""
                              onChange={e => e.target.value && setAssigningPlan({ lenderId: lender.id, pkg: e.target.value })}
                              className="px-2 py-1 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-cashub-500 bg-white">
                              <option value="">Select...</option>
                              {allPackages.map(p => <option key={p.id} value={p.id}>{p.name} — N${p.price}/mo</option>)}
                            </select>
                            {assigningPlan?.lenderId === lender.id && (
                              <button onClick={assignPlan} disabled={planAssigning}
                                className="px-3 py-1 bg-cashub-600 text-white rounded-lg text-xs hover:bg-cashub-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                                {planAssigning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Assign
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Usage Statistics Tab */}
        {activeTab === 'usage' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-900">Borrowers</h4>
                  <Users className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-2">8 / 10</div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-cashub-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-sm text-neutral-500 mt-2">80% of limit used</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-900">Users</h4>
                  <Shield className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-2">1 / 1</div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-cashub-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm text-neutral-500 mt-2">100% of limit used</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-900">Reports Generated</h4>
                  <FileText className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-2">12</div>
                <p className="text-sm text-neutral-500 mt-2">This month</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPackage && (() => {
        const modalMonthly = selectedPackage.price
        const modalAnnualMonthly = Math.round(modalMonthly * (1 - ANNUAL_DISCOUNT))
        const modalAnnualTotal = modalAnnualMonthly * 12
        const modalPrice = billingCycle === 'annual' ? modalAnnualMonthly : modalMonthly
        const modalSavings = billingCycle === 'annual' ? (modalMonthly * 12) - modalAnnualTotal : 0

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upgrade Subscription</h3>
              <div className="mb-4">
                <p className="text-sm text-neutral-600 mb-2">
                  You&apos;re upgrading to <span className="font-medium text-neutral-900">{selectedPackage.name}</span>
                  <span className="ml-1 text-xs text-neutral-400">({billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing)</span>
                </p>
                <div className="text-3xl font-bold text-cashub-600">
                  N$ {modalPrice.toLocaleString()}
                  <span className="text-sm font-normal text-neutral-500">/month</span>
                </div>
                {billingCycle === 'annual' && modalMonthly > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-neutral-400 line-through">N$ {modalMonthly.toLocaleString()}/month</p>
                    <p className="text-xs font-semibold text-green-600">
                      Billed N$ {modalAnnualTotal.toLocaleString()}/year — You save N$ {modalSavings.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2 text-sm">What&apos;s included:</h4>
                <ul className="space-y-1">
                  {selectedPackage.features.map((feature, index) => (
                    <li key={index} className="text-xs text-neutral-600 flex items-start">
                      <Check className="w-3.5 h-3.5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false)
                    setSelectedPackage(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processUpgrade}
                  className="px-6 py-2 bg-cashub-600 text-white text-sm font-semibold rounded-lg hover:bg-cashub-700 transition-all shadow-md hover:shadow-lg"
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
