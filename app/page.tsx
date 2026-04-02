"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle, Users, FileText, Shield, BarChart3, Building,
  Globe, ArrowRight, Star, Zap, Crown, Menu, X, Phone, Mail,
  MapPin, ChevronDown, TrendingUp, Lock, BookOpen,
  Banknote, Store, AlertTriangle, CreditCard, Award,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const COUNTRIES = [
  { name: 'Namibia', flag: '🇳🇦', code: 'NAM', currency: 'N$', desc: 'Full NAMFISA compliance & reporting' },
  { name: 'South Africa', flag: '🇿🇦', code: 'RSA', currency: 'R', desc: 'NCR compliance & credit bureau integration' },
  { name: 'Botswana', flag: '🇧🇼', code: 'BWA', currency: 'P', desc: 'NBFIRA regulated lending operations' },
]

const FEATURES = [
  { icon: Users, color: 'bg-blue-500', title: 'Borrower Management', desc: 'Store and manage all your borrower details in one place — IDs, employment info, credit history and documents.' },
  { icon: FileText, color: 'bg-indigo-500', title: 'Loan Applications', desc: 'Process loan applications quickly with automated scoring and approval steps — no paperwork needed.' },
  { icon: BookOpen, color: 'bg-purple-500', title: 'Shared Registry', desc: 'See where your borrowers have active loans with other lenders, so you never over-lend or get caught out.' },
  { icon: Shield, color: 'bg-teal-500', title: 'NAMFISA Compliance', desc: 'Your NAMFISA quarterly reports are automatically created and ready to submit — no more manual paperwork.' },
  { icon: BarChart3, color: 'bg-pink-500', title: 'Analytics & Reports', desc: 'See exactly how your portfolio is performing — who paid, who owes, and how much you have disbursed.' },
  { icon: Building, color: 'bg-orange-500', title: 'Multi-Branch Support', desc: 'Run all your branches from one account. Assign staff roles and track each branch separately.' },
  { icon: Store, color: 'bg-cyan-500', title: 'Loan Marketplace', desc: 'Buy or sell loan books with other lenders on the platform. Grow your portfolio or exit positions easily.' },
  { icon: AlertTriangle, color: 'bg-rose-500', title: 'Scam Alert System', desc: 'Know if a borrower has been flagged as a scammer by other lenders before you approve their loan.' },
  { icon: Banknote, color: 'bg-emerald-500', title: 'Repayment Tracking', desc: 'Track every repayment — whether by payroll deduction, debit order or cash — and get notified when overdue.' },
  { icon: Lock, color: 'bg-red-500', title: 'Secure Contracts', desc: 'Sign your platform agreement digitally. Safe, legally binding, and stored securely on the system.' },
  { icon: CreditCard, color: 'bg-yellow-500', title: 'Billing & Subscriptions', desc: 'Your subscription is billed automatically each month. No surprises, no manual payments.' },
  { icon: TrendingUp, color: 'bg-violet-500', title: 'Loan Agreements', desc: 'Generate and sign borrower loan agreements digitally. No printing, no scanning — all done online.' },
]

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 250, icon: Star,
    color: 'border-blue-200 bg-blue-50', btnColor: 'bg-blue-600 hover:bg-blue-700',
    badge: '', badgeColor: '',
    features: ['Up to 50 active loans', '2 loan officers', 'Basic reports', 'Shared registry access', 'Email support'],
  },
  {
    id: 'professional', name: 'Professional', price: 350, icon: Zap,
    color: 'border-red-800 bg-white ring-2 ring-red-800', btnColor: 'bg-red-800 hover:bg-red-900',
    badge: 'Most Popular', badgeColor: 'bg-red-800 text-white',
    features: ['Up to 250 active loans', '10 loan officers', 'Advanced reports', 'NAMFISA compliance tools', 'Marketplace access', 'Priority support'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 500, icon: Crown,
    color: 'border-purple-200 bg-purple-50', btnColor: 'bg-purple-700 hover:bg-purple-800',
    badge: '', badgeColor: '',
    features: ['Unlimited loans & staff', 'Full analytics suite', 'API access', 'Custom integrations', 'Multi-branch management', 'Dedicated account manager'],
  },
]

