"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Building, Users, ChevronLeft, ChevronRight, Calculator, DollarSign, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const DEFAULT_SLIDES = [
  { image: '/slides/slide-team.jpg', gradient: 'from-blue-800 via-blue-900 to-indigo-900', title: 'Your Trusted Lending Partner', subtitle: 'Join thousands of satisfied customers who trust CasHuB for their financial needs.' },
  { image: '/slides/slide-school.jpg', gradient: 'from-green-800 via-green-900 to-emerald-900', title: 'Back to School Loans', subtitle: 'Get same-day approval for school fees, uniforms, and supplies. Education matters.' },
  { image: '/slides/slide-van.jpg', gradient: 'from-orange-800 via-orange-900 to-red-900', title: 'Transport & Business Solutions', subtitle: 'Finance for vehicles, equipment, and business expansion. Grow with CasHuB.' },
  { image: '/slides/slide1-new.jpg', gradient: 'from-indigo-800 via-indigo-900 to-purple-900', title: 'Modern Lending Platform', subtitle: 'Experience the future of microlending with CasHuB platform.' },
  { image: '/slides/bus.jpg', gradient: 'from-green-800 via-green-900 to-emerald-900', title: 'Transport Solutions', subtitle: 'Quick financing for transport, logistics and business needs.' },
  { image: '/slides/wear.jpg', gradient: 'from-amber-800 via-amber-900 to-orange-900', title: 'Fashion & Retail', subtitle: 'Flexible payment plans for clothing, accessories and retail.' },
  { image: '/slides/slide1.jpg', gradient: 'from-green-800 via-green-900 to-emerald-900', title: 'Back to School Loans', subtitle: 'Apply for your loan today. Same day approval and payout guaranteed.' },
  { image: '/slides/slide2.jpg', gradient: 'from-blue-800 via-blue-900 to-indigo-900', title: 'Emergency Cash When You Need', subtitle: 'Quick loans for groceries, school fees, medical bills, or other expenses.' },
  { image: '/slides/slide3.jpg', gradient: 'from-teal-700 via-teal-800 to-green-900', title: 'Build Your Credit History', subtitle: 'Every repayment improves your score. Access bigger loans over time.' },
]

const INTEREST_RATES = [
  { label: '20%', value: 0.20 },
  { label: '25%', value: 0.25 },
  { label: '30%', value: 0.30 },
]

