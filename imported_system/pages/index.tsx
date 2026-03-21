import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { 
  LayoutDashboard,
  Search,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  UserPlus,
  Landmark,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Calculator,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'

export default function CasHuBHome() {
  return (
    <>
      <Head>
        <title>CasHuB - Digital Microlending Platform</title>
        <meta name="description" content="CasHuB - Regulated Digital Microlending & Credit Registry Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cashub-600 to-accent-500 bg-clip-text text-transparent">
                    CasHuB
                  </h1>
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    <a href="/dashboard" className="text-neutral-600 hover:text-cashub-600 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </a>
                    <a href="/marketplace" className="text-neutral-600 hover:text-cashub-600 px-3 py-2 rounded-md text-sm font-medium">
                      Marketplace
                    </a>
                    <a href="/borrowers" className="text-neutral-600 hover:text-cashub-600 px-3 py-2 rounded-md text-sm font-medium">
                      Borrowers
                    </a>
                    <a href="/document-authentication" className="text-neutral-600 hover:text-cashub-600 px-3 py-2 rounded-md text-sm font-medium">
                      Fraud Detection
                    </a>
                    <a href="/shared-registry" className="text-neutral-600 hover:text-cashub-600 px-3 py-2 rounded-md text-sm font-medium">
                      Registry
                    </a>
                  </div>
                </div>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center space-x-4">
                <button className="btn-outline">
                  Sign In
                </button>
                <button className="btn-primary">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-cashub-600 via-cashub-700 to-cashub-800 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Digital Microlending
                <span className="block text-3xl md:text-5xl mt-2 text-accent-300">
                  Made Simple & Compliant
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-cashub-100 max-w-3xl mx-auto">
                Complete microlending platform with NAMFISA compliance, borrower registry, 
                blacklist management, and automated reporting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-accent text-lg px-8 py-4">
                  Start Free Trial
                </button>
                <button className="bg-white/20 backdrop-blur hover:bg-white/30 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 border border-white/30">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Loan Calculator Section */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Calculate Your Loan Instantly
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Use our interactive calculator to see exactly how much your loan will cost. 
                No hidden fees, transparent pricing.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Loan Amount (N$)</label>
                  <input type="number" placeholder="5000" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Loan Term (months)</label>
                  <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-transparent">
                    <option>1 month</option>
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>12 months</option>
                  </select>
                </div>
                <button className="w-full btn-primary">Calculate Repayment</button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Everything You Need for Microlending
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Complete end-to-end solution from loan application to compliance reporting
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card-hover">
                <div className="w-12 h-12 bg-cashub-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cashub-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Borrower Management
                </h3>
                <p className="text-neutral-600">
                  Complete borrower profiles, credit scoring, risk assessment, and behavior tracking.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card-hover">
                <div className="w-12 h-12 bg-cashub-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-cashub-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Loan Processing
                </h3>
                <p className="text-neutral-600">
                  Digital loan applications, automated approval workflows, and e-signature agreements.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card-hover">
                <div className="w-12 h-12 bg-cashub-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-cashub-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Blacklist Registry
                </h3>
                <p className="text-neutral-600">
                  Evidence-based blacklisting, dispute resolution, and industry-wide sharing.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card-hover">
                <div className="w-12 h-12 bg-cashub-100 rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-6 h-6 text-cashub-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-neutral-600">
                  Real-time insights, portfolio performance, and risk monitoring dashboards.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card-hover">
                <div className="w-12 h-12 bg-cashub-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-cashub-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  NAMFISA Compliance
                </h3>
                <p className="text-neutral-600">
                  Automated quarterly reporting, compliance tracking, and audit-ready records.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card-hover">
                <div className="w-12 h-12 bg-cashub-100 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-cashub-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Subscription Plans
                </h3>
                <p className="text-neutral-600">
                  Flexible pricing plans, feature-based access control, and automated billing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-cashub-600 to-accent-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Microlending Business?
            </h2>
            <p className="text-xl mb-8 text-cashub-100">
              Join hundreds of lenders using CasHuB for compliant, efficient microlending operations.
            </p>
            <button className="bg-white text-cashub-600 hover:bg-neutral-50 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg">
              Start Your Free Trial
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">CasHuB</h3>
                <p className="text-neutral-400">
                  Digital microlending platform for modern lenders.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                  <li><a href="#" className="hover:text-white">Compliance</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
              <p>&copy; 2026 CasHuB. All rights reserved. NAMFISA Compliant.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
