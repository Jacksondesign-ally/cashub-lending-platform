import React, { useState } from 'react';
import { 
  CreditCard,
  Package,
  Users,
  Shield,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  DollarSign,
  FileText,
  BarChart3,
  Bell,
  UserPlus,
  Crown,
  Star
} from 'lucide-react';

const SubscriptionBilling = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Current subscription status
  const currentSubscription = {
    package: 'MEDIUM',
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    daysRemaining: 344,
    autoRenew: true,
    currentUsers: 1,
    maxUsers: 1,
    currentBorrowers: 156,
    maxBorrowers: 500,
    features: [
      'Full borrower registry access',
      'Create & view blacklists',
      'Participate in disputes',
      'Monthly + quarterly reports',
      'Notifications enabled'
    ]
  };

  // Available packages
  const packages = [
    {
      id: 'FREE',
      name: 'Free Trial',
      price: 0,
      duration: 30,
      badge: 'Limited',
      color: 'from-gray-500 to-gray-600',
      maxBorrowers: 10,
      maxUsers: 1,
      features: [
        'Duration: 14-30 days',
        'Max 10 borrowers',
        'Basic loan management',
        'No shared blacklist registry',
        'No dispute participation',
        'No report exports',
        'Single user only'
      ],
      limitations: [
        'No blacklist access',
        'No analytics',
        'No API access'
      ]
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 2500,
      duration: 30,
      badge: 'Starter',
      color: 'from-blue-500 to-cyan-500',
      maxBorrowers: 100,
      maxUsers: 1,
      features: [
        'Limited borrower registry (view-only)',
        'Basic loan & borrower management',
        'View blacklist (cannot create)',
        'Monthly summary reports',
        'Email support',
        'Single user'
      ],
      limitations: [
        'Cannot create blacklists',
        'No dispute resolution',
        'Limited analytics'
      ]
    },
    {
      id: 'MEDIUM',
      name: 'Professional',
      price: 5500,
      duration: 30,
      badge: 'Popular',
      color: 'from-purple-500 to-pink-500',
      maxBorrowers: 500,
      maxUsers: 1,
      features: [
        'Full borrower registry access',
        'Create & view blacklists',
        'Participate in disputes',
        'Monthly + quarterly reports',
        'Advanced notifications',
        'Priority email support',
        'Single user'
      ],
      limitations: [
        'No API access',
        'No multi-user support',
        'No NAMFISA automation'
      ],
      popular: true
    },
    {
      id: 'ADVANCED',
      name: 'Advanced',
      price: 12000,
      duration: 30,
      badge: 'Premium',
      color: 'from-orange-500 to-red-500',
      maxBorrowers: 2000,
      maxUsers: 5,
      features: [
        'Full analytics & raw data insights',
        'NAMFISA quarterly reports (auto-generated)',
        'Blacklist creation & dispute resolution',
        'API access',
        'Priority support',
        'Multi-user support (5 users)',
        'Custom integrations',
        'Advanced reporting'
      ],
      limitations: []
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 'Custom',
      duration: 365,
      badge: 'Ultimate',
      color: 'from-yellow-500 to-amber-500',
      maxBorrowers: 'Unlimited',
      maxUsers: 'Unlimited',
      features: [
        'Everything in Advanced',
        'Unlimited users & borrowers',
        'Dedicated account manager',
        'Custom feature development',
        'White-label options',
        'On-premise deployment',
        'SLA guarantees',
        '24/7 phone support'
      ],
      limitations: []
    }
  ];

  // Payment history
  const paymentHistory = [
    {
      id: 'PAY-2024-001',
      date: '2024-01-01',
      amount: 5500,
      package: 'Professional',
      method: 'Bank Transfer',
      reference: 'TRX-2024-001234',
      status: 'PAID'
    },
    {
      id: 'PAY-2023-012',
      date: '2023-12-01',
      amount: 5500,
      package: 'Professional',
      method: 'Bank Transfer',
      reference: 'TRX-2023-009876',
      status: 'PAID'
    },
    {
      id: 'PAY-2023-011',
      date: '2023-11-01',
      amount: 5500,
      package: 'Professional',
      method: 'Card',
      reference: 'CARD-2023-456',
      status: 'PAID'
    }
  ];

  // Usage statistics
  const usageStats = [
    {
      label: 'Borrowers',
      current: 156,
      limit: 500,
      percentage: 31,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Active Users',
      current: 1,
      limit: 1,
      percentage: 100,
      icon: UserPlus,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Blacklist Entries',
      current: 12,
      limit: 'Unlimited',
      percentage: 0,
      icon: Shield,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Reports Generated',
      current: 24,
      limit: 'Unlimited',
      percentage: 0,
      icon: FileText,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Notifications/alerts
  const alerts = [
    {
      type: 'info',
      message: 'Your subscription auto-renews on Dec 31, 2024',
      icon: RefreshCw,
      color: 'blue'
    },
    {
      type: 'warning',
      message: 'You\'re using 31% of your borrower limit. Consider upgrading for more capacity.',
      icon: AlertCircle,
      color: 'yellow'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
      EXPIRING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      EXPIRED: 'bg-red-500/20 text-red-300 border-red-500/30',
      SUSPENDED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      PAID: 'bg-green-500/20 text-green-300 border-green-500/30',
      FAILED: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getAlertColor = (type) => {
    const colors = {
      info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
      error: 'bg-red-500/10 border-red-500/30 text-red-200'
    };
    return colors[type] || 'bg-gray-500/10 border-gray-500/30 text-gray-200';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'packages', name: 'Packages', icon: Package },
    { id: 'billing', name: 'Billing History', icon: FileText },
    { id: 'usage', name: 'Usage & Limits', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Subscription & Billing</h1>
          <p className="text-purple-200">Manage your subscription plan and billing</p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`rounded-lg p-4 border ${getAlertColor(alert.type)} flex items-start gap-3`}>
                <alert.icon className="flex-shrink-0 mt-0.5" size={20} />
                <p className="flex-1 text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Current Subscription Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500`}>
                <Crown className="text-white" size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{currentSubscription.package} Plan</h2>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(currentSubscription.status)}`}>
                    {currentSubscription.status}
                  </span>
                </div>
                <p className="text-purple-200">Active until {currentSubscription.endDate}</p>
                <p className="text-purple-300 text-sm">{currentSubscription.daysRemaining} days remaining</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <Zap size={18} />
                Upgrade Plan
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2">
                <Download size={18} />
                Invoice
              </button>
            </div>
          </div>

          {/* Auto-renew toggle */}
          <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-purple-300" size={20} />
              <div>
                <p className="text-white font-medium">Auto-renewal</p>
                <p className="text-purple-200 text-sm">Automatically renew on expiry</p>
              </div>
            </div>
            <button
              className={`relative w-14 h-7 rounded-full transition-colors ${
                currentSubscription.autoRenew ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  currentSubscription.autoRenew ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="border-b border-white/20 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-purple-200 hover:text-white'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Usage Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {usageStats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                          <stat.icon className="text-white" size={20} />
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{stat.label}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-white">{stat.current}</span>
                        <span className="text-purple-200 text-sm">/ {stat.limit}</span>
                      </div>
                      {stat.percentage > 0 && (
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${stat.color}`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Features List */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Current Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSubscription.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0" size={18} />
                        <span className="text-purple-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Payments</h3>
                  <div className="space-y-3">
                    {paymentHistory.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-purple-300" size={20} />
                          <div>
                            <p className="text-white font-medium">{payment.package}</p>
                            <p className="text-purple-200 text-sm">{payment.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">NAD {payment.amount.toLocaleString()}</p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      className={`bg-white/5 rounded-xl p-6 border ${
                        pkg.popular ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10'
                      } hover:bg-white/10 transition-all relative overflow-hidden`}
                    >
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-bl-lg">
                          <span className="text-white text-xs font-bold flex items-center gap-1">
                            <Star size={12} />
                            {pkg.badge}
                          </span>
                        </div>
                      )}
                      
                      <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${pkg.color} mb-4`}>
                        <Package className="text-white" size={24} />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        {typeof pkg.price === 'number' ? (
                          <>
                            <span className="text-3xl font-bold text-white">NAD {pkg.price.toLocaleString()}</span>
                            <span className="text-purple-200">/ month</span>
                          </>
                        ) : (
                          <span className="text-3xl font-bold text-white">{pkg.price}</span>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-200">Max Borrowers:</span>
                          <span className="text-white font-semibold">{pkg.maxBorrowers}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-200">Max Users:</span>
                          <span className="text-white font-semibold">{pkg.maxUsers}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <h4 className="text-white font-semibold text-sm mb-3">Features:</h4>
                        {pkg.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                            <span className="text-purple-100 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {pkg.limitations.length > 0 && (
                        <div className="space-y-2 mb-6">
                          <h4 className="text-white font-semibold text-sm mb-3">Limitations:</h4>
                          {pkg.limitations.map((limitation, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                              <span className="text-purple-200 text-sm">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        disabled={pkg.id === currentSubscription.package}
                        className={`w-full py-3 rounded-lg font-medium transition-all ${
                          pkg.id === currentSubscription.package
                            ? 'bg-white/10 text-purple-200 cursor-not-allowed'
                            : pkg.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:scale-105'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        {pkg.id === currentSubscription.package ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing History Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Payment History</h3>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
                    <Download size={16} />
                    Export All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Package</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Method</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Reference</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white">{payment.date}</td>
                          <td className="px-6 py-4 text-white font-medium">{payment.package}</td>
                          <td className="px-6 py-4 text-white font-semibold">NAD {payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-purple-200">{payment.method}</td>
                          <td className="px-6 py-4 text-purple-200 font-mono text-sm">{payment.reference}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-purple-300 hover:text-purple-100 text-sm font-medium flex items-center gap-1">
                              <Download size={14} />
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Usage & Limits Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-blue-300 flex-shrink-0" size={20} />
                  <div className="text-blue-200 text-sm">
                    <p className="font-semibold mb-1">Fair Usage Policy</p>
                    <p>These limits ensure fair resource allocation and optimal system performance. Upgrade your plan for higher limits.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {usageStats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                          <stat.icon className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{stat.label}</h3>
                          <p className="text-purple-200 text-sm">Current usage</p>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-white">{stat.current}</span>
                        <span className="text-purple-200">/ {stat.limit}</span>
                      </div>

                      {stat.percentage > 0 && (
                        <>
                          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full bg-gradient-to-r ${stat.color} transition-all`}
                              style={{ width: `${stat.percentage}%` }}
                            />
                          </div>
                          <p className="text-purple-200 text-sm">{stat.percentage}% used</p>
                        </>
                      )}

                      {stat.percentage > 80 && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-200 text-sm">
                            You're approaching your limit. Consider upgrading for more capacity.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Feature Access Matrix */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Feature Access</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-white">Borrower Registry (Full Access)</span>
                      </div>
                      <Unlock className="text-green-400" size={18} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-white">Blacklist Creation</span>
                      </div>
                      <Unlock className="text-green-400" size={18} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-white">Dispute Participation</span>
                      </div>
                      <Unlock className="text-green-400" size={18} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="text-red-400" size={20} />
                        <span className="text-purple-200">API Access (Requires Advanced)</span>
                      </div>
                      <Lock className="text-red-400" size={18} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="text-red-400" size={20} />
                        <span className="text-purple-200">Multi-User Support (Requires Advanced)</span>
                      </div>
                      <Lock className="text-red-400" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Plan</h2>
                <p className="text-purple-200">Unlock more features and increase your limits</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-white text-sm mb-3">Select your new plan:</p>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400">
                  <option value="BASIC" className="bg-slate-800">Basic - NAD 2,500/mo</option>
                  <option value="MEDIUM" className="bg-slate-800">Professional - NAD 5,500/mo</option>
                  <option value="ADVANCED" className="bg-slate-800">Advanced - NAD 12,000/mo</option>
                  <option value="ENTERPRISE" className="bg-slate-800">Enterprise - Custom Pricing</option>
                </select>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-200 text-sm">
                  Your new plan will be activated immediately. Unused time from your current plan will be prorated.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    alert('Upgrade initiated! Redirecting to payment...');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all shadow-lg"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBilling;
                        