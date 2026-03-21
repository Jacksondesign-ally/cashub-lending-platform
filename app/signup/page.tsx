"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, Building, Shield, MapPin, FileText, CreditCard, ChevronRight, ChevronLeft, Star, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const LENDER_PACKAGES = [
  { id: 'starter',      name: 'Starter',      price: 250,  currency: 'N$', icon: Star,    color: 'border-blue-300 bg-blue-50',   activeColor: 'border-blue-600 bg-blue-50',   textColor: 'text-blue-700',   features: ['Up to 50 active loans', '2 loan officers', 'Basic reports', 'Shared registry access'] },
  { id: 'professional', name: 'Professional', price: 350,  currency: 'N$', icon: Zap,     color: 'border-cashub-300 bg-cashub-50', activeColor: 'border-cashub-600 bg-cashub-50', textColor: 'text-cashub-700', features: ['Up to 250 active loans', '10 loan officers', 'Advanced reports', 'NAMFISA compliance', 'Marketplace access'], popular: true },
  { id: 'enterprise',   name: 'Enterprise',   price: 500,  currency: 'N$', icon: Crown,   color: 'border-violet-300 bg-violet-50', activeColor: 'border-violet-600 bg-violet-50', textColor: 'text-violet-700', features: ['Unlimited loans & staff', 'Full analytics suite', 'Priority support', 'Custom integrations', 'Multi-branch management'] },
]

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex items-center gap-2 ${i < total - 1 ? 'flex-1' : ''}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 === step ? 'bg-cashub-600 text-white shadow-md' : i + 1 < step ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
            {i + 1 < step ? '✓' : i + 1}
          </div>
          {i < total - 1 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-emerald-400' : 'bg-neutral-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function Input({ icon: Icon, label, required, ...props }: { icon: any; label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-neutral-400" /></div>
        <input {...props} className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 text-sm" />
      </div>
    </div>
  )
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') || 'borrower'
  const registrationRole = ['lender', 'super_admin'].includes(roleParam) ? roleParam : 'borrower'
  const isLender = registrationRole === 'lender'

  // Step management (lender has 3 steps, others have 1)
  const [step, setStep] = useState(1)
  const totalSteps = isLender ? 3 : 1

  // Step 1 - Account info
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 - Company info (lender only)
  const [companyName, setCompanyName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [namfisaLicense, setNamfisaLicense] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [yearsInBusiness, setYearsInBusiness] = useState('')

  // Step 3 - Package (lender only)
  const [selectedPackage, setSelectedPackage] = useState('professional')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [envOk, setEnvOk] = useState<boolean | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => { setEnvOk(isSupabaseConfigured) }, [])

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Full name is required'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email is required'
    if (!password || password.length < 6) return 'Password must be at least 6 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return ''
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!envOk) { setError('Supabase is not configured.'); return }

      // Create auth account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/login`, data: { full_name: fullName, role: registrationRole } }
      })

      if (signUpError) {
        const errMsg = signUpError.message.toLowerCase()
        if (errMsg.includes('already')) {
          setError('An account with this email already exists')
        } else if (errMsg.includes('rate limit') || errMsg.includes('too many')) {
          setError('Too many signup attempts. Please wait 1 hour and try again, or contact support.')
        } else if (errMsg.includes('email') && errMsg.includes('send')) {
          setError('Email service temporarily unavailable. Your account was created - try logging in instead.')
        } else {
          setError(signUpError.message)
        }
        return
      }
      if (!signUpData?.user) { setError('Failed to create account. Please try again.'); return }

      // Try to sign in immediately (works if email confirmation is disabled)
      const { data: signInData } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      // Note: sign-in may fail if email confirmation is required - that's OK
      // Our RLS policies now allow anonymous inserts for the signup flow

      const userId = signUpData.user.id
      const userEmail = email.trim().toLowerCase()

      // Create user profile - works with both authenticated and anonymous sessions
      const { error: userErr } = await supabase.from('users').insert({
        id: userId,
        email: userEmail,
        role: registrationRole,
        full_name: fullName,
        phone: phone || null,
        is_active: true,
      })
      // Ignore duplicate errors (user may already exist)
      if (userErr && !userErr.message.includes('duplicate') && !userErr.message.includes('already exists') && !userErr.message.includes('unique')) {
        console.error('User insert error:', userErr.message)
      }

      if (isLender) {
        const displayName = companyName || fullName

        // Create lender onboarding record
        const { error: onboardErr } = await supabase.from('lender_onboarding').insert({
          user_id: userId,
          company_name: displayName,
          legal_name: displayName,
          registration_number: registrationNumber || '',
          contact_person: fullName,
          email: userEmail,
          phone: phone || '',
          address: address || '',
          city: city || '',
          namfisa_license: namfisaLicense || '',
          years_in_business: parseInt(yearsInBusiness) || 0,
          package_tier: selectedPackage,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        if (onboardErr && !onboardErr.message.includes('duplicate') && !onboardErr.message.includes('unique')) {
          setError(`Failed to submit application: ${onboardErr.message}. Please contact support.`)
          setLoading(false)
          return
        }

        // Create lenders record
        const { data: lenderData } = await supabase.from('lenders').insert({
          user_id: userId,
          company_name: displayName,
          legal_name: displayName,
          email: userEmail,
          phone: phone || '',
          registration_number: registrationNumber || '',
          is_active: false,
        }).select('id, company_name').single()
        
        // Store lender ID for data isolation
        if (lenderData) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lenderId', lenderData.id)
            localStorage.setItem('lenderCompany', lenderData.company_name || displayName)
          }
        }
      } else if (registrationRole === 'borrower') {
        const parts = fullName.trim().split(' ')
        const { error: borrowerErr } = await supabase.from('borrowers').insert({
          user_id: userId,
          first_name: parts[0] || fullName,
          last_name: parts.slice(1).join(' ') || '',
          email: userEmail,
          phone: phone || '',
          status: 'active',
        })
        if (borrowerErr && !borrowerErr.message.includes('duplicate') && !borrowerErr.message.includes('unique')) {
          console.error('Borrower insert error:', borrowerErr.message)
        }
      }

      // Sign out after data insertion (lender needs admin approval first)
      if (isLender) await supabase.auth.signOut()

      setSuccess(isLender
        ? 'Application submitted! Your account is pending admin review. You will be notified once approved.'
        : signUpData.user.email_confirmed_at
          ? 'Account created! Redirecting to login...'
          : 'Account created! Please check your email to confirm, then log in.')

      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Unexpected error while creating account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Account', 'Company', 'Package']

  return (
    <div className="min-h-screen bg-gradient-to-br from-cashub-600 via-cashub-700 to-emerald-800 flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg space-y-5">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto h-14 w-14 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
              <Image src="/cashub-icon.svg" alt="CasHuB" width={48} height={48} />
            </div>
          </Link>
          <h2 className="mt-3 text-2xl font-extrabold text-white">
            {registrationRole === 'super_admin' ? 'Admin Access Request' : isLender ? 'Lender Registration' : 'Borrower Registration'}
          </h2>
          {isLender && (
            <p className="mt-1 text-sm text-emerald-100">
              Step {step} of {totalSteps} — {stepLabels[step - 1]}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {isLender && <StepIndicator step={step} total={totalSteps} />}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* ─── STEP 1: Account Info ─── */}
          {step === 1 && (
            <div className="space-y-4">
              {isLender && <p className="text-xs text-neutral-500 mb-2">Create your login credentials</p>}
              <Input icon={User} label="Full Name" required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" />
              <Input icon={Mail} label="Email Address" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              <Input icon={Phone} label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+264 81 000 0000" />
              <Input icon={Lock} label="Password" required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
              <Input icon={Lock} label="Confirm Password" required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />

              {!isLender && (
                <div className="flex items-center gap-2">
                  <input id="terms" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="h-4 w-4 text-cashub-600 border-neutral-300 rounded" />
                  <label htmlFor="terms" className="text-xs text-neutral-600">I accept the CasHuB terms, privacy policy and NAMFISA regulations</label>
                </div>
              )}

              {isLender ? (
                <button type="button" onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold transition-all">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <button type="submit" disabled={loading || !acceptedTerms}
                    className="w-full py-2.5 bg-gradient-to-r from-cashub-600 to-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
                    {loading ? 'Creating account...' : registrationRole === 'super_admin' ? 'Request Admin Access' : 'Register as Borrower'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── STEP 2: Company Info (lender only) ─── */}
          {step === 2 && isLender && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 mb-2">Tell us about your lending business</p>
              <Input icon={Building} label="Company / Business Name" required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your lending company name" />
              <Input icon={FileText} label="Business Registration Number" type="text" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} placeholder="e.g. CC/2024/12345" />
              <Input icon={Shield} label="NAMFISA License Number" type="text" value={namfisaLicense} onChange={e => setNamfisaLicense(e.target.value)} placeholder="NAMFISA micro-lending license" />
              <div className="grid grid-cols-2 gap-3">
                <Input icon={MapPin} label="Address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
                <Input icon={MapPin} label="City" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Windhoek" />
              </div>
              <Input icon={FileText} label="Years in Business" type="number" min="0" max="100" value={yearsInBusiness} onChange={e => setYearsInBusiness(e.target.value)} placeholder="e.g. 3" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setError(''); setStep(1) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => { setError(''); setStep(3) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold transition-all">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Package Selection (lender only) ─── */}
          {step === 3 && isLender && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-neutral-500 mb-2">Choose a subscription plan to get started</p>

              {/* Billing Period Toggle */}
              <div className="flex items-center justify-center gap-1 bg-neutral-100 rounded-xl p-1">
                <button type="button" onClick={() => setBillingPeriod('monthly')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${billingPeriod === 'monthly' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  Monthly
                </button>
                <button type="button" onClick={() => setBillingPeriod('yearly')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${billingPeriod === 'yearly' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  Yearly <span className="text-emerald-600 font-bold">Save 20%</span>
                </button>
              </div>

              <div className="space-y-2">
                {LENDER_PACKAGES.map(pkg => {
                  const displayPrice = billingPeriod === 'yearly' ? Math.round(pkg.price * 12 * 0.80) : pkg.price
                  return (
                  <button key={pkg.id} type="button" onClick={() => setSelectedPackage(pkg.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedPackage === pkg.id ? pkg.activeColor + ' border-2' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <pkg.icon className={`w-4 h-4 ${selectedPackage === pkg.id ? pkg.textColor : 'text-neutral-400'}`} />
                        <span className={`text-sm font-bold ${selectedPackage === pkg.id ? pkg.textColor : 'text-neutral-700'}`}>{pkg.name}</span>
                        {pkg.popular && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Popular</span>}
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black ${selectedPackage === pkg.id ? pkg.textColor : 'text-neutral-600'}`}>
                          {pkg.currency} {displayPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-normal text-neutral-400">/{billingPeriod === 'yearly' ? 'yr' : 'mo'}</span>
                        {billingPeriod === 'yearly' && <p className="text-[10px] text-emerald-600 font-medium">N$ {Math.round(displayPrice/12)}/mo</p>}
                      </div>
                    </div>
                    <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {pkg.features.slice(0, 3).map(f => <li key={f} className="text-[10px] text-neutral-500">• {f}</li>)}
                    </ul>
                  </button>
                )})}
              </div>
              <div className="flex items-center gap-2">
                <input id="terms-lender" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="h-4 w-4 text-cashub-600 border-neutral-300 rounded" />
                <label htmlFor="terms-lender" className="text-xs text-neutral-600">I accept the CasHuB terms, privacy policy and NAMFISA regulations</label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setError(''); setStep(2) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading || !acceptedTerms}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cashub-600 to-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-cashub-600 hover:text-cashub-500">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/50">CasHuB Microlending Platform © {new Date().getFullYear()} | NAMFISA Regulated</p>
      </div>
    </div>
  )
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cashub-900 via-cashub-800 to-emerald-900"><p className="text-white">Loading...</p></div>}>
      <SignupContent />
    </Suspense>
  )
}
