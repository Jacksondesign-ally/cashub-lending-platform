import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
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
  HelpCircle
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
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'history' | 'usage'>('overview')
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)

  const packages: SubscriptionPackage[] = [
    {
      id: 'free-trial',
      name: 'Free Trial',
      price: 0,
      duration: 30,
      maxBorrowers: 10,
      maxUsers: 1,
      features: [
        'Full platform access',
        'Shared blacklist registry',
        'Dispute participation',
        'Report exports',
        'Basic support'
      ],
      color: 'from-gray-500 to-gray-600',
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 499,
      duration: 30,
      maxBorrowers: 50,
      maxUsers: 1,
      features: [
        'Limited borrower registry (view-only)',
        'Basic loan & borrower management',
        'View blacklist (cannot create)',
        'Monthly summary reports',
        'Single user access'
      ],
      color: 'from-blue-500 to-blue-600',
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'medium',
      name: 'Medium',
      price: 999,
      duration: 30,
      maxBorrowers: 200,
      maxUsers: 1,
      features: [
        'Full borrower registry access',
        'Create & view blacklists',
        'Participate in disputes',
        'Monthly + quarterly reports',
        'Notifications enabled',
        'Single user access'
      ],
      color: 'from-purple-500 to-purple-600',
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: 1999,
      duration: 30,
      maxBorrowers: 1000,
      maxUsers: 5,
      features: [
        'Full analytics & raw data insights',
        'NAMFISA quarterly reports (auto-generated)',
        'Blacklist creation & dispute resolution',
        'API access',
        'Priority support',
        'Multi-user support (up to 5)',
        'Advanced risk scoring'
      ],
      popular: true,
      color: 'from-cashub-600 to-accent-500',
      icon: <Crown className="w-6 h-6" />
    }
  ]

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Mock current subscription - in real app, fetch from Supabase
      const mockSubscription: Subscription = {
        id: '1',
        packageId: 'free-trial',
        packageName: 'Free Trial',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        autoRenew: false,
        lender: {
          legal_name: 'QuickCash Finance',
          registration_number: 'RC2024001'
        }
      }
      
      setCurrentSubscription(mockSubscription)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
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
      
      // Update subscription in Supabase
      // await supabase.from('lender_subscriptions').update({
      //   package_id: selectedPackage.id,
      //   start_date: new Date().toISOString(),
      //   end_date: new Date(Date.now() + selectedPackage.duration * 24 * 60 * 60 * 1000).toISOString(),
      //   status: 'ACTIVE'
      // }).eq('id', currentSubscription?.id)
      
      setShowUpgradeModal(false)
      setSelectedPackage(null)
      await fetchSubscriptionData()
    } catch (error) {
      console.error('Error processing upgrade:', error)
    }
  }

  if (loading) {
    return (
      <Layout title="Subscription & Billing">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Subscription & Billing">
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
              <button
                onClick={() => setActiveTab('packages')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'packages'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Packages
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment History
                </div>
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'usage'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Usage Statistics
                </div>
              </button>
            </nav>
          </div>

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className={`relative bg-white rounded-xl shadow-sm border-2 ${
                    pkg.popular ? 'border-cashub-500' : 'border-neutral-200'
                  } p-6 hover:shadow-lg transition-shadow`}>
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
                        N$ {pkg.price.toLocaleString()}
                        <span className="text-sm font-normal text-neutral-500">/month</span>
                      </div>
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
                        pkg.popular
                          ? 'bg-cashub-600 text-white hover:bg-cashub-700'
                          : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                      }`}
                    >
                      {currentSubscription?.packageId === pkg.id ? 'Current Plan' : 'Upgrade Now'}
                    </button>
                  </div>
                ))}
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
        {showUpgradeModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upgrade Subscription</h3>
              <div className="mb-4">
                <p className="text-sm text-neutral-600 mb-2">
                  You're upgrading to <span className="font-medium text-neutral-900">{selectedPackage.name}</span>
                </p>
                <p className="text-2xl font-bold text-cashub-600">
                  N$ {selectedPackage.price.toLocaleString()}/month
                </p>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-neutral-900 mb-2">What's included:</h4>
                <ul className="space-y-1">
                  {selectedPackage.features.map((feature, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processUpgrade}
                  className="px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