const STATS = [
  { label: 'Active Lenders', value: '50+', icon: Building },
  { label: 'Countries', value: '3', icon: Globe },
  { label: 'Loans Processed', value: '10K+', icon: FileText },
  { label: 'Platform Uptime', value: '99.9%', icon: TrendingUp },
]

const SLIDES = [
  {
    image: '/slides/slide-man.jpg',
    tag: 'People-First Platform',
    title: 'Built for the People Behind the Loans',
    subtitle: 'CasHuB empowers lenders across Southern Africa with smart tools, compliance support, and real-time insights.',
    cta: 'Start Free Trial',
    ctaHref: '/signup',
  },
  {
    image: '/slides/slide-van.jpg',
    tag: 'CasHuB On The Move',
    title: 'Serving Lenders Across Southern Africa',
    subtitle: 'From Windhoek to Johannesburg to Gaborone — CasHuB is your on-the-ground lending partner wherever you operate.',
    cta: 'See Coverage',
    ctaHref: '#countries',
  },
  {
    image: '/slides/slide-windhoek.jpg',
    tag: 'Proudly Namibian',
    title: 'Headquartered in Windhoek, Built for the Region',
    subtitle: 'Designed to meet NAMFISA, NBFIRA, and NCR regulatory requirements with local expertise and dedicated support.',
    cta: 'Explore Features',
    ctaHref: '#features',
  },
  {
    image: '/slides/slide-desert.jpg',
    tag: 'African Built. African Proud.',
    title: 'A Platform as Resilient as the African Landscape',
    subtitle: 'CasHuB is built to handle the demands of the Southern African lending market — robust, secure, and always available.',
    cta: 'Get Started',
    ctaHref: '/signup',
  },
]

