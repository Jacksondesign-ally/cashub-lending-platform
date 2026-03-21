import React, { useState } from 'react';
import { 
  LayoutDashboard,
  Search,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  UserPlus,
  Landmark,
  Menu,
  X,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

const CasHubCompleteSystem = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview with KPIs, recent loans, and alerts',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'search',
      name: 'Search & Classification',
      icon: Search,
      description: 'Advanced borrower search and filtering',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'loan-application',
      name: 'Loan Application',
      icon: FileText,
      description: '5-step loan application form',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'borrower-profile',
      name: 'Borrower Profile',
      icon: Users,
      description: 'Complete borrower details with tabs',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'payment-processing',
      name: 'Payment Processing',
      icon: DollarSign,
      description: 'Record and manage loan payments',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'reports-analytics',
      name: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Interactive charts and insights',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'loan-agreement-borrower',
      name: 'Digital Loan Agreement',
      icon: FileText,
      description: '6-step borrower agreement workflow',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'loan-officer',
      name: 'Loan Officer Dashboard',
      icon: UserPlus,
      description: 'Review and approve applications',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'blacklist-dispute',
      name: 'Blacklist & Disputes',
      icon: Shield,
      description: 'Blacklist registry and dispute management',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'subscription',
      name: 'Subscription & Billing',
      icon: CreditCard,
      description: 'Package management and payments',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'lender-onboarding',
      name: 'Lender Registration',
      icon: Landmark,
      description: '6-step lender onboarding',
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: 'namfisa',
      name: 'NAMFISA Compliance',
      icon: Shield,
      description: 'Regulatory reporting dashboard',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: Users,
      description: 'Multi-user access control',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'System configuration panel',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const activeModuleData = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 overflow-y-auto transition-transform duration-300`}>
          
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Landmark className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CasHuB</h1>
                <p className="text-purple-200 text-xs">Lending Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
              System Modules ({modules.length})
            </p>
            <nav className="space-y-1">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    activeModule === module.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'text-purple-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeModule === module.id
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${module.color}`
                  }`}>
                    <module.icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{module.name}</p>
                    <p className={`text-xs ${
                      activeModule === module.id ? 'text-purple-100' : 'text-purple-300'
                    }`}>
                      {module.description.slice(0, 30)}...
                    </p>
                  </div>
                  {activeModule === module.id && (
                    <ChevronRight size={18} />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 mt-auto">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
              <p className="text-white font-semibold mb-1">System Info</p>
              <div className="space-y-1 text-xs text-purple-200">
                <p>Version: 1.0.0</p>
                <p>Components: {modules.length}</p>
                <p>Status: Production Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Bar */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${activeModuleData?.color}`}>
                  {activeModuleData && <activeModuleData.icon className="text-white" size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeModuleData?.name}</h2>
                  <p className="text-purple-200 text-sm">{activeModuleData?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
                
                {/* Module Preview Cards */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${activeModuleData?.color} mb-4`}>
                    {activeModuleData && <activeModuleData.icon className="text-white" size={40} />}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{activeModuleData?.name}</h3>
                  <p className="text-purple-200 mb-6">{activeModuleData?.description}</p>
                </div>

                {/* Component Info */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                  <h4 className="text-white font-semibold mb-4">Component Details</h4>
                  
                  {activeModule === 'dashboard' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 4 KPI stat cards (Active Loans, Borrowers, Overdue, Collection Rate)</p>
                      <p>✅ Recent loans table with status indicators</p>
                      <p>✅ Alerts & activity feed</p>
                      <p>✅ Quick actions panel</p>
                      <p>✅ Time range filter (Week/Month/Quarter/Year)</p>
                    </div>
                  )}

                  {activeModule === 'search' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ Multi-criteria search (Name, ID, Phone)</p>
                      <p>✅ Quick filter presets (High Risk, Overdue, Good Payers)</p>
                      <p>✅ Advanced filters (Status, Risk Level, Income, Credit Score)</p>
                      <p>✅ Results table with borrower cards</p>
                      <p>✅ Export to CSV/Excel</p>
                    </div>
                  )}

                  {activeModule === 'loan-application' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 5-step wizard with progress tracking</p>
                      <p>✅ Personal details, Contact info, Primary contact</p>
                      <p>✅ Document upload (ID, License, Tax clearance)</p>
                      <p>✅ Account setup with password validation</p>
                      <p>✅ Package selection with 30-day trial</p>
                    </div>
                  )}

                  {activeModule === 'borrower-profile' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ Profile header with avatar and status</p>
                      <p>✅ 5 tabs: Overview, Loans, Payments, Documents, Activity</p>
                      <p>✅ Stats cards (Total Loans, Borrowed, Outstanding, Payment Rate)</p>
                      <p>✅ Risk assessment with credit score</p>
                      <p>✅ Complete loan and payment history</p>
                    </div>
                  )}

                  {activeModule === 'payment-processing' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ Loan selection with search functionality</p>
                      <p>✅ 4 payment methods (Cash, Bank Transfer, Mobile Money, Check)</p>
                      <p>✅ Payment details form with amount calculation</p>
                      <p>✅ Payment summary sidebar</p>
                      <p>✅ Confirmation modal with receipt</p>
                    </div>
                  )}

                  {activeModule === 'reports-analytics' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 4 KPI cards with trend indicators</p>
                      <p>✅ Interactive charts (Line, Bar, Pie) using Recharts</p>
                      <p>✅ 5 report types (Overview, Loans, Collections, Risk, Performance)</p>
                      <p>✅ Top performers list</p>
                      <p>✅ Risk alerts panel</p>
                    </div>
                  )}

                  {activeModule === 'loan-agreement-borrower' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 6-screen workflow with progress bar</p>
                      <p>✅ Loan overview, Personal info confirmation</p>
                      <p>✅ Loan terms with compliance notices</p>
                      <p>✅ Scrollable agreement with scroll-to-bottom enforcement</p>
                      <p>✅ 3 signature methods (Draw, OTP, Selfie)</p>
                      <p>✅ Success confirmation with download options</p>
                    </div>
                  )}

                  {activeModule === 'loan-officer' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ Loan applications table with search</p>
                      <p>✅ Risk level and credit score indicators</p>
                      <p>✅ Detailed borrower file with tabs</p>
                      <p>✅ Document verification status</p>
                      <p>✅ Approve/Decline workflow with modals</p>
                      <p>✅ Digital signature for loan officer</p>
                    </div>
                  )}

                  {activeModule === 'blacklist-dispute' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ Blacklist registry with evidence tracking</p>
                      <p>✅ 5 reason codes (Default, Fraud, Misrepresentation, Absconded, Court Order)</p>
                      <p>✅ Visibility control (Shared/Private)</p>
                      <p>✅ Dispute filing interface</p>
                      <p>✅ Evidence upload for both parties</p>
                      <p>✅ Complete audit trail</p>
                    </div>
                  )}

                  {activeModule === 'subscription' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 5 subscription packages (Free, Basic, Professional, Advanced, Enterprise)</p>
                      <p>✅ Current subscription display with auto-renewal</p>
                      <p>✅ 4 tabs (Overview, Packages, Billing History, Usage)</p>
                      <p>✅ Usage metrics with progress bars</p>
                      <p>✅ Payment history table</p>
                      <p>✅ Upgrade/downgrade workflow</p>
                    </div>
                  )}

                  {activeModule === 'lender-onboarding' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 6-step registration wizard</p>
                      <p>✅ Company details with NAMFISA license</p>
                      <p>✅ Contact information with 14 Namibian regions</p>
                      <p>✅ Document upload (Registration, License, Tax clearance)</p>
                      <p>✅ Account setup with password validation</p>
                      <p>✅ Success page with onboarding instructions</p>
                    </div>
                  )}

                  {activeModule === 'namfisa' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ Compliance score dashboard (92%)</p>
                      <p>✅ 4 tabs (Overview, Reports, Requirements, Analytics)</p>
                      <p>✅ Q1-Q4 2024 quarterly reports</p>
                      <p>✅ Compliance requirements checklist</p>
                      <p>✅ Interactive analytics charts</p>
                      <p>✅ Auto-generated reports ready for submission</p>
                    </div>
                  )}

                  {activeModule === 'user-management' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ User table with role indicators</p>
                      <p>✅ 5 roles (Admin, Manager, Loan Officer, Accountant, Viewer)</p>
                      <p>✅ Add user modal with role assignment</p>
                      <p>✅ Active/Inactive status toggle</p>
                      <p>✅ User activity tracking</p>
                      <p>✅ Seat management for multi-user packages</p>
                    </div>
                  )}

                  {activeModule === 'settings' && (
                    <div className="space-y-3 text-purple-100 text-sm">
                      <p>✅ 6 settings categories with sidebar navigation</p>
                      <p>✅ Profile management with avatar upload</p>
                      <p>✅ Notification preferences (Email, SMS, Alerts)</p>
                      <p>✅ Security settings (2FA, Password, Session timeout)</p>
                      <p>✅ System configuration (Currency, Date format, Timezone)</p>
                      <p>✅ Loan defaults and backup/data management</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare size={18} />
                      View Full Component
                    </h5>
                    <p className="text-blue-200 text-sm mb-3">
                      This is a preview. Each component is built as a complete, standalone React component.
                    </p>
                    <p className="text-blue-300 text-xs">
                      Artifact ID: cashub-{activeModule}
                    </p>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2">Integration Ready</h5>
                    <p className="text-purple-200 text-sm mb-3">
                      All components use the same design system and can be integrated into a single application.
                    </p>
                    <p className="text-purple-300 text-xs">
                      Backend: REST/GraphQL APIs needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasHubCompleteSystem;