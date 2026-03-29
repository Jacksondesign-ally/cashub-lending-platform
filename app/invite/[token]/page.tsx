"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, User, Building, CheckCircle, ArrowRight, Shield } from 'lucide-react'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const [lenderName, setLenderName] = useState('')
  const [lenderCompany, setLenderCompany] = useState('')
  const [borrowerName, setBorrowerName] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [decoded, setDecoded] = useState(false)

  useEffect(() => {
    try {
      const token = params.token as string
      const data = atob(token)
      const parts = data.split('|')
      if (parts.length >= 3) {
        setLenderName(parts[0] || 'A Lender')
        setBorrowerName(parts[1] || '')
        setLoanAmount(parts[2] || '')
        setLenderCompany(parts[4] || parts[0] || 'Lender')
        setDecoded(true)
      }
    } catch {
      setDecoded(true)
    }
  }, [params.token])

  if (!decoded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Lender Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
            <span className="text-2xl font-bold text-white">{lenderCompany ? lenderCompany.charAt(0).toUpperCase() : 'L'}</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">{lenderCompany || lenderName}</h1>
          <p className="text-xs text-neutral-500">Licensed Microlender</p>
        </div>

        {/* Invite Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
          <div className="bg-gradient-to-r from-cashub-600 to-cashub-700 p-5 text-white text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h2 className="text-lg font-bold">Loan Invitation</h2>
            <p className="text-xs text-white/80 mt-1">You&apos;ve been invited to apply for a cash loan</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">{lenderCompany ? lenderCompany.charAt(0).toUpperCase() : 'L'}</span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Invited by</p>
                  <p className="text-sm font-semibold text-neutral-900">{lenderCompany || lenderName}</p>
                  <p className="text-[10px] text-neutral-400">Licensed Microlender &bull; via CasHuB</p>
                </div>
              </div>

              {borrowerName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wide">For</p>
                    <p className="text-sm font-semibold text-neutral-900">{borrowerName}</p>
                  </div>
                </div>
              )}

              {loanAmount && loanAmount !== '' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Loan Amount</p>
                    <p className="text-sm font-semibold text-neutral-900">N$ {parseInt(loanAmount).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-neutral-600">
              <p className="font-semibold text-neutral-800">To accept this invitation:</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Register for a free CasHuB borrower account</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete your profile and upload documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>The lender will review and process your loan</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link href={`/signup?role=borrower&ref=${encodeURIComponent(lenderCompany || lenderName)}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold transition-all">
                Register on CasHuB <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-all">
                Already have an account? Log in
              </Link>
            </div>

            {/* Powered by CasHuB */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100">
              <div className="w-5 h-5 bg-gradient-to-br from-cashub-600 to-accent-500 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">C</span>
              </div>
              <span className="text-[10px] text-neutral-400">Powered by <span className="font-semibold text-neutral-600">CasHuB</span> Microlending Platform</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-neutral-400 mt-4">
          CasHuB Microlending Platform &copy; {new Date().getFullYear()} | NAMFISA Regulated
        </p>
      </div>
    </div>
  )
}
