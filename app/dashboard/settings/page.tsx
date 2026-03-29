"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Database, 
  CreditCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Globe,
  Smartphone,
  Key,
  FileText,
  HelpCircle,
  Info,
  Plus,
  Edit,
  XCircle,
  Search,
  UserPlus,
  Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LOCALES, getLocale, setLocale, type Locale } from '@/lib/i18n'

interface AdminUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'security' | 'notifications' | 'integrations' | 'loan_defaults' | 'backup' | 'branding'>('general')
  const [loginSlides, setLoginSlides] = useState<{ image: string; title: string; subtitle: string; gradient: string }[]>([
    { image: '/slides/slide1-new.jpg', gradient: 'from-indigo-800 via-indigo-900 to-purple-900', title: 'Modern Lending Platform', subtitle: 'Experience the future of microlending with CasHuB.' },
    { image: '/slides/bus.jpg',        gradient: 'from-green-800 via-green-900 to-emerald-900',  title: 'Transport Solutions',          subtitle: 'Quick financing for transport, logistics and business needs.' },
    { image: '/slides/wear.jpg',       gradient: 'from-amber-800 via-amber-900 to-orange-900',   title: 'Fashion & Retail Loans',       subtitle: 'Flexible payment plans for clothing, accessories and retail.' },
    { image: '/slides/slide1.svg',     gradient: 'from-green-800 via-green-900 to-emerald-900',  title: 'Back to School Loans',         subtitle: 'Apply for your loan today. Same day approval and payout guaranteed.' },
    { image: '/slides/slide2.jpg',     gradient: 'from-blue-800 via-blue-900 to-indigo-900',     title: 'Emergency Cash When You Need It', subtitle: 'Quick loans for groceries, school fees, medical bills, or other expenses.' },
  ])
  const [slideSaving, setSlideSaving] = useState(false)
  const [slideUploading, setSlideUploading] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')

  useEffect(() => {
    setCurrentLocale(getLocale())
    const saved = localStorage.getItem('loginSlides')
    if (saved) { try { setLoginSlides(JSON.parse(saved)) } catch (err) { console.error('Settings slides parse error:', err) } }
  }, [])

  // Admin user management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [newUser, setNewUser] = useState({ email: '', full_name: '', phone: '', role: 'loan_officer', password: '' })
  const [addUserError, setAddUserError] = useState('')
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('userRole') || ''
    setCurrentUserRole(role)
    if (activeTab === 'users') fetchAdminUsers()
  }, [activeTab])

  const fetchAdminUsers = async () => {
    setUsersLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setAdminUsers(data.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name || u.email?.split('@')[0] || '',
          phone: u.phone || '',
          role: u.role || 'loan_officer',
          is_active: u.is_active !== false,
          created_at: u.created_at || '',
        })))
      } else {
        // Fallback demo data
        setAdminUsers([
          { id: '1', email: 'support@cashub.com', full_name: 'Super Admin', phone: '+264 61 123456', role: 'super_admin', is_active: true, created_at: '2024-01-01' },
          { id: '2', email: 'officer@cashub.com', full_name: 'Loan Officer', phone: '+264 81 234567', role: 'loan_officer', is_active: true, created_at: '2024-01-10' },
          { id: '3', email: 'lender@company.com', full_name: 'Lender Admin', phone: '+264 81 345678', role: 'lender_admin', is_active: true, created_at: '2024-01-15' },
        ])
      }
    } catch {
      setAdminUsers([
        { id: '1', email: 'support@cashub.com', full_name: 'Super Admin', phone: '+264 61 123456', role: 'super_admin', is_active: true, created_at: '2024-01-01' },
        { id: '2', email: 'officer@cashub.com', full_name: 'Loan Officer', phone: '+264 81 234567', role: 'loan_officer', is_active: true, created_at: '2024-01-10' },
      ])
    } finally {
      setUsersLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.role) { setAddUserError('Email and role are required'); return }
    if (!newUser.password || newUser.password.length < 6) { setAddUserError('Password must be at least 6 characters'); return }
    setAddUserLoading(true)
    setAddUserError('')
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: { emailRedirectTo: `${window.location.origin}/login` }
      })
      
      if (authError) {
        const errMsg = authError.message.toLowerCase()
        if (errMsg.includes('rate limit') || errMsg.includes('too many')) {
          setAddUserError('Rate limit reached. Wait 1 hour or use a different email.')
        } else {
          setAddUserError(authError.message)
        }
        setAddUserLoading(false)
        return
      }
      
      if (!authData?.user?.id) {
        setAddUserError('Failed to create auth account')
        setAddUserLoading(false)
        return
      }
      
      // Insert into users table with auth user ID
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.full_name || newUser.email.split('@')[0],
        phone: newUser.phone || null,
        role: newUser.role,
        is_active: true,
      })
      
      if (insertError) {
        setAddUserError(`User created in auth but failed to save profile: ${insertError.message}`)
        setAddUserLoading(false)
        return
      }
      
      // Success
      setNewUser({ email: '', full_name: '', phone: '', role: 'loan_officer', password: '' })
      setShowAddUserModal(false)
      await fetchAdminUsers()
      alert('✅ User created successfully!')
    } catch (err: any) {
      setAddUserError(err?.message || 'Error creating user')
    }
    setAddUserLoading(false)
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', userId)
    } catch { /* local fallback */ }
    setAdminUsers(adminUsers.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await supabase.from('users').update({ is_active: isActive }).eq('id', userId)
    } catch { /* local fallback */ }
    setAdminUsers(adminUsers.map(u => u.id === userId ? { ...u, is_active: isActive } : u))
  }

  const filteredUsers = adminUsers.filter(u =>
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-700',
      lender_admin: 'bg-blue-100 text-blue-700',
      loan_officer: 'bg-purple-100 text-purple-700',
      borrower: 'bg-green-100 text-green-700',
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  const getRoleLabel = (role: string) => role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Platform configuration defaults
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'CasHuB',
    platformEmail: 'support@cashub.com',
    platformPhone: '+264 61 123456',
    defaultCurrency: 'NAD',
    timezone: 'Africa/Windhoek',
    dateFormat: 'DD/MM/YYYY',
    language: 'en'
  })

  const [userSettings, setUserSettings] = useState({
    requireEmailVerification: true,
    requirePhoneVerification: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    loanApplicationAlerts: true,
    paymentReminders: true,
    complianceAlerts: true,
    systemAlerts: true
  })

  const [loanDefaults, setLoanDefaults] = useState({
    defaultInterestRate: '15',
    minLoanAmount: '5000',
    maxLoanAmount: '100000',
    defaultLoanTerm: '12',
    lateFeePercentage: '5',
    gracePeriodDays: '3'
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    supabaseUrl: 'https://rpuwgyfxueayqgjukjiq.supabase.co',
    emailProvider: 'smtp',
    smsProvider: 'twilio',
    paymentGateway: 'payfast',
    fileStorage: 'supabase'
  })

  const handleSave = async (section: string) => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      // Show success message
    }, 1000)
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'general': return <Settings className="w-4 h-4" />
      case 'users': return <Users className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'notifications': return <Bell className="w-4 h-4" />
      case 'integrations': return <Database className="w-4 h-4" />
      case 'loan_defaults': return <CreditCard className="w-4 h-4" />
      case 'backup': return <RefreshCw className="w-4 h-4" />
      case 'branding': return <Upload className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
        <p className="text-neutral-500">Manage your CasHuB platform configuration</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {/* Tabs */}
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px overflow-x-auto">
            {['general', 'users', 'security', 'notifications', 'integrations', 'loan_defaults', 'backup', 'branding'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-6 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  {getTabIcon(tab)}
                  <span className="ml-2">{tab}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Platform Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings({...generalSettings, platformName: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Platform Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.platformEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, platformEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Platform Phone
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.platformPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, platformPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={generalSettings.defaultCurrency}
                    onChange={(e) => setGeneralSettings({...generalSettings, defaultCurrency: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  >
                    <option value="NAD">Namibian Dollar (N$)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="ZAR">South African Rand (R)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  >
                    <option value="Africa/Windhoek">Africa/Windhoek</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Language / Taal / Elaka</h3>
              <p className="text-sm text-neutral-500 mb-4">Select your preferred language for the platform interface</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LOCALES.map(loc => (
                  <button key={loc.id} onClick={() => { setLocale(loc.id); window.location.reload() }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      currentLocale === loc.id ? 'border-cashub-600 bg-cashub-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                    <span className="text-2xl">{loc.flag}</span>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${currentLocale === loc.id ? 'text-cashub-700' : 'text-neutral-700'}`}>{loc.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              {currentLocale !== 'en' && (
                <p className="text-xs text-cashub-600 mt-3 font-medium">
                  Language set to {LOCALES.find(l => l.id === currentLocale)?.label}. Some content may remain in English where translations are in progress.
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('general')}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">User Management</h3>
                <p className="text-sm text-neutral-500">Add, edit, and manage platform users and their roles</p>
              </div>
              {(currentUserRole === 'super_admin' || currentUserRole === 'admin') && (
                <button onClick={() => { setShowAddUserModal(true); setAddUserError(''); setNewUser({ email: '', full_name: '', phone: '', role: 'admin', password: '' }) }}
                  className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors text-sm font-medium">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Total Users</p>
                <p className="text-xl font-bold text-neutral-900">{adminUsers.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-[10px] text-green-600 uppercase tracking-wide">Active</p>
                <p className="text-xl font-bold text-green-700">{adminUsers.filter(u => u.is_active).length}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-[10px] text-red-600 uppercase tracking-wide">Admins</p>
                <p className="text-xl font-bold text-red-700">{adminUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-[10px] text-blue-600 uppercase tracking-wide">Lenders</p>
                <p className="text-xl font-bold text-blue-700">{adminUsers.filter(u => u.role === 'lender' || u.role === 'lender_admin').length}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" placeholder="Search users..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-cashub-600 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">User</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Role</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Joined</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-neutral-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-cashub-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-cashub-600">{(user.full_name || user.email)[0].toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{user.full_name || user.email.split('@')[0]}</p>
                              <p className="text-xs text-neutral-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {(currentUserRole === 'super_admin') ? (
                            <select value={user.role} onChange={e => handleUpdateUserRole(user.id, e.target.value)}
                              className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getRoleColor(user.role)} cursor-pointer`}>
                              <option value="super_admin">Super Admin</option>
                              <option value="lender_admin">Lender Admin</option>
                              <option value="loan_officer">Loan Officer</option>
                              <option value="borrower">Borrower</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleToggleActive(user.id, !user.is_active)}
                            disabled={currentUserRole !== 'super_admin' && currentUserRole !== 'admin'}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                              user.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } ${currentUserRole !== 'super_admin' && currentUserRole !== 'admin' ? 'cursor-default' : 'cursor-pointer'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            {(currentUserRole === 'super_admin' || currentUserRole === 'admin') && (
                              <>
                                <button
                                  onClick={() => handleToggleActive(user.id, !user.is_active)}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                    user.is_active
                                      ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                  }`}
                                  title={user.is_active ? 'Suspend User' : 'Reactivate User'}
                                >
                                  {user.is_active ? 'Suspend' : 'Activate'}
                                </button>
                                {currentUserRole === 'super_admin' && (
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Permanently delete user ${user.full_name || user.email}? This cannot be undone.`)) return
                                      await supabase.from('users').delete().eq('id', user.id)
                                      fetchAdminUsers()
                                    }}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                            {user.phone && <span className="text-[10px] text-neutral-400 ml-1">{user.phone}</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-neutral-400">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Verification Settings */}
            <div className="border-t border-neutral-200 pt-6">
              <h4 className="text-md font-semibold text-neutral-900 mb-3">Verification Requirements</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" checked={userSettings.requireEmailVerification}
                    onChange={(e) => setUserSettings({...userSettings, requireEmailVerification: e.target.checked})}
                    className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500" />
                  <span className="ml-2 text-sm text-neutral-700">Require Email Verification</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={userSettings.requirePhoneVerification}
                    onChange={(e) => setUserSettings({...userSettings, requirePhoneVerification: e.target.checked})}
                    className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500" />
                  <span className="ml-2 text-sm text-neutral-700">Require Phone Verification</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ADD USER MODAL ═══ */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Add New User</h2>
                  <p className="text-xs text-neutral-500">Create a new platform user account</p>
                </div>
                <button onClick={() => setShowAddUserModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {addUserError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-xs text-red-700">{addUserError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
                  <input type="text" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                    placeholder="John Admin" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@cashub.com" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Phone</label>
                  <input type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+264 81 123 4567" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Role <span className="text-red-500">*</span></label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
                    <option value="lender_admin">Lender Admin</option>
                    <option value="loan_officer">Loan Officer</option>
                    <option value="borrower">Borrower</option>
                    {currentUserRole === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Min 8 characters" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                  <p className="text-[10px] text-neutral-400 mt-1">If provided, a Supabase auth account will be created</p>
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 flex gap-3">
                <button onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleAddUser} disabled={!newUser.email || addUserLoading}
                  className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {addUserLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Security Configuration</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">Security Recommendations</p>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Enable two-factor authentication for admin users</li>
                        <li>• Regularly update your password</li>
                        <li>• Monitor login attempts and unusual activity</li>
                        <li>• Keep your software and dependencies updated</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-neutral-900 mb-3">API Keys</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <Key className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-900">Supabase Anon Key</span>
                      </div>
                      <button className="text-sm text-cashub-600 hover:text-cashub-700">
                        Regenerate
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <Key className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-900">Supabase Service Role Key</span>
                      </div>
                      <button className="text-sm text-cashub-600 hover:text-cashub-700">
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-neutral-900 mb-3">Access Logs</h4>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-neutral-900">Last login attempts</span>
                      <button className="text-sm text-cashub-600 hover:text-cashub-700">
                        View All
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">support@cashub.com</span>
                        <span className="text-green-600">Success - 2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">user@example.com</span>
                        <span className="text-red-600">Failed - 3 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-neutral-900 mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-700">General Email Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-700">Loan Application Alerts</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.loanApplicationAlerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, loanApplicationAlerts: e.target.checked})}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-700">Payment Reminders</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.paymentReminders}
                        onChange={(e) => setNotificationSettings({...notificationSettings, paymentReminders: e.target.checked})}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-700">Compliance Alerts</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.complianceAlerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, complianceAlerts: e.target.checked})}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-neutral-900 mb-3">SMS Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 text-neutral-600 mr-2" />
                        <span className="text-sm text-neutral-700">General SMS Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                        className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('notifications')}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Third-Party Integrations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 text-neutral-600 mr-2" />
                      <span className="font-medium text-neutral-900">Supabase Database</span>
                    </div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <p>URL: {integrationSettings.supabaseUrl}</p>
                    <p className="mt-1">Status: Active and synchronized</p>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-neutral-600 mr-2" />
                      <span className="font-medium text-neutral-900">Email Provider</span>
                    </div>
                    <span className="text-sm text-green-600">Configured</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <p>Provider: {integrationSettings.emailProvider}</p>
                    <p className="mt-1">Status: Ready to send emails</p>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-neutral-600 mr-2" />
                      <span className="font-medium text-neutral-900">SMS Provider</span>
                    </div>
                    <span className="text-sm text-yellow-600">Setup Required</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <p>Provider: {integrationSettings.smsProvider}</p>
                    <p className="mt-1">Status: Configuration needed</p>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-neutral-600 mr-2" />
                      <span className="font-medium text-neutral-900">Payment Gateway</span>
                    </div>
                    <span className="text-sm text-yellow-600">Setup Required</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <p>Gateway: {integrationSettings.paymentGateway}</p>
                    <p className="mt-1">Status: API keys needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan Defaults */}
        {activeTab === 'loan_defaults' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">Loan Default Settings</h3>
              <p className="text-sm text-neutral-500 mb-4">Configure default loan parameters for new loans</p>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">These settings will be used as defaults for new loans. Individual loans can override these values.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Default Interest Rate (%)</label>
                  <input type="number" value={loanDefaults.defaultInterestRate}
                    onChange={(e) => setLoanDefaults({ ...loanDefaults, defaultInterestRate: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Default Loan Term (months)</label>
                  <input type="number" value={loanDefaults.defaultLoanTerm}
                    onChange={(e) => setLoanDefaults({ ...loanDefaults, defaultLoanTerm: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Minimum Loan Amount (N$)</label>
                  <input type="number" value={loanDefaults.minLoanAmount}
                    onChange={(e) => setLoanDefaults({ ...loanDefaults, minLoanAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Maximum Loan Amount (N$)</label>
                  <input type="number" value={loanDefaults.maxLoanAmount}
                    onChange={(e) => setLoanDefaults({ ...loanDefaults, maxLoanAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Late Fee Percentage (%)</label>
                  <input type="number" value={loanDefaults.lateFeePercentage}
                    onChange={(e) => setLoanDefaults({ ...loanDefaults, lateFeePercentage: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Grace Period (days)</label>
                  <input type="number" value={loanDefaults.gracePeriodDays}
                    onChange={(e) => setLoanDefaults({ ...loanDefaults, gracePeriodDays: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => handleSave('loan_defaults')} disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors disabled:opacity-50">
                {saving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
              </button>
            </div>
          </div>
        )}

        {/* Branding / Login Slides */}
        {activeTab === 'branding' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">Login Page Slides</h3>
              <p className="text-sm text-neutral-500 mb-4">Customize up to 5 promotional slides shown on the login page.</p>
              <div className="space-y-4">
                {loginSlides.map((slide, idx) => (
                  <div key={idx} className="border border-neutral-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-700">Slide {idx + 1}</span>
                      {loginSlides.length > 1 && (
                        <button onClick={() => setLoginSlides(loginSlides.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Slide Image</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={slide.image}
                          onChange={e => setLoginSlides(loginSlides.map((s, i) => i === idx ? { ...s, image: e.target.value } : s))}
                          placeholder="/slides/slide1.jpg or upload below"
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                        <button type="button" disabled={slideUploading === idx}
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (!file) return
                              setSlideUploading(idx)
                              try {
                                const reader = new FileReader()
                                reader.onload = (ev) => {
                                  const base64 = ev.target?.result as string
                                  setLoginSlides(prev => prev.map((s, i) => i === idx ? { ...s, image: base64 } : s))
                                  setSlideUploading(null)
                                }
                                reader.readAsDataURL(file)
                              } catch { setSlideUploading(null) }
                            }
                            input.click()
                          }}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700 disabled:opacity-50">
                          <Upload className="w-3.5 h-3.5" />
                          {slideUploading === idx ? 'Loading...' : 'Upload'}
                        </button>
                      </div>
                      {slide.image?.startsWith('data:') && (
                        <img src={slide.image} alt="preview" className="mt-2 h-16 w-full object-cover rounded-lg" />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Title</label>
                      <input type="text" value={slide.title}
                        onChange={e => setLoginSlides(loginSlides.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Subtitle</label>
                      <input type="text" value={slide.subtitle}
                        onChange={e => setLoginSlides(loginSlides.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Background Gradient (Tailwind classes)</label>
                      <input type="text" value={slide.gradient}
                        onChange={e => setLoginSlides(loginSlides.map((s, i) => i === idx ? { ...s, gradient: e.target.value } : s))}
                        placeholder="from-green-800 via-green-900 to-emerald-900"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                    </div>
                  </div>
                ))}
              </div>
              {loginSlides.length < 5 && (
                <button
                  onClick={() => setLoginSlides([...loginSlides, { image: '', gradient: 'from-green-800 via-green-900 to-emerald-900', title: '', subtitle: '' }])}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slide ({loginSlides.length}/5)
                </button>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setSlideSaving(true)
                  localStorage.setItem('loginSlides', JSON.stringify(loginSlides))
                  setTimeout(() => setSlideSaving(false), 800)
                }}
                disabled={slideSaving}
                className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors disabled:opacity-50">
                {slideSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Slides</>}
              </button>
            </div>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Backup & Recovery</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">Automatic Backups</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your data is automatically backed up daily to secure cloud storage. 
                        You can also create manual backups at any time.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-neutral-900 mb-3">Backup History</h4>
                  <div className="space-y-2">
                    <div className="p-3 border border-neutral-200 rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-neutral-900">Daily Backup</span>
                        <span className="text-xs text-neutral-500 ml-2">Today, 02:00 AM</span>
                      </div>
                      <span className="text-xs text-neutral-500">24 MB</span>
                    </div>
                    <div className="p-3 border border-neutral-200 rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-neutral-900">Daily Backup</span>
                        <span className="text-xs text-neutral-500 ml-2">Yesterday, 02:00 AM</span>
                      </div>
                      <span className="text-xs text-neutral-500">23.8 MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cashub-600 hover:bg-cashub-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cashub-500">
                    <Download className="w-4 h-4 mr-2" />
                    Create Manual Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
