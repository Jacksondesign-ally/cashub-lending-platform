"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LanguageDropdown from '@/components/LanguageDropdown'
import {
  Shield, AlertCircle, CheckCircle, Gavel, DollarSign, User, Clock,
  FileText, CreditCard, TrendingUp, Activity, LogOut, Bell,
  Calendar, Phone, Mail, MapPin, Eye, ChevronRight, Plus, Building,
  Star, Search, Send, Upload, XCircle, Info, Pen, Store, RefreshCw,
  Save, Briefcase, Users
} from 'lucide-react'

type BorrowerLoan = {
  id: string
  loan_number: string
  lender_name: string
  principal: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  outstanding: number
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected'
  applied_date: string
  next_payment_date?: string
  payments_made: number
  total_payments: number
}

type BorrowerPayment = {
  id: string
  loan_id: string
  amount: number
  date: string
  method: string
  status: 'completed' | 'pending' | 'failed'
  reference: string
}

type MarketplaceLender = {
  id: string
  name: string
  registration_number: string
  rating: number
  total_loans: number
  approval_rate: number
  avg_interest_rate: number
  min_amount: number
  max_amount: number
  response_time: string
  features: string[]
  logo_url?: string
  about?: string
}

type BlacklistEntry = {
  id: string
  lender_name: string
  reason: string
  description: string
  outstanding_amount: number
  status: string
  blacklist_date: string
}

