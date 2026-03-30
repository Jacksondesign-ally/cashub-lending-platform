"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, Building, Shield, MapPin, FileText, CreditCard, ChevronRight, ChevronLeft, Star, Zap, Crown, Camera, Upload, X } from 'lucide-react'
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

  // Step management (lender has 4 steps, borrower has 5)
  const [step, setStep] = useState(1)
  const totalSteps = isLender ? 4 : registrationRole === 'borrower' ? 5 : 1

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

  // Step 4 - Agreement info (lender only)
  const [signatoryName, setSignatoryName] = useState('')
  const [signatoryId, setSignatoryId] = useState('')
  const [signatoryTitle, setSignatoryTitle] = useState('')
  const [lenderPostalAddress, setLenderPostalAddress] = useState('')
  const [latePaymentPercentage, setLatePaymentPercentage] = useState('5')
  const sigCanvasRef = useRef<HTMLCanvasElement>(null)
  const [sigIsDrawing, setSigIsDrawing] = useState(false)
  const [sigDataUrl, setSigDataUrl] = useState('')

  // Borrower photo
  const [borrowerPhoto, setBorrowerPhoto] = useState('')

  // Borrower agreement fields (steps 2-5)
  const [idNumber, setIdNumber] = useState('')
  const [postalAddress, setPostalAddress] = useState('')
  const [residentialAddress, setResidentialAddress] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [occupation, setOccupation] = useState('')
  const [employerName, setEmployerName] = useState('')
  const [employerTel, setEmployerTel] = useState('')
  const [employerAddress, setEmployerAddress] = useState('')
  const [payslipEmployeeNo, setPayslipEmployeeNo] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [bankAccountNo, setBankAccountNo] = useState('')
  const [bankAccountType, setBankAccountType] = useState('')
  const [reference1Name, setReference1Name] = useState('')
  const [reference1Tel, setReference1Tel] = useState('')
  const [reference2Name, setReference2Name] = useState('')
  const [reference2Tel, setReference2Tel] = useState('')

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

  const startSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setSigIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    ctx.beginPath()
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
  }
  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!sigIsDrawing) return
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f172a'
    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    ctx.stroke()
  }
  const stopSig = () => {
    if (!sigIsDrawing) return
    setSigIsDrawing(false)
    const canvas = sigCanvasRef.current
    if (canvas) setSigDataUrl(canvas.toDataURL('image/png'))
  }
  const clearSig = () => {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    setSigDataUrl('')
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
          postal_address: lenderPostalAddress || null,
          authorized_signatory_name: signatoryName || null,
          authorized_signatory_id: signatoryId || null,
          authorized_signatory_title: signatoryTitle || null,
          late_payment_percentage: latePaymentPercentage ? parseFloat(latePaymentPercentage) : 5,
          signature_url: sigDataUrl || null,
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
          id_number: idNumber || null,
          photo_url: borrowerPhoto || null,
          postal_address: postalAddress || null,
          address: residentialAddress || null,
          marital_status: maritalStatus || null,
          occupation: occupation || null,
          employer_name: employerName || null,
          employer_tel: employerTel || null,
          employer_address: employerAddress || null,
          payslip_employee_no: payslipEmployeeNo || null,
          bank_name: bankName || null,
          bank_branch: bankBranch || null,
          bank_account_no: bankAccountNo || null,
          bank_account_type: bankAccountType || null,
          reference1_name: reference1Name || null,
          reference1_tel: reference1Tel || null,
          reference2_name: reference2Name || null,
          reference2_tel: reference2Tel || null,
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

  const stepLabels = isLender ? ['Account', 'Company', 'Package', 'Agreement'] : ['Account', 'Personal', 'Employment', 'Banking', 'References']

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
          {(isLender || registrationRole === 'borrower') && (
            <p className="mt-1 text-sm text-emerald-100">
              Step {step} of {totalSteps} — {stepLabels[step - 1] || ''}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {(isLender || registrationRole === 'borrower') && <StepIndicator step={step} total={totalSteps} />}

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

              <button type="button" onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold transition-all">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── STEP 2 BORROWER: Personal Info ─── */}
          {step === 2 && !isLender && registrationRole === 'borrower' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 font-medium">Personal Information — used to auto-fill your loan agreement</p>

              {/* Photo capture */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Profile Photo <span className="text-xs font-normal text-neutral-400">(optional)</span></label>
                <div className="flex items-center gap-4">
                  {borrowerPhoto ? (
                    <div className="relative">
                      <img src={borrowerPhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-cashub-500" />
                      <button type="button" onClick={() => setBorrowerPhoto('')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                      <Camera className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => {
                      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'
                      inp.onchange = (ev) => { const f = (ev.target as HTMLInputElement).files?.[0]; if (!f) return; const r = new FileReader(); r.onload = e2 => setBorrowerPhoto(e2.target?.result as string); r.readAsDataURL(f) }
                      inp.click()
                    }} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700">
                      <Upload className="w-3.5 h-3.5" /> Upload Photo
                    </button>
                    <button type="button" onClick={() => {
                      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'user')
                      inp.onchange = (ev) => { const f = (ev.target as HTMLInputElement).files?.[0]; if (!f) return; const r = new FileReader(); r.onload = e2 => setBorrowerPhoto(e2.target?.result as string); r.readAsDataURL(f) }
                      inp.click()
                    }} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700">
                      <Camera className="w-3.5 h-3.5" /> Take Photo
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input icon={Shield} label="ID / Passport No" required type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="e.g. 00010100123" />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Marital Status</label>
                  <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 text-neutral-900">
                    <option value="">Select...</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                  </select>
                </div>
              </div>
              <Input icon={MapPin} label="Postal Address" type="text" value={postalAddress} onChange={e => setPostalAddress(e.target.value)} placeholder="P.O. Box 1234, Windhoek" />
              <Input icon={MapPin} label="Residential Address" type="text" value={residentialAddress} onChange={e => setResidentialAddress(e.target.value)} placeholder="123 Main Street, Windhoek" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setError(''); setStep(1) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => { setError(''); setStep(3) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3 BORROWER: Employment ─── */}
          {step === 3 && !isLender && registrationRole === 'borrower' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 font-medium">Employment Details</p>
              <Input icon={FileText} label="Occupation" type="text" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g. Teacher, Nurse" />
              <Input icon={Building} label="Employer Name" type="text" value={employerName} onChange={e => setEmployerName(e.target.value)} placeholder="e.g. Ministry of Education" />
              <div className="grid grid-cols-2 gap-3">
                <Input icon={Phone} label="Employer Tel" type="tel" value={employerTel} onChange={e => setEmployerTel(e.target.value)} placeholder="+264 61 000 0000" />
                <Input icon={FileText} label="Payslip / Employee No" type="text" value={payslipEmployeeNo} onChange={e => setPayslipEmployeeNo(e.target.value)} placeholder="e.g. EMP12345" />
              </div>
              <Input icon={MapPin} label="Employer Address" type="text" value={employerAddress} onChange={e => setEmployerAddress(e.target.value)} placeholder="Employer street address" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setError(''); setStep(2) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => { setError(''); setStep(4) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4 BORROWER: Banking ─── */}
          {step === 4 && !isLender && registrationRole === 'borrower' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 font-medium">Banking Details</p>
              <div className="grid grid-cols-2 gap-3">
                <Input icon={CreditCard} label="Bank Name" type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. FNB, Standard Bank" />
                <Input icon={CreditCard} label="Branch" type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} placeholder="e.g. Windhoek" />
              </div>
              <Input icon={CreditCard} label="Account Number" type="text" value={bankAccountNo} onChange={e => setBankAccountNo(e.target.value)} placeholder="Your bank account number" />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Account Type</label>
                <select value={bankAccountType} onChange={e => setBankAccountType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 text-neutral-900">
                  <option value="">Select...</option>
                  <option>Cheque</option><option>Savings</option><option>Transmission</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setError(''); setStep(3) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => { setError(''); setStep(5) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 5 BORROWER: References + Submit ─── */}
          {step === 5 && !isLender && registrationRole === 'borrower' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-neutral-500 font-medium">Personal References</p>
              <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-neutral-700">Reference 1</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input icon={User} label="Full Name" type="text" value={reference1Name} onChange={e => setReference1Name(e.target.value)} placeholder="Reference name" />
                  <Input icon={Phone} label="Tel No" type="tel" value={reference1Tel} onChange={e => setReference1Tel(e.target.value)} placeholder="+264 81 000 0000" />
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-neutral-700">Reference 2</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input icon={User} label="Full Name" type="text" value={reference2Name} onChange={e => setReference2Name(e.target.value)} placeholder="Reference name" />
                  <Input icon={Phone} label="Tel No" type="tel" value={reference2Tel} onChange={e => setReference2Tel(e.target.value)} placeholder="+264 81 000 0000" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="terms-b" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="h-4 w-4 text-cashub-600 border-neutral-300 rounded" />
                <label htmlFor="terms-b" className="text-xs text-neutral-600">I accept the CasHuB terms, privacy policy and NAMFISA regulations</label>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setError(''); setStep(4) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading || !acceptedTerms}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cashub-600 to-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
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
            <div className="space-y-4">
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
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setError(''); setStep(2) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => { setError(''); setStep(4) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Agreement Info (lender only) ─── */}
          {step === 4 && isLender && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-neutral-500 font-medium">Agreement &amp; Signatory Details — auto-fills your loan agreements</p>
              <Input icon={User} label="Authorised Signatory Name" type="text" value={signatoryName} onChange={e => setSignatoryName(e.target.value)} placeholder="Full name of authorised signatory" />
              <div className="grid grid-cols-2 gap-3">
                <Input icon={Shield} label="Signatory ID No" type="text" value={signatoryId} onChange={e => setSignatoryId(e.target.value)} placeholder="ID / Passport number" />
                <Input icon={FileText} label="Title / Designation" type="text" value={signatoryTitle} onChange={e => setSignatoryTitle(e.target.value)} placeholder="e.g. Director, CEO" />
              </div>
              <Input icon={MapPin} label="Postal Address" type="text" value={lenderPostalAddress} onChange={e => setLenderPostalAddress(e.target.value)} placeholder="P.O. Box 1234, Windhoek" />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Late Payment Penalty (%)</label>
                <input type="number" min="0" max="100" step="0.1" value={latePaymentPercentage}
                  onChange={e => setLatePaymentPercentage(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
                <p className="text-[11px] text-neutral-400 mt-1">Standard is 5% — this will appear on all your loan agreements</p>
              </div>

              {/* Signature Pad */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Authorised Signature <span className="text-xs font-normal text-neutral-400">(draw in box below)</span>
                </label>
                <div className="relative border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden" style={{height: '120px'}}>
                  <canvas
                    ref={sigCanvasRef}
                    width={600}
                    height={120}
                    className="w-full h-full touch-none cursor-crosshair"
                    onMouseDown={startSig}
                    onMouseMove={drawSig}
                    onMouseUp={stopSig}
                    onMouseLeave={stopSig}
                    onTouchStart={e => { e.preventDefault(); startSig(e) }}
                    onTouchMove={e => { e.preventDefault(); drawSig(e) }}
                    onTouchEnd={stopSig}
                  />
                  {!sigDataUrl && (
                    <p className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400 pointer-events-none select-none">
                      ✍ Sign here
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-neutral-400">This signature will appear on all loan agreements</p>
                  {sigDataUrl && (
                    <button type="button" onClick={clearSig} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="terms-lender" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="h-4 w-4 text-cashub-600 border-neutral-300 rounded" />
                <label htmlFor="terms-lender" className="text-xs text-neutral-600">I accept the CasHuB terms, privacy policy and NAMFISA regulations</label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setError(''); setStep(3) }}
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
