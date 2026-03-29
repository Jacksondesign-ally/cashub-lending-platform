"use client"

import React, { useState, useEffect } from 'react'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [envOk, setEnvOk] = useState<boolean | null>(null)

  useEffect(() => {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setEnvOk(hasUrl && hasKey)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!email) {
        setError('Please enter your email address')
        return
      }

      if (!envOk) {
        setSuccess('In preview mode — password reset email would be sent to ' + email)
        return
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email')
        return
      }

      setSuccess('Password reset link has been sent to your email address.')
    } catch (e) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cashub-600 via-cashub-700 to-cashub-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-md w-full space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto h-14 w-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold bg-gradient-to-r from-cashub-600 to-accent-500 bg-clip-text text-transparent">
                C
              </span>
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-white">Reset Your Password</h2>
          <p className="mt-1 text-sm text-cashub-100">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 transition-colors text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-cashub-600 to-cashub-700 ${
                loading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:from-cashub-700 hover:to-cashub-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cashub-500`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-cashub-600 hover:text-cashub-500">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-cashub-100/60">
          CasHuB Microlending Platform &copy; {new Date().getFullYear()} | NAMFISA Regulated
        </p>
      </div>
    </div>
  )
}
