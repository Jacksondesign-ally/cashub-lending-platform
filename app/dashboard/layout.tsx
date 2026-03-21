"use client"

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Bell, User } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Use state to avoid hydration issues with localStorage
  const [user, setUser] = useState({
    name: 'John Admin',
    role: 'System Administrator'
  })

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    const name = localStorage.getItem('userName')

    if (!role || !name) return

    const roleLabels: Record<string, string> = {
      super_admin: 'Super Administrator',
      lender_admin: 'Lender Administrator',
      loan_officer: 'Loan Officer',
      borrower: 'Borrower',
    }

    setUser({
      name: name || role || 'User',
      role: roleLabels[role] || role
    })
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
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
                  <div className="text-right hidden md:block">
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
