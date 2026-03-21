"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Clock, LogOut, Mail, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LenderPendingApprovalPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch { /* ignore */ }
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('lenderId')
    localStorage.removeItem('lenderCompany')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Account Pending Approval</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Your lender account is currently under review by the CasHuB admin team. You will receive an email once your account has been approved and activated.
        </p>

        <div className="space-y-3 text-left mb-6">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">Your application is being reviewed for NAMFISA compliance and CasHuB platform requirements.</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <Mail className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">You will be notified by email when your account is approved. This typically takes 1-3 business days.</p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-sm font-semibold transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )
}
