import React, { useState } from 'react'
import Layout from '../components/Layout'
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
  Info
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'security' | 'notifications' | 'integrations' | 'backup'>('general')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  // Mock data for settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'CasHuB',
    platformEmail: 'admin@cashub.com',
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
      case 'backup': return <RefreshCw className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  return (
    <Layout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
          <p className="text-neutral-500">Manage your CasHuB platform configuration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          {/* Tabs */}
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              {['general', 'users', 'security', 'notifications', 'integrations', 'backup'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${
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

          {/* User Management Settings */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">User Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Password Minimum Length
                    </label>
                    <input
                      type="number"
                      value={userSettings.passwordMinLength}
                      onChange={(e) => setUserSettings({...userSettings, passwordMinLength: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={userSettings.sessionTimeout}
                      onChange={(e) => setUserSettings({...userSettings, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={userSettings.maxLoginAttempts}
                      onChange={(e) => setUserSettings({...userSettings, maxLoginAttempts: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Lockout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={userSettings.lockoutDuration}
                      onChange={(e) => setUserSettings({...userSettings, lockoutDuration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-neutral-900 mb-3">Verification Requirements</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={userSettings.requireEmailVerification}
                      onChange={(e) => setUserSettings({...userSettings, requireEmailVerification: e.target.checked})}
                      className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Require Email Verification</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={userSettings.requirePhoneVerification}
                      onChange={(e) => setUserSettings({...userSettings, requirePhoneVerification: e.target.checked})}
                      className="w-4 h-4 text-cashub-600 border-neutral-300 rounded focus:ring-cashub-500"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Require Phone Verification</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('users')}
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
                          <span className="text-neutral-600">admin@cashub.com</span>
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
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center">
                          <RefreshCw className="w-4 h-4 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-neutral-900">Daily Backup</p>
                            <p className="text-xs text-neutral-500">January 10, 2024 - 2:00 AM</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600">Complete</span>
                          <button className="text-sm text-cashub-600 hover:text-cashub-700">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center">
                          <RefreshCw className="w-4 h-4 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-neutral-900">Daily Backup</p>
                            <p className="text-xs text-neutral-500">January 9, 2024 - 2:00 AM</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600">Complete</span>
                          <button className="text-sm text-cashub-600 hover:text-cashub-700">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Create Backup Now
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
