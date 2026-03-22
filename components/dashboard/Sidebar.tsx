"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Database,
  Menu,
  X,
  User,
  LogOut,
  AlertTriangle,
  Search,
  BarChart3,
  Building,
  Gavel,
  Brain,
  ScrollText,
  Bell,
  Store,
  UserCheck,
  BookOpen,
  Ban,
  ClipboardList
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

// ─── SUPER ADMIN MENU (Platform Owner) ────────────────────────────────────────
const superAdminMenu = [
  { id: 'dashboard',    name: 'Dashboard',          href: '/dashboard',                icon: LayoutDashboard, color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  { id: 'lenders',      name: 'Lenders',             href: '/dashboard/lenders',        icon: Building,        color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { id: 'onboarding',  name: 'Lender Onboarding',   href: '/dashboard/onboarding',     icon: UserCheck,       color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'borrowers',   name: 'Borrowers',            href: '/dashboard/borrowers',      icon: Users,           color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'kyc-review',  name: 'KYC Review',          href: '/dashboard/kyc-review',     icon: FileText,        color: 'text-blue-500',   bgColor: 'bg-blue-50' },
  { id: 'loans',       name: 'Loans',               href: '/dashboard/loans',          icon: FileText,        color: 'text-green-600',  bgColor: 'bg-green-50' },
  { id: 'payments',    name: 'Payments',            href: '/dashboard/payments',       icon: CreditCard,      color: 'text-emerald-600',bgColor: 'bg-emerald-50' },
  { id: 'marketplace', name: 'Marketplace',         href: '/dashboard/marketplace',    icon: Store,           color: 'text-cyan-600',   bgColor: 'bg-cyan-50' },
  { id: 'blacklist',   name: 'Blacklist',           href: '/dashboard/blacklist',      icon: Ban,             color: 'text-red-600',    bgColor: 'bg-red-50' },
  { id: 'scam-alerts', name: 'Scam Alerts',         href: '/dashboard/scam-alerts',    icon: AlertTriangle,   color: 'text-rose-600',   bgColor: 'bg-rose-50' },
  { id: 'disputes',    name: 'Disputes',            href: '/dashboard/disputes',       icon: Gavel,           color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'registry',    name: 'Shared Registry',     href: '/dashboard/registry',       icon: BookOpen,        color: 'text-teal-600',   bgColor: 'bg-teal-50' },
  { id: 'reports',     name: 'Reports',             href: '/dashboard/reports',        icon: BarChart3,       color: 'text-pink-600',   bgColor: 'bg-pink-50' },
  { id: 'risk-engine', name: 'Risk Engine',         href: '/dashboard/risk-engine',    icon: TrendingUp,      color: 'text-amber-600',  bgColor: 'bg-amber-50' },
  { id: 'compliance',  name: 'Compliance',          href: '/dashboard/compliance',     icon: Shield,          color: 'text-blue-700',   bgColor: 'bg-blue-100' },
  { id: 'billing',     name: 'Billing',             href: '/dashboard/billing',        icon: CreditCard,      color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'audit-logs',  name: 'Audit Logs',          href: '/dashboard/audit-logs',     icon: Database,        color: 'text-slate-600',  bgColor: 'bg-slate-50' },
  { id: 'settings',    name: 'Settings',            href: '/dashboard/settings',       icon: Settings,        color: 'text-gray-600',   bgColor: 'bg-gray-50' },
  { id: 'notifications',name: 'Notifications',        href: '/dashboard/notifications',  icon: Bell,            color: 'text-emerald-600',bgColor: 'bg-emerald-50' },
]

// ─── LOAN OFFICER MENU (Lender staff in dashboard scope) ─────────────────────
const loanOfficerMenu = [
  { id: 'dashboard',   name: 'Dashboard',            href: '/dashboard',                icon: LayoutDashboard, color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  { id: 'loans',       name: 'Loan Staff Oversight', href: '/dashboard/loans',          icon: FileText,        color: 'text-green-600',  bgColor: 'bg-green-50' },
  { id: 'borrowers',   name: 'Borrowers',            href: '/dashboard/borrowers',      icon: Users,           color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'search',      name: 'Advanced Search',      href: '/dashboard/search',         icon: Search,          color: 'text-teal-600',   bgColor: 'bg-teal-50' },
  { id: 'registry',   name: 'Shared Registry',       href: '/dashboard/registry',       icon: BookOpen,        color: 'text-purple-600', bgColor: 'bg-purple-50' },
]

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setRole(localStorage.getItem('userRole'))
    setMounted(true)
  }, [])

  const menuItems = mounted && role
    ? (role === 'super_admin' ? superAdminMenu : loanOfficerMenu)
    : []

  const roleLabels: Record<string, string> = {
    super_admin:  'Super Administrator',
    lender_admin: 'Lender Administrator',
    loan_officer: 'Loan Officer',
    borrower:     'Borrower',
  }

  const [displayUser, setDisplayUser] = useState({ name: 'CasHuB Admin', role: 'System Administrator' })

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') || ''
    const storedName = localStorage.getItem('userName') || 'User'
    setDisplayUser({
      name: storedName,
      role: roleLabels[storedRole] || storedRole,
    })
  }, [])

  return (
    <div className={`fixed inset-y-0 left-0 z-50 ${open ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/cashub-icon.svg" alt="CasHuB" width={32} height={32} className="rounded-lg" />
            {open && (
              <Image src="/cashub-logo.svg" alt="CasHuB" width={100} height={30} className="ml-2" />
            )}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center ${open ? 'justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 hover:bg-neutral-100 group ${
                  isActive ? 'bg-cashub-50 text-cashub-600' : 'text-neutral-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-cashub-100' : item.bgColor} group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${isActive ? item.color : 'text-neutral-600'}`} />
                </div>
                {open && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-neutral-200">
          <div className={`flex items-center ${open ? 'justify-start' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-neutral-900 truncate">{displayUser.name}</p>
                <p className="text-xs text-neutral-500 truncate">{displayUser.role}</p>
              </div>
            )}
          </div>
          {open && (
            <button
              onClick={async () => {
                try {
                  // Attempt Supabase sign-out if configured
                  // Ignore errors in case env is not set
                  // @ts-ignore
                  if (supabase?.auth?.signOut) {
                    await supabase.auth.signOut()
                  }
                } finally {
                  localStorage.removeItem('userRole')
                  localStorage.removeItem('userName')
                  router.push('/login')
                }
              }}
              className="mt-4 w-full flex items-center justify-center p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