export default function BorrowerPortalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'apply' | 'applications' | 'repayments' | 'documents' | 'credit_score' | 'marketplace' | 'payments' | 'profile' | 'blacklist' | 'notifications'>('overview')
  const [userName, setUserName] = useState('Borrower')
  const [userEmail, setUserEmail] = useState('')

  // Preview data
  const [loans, setLoans] = useState<BorrowerLoan[]>([])
  const [payments, setPayments] = useState<BorrowerPayment[]>([])

  // Loan application state
  const [loanApp, setLoanApp] = useState({ amount: '', term: '6', purpose: 'personal', employer: '', income: '', notes: '', anonymous: false })
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [checksRunning, setChecksRunning] = useState(false)
  const [checksComplete, setChecksComplete] = useState(false)
  const [checkResults, setCheckResults] = useState<{ id: string; label: string; status: 'pass' | 'warn' | 'fail' | 'checking' | 'pending'; detail: string }[]>([])

  // Marketplace state
  const [lenders, setLenders] = useState<MarketplaceLender[]>([])
  const [lenderSearch, setLenderSearch] = useState('')
  // Selected lender for direct application (from marketplace)
  const [selectedLender, setSelectedLender] = useState<MarketplaceLender | null>(null)

  // Applications state
  const [applications, setApplications] = useState<any[]>([])

  // Credit score state
  const [creditData, setCreditData] = useState<{ score: number; risk_level: string; last_updated: string } | null>(null)

  // Documents state
  const [documents, setDocuments] = useState<{ id?: string; name: string; type: string; status: string; uploaded: string; file_data?: string; notes?: string }[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({ type: 'identity', name: '', file: null as File | null })

  // KYC state
  const [kycComplete, setKycComplete] = useState(false)
  const [borrowerProfile, setBorrowerProfile] = useState<{ id_number?: string; phone?: string; address?: string; city?: string; region?: string; employment_status?: string; monthly_income?: number; member_since?: string } | null>(null)

  // Editable profile / agreement fields
  const [borrowerId, setBorrowerId] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileTab, setProfileTab] = useState<'personal'|'employment'|'banking'|'references'|'signature'>('personal')
  const [pForm, setPForm] = useState({
    id_number: '', postal_address: '', address: '', marital_status: '',
    occupation: '', employer_name: '', employer_tel: '', employer_address: '', payslip_employee_no: '',
    bank_name: '', bank_branch: '', bank_account_no: '', bank_account_type: '',
    reference1_name: '', reference1_tel: '', reference2_name: '', reference2_tel: '',
  })
  const [sigUrl, setSigUrl] = useState('')
  const [sigMethod, setSigMethod] = useState<'draw'|'upload'>('draw')
  const [isSigDrawing, setIsSigDrawing] = useState(false)
  const [hasSig, setHasSig] = useState(false)
  const sigRef = useRef<HTMLCanvasElement>(null)
  const setP = (k: string, v: string) => setPForm(p => ({ ...p, [k]: v }))

  // Blacklist state
  const [blacklistEntries, setBlacklistEntries] = useState<BlacklistEntry[]>([])
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [selectedBlacklist, setSelectedBlacklist] = useState<BlacklistEntry | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)
  // Offer acceptance state
  const [offerActioning, setOfferActioning] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const name = localStorage.getItem('userName') || 'Borrower User'
      const role = localStorage.getItem('userRole')
      setUserName(name)
      // Use stored email from auth (set during login), fall back to userName if it looks like an email
      const storedEmail = localStorage.getItem('userEmail')
      const email = storedEmail || (name.includes('@') ? name : '')
      // Avatar scoped to this user's email to prevent cross-borrower contamination
      const savedAvatar = localStorage.getItem(`borrowerAvatar_${email}`)
      if (savedAvatar) setPhotoUrl(savedAvatar)
      setUserEmail(email)

      if (role !== 'borrower') {
        router.push('/login')
        return
      }

      // Fetch loans from Supabase
      if (email) {
        const allLoans: BorrowerLoan[] = []

        // Get borrower record — full profile for KYC check + data isolation
        const { data: borrowerRec } = await supabase
          .from('borrowers')
          .select('*')
          .eq('email', email)
          .maybeSingle()
        const borrowerId = borrowerRec?.id || null
        if (borrowerRec) {
          setBorrowerId(borrowerRec.id || '')
          setSigUrl((borrowerRec as any).signature_url || '')
          setHasSig(!!(borrowerRec as any).signature_url)
          setPForm({
            id_number: borrowerRec.id_number || '',
            postal_address: (borrowerRec as any).postal_address || '',
            address: borrowerRec.address || '',
            marital_status: (borrowerRec as any).marital_status || '',
            occupation: (borrowerRec as any).occupation || '',
            employer_name: (borrowerRec as any).employer_name || '',
            employer_tel: (borrowerRec as any).employer_tel || '',
            employer_address: (borrowerRec as any).employer_address || '',
            payslip_employee_no: (borrowerRec as any).payslip_employee_no || '',
            bank_name: (borrowerRec as any).bank_name || '',
            bank_branch: (borrowerRec as any).bank_branch || '',
            bank_account_no: (borrowerRec as any).bank_account_no || '',
            bank_account_type: (borrowerRec as any).bank_account_type || '',
            reference1_name: (borrowerRec as any).reference1_name || '',
            reference1_tel: (borrowerRec as any).reference1_tel || '',
            reference2_name: (borrowerRec as any).reference2_name || '',
            reference2_tel: (borrowerRec as any).reference2_tel || '',
          })
          setBorrowerProfile({
            id_number: borrowerRec.id_number || '',
            phone: borrowerRec.phone || '',
            address: borrowerRec.address || '',
            city: borrowerRec.city || '',
            region: borrowerRec.region || '',
            employment_status: borrowerRec.employment_status || '',
            monthly_income: borrowerRec.monthly_income || 0,
            member_since: borrowerRec.created_at ? new Date(borrowerRec.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
          })
          // KYC is complete only when id_number exists AND profile photo uploaded
          const hasPhoto = !!localStorage.getItem(`borrowerAvatar_${email}`)
          setKycComplete(!!(borrowerRec.id_number && hasPhoto))
        } else {
          setKycComplete(false)
        }

        // Fetch from loans table filtered by this borrower (borrower_id OR borrower_email)
        const { data: loanData } = await supabase
          .from('loans')
          .select('*, lenders(company_name, legal_name)')
          .or(`borrower_id.eq.${borrowerId},borrower_email.eq.${email}`)
          .order('created_at', { ascending: false })
        if (loanData) {
          allLoans.push(...loanData.map((l: any) => ({
            id: l.id, loan_number: l.loan_number || `CL-${l.id?.slice(0, 8)}`,
            lender_name: l.lenders?.company_name || l.lenders?.legal_name || 'Unknown Lender',
            principal: l.principal_amount || 0, interest_rate: l.interest_rate || 20,
            term_months: l.term_months || 0, monthly_payment: l.monthly_payment || 0,
            outstanding: l.outstanding_balance ?? l.principal_amount ?? 0,
            status: l.status || 'pending', applied_date: l.application_date || l.created_at?.split('T')[0] || '',
            next_payment_date: l.end_date || undefined,
            payments_made: 0, total_payments: l.term_months || 0
          })))
        }

        // Also fetch from loan_applications (borrower portal submissions)
        // Exclude applications already converted to loans (disbursed/active/completed)
        const { data: appData } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('borrower_email', email)
          .not('status', 'in', '("disbursed","active","completed")')
          .order('created_at', { ascending: false })
        if (appData) {
          allLoans.push(...appData.map((a: any) => ({
            id: a.id, loan_number: `APP-${a.id?.slice(0, 8).toUpperCase()}`,
            lender_name: a.lender_email || 'Pending Assignment',
            principal: a.loan_amount || 0, interest_rate: a.interest_rate || 20,
            term_months: a.loan_term || 0, monthly_payment: 0,
            outstanding: a.loan_amount || 0,
            status: a.status || 'pending', applied_date: a.created_at?.split('T')[0] || '',
            payments_made: 0, total_payments: a.loan_term || 0
          })))
        }

        setLoans(allLoans)

        // Fetch payments scoped to this borrower
        const paymentFilter = borrowerId
          ? `borrower_id.eq.${borrowerId},borrower_email.eq.${email}`
          : `borrower_email.eq.${email}`
        const { data: payData } = await supabase
          .from('payments')
          .select('*')
          .or(paymentFilter)
          .order('created_at', { ascending: false })
          .limit(20)
        if (payData) {
          setPayments(payData.map((p: any) => ({
            id: p.id, loan_id: p.loan_id || '',
            amount: p.amount || 0, date: p.payment_date || p.created_at?.split('T')[0] || '',
            method: p.payment_method || 'Cash', status: p.status || 'completed',
            reference: p.payment_number || p.reference || ''
          })))
        }
      }
      // Load marketplace lenders
      try {
        const { data: lenderData, error: lenderErr } = await supabase
          .from('lenders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (!lenderErr && lenderData && lenderData.length > 0) {
          setLenders(lenderData.map((l: any) => ({
            id: l.id,
            name: l.company_name || l.legal_name || l.name || 'Unknown',
            registration_number: l.registration_number || '',
            logo_url: l.logo_url || '',
            about: l.about || '',
            rating: l.rating || 4.5,
            total_loans: l.total_loans || 0,
            approval_rate: l.approval_rate || 85,
            avg_interest_rate: l.average_interest_rate || 15,
            min_amount: l.min_loan_amount || 500,
            max_amount: l.max_loan_amount || 50000,
            response_time: l.response_time || '24 hours',
            features: l.features || [],
          })))
        } else {
          setLenders([])
        }
      } catch { /* no lenders */ }

      // Load loan applications for this borrower
      if (email) {
        const { data: appRows } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('borrower_email', email)
          .order('created_at', { ascending: false })
        if (appRows) setApplications(appRows)
        // Derive credit score from borrower table
        const { data: borrowerRow } = await supabase
          .from('borrowers')
          .select('credit_score, risk_level, updated_at')
          .eq('email', email)
          .maybeSingle()
        if (borrowerRow) setCreditData({ score: borrowerRow.credit_score || 0, risk_level: borrowerRow.risk_level || 'medium', last_updated: borrowerRow.updated_at?.split('T')[0] || '' })
        // Load real documents from database
        const { data: docsData } = await supabase
          .from('borrower_documents')
          .select('*')
          .eq('borrower_email', email)
          .order('created_at', { ascending: false })
        if (docsData) {
          setDocuments(docsData.map((d: any) => ({
            id: d.id,
            name: d.document_name,
            type: d.document_type,
            status: d.status,
            uploaded: d.created_at?.split('T')[0] || '',
            file_data: d.file_data,
            notes: d.notes,
          })))
        } else {
          setDocuments([])
        }
      }

      // Load blacklist entries for this borrower
      try {
        const blEmail = email || localStorage.getItem('userEmail') || ''
        const { data: blData, error: blErr } = await supabase
          .from('borrower_blacklist')
          .select('*, lenders(legal_name)')
          .eq('borrower_email', blEmail)
          .order('created_at', { ascending: false })

        if (!blErr && blData && blData.length > 0) {
          setBlacklistEntries(blData.map((b: any) => ({
            id: b.id,
            lender_name: b.lenders?.legal_name || 'Unknown Lender',
            reason: b.reason || 'Unknown',
            description: b.description || '',
            outstanding_amount: b.outstanding_amount || 0,
            status: b.status || 'active',
            blacklist_date: b.blacklist_date || b.created_at?.split('T')[0] || '',
          })))
        }
      } catch { /* no blacklist entries */ }
    } catch (err) {
      console.error('Error loading borrower data:', err)
    } finally {
      setLoading(false)
    }
  }

  const runEligibilityChecks = async () => {
    if (!userEmail) return
    setChecksRunning(true)
    setChecksComplete(false)
    const initial = [
      { id: 'registry',   label: 'Shared Registry',     status: 'checking' as const, detail: 'Checking...' },
      { id: 'blacklist',  label: 'Blacklist Status',     status: 'checking' as const, detail: 'Checking...' },
      { id: 'scam',       label: 'Scam / Fraud Alerts',  status: 'checking' as const, detail: 'Checking...' },
      { id: 'credit',     label: 'Credit Score',         status: 'checking' as const, detail: 'Checking...' },
      { id: 'risk',       label: 'Risk Level',           status: 'checking' as const, detail: 'Checking...' },
      { id: 'activedebt', label: 'Active Debt',          status: 'checking' as const, detail: 'Checking...' },
    ]
    setCheckResults(initial)
    const update = (id: string, status: 'pass'|'warn'|'fail', detail: string) =>
      setCheckResults(prev => prev.map(c => c.id === id ? { ...c, status, detail } : c))
    try {
      const { data: bData } = await supabase.from('borrowers').select('id, id_number, credit_score, risk_level, status').eq('email', userEmail).maybeSingle()
      update('registry', bData ? 'pass' : 'warn', bData ? `Registered (${bData.status})` : 'Not in shared registry — will be added on submission')
      const borrowerIdNumber = bData?.id_number || ''
      const { data: blData } = await supabase.from('blacklist').select('id, status').or(`id_number.eq.${borrowerIdNumber},full_name.ilike.%${userName}%`).limit(5)
      const hasBlacklist = blData && blData.some((b: any) => b.status === 'approved')
      update('blacklist', hasBlacklist ? 'fail' : 'pass', hasBlacklist ? 'Active blacklist entry found!' : 'No blacklist entries')
      const { data: scamData } = await supabase.from('scam_alerts').select('id').or(`suspect_id.eq.${borrowerIdNumber},suspect_name.ilike.%${userName}%`).limit(5)
      update('scam', scamData && scamData.length > 0 ? 'warn' : 'pass', scamData && scamData.length > 0 ? 'Scam alert associated with this account' : 'No scam/fraud alerts')
      const score = bData?.credit_score || 50
      update('credit', score >= 70 ? 'pass' : score >= 40 ? 'warn' : 'fail', `Score: ${score}/100 — ${score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}`)
      const risk = bData?.risk_level || 'medium'
      update('risk', risk === 'low' ? 'pass' : risk === 'medium' ? 'warn' : 'fail', `Risk level: ${risk.toUpperCase()}`)
      const borrowerIdForDebt = bData?.id || ''
      const { data: activeLoans } = await supabase.from('loans').select('id, status, principal_amount').eq('status', 'active').or(`borrower_id.eq.${borrowerIdForDebt},borrower_email.eq.${userEmail}`)
      const hasActiveDebt = activeLoans && activeLoans.length > 0
      update('activedebt', hasActiveDebt ? 'warn' : 'pass', hasActiveDebt ? `${activeLoans.length} active loan(s) — N$ ${activeLoans.reduce((s: number, l: any) => s + (l.principal_amount || 0), 0).toLocaleString()} outstanding` : 'No active loans')
    } catch (err) { console.error('[CasHuB Error]', err); setCheckResults(prev => prev.map(c => c.status === 'checking' ? { ...c, status: 'warn', detail: 'Could not verify' } : c)) }
    setChecksRunning(false)
    setChecksComplete(true)
  }

  const handleApplyForLoan = async () => {
    if (!loanApp.amount || !loanApp.purpose) return
    setApplyLoading(true)
    try {
      if (selectedLender) {
        // Direct application to a specific lender — does NOT go to marketplace
        await supabase.from('loan_applications').insert({
          borrower_email: loanApp.anonymous ? null : userEmail,
          borrower_first_name: userName.split(' ')[0] || userName,
          borrower_last_name: userName.split(' ').slice(1).join(' ') || '',
          loan_amount: parseFloat(loanApp.amount),
          loan_term: parseInt(loanApp.term),
          loan_purpose: loanApp.purpose,
          employer: loanApp.employer || null,
          monthly_income: loanApp.income ? parseFloat(loanApp.income) : null,
          notes: loanApp.notes || null,
          status: 'pending',
          is_anonymous: loanApp.anonymous,
          lender_id: selectedLender.id,
          lender_email: null,
        })
      } else {
        // No specific lender selected — post to marketplace for any lender to pick up
        await supabase.from('loan_applications').insert({
          borrower_email: loanApp.anonymous ? null : userEmail,
          borrower_first_name: userName.split(' ')[0] || userName,
          borrower_last_name: userName.split(' ').slice(1).join(' ') || '',
          loan_amount: parseFloat(loanApp.amount),
          loan_term: parseInt(loanApp.term),
          loan_purpose: loanApp.purpose,
          employer: loanApp.employer || null,
          monthly_income: loanApp.income ? parseFloat(loanApp.income) : null,
          notes: loanApp.notes || null,
          status: 'pending',
          is_anonymous: loanApp.anonymous,
        })
        // Also post to marketplace listing
        await supabase.from('marketplace_applications').insert({
          requested_amount: parseFloat(loanApp.amount),
          loan_period: parseInt(loanApp.term),
          purpose: loanApp.purpose,
          borrower_name: loanApp.anonymous ? 'Anonymous Borrower' : userName,
          borrower_email: userEmail, // Always store real email for offer linking (lenders see "Anonymous" if is_anonymous=true)
          loan_amount: parseFloat(loanApp.amount),
          loan_term: parseInt(loanApp.term),
          loan_purpose: loanApp.purpose,
          status: 'open',
          is_anonymous: loanApp.anonymous,
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
    } catch { /* fallback */ }
    setApplySuccess(true)
    setApplyLoading(false)
    setTimeout(() => {
      setApplySuccess(false)
      setSelectedLender(null)
      setLoanApp({ amount: '', term: '6', purpose: 'personal', employer: '', income: '', notes: '', anonymous: false })
    }, 4000)
  }

  const handleFileDispute = async () => {
    if (!selectedBlacklist || !disputeReason.trim()) return
    setDisputeSubmitting(true)
    try {
      await supabase.from('borrower_disputes').insert({
        blacklist_id: selectedBlacklist.id,
        dispute_number: `DS-${Date.now().toString().slice(-6)}`,
        reason: disputeReason,
        evidence_description: 'Dispute filed via borrower portal',
        status: 'pending',
        clearance_paid: false,
      })
      await supabase.from('borrower_blacklist').update({ status: 'dispute_filed' }).eq('id', selectedBlacklist.id)
    } catch { /* fallback */ }
    setBlacklistEntries(blacklistEntries.map(e => e.id === selectedBlacklist.id ? { ...e, status: 'dispute_filed' } : e))
    setShowDisputeModal(false)
    setSelectedBlacklist(null)
    setDisputeReason('')
    setDisputeSubmitting(false)
  }

  const acceptOffer = async (app: any) => {
    setOfferActioning(app.id)
    try {
      // Get borrower_id for this user
      const { data: borrowerRec } = await supabase.from('borrowers').select('id').eq('email', userEmail).maybeSingle()
      const borrowerId = borrowerRec?.id || null
      
      // Create active loan record
      const loanNumber = `L-${Date.now().toString(36).toUpperCase()}`
      await supabase.from('loans').insert({
        loan_number: loanNumber,
        lender_id: app.lender_id || null,
        borrower_id: borrowerId,
        principal_amount: app.loan_amount || 0,
        outstanding_balance: app.loan_amount || 0,
        interest_rate: app.interest_rate || 20,
        term_months: app.loan_term || 12,
        status: 'active',
        purpose: app.loan_purpose || 'General',
        start_date: new Date().toISOString().split('T')[0],
        borrower_email: userEmail,
      })
      // Mark application approved
      await supabase.from('loan_applications').update({ status: 'approved' }).eq('id', app.id)
      // Mark marketplace application accepted
      if (app.marketplace_application_id) {
        await supabase.from('marketplace_applications').update({ status: 'accepted' }).eq('id', app.marketplace_application_id)
      }
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved' } : a))
      loadData()
    } catch (err) { console.error('acceptOffer error:', err) }
    setOfferActioning(null)
  }

  const declineOffer = async (appId: string, marketplaceId?: string) => {
    setOfferActioning(appId)
    await supabase.from('loan_applications').update({ status: 'rejected' }).eq('id', appId)
    if (marketplaceId) {
      await supabase.from('marketplace_applications').update({ status: 'open' }).eq('id', marketplaceId)
    }
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a))
    setOfferActioning(null)
  }

  const handleUploadDocument = async () => {
    if (!uploadForm.file || !uploadForm.name) return
    setUploadingDoc(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileData = e.target?.result as string
        const { data: borrowerRec } = await supabase.from('borrowers').select('id').eq('email', userEmail).maybeSingle()
        await supabase.from('borrower_documents').insert({
          borrower_id: borrowerRec?.id || null,
          borrower_email: userEmail,
          document_type: uploadForm.type,
          document_name: uploadForm.name,
          file_data: fileData,
          file_size: uploadForm.file?.size || 0,
          status: 'pending',
        })
        setShowUploadModal(false)
        setUploadForm({ type: 'identity', name: '', file: null })
        loadData()
      }
      reader.readAsDataURL(uploadForm.file)
    } catch (err) {
      console.error('Upload error:', err)
    }
    setUploadingDoc(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  const activeLoans = loans.filter(l => l.status === 'active')
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding, 0)
  const totalBorrowed = loans.reduce((sum, l) => sum + l.principal, 0)
  const completedLoans = loans.filter(l => l.status === 'completed').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/borrower" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">C</span>
              </div>
              <span className="font-bold text-neutral-900 text-sm">CasHuB <span className="text-emerald-600 font-normal">Borrower</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageDropdown compact />
            <button className="relative text-neutral-500 hover:text-neutral-700">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="text-sm font-medium text-neutral-700 hidden sm:block">{userName}</span>
            </div>
            <button onClick={handleLogout} className="text-neutral-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Nav */}
        <div className="flex gap-1 bg-white rounded-xl border border-neutral-200 p-1 mb-6 overflow-x-auto">
          {([
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'apply', label: 'Apply', icon: Plus },
            { id: 'applications', label: 'My Applications', icon: Send },
            { id: 'loans', label: 'My Loans', icon: FileText },
            { id: 'repayments', label: 'Repayments', icon: CreditCard },
            { id: 'documents', label: 'Documents', icon: Upload },
            { id: 'credit_score', label: 'Credit Score', icon: TrendingUp },
            { id: 'marketplace', label: 'Lenders', icon: Store },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'blacklist', label: 'Disputes', icon: Gavel },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Borrowed" value={`N$ ${totalBorrowed.toLocaleString()}`} icon={DollarSign} color="blue" />
              <StatCard label="Outstanding" value={`N$ ${totalOutstanding.toLocaleString()}`} icon={Activity} color="orange" />
              <StatCard label="Active Loans" value={activeLoans.length.toString()} icon={FileText} color="emerald" />
              <StatCard label="Completed" value={completedLoans.toString()} icon={CheckCircle} color="green" />
            </div>

            {/* Active Loans Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 text-sm">Active Loans</h3>
                <button onClick={() => setActiveTab('loans')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-neutral-100">
                {activeLoans.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">No active loans</p>
                  </div>
                ) : activeLoans.map(loan => (
                  <div key={loan.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{loan.loan_number}</p>
                      <p className="text-xs text-neutral-500">{loan.lender_name} • N$ {loan.principal.toLocaleString()} at {loan.interest_rate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">N$ {loan.outstanding.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Outstanding • {loan.payments_made}/{loan.total_payments} paid</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 text-sm">Recent Payments</h3>
                <button onClick={() => setActiveTab('payments')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-neutral-100">
                {payments.slice(0, 3).map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{p.reference}</p>
                        <p className="text-xs text-neutral-500">{p.loan_id} • {p.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">N$ {p.amount.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400">{p.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── APPLY FOR LOAN TAB ─── */}
        {activeTab === 'apply' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Apply for a Loan</h3>
              <p className="text-sm text-neutral-500">
                {selectedLender
                  ? `Applying directly to ${selectedLender.name}. This application goes only to this lender.`
                  : 'Fill in the details below. Your application will be posted to the marketplace for lenders to review.'}
              </p>
            </div>

            {/* Selected lender banner */}
            {selectedLender && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Applying directly to: {selectedLender.name}</p>
                    <p className="text-xs text-blue-700">Interest: {selectedLender.avg_interest_rate}% · Max N$ {selectedLender.max_amount.toLocaleString()} · Approval: {selectedLender.approval_rate}%</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLender(null)} className="text-xs text-blue-500 hover:text-blue-700 font-medium underline">Post to marketplace instead</button>
              </div>
            )}

            {/* KYC Wall — block if not complete */}
            {!kycComplete && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900">KYC Required Before Applying</p>
                    <p className="text-xs text-amber-700 mt-1">You must complete your profile before submitting a loan application. Missing:</p>
                    <ul className="mt-2 space-y-1">
                      {!borrowerProfile?.id_number && <li className="text-xs text-amber-800 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> National ID Number (update in your borrower record)</li>}
                      {!photoUrl && <li className="text-xs text-amber-800 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Profile Photo — <button onClick={() => setActiveTab('profile')} className="underline font-semibold">Go to Profile →</button></li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Anonymous toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${loanApp.anonymous ? 'border-purple-300 bg-purple-50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${loanApp.anonymous ? 'bg-purple-100' : 'bg-neutral-100'}`}>
                  <Eye className={`w-4 h-4 ${loanApp.anonymous ? 'text-purple-600' : 'text-neutral-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{loanApp.anonymous ? 'Anonymous Posting' : 'Public Posting'}</p>
                  <p className="text-xs text-neutral-500">{loanApp.anonymous ? 'Lenders see your loan request but not your identity. They get full details only after you accept their offer.' : 'Your name is visible to lenders in the marketplace.'}</p>
                </div>
              </div>
              <button onClick={() => setLoanApp(a => ({ ...a, anonymous: !a.anonymous }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${loanApp.anonymous ? 'bg-purple-600' : 'bg-neutral-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${loanApp.anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {applySuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-emerald-800">Application Submitted!</h4>
                <p className="text-sm text-emerald-700 mt-1">Your loan request has been posted to the marketplace. Lenders will review and respond shortly.</p>
                <button onClick={() => { setApplySuccess(false); setActiveTab('loans') }} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all">
                  View My Loans
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Loan Amount (N$) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input type="number" value={loanApp.amount} onChange={e => setLoanApp({...loanApp, amount: e.target.value})}
                        placeholder="5000" min="100" max="100000"
                        className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Loan Term <span className="text-red-500">*</span></label>
                    <select value={loanApp.term} onChange={e => setLoanApp({...loanApp, term: e.target.value})}
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                      <option value="1">1 month</option>
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Purpose <span className="text-red-500">*</span></label>
                    <select value={loanApp.purpose} onChange={e => setLoanApp({...loanApp, purpose: e.target.value})}
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                      <option value="personal">Personal</option>
                      <option value="business">Business Expansion</option>
                      <option value="education">Education</option>
                      <option value="medical">Medical / Emergency</option>
                      <option value="housing">Housing / Rent</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="debt_consolidation">Debt Consolidation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Monthly Income (N$)</label>
                    <input type="number" value={loanApp.income} onChange={e => setLoanApp({...loanApp, income: e.target.value})}
                      placeholder="15000" className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Employer</label>
                    <input type="text" value={loanApp.employer} onChange={e => setLoanApp({...loanApp, employer: e.target.value})}
                      placeholder="Company name" className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Additional Notes</label>
                  <textarea value={loanApp.notes} onChange={e => setLoanApp({...loanApp, notes: e.target.value})}
                    rows={3} placeholder="Any additional information for lenders..."
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>

                {/* Estimated calculation */}
                {loanApp.amount && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Estimated Calculation (25% interest)</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div><p className="text-emerald-600 text-xs">Principal</p><p className="font-bold text-neutral-900">N$ {parseFloat(loanApp.amount || '0').toLocaleString()}</p></div>
                      <div><p className="text-emerald-600 text-xs">Total Repayment</p><p className="font-bold text-neutral-900">N$ {(parseFloat(loanApp.amount || '0') * 1.25).toLocaleString()}</p></div>
                      <div><p className="text-emerald-600 text-xs">Monthly (~)</p><p className="font-bold text-neutral-900">N$ {Math.round((parseFloat(loanApp.amount || '0') * 1.25) / parseInt(loanApp.term || '6')).toLocaleString()}</p></div>
                    </div>
                  </div>
                )}

                {/* Eligibility Pre-Checks */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-neutral-900">Eligibility Pre-Checks</span>
                      {checksComplete && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checkResults.some(c => c.status === 'fail') ? 'bg-red-100 text-red-700' : checkResults.some(c => c.status === 'warn') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {checkResults.some(c => c.status === 'fail') ? 'BLOCKED' : checkResults.some(c => c.status === 'warn') ? 'WARNINGS' : 'ALL CLEAR'}
                        </span>
                      )}
                    </div>
                    <button onClick={runEligibilityChecks} disabled={checksRunning}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all">
                      {checksRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                      {checksRunning ? 'Checking...' : checksComplete ? 'Re-run' : 'Run Checks'}
                    </button>
                  </div>
                  {checkResults.length > 0 && (
                    <div className="divide-y divide-neutral-100">
                      {checkResults.map(c => (
                        <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {c.status === 'checking' ? <RefreshCw className="w-3.5 h-3.5 text-neutral-400 animate-spin" /> :
                             c.status === 'pass' ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> :
                             c.status === 'warn' ? <AlertCircle className="w-3.5 h-3.5 text-yellow-600" /> :
                             <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                            <span className="text-xs font-semibold text-neutral-700">{c.label}</span>
                          </div>
                          <span className={`text-xs ${c.status === 'pass' ? 'text-green-700' : c.status === 'warn' ? 'text-yellow-700' : c.status === 'fail' ? 'text-red-700 font-bold' : 'text-neutral-400'}`}>{c.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {checkResults.length === 0 && (
                    <div className="px-4 py-4 text-xs text-neutral-500 text-center">Run checks to verify your eligibility before submitting</div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">{loanApp.anonymous ? 'Your request will be posted anonymously. Lenders will only see your loan details. Your full profile is revealed only after you accept an offer.' : 'Your application will be posted to the CasHuB marketplace. Lenders can review and make offers. You are not obligated to accept any offer.'}</p>
                </div>

                <button onClick={handleApplyForLoan} disabled={!loanApp.amount || applyLoading || !kycComplete || checkResults.some(c => c.status === 'fail')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {applyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {selectedLender ? `Submit to ${selectedLender.name}` : 'Post to Marketplace'}
                </button>
                {!kycComplete && <p className="text-xs text-amber-600 text-center font-medium">Complete KYC (ID + profile photo) to enable submission</p>}
              </div>
            )}
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">My Loans</h3>
              <div className="flex gap-2">
                <Link href="/borrower/agreement" className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-all">
                  <Pen className="w-3 h-3 mr-1" /> Sign Agreement
                </Link>
                <button onClick={() => setActiveTab('apply')} className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-all">
                  <Plus className="w-3 h-3 mr-1" /> Apply for Loan
                </button>
              </div>
            </div>
            {loans.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
                <FileText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500">No loans found. You&apos;ll see your loans here when a lender sends you an invite.</p>
              </div>
            ) : loans.map(loan => (
              <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-neutral-900">{loan.loan_number}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        loan.status === 'active' ? 'bg-blue-100 text-blue-700'
                        : loan.status === 'completed' ? 'bg-green-100 text-green-700'
                        : loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                        : loan.status === 'rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-neutral-100 text-neutral-700'
                      }`}>{loan.status.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{loan.lender_name}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-neutral-500 mt-2">
                      <div><span className="block font-medium text-neutral-700">Principal</span>N$ {loan.principal.toLocaleString()}</div>
                      <div><span className="block font-medium text-neutral-700">Interest</span>{loan.interest_rate}%</div>
                      <div><span className="block font-medium text-neutral-700">Term</span>{loan.term_months} months</div>
                      <div><span className="block font-medium text-neutral-700">Monthly</span>N$ {loan.monthly_payment.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Outstanding</p>
                    <p className="text-xl font-bold text-neutral-900">N$ {loan.outstanding.toLocaleString()}</p>
                    {loan.status === 'active' && (
                      <div className="mt-2">
                        <div className="w-32 bg-neutral-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(loan.payments_made / loan.total_payments) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1">{loan.payments_made}/{loan.total_payments} payments</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── MARKETPLACE / BROWSE LENDERS TAB ─── */}
        {activeTab === 'marketplace' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Lender Marketplace</h3>
                <p className="text-sm text-neutral-500">Browse registered lenders and compare rates before applying.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="text" placeholder="Search lenders..." value={lenderSearch} onChange={e => setLenderSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lenders.filter(l => l.name.toLowerCase().includes(lenderSearch.toLowerCase())).map(lender => (
                <div key={lender.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 hover:border-emerald-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                        {lender.logo_url
                          ? <img src={lender.logo_url} alt={lender.name} className="w-full h-full object-contain bg-white p-0.5" />
                          : <span className="text-lg font-black text-white">{lender.name.charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{lender.name}</h4>
                        <p className="text-[10px] text-neutral-500">{lender.registration_number}</p>
                        {lender.about && <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{lender.about}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-yellow-700">{lender.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-neutral-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-neutral-500">Interest</p>
                      <p className="text-sm font-bold text-neutral-900">{lender.avg_interest_rate}%</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-neutral-500">Approval</p>
                      <p className="text-sm font-bold text-emerald-600">{lender.approval_rate}%</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-neutral-500">Response</p>
                      <p className="text-sm font-bold text-blue-600">{lender.response_time}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                    <span>N$ {lender.min_amount.toLocaleString()} – N$ {lender.max_amount.toLocaleString()}</span>
                    <span>{lender.total_loans.toLocaleString()} loans issued</span>
                  </div>

                  {lender.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lender.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-medium">{f}</span>
                      ))}
                    </div>
                  )}

                  <button onClick={() => { setSelectedLender(lender); setActiveTab('apply') }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all">
                    Apply Directly to {lender.name}
                  </button>
                </div>
              ))}
            </div>

            {lenders.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
                <Building className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500">No lenders found. Check back soon as more lenders register on the platform.</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Not registered yet? <Link href="/signup" className="font-semibold underline">Create an account</Link> to apply for loans and access the full marketplace.
              </p>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Payment History</h3>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Loan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">No payments recorded yet</td>
                      </tr>
                    ) : payments.map(p => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">{p.reference}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{p.loan_id}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-neutral-900">N$ {p.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{p.method}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{p.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{p.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">My Profile</h3>
              <button onClick={async () => {
                if (!borrowerId) return
                setProfileSaving(true)
                await supabase.from('borrowers').update({ ...pForm, signature_url: sigUrl || null }).eq('id', borrowerId)
                setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000)
                setProfileSaving(false)
              }} disabled={profileSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {profileSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : profileSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {profileSaving ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
            {profileSaved && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Your information has been saved and will auto-fill future loan agreements.</div>}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800"><strong>Tip:</strong> Keep your details up to date — they will automatically fill your loan agreement when approved.</div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-100 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                    {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-9 h-9 text-white" />}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPhotoUploading(true)
                        const reader = new FileReader()
                        reader.onload = ev => {
                            const data = ev.target?.result as string
                            setPhotoUrl(data)
                            // Scope avatar to this user's email — prevents sharing between borrowers
                            localStorage.setItem(`borrowerAvatar_${userEmail}`, data)
                            setKycComplete(!!(borrowerProfile?.id_number))
                            setPhotoUploading(false)
                          }
                        reader.readAsDataURL(file)
                      }
                    }} />
                  </label>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-900">{userName}</h4>
                  <p className="text-sm text-neutral-500">{userEmail}</p>
                  <span className="inline-flex mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">ACTIVE BORROWER</span>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Click the icon to update your photo</p>
                </div>
              </div>
              {/* KYC Status Banner */}
              <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${kycComplete ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                {kycComplete
                  ? <><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-xs font-semibold text-green-700">KYC Complete — You can apply for loans</span></>
                  : <><AlertCircle className="w-4 h-4 text-amber-600" /><span className="text-xs font-semibold text-amber-700">KYC Incomplete — Upload a profile photo and ensure your ID number is on file</span></>
                }
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField icon={Mail} label="Email" value={userEmail} />
                <ProfileField icon={Phone} label="Phone" value={borrowerProfile?.phone || 'Not provided'} />
                <ProfileField icon={MapPin} label="Address" value={[borrowerProfile?.address, borrowerProfile?.city, borrowerProfile?.region].filter(Boolean).join(', ') || 'Not provided'} />
                <ProfileField icon={Calendar} label="Member Since" value={borrowerProfile?.member_since || 'Unknown'} />
                <ProfileField icon={TrendingUp} label="Credit Score" value={creditData ? `${creditData.score} / 100 (${creditData.risk_level})` : 'Not assessed'} />
                <ProfileField icon={Shield} label="National ID" value={borrowerProfile?.id_number || '⚠ Not on file — contact your lender'} />
              </div>
            </div>

            {/* ── AGREEMENT INFO EDITOR ── */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="border-b border-neutral-100 px-5 py-3">
                <p className="text-sm font-bold text-neutral-900">Agreement Information</p>
                <p className="text-xs text-neutral-400">Used to auto-fill your loan agreement</p>
              </div>
              {/* Sub-tabs */}
              <div className="flex gap-1 p-2 bg-neutral-50 border-b border-neutral-100 overflow-x-auto">
                {([['personal','Personal',User],['employment','Employment',Briefcase],['banking','Banking',CreditCard],['references','References',Users],['signature','Signature',Pen]] as const).map(([t,label,Icon]) => (
                  <button key={t} onClick={() => setProfileTab(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${profileTab===t?'bg-emerald-600 text-white':'text-neutral-500 hover:bg-neutral-200'}`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {profileTab === 'personal' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([['id_number','ID / Passport No','text'],['marital_status','','select'],['postal_address','Postal Address','text'],['address','Residential Address','text']] as const).map(([k,,type]) => (
                      k === 'marital_status' ? (
                        <div key={k}><label className="block text-xs font-medium text-neutral-600 mb-1">Marital Status</label>
                          <select value={pForm.marital_status} onChange={e => setP('marital_status', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                            <option value="">Select...</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                          </select></div>
                      ) : (
                        <div key={k}><label className="block text-xs font-medium text-neutral-600 mb-1">{k==='id_number'?'ID / Passport No':k==='postal_address'?'Postal Address':'Residential Address'}</label>
                          <input type="text" value={pForm[k as keyof typeof pForm]} onChange={e => setP(k, e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" /></div>
                      )
                    ))}
                  </div>
                )}
                {profileTab === 'employment' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[['occupation','Occupation'],['employer_name','Employer Name'],['employer_tel','Employer Tel'],['payslip_employee_no','Payslip / Employee No'],['employer_address','Employer Address']].map(([k,label]) => (
                      <div key={k}><label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
                        <input type="text" value={pForm[k as keyof typeof pForm]} onChange={e => setP(k, e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" /></div>
                    ))}
                  </div>
                )}
                {profileTab === 'banking' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[['bank_name','Bank Name'],['bank_branch','Branch'],['bank_account_no','Account Number']].map(([k,label]) => (
                      <div key={k}><label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
                        <input type="text" value={pForm[k as keyof typeof pForm]} onChange={e => setP(k, e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" /></div>
                    ))}
                    <div><label className="block text-xs font-medium text-neutral-600 mb-1">Account Type</label>
                      <select value={pForm.bank_account_type} onChange={e => setP('bank_account_type', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                        <option value="">Select...</option><option>Cheque</option><option>Savings</option><option>Transmission</option>
                      </select></div>
                  </div>
                )}
                {profileTab === 'references' && (
                  <div className="space-y-4">
                    {[{n:'1',nk:'reference1_name' as const,tk:'reference1_tel' as const},{n:'2',nk:'reference2_name' as const,tk:'reference2_tel' as const}].map(r => (
                      <div key={r.n} className="bg-neutral-50 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-bold text-neutral-700">Reference {r.n}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-xs font-medium text-neutral-600 mb-1">Full Name</label>
                            <input type="text" value={pForm[r.nk]} onChange={e => setP(r.nk, e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" /></div>
                          <div><label className="block text-xs font-medium text-neutral-600 mb-1">Tel No</label>
                            <input type="tel" value={pForm[r.tk]} onChange={e => setP(r.tk, e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {profileTab === 'signature' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {([['draw','Draw',Pen],['upload','Upload Photo',Upload]] as const).map(([m,label,Icon]) => (
                        <button key={m} onClick={() => setSigMethod(m)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${sigMethod===m?'border-emerald-500 bg-emerald-50 text-emerald-700':'border-neutral-200 text-neutral-500'}`}>
                          <Icon className="w-4 h-4" />{label}
                        </button>
                      ))}
                    </div>
                    {sigUrl && <div className="flex items-center gap-3"><img src={sigUrl} alt="Current signature" className="h-14 object-contain border border-neutral-200 rounded" /><p className="text-xs text-emerald-600 font-medium">Current signature on file</p></div>}
                    {sigMethod === 'draw' && (
                      <div>
                        <p className="text-xs text-neutral-500 mb-2">Draw your signature below:</p>
                        <div className="border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden">
                          <canvas ref={sigRef} width={500} height={130} className="w-full cursor-crosshair touch-none"
                            onMouseDown={e => { const c=sigRef.current;if(!c)return;setIsSigDrawing(true);const r=c.getBoundingClientRect();const ctx=c.getContext('2d')!;ctx.beginPath();ctx.moveTo(e.clientX-r.left,e.clientY-r.top) }}
                            onMouseMove={e => { if(!isSigDrawing)return;const c=sigRef.current;if(!c)return;const ctx=c.getContext('2d')!;const r=c.getBoundingClientRect();ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#1a1a1a';ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();setHasSig(true) }}
                            onMouseUp={() => setIsSigDrawing(false)} onMouseLeave={() => setIsSigDrawing(false)} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <button onClick={() => { const c=sigRef.current;if(!c)return;c.getContext('2d')!.clearRect(0,0,c.width,c.height);setHasSig(false) }} className="text-xs text-red-500">Clear</button>
                          <button onClick={() => { const c=sigRef.current;if(!c)return;setSigUrl(c.toDataURL('image/png')) }} disabled={!hasSig}
                            className="text-xs text-emerald-600 font-semibold disabled:opacity-40">Use this signature ✓</button>
                        </div>
                      </div>
                    )}
                    {sigMethod === 'upload' && (
                      <label className="block border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 transition-all">
                        {sigUrl ? <img src={sigUrl} alt="Signature" className="h-16 object-contain mx-auto" />
                          : <div className="space-y-1"><Upload className="w-6 h-6 text-neutral-400 mx-auto" /><p className="text-sm text-neutral-500">Click to upload signature</p><p className="text-xs text-neutral-400">JPG or PNG</p></div>}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setSigUrl(ev.target?.result as string);setHasSig(true)};r.readAsDataURL(f) }} />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blacklist Tab */}
        {activeTab === 'blacklist' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Blacklist Status</h3>

            {blacklistEntries.length === 0 ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Your record is clear</p>
                    <p className="text-xs text-green-700 mt-1">
                      You have no active blacklist records on the CasHuB network. Keep up the good payment history!
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {blacklistEntries.map(entry => (
                  <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-bold text-neutral-900">{entry.lender_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            entry.status === 'active' ? 'bg-red-100 text-red-700'
                            : entry.status === 'dispute_filed' ? 'bg-blue-100 text-blue-700'
                            : entry.status === 'resolved' ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>{entry.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-neutral-600"><span className="font-medium">Reason:</span> {entry.reason.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</p>
                        {entry.description && <p className="text-xs text-neutral-500">{entry.description}</p>}
                        <p className="text-xs text-neutral-400">Blacklisted: {new Date(entry.blacklist_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-lg font-bold text-red-600">N$ {entry.outstanding_amount.toLocaleString()}</p>
                        {(entry.status === 'active' || entry.status === 'under_review') && (
                          <button onClick={() => { setSelectedBlacklist(entry); setShowDisputeModal(true); setDisputeReason('') }}
                            className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 transition-all">
                            <Gavel className="w-3 h-3 mr-1" /> File Dispute
                          </button>
                        )}
                        {entry.status === 'dispute_filed' && (
                          <span className="text-[10px] text-blue-600 font-medium">Dispute under review</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <h4 className="font-semibold text-neutral-900 text-sm mb-3">What is the Blacklist?</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The CasHuB blacklist is a shared registry of borrowers who have defaulted on loans. Lenders report
                borrowers who fail to repay, and this information is shared across the network to help other lenders
                make informed decisions. If you are blacklisted, you can <strong>file a dispute</strong> to challenge the entry or request settlement.
              </p>
            </div>
          </div>
        )}

        {/* ─── MY APPLICATIONS TAB ─── */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">My Applications ({applications.length})</h3>

            {/* Pending Offers — require borrower action */}
            {applications.filter((a: any) => a.status === 'offer_pending').length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-bold text-blue-900">You have {applications.filter((a: any) => a.status === 'offer_pending').length} loan offer(s) awaiting your response</p>
                </div>
                {applications.filter((a: any) => a.status === 'offer_pending').map((app: any) => (
                  <div key={app.id} className="bg-white rounded-xl border border-blue-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">Loan Offer from {app.lender_email || 'Lender'}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">N$ {(app.loan_amount || 0).toLocaleString()} · {app.loan_purpose || 'General'} · {app.loan_term || '—'} months</p>
                        {app.notes && <p className="text-xs text-blue-600 mt-1 italic">{app.notes}</p>}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">OFFER PENDING</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptOffer(app)} disabled={offerActioning === app.id}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all">
                        {offerActioning === app.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Accept Offer
                      </button>
                      <button onClick={() => declineOffer(app.id, app.marketplace_application_id)} disabled={offerActioning === app.id}
                        className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all">
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {applications.filter((a: any) => a.status !== 'offer_pending').length === 0 && applications.filter((a: any) => a.status === 'offer_pending').length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
                <Send className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500 font-medium">No applications yet</p>
                <button onClick={() => setActiveTab('apply')} className="mt-3 text-emerald-600 text-sm hover:underline">Apply for a loan →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.filter((a: any) => a.status !== 'offer_pending').map((app: any) => (
                  <div key={app.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">Loan Application</p>
                        <p className="text-xs text-neutral-500 mt-0.5">N$ {(app.loan_amount || 0).toLocaleString()} · {app.loan_purpose || app.purpose || 'General'} · {app.loan_term || '—'} months</p>
                        <p className="text-xs text-neutral-400 mt-0.5">Submitted {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                        : app.status === 'rejected' ? 'bg-red-100 text-red-700'
                        : app.status === 'disbursed' ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>{app.status || 'pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── REPAYMENTS TAB ─── */}
        {activeTab === 'repayments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Repayment Schedule</h3>
            {loans.filter(l => l.status === 'active').length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
                <CreditCard className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500 font-medium">No active loans with repayment schedules</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.filter(l => l.status === 'active').map(loan => (
                  <div key={loan.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{loan.loan_number}</p>
                        <p className="text-xs text-neutral-500">{loan.lender_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Monthly Payment</p>
                        <p className="text-lg font-bold text-emerald-700">N$ {loan.monthly_payment.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-neutral-50 rounded-lg p-2">
                        <p className="text-neutral-500">Principal</p>
                        <p className="font-bold text-neutral-900">N$ {loan.principal.toLocaleString()}</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-2">
                        <p className="text-neutral-500">Outstanding</p>
                        <p className="font-bold text-amber-700">N$ {loan.outstanding.toLocaleString()}</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-2">
                        <p className="text-neutral-500">Progress</p>
                        <p className="font-bold text-emerald-700">{loan.total_payments > 0 ? Math.round((loan.payments_made / loan.total_payments) * 100) : 0}%</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${loan.total_payments > 0 ? (loan.payments_made / loan.total_payments) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {payments.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="p-4 border-b border-neutral-100">
                  <h4 className="text-sm font-bold text-neutral-900">Payment History</h4>
                </div>
                <table className="w-full">
                  <thead className="bg-neutral-50"><tr>{['Date', 'Amount', 'Method', 'Status'].map(h => <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-neutral-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-neutral-100">
                    {payments.slice(0, 10).map(p => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-2 text-xs text-neutral-600">{p.date}</td>
                        <td className="px-4 py-2 text-xs font-bold text-neutral-900">N$ {p.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs text-neutral-500">{p.method}</td>
                        <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── DOCUMENTS TAB ─── */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">KYC Documents</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Upload each document separately. All documents are reviewed by your lender before loan approval.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              All 4 documents are required for full KYC verification. Missing documents may delay your loan approval.
            </div>
            {[
              { key: 'id', label: 'National ID / Passport', desc: 'Clear copy of both sides', accept: 'image/*,.pdf', color: 'blue' },
              { key: 'payslip', label: 'Latest Payslip', desc: 'Most recent payslip (last 3 months)', accept: 'image/*,.pdf', color: 'green' },
              { key: 'bank', label: 'Bank Statement', desc: 'Last 3 months bank statement', accept: 'image/*,.pdf', color: 'purple' },
              { key: 'residence', label: 'Proof of Residence', desc: 'Utility bill, lease or municipal statement', accept: 'image/*,.pdf', color: 'orange' },
            ].map(docType => {
              const existing = documents.find(d => d.type === docType.key)
              const colors: Record<string, string> = { blue: 'bg-blue-50 border-blue-200 text-blue-700', green: 'bg-green-50 border-green-200 text-green-700', purple: 'bg-purple-50 border-purple-200 text-purple-700', orange: 'bg-orange-50 border-orange-200 text-orange-700' }
              return (
                <div key={docType.key} className="bg-white rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colors[docType.color]}`}><FileText className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{docType.label}</p>
                        <p className="text-xs text-neutral-500">{docType.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {existing ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${existing.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{existing.status}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-500">Not uploaded</span>
                      )}
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-semibold cursor-pointer text-neutral-700">
                        <Upload className="w-3 h-3" />{existing ? 'Replace' : 'Upload'}
                        <input type="file" accept={docType.accept} className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploadingDoc(true)
                          try {
                            const reader = new FileReader()
                            reader.onload = async (ev) => {
                              const fileData = ev.target?.result as string
                              const { data: borrowerRec } = await supabase.from('borrowers').select('id').eq('email', userEmail).maybeSingle()
                              await supabase.from('borrower_documents').insert({
                                borrower_id: borrowerRec?.id || null,
                                borrower_email: userEmail,
                                document_type: docType.key,
                                document_name: file.name,
                                file_data: fileData,
                                file_size: file.size,
                                status: 'pending',
                              })
                              loadData()
                              setUploadingDoc(false)
                            }
                            reader.readAsDataURL(file)
                          } catch (err) {
                            console.error('Upload error:', err)
                            setUploadingDoc(false)
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                  {existing && (
                    <div className="mt-2 text-xs text-neutral-400 border-t border-neutral-100 pt-2">Uploaded: {existing.uploaded}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ─── CREDIT SCORE TAB ─── */}
        {activeTab === 'credit_score' && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-neutral-900">Credit Score & Risk Level</h3>
            <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
              {creditData && creditData.score > 0 ? (
                <>
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-4 ${creditData.score >= 700 ? 'border-green-400 bg-green-50' : creditData.score >= 500 ? 'border-yellow-400 bg-yellow-50' : 'border-red-400 bg-red-50'}`}>
                    <div>
                      <p className={`text-3xl font-black ${creditData.score >= 700 ? 'text-green-700' : creditData.score >= 500 ? 'text-yellow-700' : 'text-red-700'}`}>{creditData.score}</p>
                      <p className="text-xs text-neutral-500">/ 850</p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold capitalize ${creditData.risk_level === 'low' ? 'text-green-700' : creditData.risk_level === 'medium' ? 'text-yellow-700' : 'text-red-700'}`}>{creditData.risk_level} Risk</p>
                  <p className="text-xs text-neutral-400 mt-1">Last updated: {creditData.last_updated || 'N/A'}</p>
                </>
              ) : (
                <div className="py-6">
                  <TrendingUp className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-500 font-medium">Credit score not yet calculated</p>
                  <p className="text-xs text-neutral-400 mt-1">Your score will be calculated once you have loan history or a lender registers your profile.</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h4 className="text-sm font-bold text-neutral-900 mb-3">How to Improve Your Score</h4>
              <div className="space-y-2">
                {[
                  { tip: 'Make all repayments on time', done: completedLoans > 0 },
                  { tip: 'Keep your profile and KYC up to date', done: !!userEmail },
                  { tip: 'Avoid multiple simultaneous loan applications', done: applications.filter((a: any) => a.status === 'pending').length <= 1 },
                  { tip: 'Maintain a low debt-to-income ratio', done: totalOutstanding < 50000 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-neutral-200'}`}>
                      {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={item.done ? 'text-neutral-500 line-through' : 'text-neutral-800'}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── NOTIFICATIONS TAB ─── */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Notifications</h3>
            {[
              { title: 'Loan Application Received', body: 'Your loan application has been received and is under review.', time: '2 hours ago', read: false, type: 'info' },
              { title: 'Payment Reminder', body: 'Your next loan repayment is due in 3 days. Amount: N$ 3,500.', time: '1 day ago', read: false, type: 'warning' },
              { title: 'Profile Verified', body: 'Your KYC documents have been verified by your lender.', time: '3 days ago', read: true, type: 'success' },
              { title: 'Loan Approved', body: 'Congratulations! Your loan application has been approved.', time: '1 week ago', read: true, type: 'success' },
            ].map((notif, i) => (
              <div key={i} className={`bg-white rounded-xl border p-4 ${!notif.read ? 'border-emerald-200 bg-emerald-50/20' : 'border-neutral-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-neutral-900' : 'text-neutral-600'}`}>{notif.title}</p>
                      <span className="text-[10px] text-neutral-400 ml-2 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{notif.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ DISPUTE MODAL ═══ */}
      {showDisputeModal && selectedBlacklist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">File a Dispute</h2>
                <p className="text-xs text-neutral-500">Challenge this blacklist entry</p>
              </div>
              <button onClick={() => { setShowDisputeModal(false); setSelectedBlacklist(null) }} className="p-1.5 hover:bg-neutral-100 rounded-lg">
                <XCircle className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h3 className="text-xs font-bold text-red-900 mb-2 uppercase tracking-wide">Blacklist Record</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-red-600 text-xs">Lender</p><p className="font-medium text-neutral-900">{selectedBlacklist.lender_name}</p></div>
                  <div><p className="text-red-600 text-xs">Reason</p><p className="font-medium text-neutral-900">{selectedBlacklist.reason.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</p></div>
                  <div><p className="text-red-600 text-xs">Outstanding</p><p className="font-medium text-neutral-900">N$ {selectedBlacklist.outstanding_amount.toLocaleString()}</p></div>
                  <div><p className="text-red-600 text-xs">Date</p><p className="font-medium text-neutral-900">{new Date(selectedBlacklist.blacklist_date).toLocaleDateString()}</p></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Why do you believe this entry is incorrect? <span className="text-red-500">*</span></label>
                <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4}
                  placeholder="Explain your dispute reason. Include details such as payment proof, incorrect information, etc."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Evidence</label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600 font-medium">Click to upload documents</p>
                  <p className="text-[10px] text-neutral-400">Payment receipts, communications, proof (PDF, JPG, PNG)</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">What happens next:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Your dispute will be reviewed within 5-7 business days</li>
                    <li>The lender will be notified and may respond</li>
                    <li>The entry will be marked as &quot;Disputed&quot; during review</li>
                    <li>You&apos;ll receive the outcome via email</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button onClick={() => { setShowDisputeModal(false); setSelectedBlacklist(null) }}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">
                Cancel
              </button>
              <button onClick={handleFileDispute} disabled={!disputeReason.trim() || disputeSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {disputeSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function ProfileField({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
      <Icon className="w-4 h-4 text-neutral-400" />
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-neutral-900">{value}</p>
      </div>
    </div>
  )
}


