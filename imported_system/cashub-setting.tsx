import React, { useState } from 'react';
import { 
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Database,
  Globe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@cashub.na',
    phone: '+264811234567',
    role: 'System Administrator',
    avatar: null
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    loanApprovals: true,
    paymentReminders: true,
    overdueAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
    marketingEmails: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    defaultCurrency: 'NAD',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Windhoek',
    language: 'en',
    fiscalYearStart: 'January'
  });

  const [loanDefaults, setLoanDefaults] = useState({
    defaultInterestRate: '15',
    minLoanAmount: '5000',
    maxLoanAmount: '100000',
    defaultLoanTerm: '12',
    lateFeePercentage: '5',
    gracePeriodDays: '3'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Settings },
    { id: 'loans', name: 'Loan Defaults', icon: CreditCard },
    { id: 'backup', name: 'Backup & Data', icon: Database }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/20'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-purple-200">Manage your system preferences and configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-4 sticky top-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
                    <p className="text-purple-200">Update your personal information</p>
                  </div>

                  <div className="flex items-center gap-6 pb-6 border-b border-white/20">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white font-medium transition-all mb-2 flex items-center gap-2">
                        <Upload size={16} />
                        Upload Photo
                      </button>
                      <p className="text-purple-200 text-sm">JPG or PNG, max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-200 mb-2">Role</label>
                      <input
                        type="text"
                        value={profileData.role}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-purple-200 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                    <p className="text-purple-200">Choose how you want to be notified</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Communication Channels</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Email Notifications</p>
                            <p className="text-purple-200 text-sm">Receive updates via email</p>
                          </div>
                          <Toggle 
                            checked={notifications.emailNotifications}
                            onChange={(val) => setNotifications({ ...notifications, emailNotifications: val })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">SMS Notifications</p>
                            <p className="text-purple-200 text-sm">Receive updates via SMS</p>
                          </div>
                          <Toggle 
                            checked={notifications.smsNotifications}
                            onChange={(val) => setNotifications({ ...notifications, smsNotifications: val })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Alert Types</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Loan Approvals</p>
                            <p className="text-purple-200 text-sm">New loan approval notifications</p>
                          </div>
                          <Toggle 
                            checked={notifications.loanApprovals}
                            onChange={(val) => setNotifications({ ...notifications, loanApprovals: val })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Payment Reminders</p>
                            <p className="text-purple-200 text-sm">Upcoming payment alerts</p>
                          </div>
                          <Toggle 
                            checked={notifications.paymentReminders}
                            onChange={(val) => setNotifications({ ...notifications, paymentReminders: val })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Overdue Alerts</p>
                            <p className="text-purple-200 text-sm">Late payment notifications</p>
                          </div>
                          <Toggle 
                            checked={notifications.overdueAlerts}
                            onChange={(val) => setNotifications({ ...notifications, overdueAlerts: val })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">System Updates</p>
                            <p className="text-purple-200 text-sm">Software update notifications</p>
                          </div>
                          <Toggle 
                            checked={notifications.systemUpdates}
                            onChange={(val) => setNotifications({ ...notifications, systemUpdates: val })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Reports</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Weekly Reports</p>
                            <p className="text-purple-200 text-sm">Weekly performance summaries</p>
                          </div>
                          <Toggle 
                            checked={notifications.weeklyReports}
                            onChange={(val) => setNotifications({ ...notifications, weeklyReports: val })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
                    <p className="text-purple-200">Manage your account security</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-100"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white font-medium">Enable 2FA</p>
                        <p className="text-purple-200 text-sm">Add an extra layer of security</p>
                      </div>
                      <Toggle 
                        checked={security.twoFactorAuth}
                        onChange={(val) => setSecurity({ ...security, twoFactorAuth: val })}
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Session Timeout (minutes)</label>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="15" className="bg-slate-800">15 minutes</option>
                          <option value="30" className="bg-slate-800">30 minutes</option>
                          <option value="60" className="bg-slate-800">1 hour</option>
                          <option value="120" className="bg-slate-800">2 hours</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Login Alerts</p>
                          <p className="text-purple-200 text-sm">Get notified of new logins</p>
                        </div>
                        <Toggle 
                          checked={security.loginAlerts}
                          onChange={(val) => setSecurity({ ...security, loginAlerts: val })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
                    <p className="text-purple-200">Configure system-wide preferences</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Default Currency</label>
                      <select
                        value={systemSettings.defaultCurrency}
                        onChange={(e) => setSystemSettings({ ...systemSettings, defaultCurrency: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="NAD" className="bg-slate-800">NAD - Namibian Dollar</option>
                        <option value="USD" className="bg-slate-800">USD - US Dollar</option>
                        <option value="EUR" className="bg-slate-800">EUR - Euro</option>
                        <option value="ZAR" className="bg-slate-800">ZAR - South African Rand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Date Format</label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="DD/MM/YYYY" className="bg-slate-800">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY" className="bg-slate-800">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD" className="bg-slate-800">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Time Zone</label>
                      <select
                        value={systemSettings.timeZone}
                        onChange={(e) => setSystemSettings({ ...systemSettings, timeZone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="Africa/Windhoek" className="bg-slate-800">Africa/Windhoek (CAT)</option>
                        <option value="Africa/Johannesburg" className="bg-slate-800">Africa/Johannesburg (SAST)</option>
                        <option value="UTC" className="bg-slate-800">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Language</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="en" className="bg-slate-800">English</option>
                        <option value="af" className="bg-slate-800">Afrikaans</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Defaults Tab */}
              {activeTab === 'loans' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Loan Default Settings</h2>
                    <p className="text-purple-200">Configure default loan parameters</p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="text-yellow-400 flex-shrink-0" size={20} />
                    <p className="text-yellow-200 text-sm">
                      These settings will be used as defaults for new loans. Individual loans can override these values.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Default Interest Rate (%)</label>
                      <input
                        type="number"
                        value={loanDefaults.defaultInterestRate}
                        onChange={(e) => setLoanDefaults({ ...loanDefaults, defaultInterestRate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Default Loan Term (months)</label>
                      <input
                        type="number"
                        value={loanDefaults.defaultLoanTerm}
                        onChange={(e) => setLoanDefaults({ ...loanDefaults, defaultLoanTerm: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Minimum Loan Amount (NAD)</label>
                      <input
                        type="number"
                        value={loanDefaults.minLoanAmount}
                        onChange={(e) => setLoanDefaults({ ...loanDefaults, minLoanAmount: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Maximum Loan Amount (NAD)</label>
                      <input
                        type="number"
                        value={loanDefaults.maxLoanAmount}
                        onChange={(e) => setLoanDefaults({ ...loanDefaults, maxLoanAmount: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Late Fee Percentage (%)</label>
                      <input
                        type="number"
                        value={loanDefaults.lateFeePercentage}
                        onChange={(e) => setLoanDefaults({ ...loanDefaults, lateFeePercentage: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Grace Period (days)</label>
                      <input
                        type="number"
                        value={loanDefaults.gracePeriodDays}
                        onChange={(e) => setLoanDefaults({ ...loanDefaults, gracePeriodDays: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Backup & Data Tab */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Backup & Data Management</h2>
                    <p className="text-purple-200">Manage your system data and backups</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Database size={20} />
                      Database Backup
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Last Backup</p>
                          <p className="text-purple-200 text-sm">January 22, 2024 at 03:00 AM</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm font-medium flex items-center gap-2">
                          <Check size={14} />
                          Successful
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2">
                          <RefreshCw size={18} />
                          Backup Now
                        </button>
                        <button className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2">
                          <Download size={18} />
                          Download Backup
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center justify-between">
                        <span>Export Borrowers</span>
                        <Download size={18} />
                      </button>
                      <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20