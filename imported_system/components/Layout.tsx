import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  Settings, 
  CreditCard, 
  Search,
  Menu,
  X,
  LogOut,
  Bell,
  User,
  Home,
  TrendingUp,
  AlertCircle,
  Database
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'loans-integrated',
      name: 'Loan Officer Dashboard',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'borrowers',
      name: 'Borrower Registry',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'shared-registry',
      name: 'Shared Registry',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'blacklist',
      name: 'Blacklist & Disputes',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'compliance-integrated',
      name: 'NAMFISA Compliance',
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'marketplace',
      name: 'Loan Marketplace',
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'billing',
      name: 'Subscription & Billing',
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'system-admin',
      name: 'System Admin',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ]

  const user = {
    name: 'John Admin',
    role: 'System Administrator',
    email: 'admin@cashub.com',
    avatar: null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cashub-600 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              {sidebarOpen && (
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-cashub-600 to-accent-500 bg-clip-text text-transparent">
                  CasHuB
                </h1>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 hover:bg-neutral-100 group ${
                  item.id === 'dashboard' ? 'bg-cashub-50 text-cashub-600' : 'text-neutral-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${item.id === 'dashboard' ? 'bg-cashub-100' : item.bgColor} group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.id === 'dashboard' ? item.color : 'text-neutral-600'}`} />
                </div>
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-neutral-200">
            <div className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
                <p className="text-sm text-neutral-500">Welcome back to CasHuB Platform</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                  <Bell className="w-5 h-5 text-neutral-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
