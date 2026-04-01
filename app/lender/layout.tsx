"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { detectOverdueLoans } from '@/lib/overdue-detection'
import LanguageDropdown from '@/components/LanguageDropdown'
import {
  LayoutDashboard, Users, FileText, Banknote, UserCog, Ban,
  AlertTriangle, BookOpen, Store, BarChart3, Shield, Settings,
  Menu, X, LogOut, User, Bell, Building, ChevronRight, CreditCard,
  UserPlus, Mail
} from 'lucide-react'

const lenderMenu = [
  { id: 'dashboard',    name: 'Dashboard',              href: '/lender',                    icon: LayoutDashboard, color: 'text-blue-600',    bg: 'bg-blue-50' },
  { id: 'borrowers',    name: 'Borrowers',               href: '/lender/borrowers',          icon: Users,           color: 'text-orange-600',  bg: 'bg-orange-50' },
  { id: 'applications', name: 'Loan Applications',       href: '/lender/applications',       icon: FileText,        color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  { id: 'loans',        name: 'Active Loans',            href: '/lender/loans',              icon: Building,        color: 'text-green-600',   bg: 'bg-green-50' },
  { id: 'repayments',   name: 'Repayments',              href: '/lender/repayments',         icon: Banknote,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'staff',        name: 'Loan Staff',              href: '/lender/staff',              icon: UserCog,         color: 'text-violet-600',  bg: 'bg-violet-50' },
  { id: 'blacklist',    name: 'Blacklist Requests',      href: '/lender/blacklist',          icon: Ban,             color: 'text-red-600',     bg: 'bg-red-50' },
  { id: 'scam-alerts',  name: 'Scam Alert Submissions', href: '/lender/scam-alerts',        icon: AlertTriangle,   color: 'text-rose-600',    bg: 'bg-rose-50' },
  { id: 'registry',     name: 'Shared Registry Search', href: '/lender/registry',           icon: BookOpen,        color: 'text-purple-600',  bg: 'bg-purple-50' },
  { id: 'marketplace',  name: 'Marketplace',             href: '/lender/marketplace',        icon: Store,           color: 'text-cyan-600',    bg: 'bg-cyan-50' },
  { id: 'reports',      name: 'Reports',                 href: '/lender/reports',            icon: BarChart3,       color: 'text-pink-600',    bg: 'bg-pink-50' },
  { id: 'agreements',   name: 'Loan Agreements',         href: '/lender/agreements',         icon: FileText,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'compliance',   name: 'Compliance Exports',      href: '/lender/compliance',         icon: Shield,          color: 'text-teal-600',    bg: 'bg-teal-50' },
  { id: 'billing',      name: 'Billing & Subscription',  href: '/lender/billing',            icon: CreditCard,      color: 'text-yellow-600',  bg: 'bg-yellow-50' },
  { id: 'invite',         name: 'Invite Borrower',     href: '/lender/invite',         icon: UserPlus, color: 'text-blue-600',   bg: 'bg-blue-50' },
  { id: 'invite-lender', name: 'Invite Lender',       href: '/lender/invite-lender', icon: Mail,     color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'branches',      name: 'Branches',            href: '/lender/branches',      icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'settings',      name: 'Settings',            href: '/lender/settings',      icon: Settings, color: 'text-gray-600',   bg: 'bg-gray-50' },
  { id: 'contract',      name: 'Platform Contract',   href: '/lender/contract',      icon: FileText, color: 'text-red-700',   bg: 'bg-red-50' },
]

export default function LenderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('Lender')
  const [companyName, setCompanyName] = useState('')
  const [blacklistAlert, setBlacklistAlert] = useState<{ count: number; names: string[] } | null>(null)
  const [showBlacklistBanner, setShowBlacklistBanner] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    const name = localStorage.getItem('userName') || 'Lender'
    const lid = localStorage.getItem('lenderId')
    if (lid) detectOverdueLoans(lid).catch(() => {})
    if (!role || !['lender_admin', 'lender', 'loan_officer'].includes(role)) {
      router.push('/login')
      return
    }
    setUserName(name)
    setCompanyName(localStorage.getItem('lenderCompany') || 'My Company')
    // Check for newly approved blacklist entries
    const lastBlacklistCheck = localStorage.getItem('lastBlacklistCheck') || new Date(0).toISOString()
    supabase
      .from('blacklist')
      .select('id, full_name, borrower:borrower_id(first_name, last_name)')
      .eq('status', 'approved')
      .gt('updated_at', lastBlacklistCheck)
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const names = data.map((e: any) => {
            const b = e.borrower
            return b ? `${b.first_name} ${b.last_name}` : e.full_name || 'Unknown'
          }).filter(Boolean)
          setBlacklistAlert({ count: data.length, names })
          setShowBlacklistBanner(true)
          localStorage.setItem('lastBlacklistCheck', new Date().toISOString())
        }
      })
    // Resolve lenderId from auth session — try user_id first, then email fallback
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const userId = session.user.id
      const email = session.user.email || (name.includes('@') ? name : null)
      // Try by user_id first (reliable for new lenders)
      let { data } = await supabase.from('lenders').select('id, company_name, legal_name, is_active').eq('user_id', userId).maybeSingle()
      // Fall back to email match
      if (!data && email) {
        const { data: byEmail } = await supabase.from('lenders').select('id, company_name, legal_name, is_active').eq('email', email).maybeSingle()
        data = byEmail
      }
      if (data) {
        localStorage.setItem('lenderId', data.id)
        const company = data.legal_name || data.company_name || ''
        if (company) { localStorage.setItem('lenderCompany', company); setCompanyName(company) }
        if (email && !localStorage.getItem('userName')?.includes('@')) {
          localStorage.setItem('userName', email)
        }
        // Check contract status — gate portal unless on exempt pages
        const currentPath = window.location.pathname
        const contractExempt = ['/lender/contract', '/lender/pending-approval', '/login'].some(p => currentPath.startsWith(p))
        if (!contractExempt) {
          const { data: contract } = await supabase
            .from('lender_contracts')
            .select('status')
            .eq('lender_id', data.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (!contract || contract.status === 'rejected' || contract.status === 'pending' || contract.status === 'under_review') {
            if (!contract || contract.status === 'rejected') {
              router.push('/lender/contract')
            } else {
              router.push('/lender/contract')
            }
            return
          }
        }
        if (data.is_active === false) {
          router.push('/lender/pending-approval')
        }
      }
    })
  }, [])

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch { /* ignore */ }
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('lenderId')
    localStorage.removeItem('lenderCompany')
    localStorage.removeItem('lastBlacklistCheck')
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${open ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
          <Link href="/lender" className="flex items-center">
            <Image src="/cashub-icon.svg" alt="CasHuB" width={32} height={32} className="rounded-lg flex-shrink-0" />
            {open && <Image src="/cashub-logo.svg" alt="CasHuB" width={90} height={28} className="ml-2" />}
          </Link>
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            {open ? <X className="w-4 h-4 text-neutral-500" /> : <Menu className="w-4 h-4 text-neutral-500" />}
          </button>
        </div>

        {/* Company badge */}
        {open && (
          <div className="mx-3 mt-3 px-3 py-2 bg-cashub-50 border border-cashub-200 rounded-lg">
            <p className="text-[10px] font-medium text-cashub-600 uppercase tracking-wide">Lender Portal</p>
            <p className="text-xs font-semibold text-cashub-800 truncate mt-0.5">{companyName || userName}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
          {lenderMenu.map(item => {
            const isActive = item.href === '/lender' ? pathname === '/lender' : pathname.startsWith(item.href)
            return (
              <Link key={item.id} href={item.href}
                className={`flex items-center ${open ? 'justify-start' : 'justify-center'} p-2.5 rounded-lg transition-all duration-150 group ${isActive ? 'bg-cashub-50 text-cashub-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${isActive ? 'bg-cashub-100' : item.bg}`}>
                  <item.icon className={`w-4 h-4 ${isActive ? item.color : 'text-neutral-500'}`} />
                </div>
                {open && <span className={`ml-2.5 text-sm font-medium truncate ${isActive ? 'text-cashub-700' : ''}`}>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User profile + logout */}
        <div className="p-3 border-t border-neutral-200 flex-shrink-0">
          <div className={`flex items-center ${open ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {open && (
              <div className="ml-2.5 flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-900 truncate">{userName}</p>
                <p className="text-[10px] text-neutral-500 truncate">Lender Admin</p>
              </div>
            )}
          </div>
          {open && (
            <button onClick={handleLogout} className="mt-2 w-full flex items-center justify-center gap-2 p-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`${open ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 min-h-screen flex flex-col`}>
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
          <div className="px-6 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-neutral-900">
                {lenderMenu.find(m => m.href === '/lender' ? pathname === '/lender' : pathname.startsWith(m.href))?.name || 'Lender Portal'}
              </h1>
              <p className="text-xs text-neutral-500">{companyName || 'Lender Portal'}</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageDropdown compact />
              <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <Bell className="w-4 h-4 text-neutral-600" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-cashub-500 to-accent-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Blacklist Notification Banner */}
        {showBlacklistBanner && blacklistAlert && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center gap-3">
            <Ban className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm flex-1">
              <strong>{blacklistAlert.count} new blacklist {blacklistAlert.count === 1 ? 'entry has' : 'entries have'} been approved</strong> since your last login.
              {blacklistAlert.names.length > 0 && ` Includes: ${blacklistAlert.names.slice(0, 3).join(', ')}${blacklistAlert.names.length > 3 ? ` and ${blacklistAlert.names.length - 3} more` : ''}.`}
              {' '}<a href="/lender/blacklist" className="underline font-semibold hover:no-underline">View Blacklist →</a>
            </p>
            <button onClick={() => setShowBlacklistBanner(false)} className="p-1 hover:bg-red-700 rounded ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