export default function MarketingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/cashub-icon.svg" alt="CasHuB" width={36} height={36} className="rounded-xl" />
            <Image src="/cashub-logo.svg" alt="CasHuB" width={100} height={30} />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-700">
            <a href="#features" className="hover:text-red-800 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-red-800 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-red-800 transition-colors">Pricing</a>
            <a href="#countries" className="hover:text-red-800 transition-colors">Coverage</a>
            <a href="#contact" className="hover:text-red-800 transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-red-800 transition-colors">Sign In</Link>
            <Link href="/signup" className="px-5 py-2 bg-red-800 text-white text-sm font-semibold rounded-xl hover:bg-red-900 transition-colors">Get Started</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-4 space-y-3">
            {['features', 'how-it-works', 'pricing', 'countries', 'contact'].map(s => (
              <a key={s} href={`#${s}`} onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-neutral-700 capitalize hover:text-red-800">{s.replace('-', ' ')}</a>
            ))}
            <Link href="/login" className="block pt-2 text-sm font-medium text-neutral-700">Sign In</Link>
            <Link href="/signup" className="block px-5 py-2 bg-red-800 text-white text-sm font-semibold rounded-xl text-center">Get Started</Link>
          </div>
        )}
      </nav>

      {/* ── HERO SLIDESHOW ── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Slides */}
        {SLIDES.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <Image src={slide.image} alt={slide.title} fill className="object-cover object-center" priority={i === 0} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
          </div>
        ))}

        {/* Slide Content */}
        <div className="relative z-20 min-h-screen flex flex-col justify-center pt-20 pb-28">
          <div className="max-w-7xl mx-auto px-6 w-full">
            {SLIDES.map((slide, i) => (
              <div key={i} className={`transition-all duration-700 ${i === slideIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'}`}>
                {i === slideIndex && (
                  <div className="max-w-2xl space-y-6">
                    <span className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/90 font-medium">
                      <Globe className="w-3.5 h-3.5 text-orange-400" /> {slide.tag}
                    </span>
                    <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">{slide.title}</h1>
                    <p className="text-lg text-white/80 leading-relaxed max-w-xl">{slide.subtitle}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link href={slide.ctaHref} className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-xl text-base">
                        {slide.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link href="/login" className="flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all text-base backdrop-blur-sm">
                        Sign In
                      </Link>
                    </div>
                    <div className="flex items-center gap-6 pt-1">
                      {['NAMFISA Compliant', 'NBFIRA Ready', 'NCR Compatible'].map(b => (
                        <div key={b} className="flex items-center gap-1.5 text-white/70 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button onClick={() => setSlideIndex(p => (p - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => setSlideIndex(p => (p + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide dots */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIndex(i)}
              className={`transition-all rounded-full ${i === slideIndex ? 'w-8 h-2.5 bg-orange-500' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`} />
          ))}
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 bg-black/50 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <s.icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KNOW YOUR BORROWER ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Know Your Borrower</span>
              <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 leading-tight">
                Before You Approve a Loan,<br /><span className="text-orange-600">Know Who You&apos;re Lending To.</span>
              </h2>
              <p className="text-neutral-600 leading-relaxed text-lg">CasHuB gives you a full picture of every borrower before you approve. See their active loans, check if they&apos;re blacklisted, and find out if they&apos;ve been flagged as a scammer by other lenders.</p>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, color: 'bg-purple-100 text-purple-700', title: 'Active Loans Across All Lenders', desc: 'Instantly see how many active loans a borrower already has with other lenders on the network — so you never over-lend.' },
                  { icon: AlertTriangle, color: 'bg-rose-100 text-rose-700', title: 'Blacklist & Scam Alerts', desc: 'If a borrower has been blacklisted or flagged as a scammer by another lender, you will see it immediately before making a decision.' },
                  { icon: Shield, color: 'bg-teal-100 text-teal-700', title: 'Credit Risk Insights', desc: 'Understand a borrower\'s repayment history and risk level so you can make smarter, safer lending decisions.' },
                  { icon: CheckCircle, color: 'bg-green-100 text-green-700', title: 'NAMFISA Reports — Done Automatically', desc: 'Your quarterly NAMFISA compliance reports are generated automatically by the system. No manual work, no stress.' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{f.title}</h4>
                      <p className="text-neutral-500 text-sm leading-relaxed mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/signup?type=lender" className="flex items-center gap-2 px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl transition-all text-sm">
                  Register as Lender <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/signup?type=borrower" className="flex items-center gap-2 px-6 py-3 border-2 border-orange-400 text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition-all text-sm">
                  Register as Borrower <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 space-y-4 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 text-sm">Borrower Profile</p>
                    <p className="text-xs text-neutral-500">John Mutamba • ID: 00012345</p>
                  </div>
                  <span className="ml-auto text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                </div>
                {[
                  { label: 'Active Loans', value: '2 loans', status: 'warning', note: 'N$ 4,500 outstanding' },
                  { label: 'Blacklist Status', value: 'Clean', status: 'good', note: 'Not blacklisted' },
                  { label: 'Scam Alerts', value: 'None', status: 'good', note: 'No flags raised' },
                  { label: 'Risk Score', value: 'Medium', status: 'warning', note: 'Review before approval' },
                  { label: 'NAMFISA Status', value: 'Compliant', status: 'good', note: 'All reports up to date' },
                ].map(r => (
                  <div key={r.label} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-neutral-100">
                    <span className="text-xs text-neutral-500">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{r.note}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{r.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COUNTRIES ── */}
      <section id="countries" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-red-800 uppercase tracking-widest">Regional Coverage</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Serving 3 Countries Across Southern Africa</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">Built to meet the specific regulatory requirements of each country with local compliance tools and support.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COUNTRIES.map(c => (
              <div key={c.name} className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
                <span className="text-5xl">{c.flag}</span>
                <h3 className="text-xl font-bold text-neutral-900">{c.name}</h3>
                <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">{c.currency} — {c.code}</span>
                <p className="text-sm text-neutral-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-red-800 uppercase tracking-widest">Platform Features</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Everything You Need to Run Your Lending Business</h2>
            <p className="text-neutral-500 mt-3 max-w-2xl mx-auto">From borrower onboarding to regulatory reporting — CasHuB handles the full lending lifecycle so you can focus on growth.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-neutral-200 hover:border-red-200 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-red-950 to-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl font-black text-white mt-2">Get Started in 4 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register & Apply', desc: 'Submit your company details, regulatory license, and choose your subscription plan.' },
              { step: '02', title: 'Sign Contract', desc: 'Review and digitally sign the CasHuB platform participation agreement with bank authorization.' },
              { step: '03', title: 'Admin Approval', desc: 'Our team reviews your application and activates your lender workspace within 24 hours.' },
              { step: '04', title: 'Start Operating', desc: 'Onboard your borrowers, process loans, and manage your full portfolio from day one.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-3 h-full">
                  <span className="text-5xl font-black text-red-300/30">{s.step}</span>
                  <h3 className="font-bold text-white text-lg">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-red-500/40" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center min-h-[400px]">
              {/* Banner Image */}
              <div className="relative flex items-center justify-center p-8 lg:p-12">
                <div className="relative w-full max-w-xs mx-auto">
                  <Image src="/slides/banner.jpg" alt="CasHuB - Know the Borrower Before You Approve" width={380} height={560} className="object-contain rounded-2xl shadow-2xl" />
                </div>
              </div>
              {/* Banner Text */}
              <div className="p-8 lg:p-12 space-y-6">
                <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">CasHuB Platform</span>
                <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 leading-tight">
                  Know the Borrower<br /><span className="text-orange-600">Before You Approve.</span>
                </h2>
                <p className="text-neutral-600 leading-relaxed">CasHuB is a digital microlender platform for lenders and borrowers — built for verification, compliance, and risk management across Southern Africa.</p>
                <div className="space-y-3">
                  {[
                    { title: 'Shared Registry', desc: 'View borrower obligations across lenders' },
                    { title: 'Blacklist & Scam Alert', desc: 'Flag high-risk borrowers and detect fraud' },
                    { title: 'Credit Score & Risk Insights', desc: 'Analyze borrower risks and worthiness' },
                    { title: 'NAMFISA Compliance Reports', desc: 'Automated reports for regulatory compliance' },
                  ].map(f => (
                    <div key={f.title} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-semibold text-neutral-800">{f.title}</span>
                        <span className="text-sm text-neutral-500"> — {f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/signup" className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all text-sm">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="https://www.cashub.co.za" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 border-2 border-orange-300 text-orange-700 font-semibold rounded-xl hover:bg-orange-50 transition-all text-sm">
                    www.cashub.co.za
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-red-800 uppercase tracking-widest">Transparent Pricing</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Simple Monthly Plans</h2>
            <p className="text-neutral-500 mt-3">All prices in Namibian Dollars. Equivalent billing available in ZAR and BWP.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div key={plan.id} className={`rounded-2xl border-2 p-8 space-y-6 relative ${plan.color}`}>
                {plan.badge && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <plan.icon className="w-5 h-5 text-neutral-600" />
                    <h3 className="font-bold text-neutral-900 text-lg">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-neutral-900">N${plan.price}</span>
                    <span className="text-neutral-500 text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full py-3 rounded-xl text-white text-sm font-bold text-center transition-all ${plan.btnColor}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-neutral-400 mt-8">All plans include a 30-day free trial. No credit card required to start.</p>
        </div>
      </section>

      {/* ── BORROWER BENEFITS ── */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">For Borrowers</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Why Borrowers Love CasHuB</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">CasHuB is not just for lenders. As a borrower, you get access to a network of trusted lenders with fast, fair, and transparent lending.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Zap, color: 'bg-orange-500', title: 'Fast Loan Approval', desc: 'Apply once and get a decision quickly. No long queues, no waiting days for an answer.' },
              { icon: Shield, color: 'bg-teal-500', title: 'Your Data is Safe', desc: 'Your personal and financial information is encrypted and only shared with lenders you apply to.' },
              { icon: FileText, color: 'bg-indigo-500', title: 'Digital Loan Agreements', desc: 'Sign your loan agreement online. No need to travel to an office or print documents.' },
              { icon: CheckCircle, color: 'bg-green-500', title: 'Clear Repayment Schedule', desc: 'Know exactly what you owe, when it is due, and how much is left. No hidden fees or surprises.' },
              { icon: TrendingUp, color: 'bg-violet-500', title: 'Build Your Credit Profile', desc: 'Good repayment history builds your borrower profile, making it easier to access loans in the future.' },
              { icon: Users, color: 'bg-blue-500', title: 'Access Multiple Lenders', desc: 'One profile, multiple lenders. Apply through a network of registered and vetted lending institutions.' },
            ].map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${b.color} rounded-xl flex items-center justify-center mb-4`}>
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{b.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/signup?type=borrower" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg text-base">
              Register as a Borrower <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CASHUB ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-red-800 uppercase tracking-widest">Why CasHuB</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Built for Southern African Lenders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Regulatory First', desc: 'Built-in NAMFISA, NBFIRA, and NCR compliance tools so you stay ahead of regulators — not behind them.' },
              { icon: Globe, title: 'Multi-Country', desc: 'One platform, three countries. Manage operations across Namibia, South Africa, and Botswana with country-specific rules.' },
              { icon: Award, title: 'Dedicated Support', desc: 'Local support team that understands the Southern African lending landscape. We are your operational partner.' },
            ].map(w => (
              <div key={w.title} className="text-center space-y-4 p-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                  <w.icon className="w-8 h-8 text-red-800" />
                </div>
                <h3 className="font-bold text-neutral-900 text-xl">{w.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-red-800 uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Who can use CasHuB?', a: 'Any registered lending institution in Namibia, South Africa, or Botswana with a valid regulatory license (NAMFISA, NBFIRA, or NCR).' },
              { q: 'How long does onboarding take?', a: 'After submitting your application and signing the platform contract, approval typically happens within 24–48 business hours.' },
              { q: 'Is my data secure?', a: 'Yes. CasHuB uses bank-level encryption, row-level security policies, and complies with applicable data protection regulations in each country.' },
              { q: 'Can I try CasHuB before committing?', a: 'Yes! All plans come with a 30-day free trial. No credit card required to get started.' },
              { q: 'Is the system mobile friendly?', a: 'Absolutely. CasHuB is fully responsive and works on desktop, tablet, and mobile devices.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors">
                  <span className="font-semibold text-neutral-900 text-sm">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-neutral-500 leading-relaxed border-t border-neutral-100">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-red-900 to-red-950">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl font-black text-white">Ready to Get Started on CasHuB?</h2>
          <p className="text-white/70 text-lg">Join lenders and borrowers across Namibia, South Africa and Botswana on Southern Africa&apos;s trusted lending platform.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup?type=lender" className="flex items-center gap-2 px-8 py-4 bg-white text-red-900 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-xl text-base">
              Register as Lender <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/signup?type=borrower" className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-xl text-base">
              Register as Borrower <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#contact" className="flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all text-base">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-red-800 uppercase tracking-widest">Get In Touch</span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">Contact Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Mail, label: 'Email', value: 'admin@cashub.com' },
              { icon: Phone, label: 'Phone', value: '+264 81 000 0000' },
              { icon: MapPin, label: 'Head Office', value: 'Windhoek, Namibia' },
            ].map(c => (
              <div key={c.label} className="text-center p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                  <c.icon className="w-5 h-5 text-red-800" />
                </div>
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{c.label}</p>
                <p className="font-semibold text-neutral-800 text-sm">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image src="/cashub-icon.svg" alt="CasHuB" width={32} height={32} className="rounded-lg" />
                <Image src="/cashub-logo.svg" alt="CasHuB" width={90} height={28} />
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed">Southern Africa&apos;s trusted micro-lending platform. Built by lenders, for lenders.</p>
              <div className="flex gap-2">
                {COUNTRIES.map(c => <span key={c.name} className="text-lg" title={c.name}>{c.flag}</span>)}
              </div>
            </div>
            {[
              { title: 'Platform', links: ['Features', 'Pricing', 'How It Works', 'Security'] },
              { title: 'Compliance', links: ['NAMFISA Reporting', 'NBFIRA Tools', 'NCR Compliance', 'Data Protection'] },
              { title: 'Company', links: ['About CasHuB', 'Contact', 'Terms of Service', 'Privacy Policy'] },
            ].map(col => (
              <div key={col.title} className="space-y-3">
                <h4 className="text-white font-bold text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-neutral-400 text-xs hover:text-white transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-xs">© 2026 CasHuB — Xtreme Group Empire. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {[
                { href: 'https://facebook.com/cashub3', label: 'Facebook', svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { href: 'https://instagram.com/cashub3', label: 'Instagram', svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                { href: 'https://tiktok.com/@cashub3', label: 'TikTok', svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
                { href: 'https://twitter.com/cashub3', label: 'X', svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { href: 'https://wa.me/264810000000', label: 'WhatsApp', svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  className="w-8 h-8 bg-neutral-700 hover:bg-orange-500 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