const NAMFISA_LEVY = 5.00
const ADMIN_FEE_RATE = 0.0103

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [envOk, setEnvOk] = useState<boolean | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loginMode, setLoginMode] = useState<'super_admin' | 'lender' | 'borrower'>('lender')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [SLIDE_IMAGES, setSlideImages] = useState(DEFAULT_SLIDES)

  // Calculator state
  const [loanAmount, setLoanAmount] = useState<string>('1000')
  const [selectedRate, setSelectedRate] = useState<number>(0.20)
  const [manualLevy, setManualLevy] = useState<string>('5.00')

  const router = useRouter()

  useEffect(() => {
    setEnvOk(isSupabaseConfigured)
    // Try localStorage first (fastest)
    try {
      const custom = localStorage.getItem('loginSlides')
      if (custom) {
        const parsed = JSON.parse(custom)
        if (parsed?.length) setSlideImages(parsed)
      }
    } catch {}
    // Also fetch from DB to get latest branding
    supabase.from('system_settings').select('value').eq('key', 'login_slides').maybeSingle().then(({ data }) => {
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value)
          if (parsed?.length) {
            setSlideImages(parsed)
            localStorage.setItem('loginSlides', data.value)
          }
        } catch {}
      }
    })
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % SLIDE_IMAGES.length
        console.log('[CasHuB Slides] Switching to slide', next, SLIDE_IMAGES[next])
        return next
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [SLIDE_IMAGES.length])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length)
  }, [SLIDE_IMAGES.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length)
  }, [SLIDE_IMAGES.length])

  // Calculator logic
  const principal = parseFloat(loanAmount) || 0
  const interest = principal * selectedRate
  const adminFee = principal * ADMIN_FEE_RATE
  const levy = parseFloat(manualLevy) || NAMFISA_LEVY
  const totalRepayment = principal + interest + adminFee + levy

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password) {
        setError('Please enter your email and password')
        return
      }

      if (!envOk) {
        setError('Supabase is not configured. Please check environment variables.')
        return
      }

      console.log('Attempting login for:', email)

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      })

      console.log('Login response:', { user: authData?.user?.id, error: authError?.message })

      if (authError) {
        setError(authError.message || 'Invalid email or password')
        return
      }

      if (!authData?.user) {
        setError('Login failed. Please try again.')
        return
      }

      // Fetch user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role, full_name, is_active')
        .eq('id', authData.user.id)
        .single()

      console.log('Profile:', { profile: userProfile, error: profileError?.message })

      if (profileError || !userProfile) {
        const defaultRole = loginMode === 'borrower' ? 'borrower' : 
                           loginMode === 'super_admin' ? 'super_admin' : 'lender_admin'
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            role: defaultRole,
            full_name: authData.user.email!.split('@')[0],
            is_active: true
          })

        if (insertError) {
          await supabase.auth.signOut()
          setError(`Profile error: ${insertError.message}`)
          return
        }

        localStorage.setItem('userRole', defaultRole)
        localStorage.setItem('userName', authData.user.email!)
        localStorage.setItem('userEmail', authData.user.email!)
        
        if (defaultRole === 'borrower') {
          router.push('/borrower')
        } else if (defaultRole === 'lender_admin') {
          router.push('/lender')
        } else {
          router.push('/dashboard')
        }
        return
      }

      // Check if user is active
      if (!userProfile.is_active) {
        await supabase.auth.signOut()
        setError('Your account has been suspended. Contact support.')
        return
      }

      // Store user info and redirect
      localStorage.setItem('userRole', userProfile.role)
      localStorage.setItem('userName', userProfile.full_name || email)
      localStorage.setItem('userEmail', authData.user.email || email.trim().toLowerCase())

      // For lenders, fetch and cache lender ID immediately
      if (['lender', 'lender_admin', 'loan_officer'].includes(userProfile.role)) {
        const { data: lenderData } = await supabase
          .from('lenders')
          .select('id, company_name')
          .eq('user_id', authData.user.id)
          .maybeSingle()
        
        if (lenderData) {
          localStorage.setItem('lenderId', lenderData.id)
          localStorage.setItem('lenderCompany', lenderData.company_name || '')
        } else {
          // Fallback: try by email
          const { data: lenderByEmail } = await supabase
            .from('lenders')
            .select('id, company_name')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle()
          
          if (lenderByEmail) {
            localStorage.setItem('lenderId', lenderByEmail.id)
            localStorage.setItem('lenderCompany', lenderByEmail.company_name || '')
          }
        }
        router.push('/lender')
      } else if (userProfile.role === 'borrower') {
        router.push('/borrower')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Sliding Image Carousel + CasHuB Info */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {SLIDE_IMAGES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background gradient base */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            {/* Slide image overlay - increased opacity for visibility */}
            <img
              src={`${slide.image}?v=2`}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              loading="eager"
              onLoad={() => console.log('[CasHuB Slides] Image loaded:', slide.image)}
              onError={(e) => {
                console.error('[CasHuB Slides] Image failed to load:', slide.image)
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ))}

        {/* Slide Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo & Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                <Image src="/cashub-icon.svg" alt="CasHuB" width={36} height={36} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CasHuB</h1>
                <p className="text-[10px] text-white/60">Microlending Platform</p>
              </div>
            </Link>
          </div>

          {/* CasHuB Info */}
          <div className="max-w-md space-y-5">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-bold text-lg mb-2">Powering Namibia&apos;s Lending Future</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Transform your lending operations with Namibia&apos;s most advanced microlending platform. 
                CasHuB streamlines every aspect of your business—from borrower onboarding to NAMFISA compliance—while 
                protecting you with real-time fraud detection and a nationwide shared credit registry.
              </p>
              <ul className="mt-3 space-y-1.5 text-white/70 text-xs">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>Full NAMFISA Compliance Automation</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>Nationwide Borrower Credit Registry</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>Instant Loan Approvals & Disbursement</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>AI-Powered Fraud & Risk Detection</li>
              </ul>
            </div>

            {/* Slide Text */}
            {SLIDE_IMAGES.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute pointer-events-none'
                }`}
              >
                {index === currentSlide && (
                  <>
                    <h2 className="text-2xl font-extrabold text-white mb-2 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Slide Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {SLIDE_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <button onClick={prevSlide} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextSlide} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form + Calculator */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-neutral-50 p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-4">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Image src="/cashub-icon.svg" alt="CasHuB" width={40} height={40} className="rounded-xl shadow-lg" />
              <h1 className="text-xl font-bold text-neutral-900">CasHuB</h1>
            </Link>
          </div>

          {/* Welcome Text */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Welcome to CasHuB</h2>
            <p className="mt-0.5 text-xs text-neutral-500">The Modern Operating System for Namibian Lenders</p>
          </div>

          {/* Super Admin / Lender / Borrower Toggle */}
          <div className="grid grid-cols-3 gap-1 bg-neutral-200/70 p-1 rounded-xl">
            <button
              onClick={() => { setLoginMode('super_admin'); setError('') }}
              className={`flex items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                loginMode === 'super_admin'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 mr-1.5 ${loginMode === 'super_admin' ? 'text-red-600' : ''}`} />
              Super Admin
            </button>
            <button
              onClick={() => { setLoginMode('lender'); setError('') }}
              className={`flex items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                loginMode === 'lender'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
            >
              <Building className={`w-3.5 h-3.5 mr-1.5 ${loginMode === 'lender' ? 'text-cashub-600' : ''}`} />
              Lender
            </button>
            <button
              onClick={() => { setLoginMode('borrower'); setError('') }}
              className={`flex items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                loginMode === 'borrower'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
            >
              <Users className={`w-3.5 h-3.5 mr-1.5 ${loginMode === 'borrower' ? 'text-emerald-600' : ''}`} />
              Borrower
            </button>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6">
            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-xs text-red-700">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-neutral-700 mb-1">
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
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 transition-colors text-sm"
                    placeholder={loginMode === 'super_admin' ? 'Enter admin email' : loginMode === 'lender' ? 'Enter lender email' : 'Enter borrower email'}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 transition-colors text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-3.5 w-3.5 text-cashub-600 focus:ring-cashub-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="accept-terms" className="ml-1.5 block text-[10px] text-neutral-600">
                    I accept the terms & privacy policy
                  </label>
                </div>
                <Link href="/forgot-password" className="text-[10px] font-medium text-cashub-600 hover:text-cashub-500">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white ${
                  loginMode === 'super_admin'
                    ? 'bg-gradient-to-r from-red-600 to-red-700'
                    : loginMode === 'lender'
                    ? 'bg-gradient-to-r from-cashub-600 to-cashub-700'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                } ${
                  loading || !acceptedTerms
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-lg transform hover:-translate-y-0.5'
                } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cashub-500`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  loginMode === 'super_admin' ? 'Sign in as Super Admin' : loginMode === 'lender' ? 'Sign in as Lender' : 'Sign in as Borrower'
                )}
              </button>
            </form>

            <div className="mt-3 text-center space-y-1.5">
              <p className="text-xs text-neutral-500">
                Don&apos;t have an account?{' '}
                {loginMode === 'super_admin' ? (
                  <Link href="/signup?role=super_admin" className="font-medium text-red-600 hover:text-red-500">
                    Request Admin Access
                  </Link>
                ) : loginMode === 'lender' ? (
                  <Link href="/signup?role=lender" className="font-medium text-cashub-600 hover:text-cashub-500">
                    Register as Lender
                  </Link>
                ) : (
                  <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
                    Register as Borrower
                  </Link>
                )}
              </p>
              {(loginMode === 'lender' || loginMode === 'super_admin') && (
                <p className="text-[10px] text-neutral-400">
                  Know a lender?{' '}
                  <Link href="/dashboard/lenders/invite" className="font-semibold text-violet-600 hover:text-violet-500">
                    Invite them to CasHuB →
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Loan Calculator */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
            <div className="flex items-center mb-3">
              <Calculator className="w-4 h-4 text-cashub-600 mr-2" />
              <h3 className="text-sm font-bold text-neutral-900">Loan Calculator</h3>
            </div>

            <div className="space-y-3">
              {/* Loan Amount */}
              <div>
                <label className="block text-[10px] font-medium text-neutral-600 mb-1">Loan Amount (N$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="block w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Interest Rate Selection */}
              <div>
                <label className="block text-[10px] font-medium text-neutral-600 mb-1">Interest Rate</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {INTEREST_RATES.map((rate) => (
                    <button
                      key={rate.label}
                      type="button"
                      onClick={() => setSelectedRate(rate.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedRate === rate.value
                          ? 'bg-cashub-600 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NAMFISA Levy */}
              <div>
                <label className="block text-[10px] font-medium text-neutral-600 mb-1">NAMFISA Levy (N$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualLevy}
                  onChange={(e) => setManualLevy(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="5.00"
                />
              </div>

              {/* Summary */}
              <div className="bg-neutral-50 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Principal</span>
                  <span className="font-medium">N$ {principal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Interest ({(selectedRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium">N$ {interest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Admin Fee (1.03%)</span>
                  <span className="font-medium">N$ {adminFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>NAMFISA Levy</span>
                  <span className="font-medium">N$ {levy.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-1.5 flex justify-between">
                  <span className="text-sm font-bold text-neutral-900">Total Repayment</span>
                  <span className="text-sm font-bold text-cashub-600">N$ {totalRepayment.toFixed(2)}</span>
                </div>
              </div>

              {/* Apply / Register CTA */}
              <Link
                href="/signup"
                className="block w-full text-center py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-md"
              >
                Apply for a Loan &mdash; Register as Borrower
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-neutral-400">
            CasHuB Microlending Platform &copy; {new Date().getFullYear()} | NAMFISA Regulated
          </p>
        </div>
      </div>
    </div>
  )
}
