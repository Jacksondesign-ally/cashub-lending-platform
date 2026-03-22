"use client"

import jsPDF from 'jspdf'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FileText, CheckCircle, ChevronRight, ChevronLeft, User, Shield,
  Calendar, DollarSign, Pen, Smartphone, Camera, ArrowLeft, Info
} from 'lucide-react'

type Step = 'overview' | 'personal' | 'terms' | 'agreement' | 'signature' | 'complete'

const STEPS: { id: Step; label: string }[] = [
  { id: 'overview', label: 'Loan Overview' },
  { id: 'personal', label: 'Personal Info' },
  { id: 'terms', label: 'Loan Terms' },
  { id: 'agreement', label: 'Agreement' },
  { id: 'signature', label: 'Sign' },
  { id: 'complete', label: 'Complete' },
]

export default function LoanAgreementPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentStep, setCurrentStep] = useState<Step>('overview')
  const signatureMethod = 'draw'
  
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [userName, setUserName] = useState('Borrower')

  // Loan data - fetched from Supabase or demo
  const [loanData, setLoanData] = useState({
    loanNumber: 'CL-2026-001',
    lenderName: 'QuickCash Namibia',
    principal: 5000,
    interestRate: 25,
    termMonths: 6,
    monthlyPayment: 1042,
    totalRepayment: 6250,
    adminFee: 51.50,
    levy: 5.00,
    startDate: new Date().toISOString().split('T')[0],
  })

  const [borrowerInfo, setBorrowerInfo] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    employer: '',
  })

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Borrower'
    const storedEmail = localStorage.getItem('userEmail') || (name.includes('@') ? name : '')
    setUserName(name)
    setBorrowerInfo(prev => ({ ...prev, fullName: name, email: storedEmail }))
    fetchLoanData(storedEmail)
  }, [])

  const fetchLoanData = async (email?: string) => {
    try {
      // Scope to this borrower — find their borrower_id first
      const borrowerEmail = email || localStorage.getItem('userEmail') || ''
      if (!borrowerEmail) return
      const { data: borrowerRec } = await supabase.from('borrowers').select('id').eq('email', borrowerEmail).maybeSingle()
      const borrowerId = borrowerRec?.id || ''
      const filter = borrowerId
        ? `borrower_id.eq.${borrowerId},borrower_email.eq.${borrowerEmail}`
        : `borrower_email.eq.${borrowerEmail}`
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'approved')
        .or(filter)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        const l = data[0] as any
        const principal = l.principal_amount || 5000
        const rate = l.interest_rate || 25
        const term = l.term_months || 6
        const total = principal * (1 + rate / 100)
        setLoanData({
          loanNumber: l.loan_number || `CL-${l.id?.slice(0, 8)}`,
          lenderName: l.lender_name || 'CasHuB Lending',
          principal,
          interestRate: rate,
          termMonths: term,
          monthlyPayment: Math.round(total / term),
          totalRepayment: total,
          adminFee: Math.round(principal * 0.0103 * 100) / 100,
          levy: 5.00,
          startDate: l.start_date || new Date().toISOString().split('T')[0],
        })
      }
    } catch { /* use demo data */ }
  }

  const stepIndex = STEPS.findIndex(s => s.id === currentStep)

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1].id)
  }
  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].id)
  }

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    setHasSignature(true)
  }
  const stopDraw = () => setIsDrawing(false)
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  


  const handleDownloadPDF = () => {
    if (!loan) return
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Loan Agreement', 105, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Loan Number: ${loan.loan_number}`, 20, 40)
    doc.text(`Borrower: ${loan.borrower_name}`, 20, 50)
    doc.text(`Amount: N$ ${loan.principal_amount?.toLocaleString()}`, 20, 60)
    doc.text(`Interest Rate: ${loan.interest_rate}%`, 20, 70)
    doc.text(`Term: ${loan.term_months} months`, 20, 80)
    doc.text(`Monthly Payment: N$ ${loan.monthly_payment?.toLocaleString()}`, 20, 90)
    doc.text(`Signed: ${new Date().toLocaleDateString()}`, 20, 100)
    
    doc.text('Terms and Conditions:', 20, 120)
    doc.setFontSize(8)
    const terms = [
      '1. The borrower agrees to repay the loan amount plus interest.',
      '2. Payments are due on the specified due date each month.',
      '3. Late payments may incur additional fees as per NAMFISA regulations.',
      '4. The lender reserves the right to report defaults to credit bureaus.',
      '5. This agreement is governed by the laws of Namibia.'
    ]
    terms.forEach((term, i) => {
      doc.text(term, 20, 130 + (i * 10))
    })
    
    doc.save(`loan_agreement_${loan.loan_number}.pdf`)
  }


  const handleComplete = async () => {
    try {
      await supabase.from('loan_signatures').insert({
        loan_number: loanData.loanNumber,
        borrower_name: borrowerInfo.fullName,
        borrower_email: borrowerInfo.email,
        signature_method: signatureMethod,
        signed_at: new Date().toISOString(),
      })
    } catch { /* fallback */ }
    setCurrentStep('complete')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/borrower" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Portal</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-neutral-900">Loan Agreement</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Progress Stepper */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-between mb-8">
            {STEPS.filter(s => s.id !== 'complete').map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex ? 'bg-emerald-600 text-white' :
                  i === stepIndex ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                  'bg-neutral-200 text-neutral-500'
                }`}>
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 2 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 transition-all ${i < stepIndex ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── STEP 1: OVERVIEW ─── */}
        {currentStep === 'overview' && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Loan Agreement Review</h2>
              <p className="text-sm text-neutral-500 mt-1">Review and sign your loan agreement with {loanData.lenderName}</p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-neutral-900">Loan Summary</h3>
              {[
                { label: 'Loan Number', value: loanData.loanNumber },
                { label: 'Lender', value: loanData.lenderName },
                { label: 'Principal Amount', value: `N$ ${loanData.principal.toLocaleString()}` },
                { label: 'Interest Rate', value: `${loanData.interestRate}%` },
                { label: 'Loan Term', value: `${loanData.termMonths} months` },
                { label: 'Monthly Payment', value: `N$ ${loanData.monthlyPayment.toLocaleString()}` },
                { label: 'Total Repayment', value: `N$ ${loanData.totalRepayment.toLocaleString()}` },
              ].map((row, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-neutral-500">{row.label}</span>
                  <span className="font-medium text-neutral-900">{row.value}</span>
                </div>
              ))}
            </div>

            <button onClick={goNext} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── STEP 2: PERSONAL INFO ─── */}
        {currentStep === 'personal' && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-5">
            <h2 className="text-lg font-bold text-neutral-900">Confirm Personal Information</h2>
            <p className="text-sm text-neutral-500">Please verify your details are correct before proceeding.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'fullName' as const, icon: User },
                { label: 'ID Number', key: 'idNumber' as const, icon: Shield },
                { label: 'Phone', key: 'phone' as const, icon: Smartphone },
                { label: 'Email', key: 'email' as const, icon: FileText },
                { label: 'Address', key: 'address' as const, icon: Info },
                { label: 'Employer', key: 'employer' as const, icon: Info },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{field.label}</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <field.icon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={borrowerInfo[field.key]}
                      onChange={e => setBorrowerInfo({ ...borrowerInfo, [field.key]: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      placeholder={field.label}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={goNext} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: LOAN TERMS ─── */}
        {currentStep === 'terms' && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-5">
            <h2 className="text-lg font-bold text-neutral-900">Loan Terms & Disclosures</h2>

            <div className="space-y-4">
              {[
                { title: 'Interest Rate', desc: `Your loan carries a flat interest rate of ${loanData.interestRate}% over the full term. This is a simple interest calculation, not compounding.` },
                { title: 'Repayment Schedule', desc: `You will make ${loanData.termMonths} monthly payments of N$ ${loanData.monthlyPayment.toLocaleString()} starting from ${new Date(loanData.startDate).toLocaleDateString()}.` },
                { title: 'Fees & Charges', desc: `Admin Fee: N$ ${loanData.adminFee} (1.03% of principal). NAMFISA Levy: N$ ${loanData.levy}. No hidden charges.` },
                { title: 'Late Payment', desc: 'Late payments may incur a penalty of 2% per month on the overdue amount. After 60 days, the account may be referred to collections.' },
                { title: 'Early Settlement', desc: 'You may settle your loan early at any time. A rebate on unearned interest may apply based on the remaining term.' },
                { title: 'Dispute Resolution', desc: 'Any disputes will be handled through the CasHuB dispute resolution process. You may file a dispute via the borrower portal at any time.' },
              ].map((item, i) => (
                <div key={i} className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={goNext} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: FULL AGREEMENT ─── */}
        {currentStep === 'agreement' && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-5">
            <h2 className="text-lg font-bold text-neutral-900">Loan Agreement</h2>

            <div className="bg-neutral-50 rounded-xl p-5 max-h-96 overflow-y-auto text-xs text-neutral-700 leading-relaxed space-y-3 border border-neutral-200">
              <p className="font-bold text-neutral-900">MICROLENDING LOAN AGREEMENT</p>
              <p>This Loan Agreement (&quot;Agreement&quot;) is entered into on {new Date().toLocaleDateString()} between:</p>
              <p><strong>Lender:</strong> {loanData.lenderName} (hereinafter &quot;the Lender&quot;)</p>
              <p><strong>Borrower:</strong> {borrowerInfo.fullName || userName} (ID: {borrowerInfo.idNumber || 'To be confirmed'}) (hereinafter &quot;the Borrower&quot;)</p>

              <p className="font-bold text-neutral-900 mt-4">1. LOAN DETAILS</p>
              <p>Principal Amount: N$ {loanData.principal.toLocaleString()}</p>
              <p>Interest Rate: {loanData.interestRate}% flat</p>
              <p>Loan Term: {loanData.termMonths} months</p>
              <p>Monthly Installment: N$ {loanData.monthlyPayment.toLocaleString()}</p>
              <p>Total Repayable: N$ {loanData.totalRepayment.toLocaleString()}</p>

              <p className="font-bold text-neutral-900 mt-4">2. REPAYMENT TERMS</p>
              <p>The Borrower agrees to repay the loan in {loanData.termMonths} equal monthly installments. Payments are due on the same date each month. Failure to make timely payments may result in penalties and potential blacklisting on the CasHuB shared registry.</p>

              <p className="font-bold text-neutral-900 mt-4">3. FEES AND CHARGES</p>
              <p>Administration Fee: N$ {loanData.adminFee} (non-refundable)</p>
              <p>NAMFISA Levy: N$ {loanData.levy}</p>
              <p>Late Payment Penalty: 2% per month on overdue balance</p>

              <p className="font-bold text-neutral-900 mt-4">4. DEFAULT AND REMEDIES</p>
              <p>If the Borrower fails to make payment for 30 consecutive days, the Lender may declare the entire outstanding balance immediately due. The Borrower&apos;s record may be shared with other lenders through the CasHuB shared blacklist registry.</p>

              <p className="font-bold text-neutral-900 mt-4">5. GOVERNING LAW</p>
              <p>This Agreement shall be governed by and construed in accordance with the laws of the Republic of Namibia. Any disputes shall be subject to the jurisdiction of the Namibian courts.</p>

              <p className="font-bold text-neutral-900 mt-4">6. NAMFISA COMPLIANCE</p>
              <p>This loan is issued in compliance with the Microlending Act and NAMFISA regulations. The Lender is a registered microlender under NAMFISA registration requirements.</p>
            </div>

            <label className="flex items-start gap-2">
              <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500" />
              <span className="text-sm text-neutral-700">I have read and understood the loan agreement and agree to all the terms and conditions stated herein.</span>
            </label>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={goNext} disabled={!agreedToTerms}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                Proceed to Sign <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 5: SIGNATURE ─── */}
        {currentStep === 'signature' && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-5">
            <h2 className="text-lg font-bold text-neutral-900">Digital Signature</h2>
            <p className="text-sm text-neutral-500">Choose your preferred method to sign the agreement.</p>

            {/* Signature Method Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'draw' as const, label: 'Draw Signature', icon: Pen },
                { id: 'otp' as const, label: 'OTP Verification', icon: Smartphone },
                { id: 'selfie' as const, label: 'Selfie Verification', icon: Camera },
              ].map(method => (
                <button key={method.id} onClick={() => setSignatureMethod(method.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    signatureMethod === method.id ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 hover:border-neutral-300'
                  }`}>
                  <method.icon className={`w-5 h-5 mx-auto mb-1 ${signatureMethod === method.id ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  <p className="text-[10px] font-medium text-neutral-700">{method.label}</p>
                </button>
              ))}
            </div>

            {/* Draw Signature */}
            {signatureMethod === 'draw' && (
              <div>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl overflow-hidden bg-white">
                  <canvas ref={canvasRef} width={500} height={150}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-[10px] text-neutral-400">Draw your signature above</p>
                  <button onClick={clearCanvas} className="text-xs text-red-500 hover:text-red-600">Clear</button>
                </div>
              </div>
            )}

            {/* OTP Verification */}
            {signatureMethod === 'otp' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600">
                  We will send a one-time password to your registered phone number for verification.
                </p>
                {!otpSent ? (
                  <button onClick={handleSendOtp}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all">
                    Send OTP to Phone
                  </button>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Enter OTP Code</label>
                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code" maxLength={6}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-center tracking-widest font-mono focus:ring-2 focus:ring-emerald-500" />
                    <p className="text-[10px] text-neutral-400 mt-1">Demo: enter any 6-digit code</p>
                  </div>
                )}
              </div>
            )}

            

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleComplete}
                disabled={!hasSignature}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <Pen className="w-4 h-4" /> Sign Agreement
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 6: COMPLETE ─── */}
        {currentStep === 'complete' && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Agreement Signed!</h2>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Your loan agreement for <strong>{loanData.loanNumber}</strong> has been successfully signed.
              A copy has been saved to your account and sent to your email.
            </p>

            <div className="bg-neutral-50 rounded-xl p-5 space-y-2 max-w-sm mx-auto text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Loan</span><span className="font-medium">{loanData.loanNumber}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Amount</span><span className="font-medium">N$ {loanData.principal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Signed</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Method</span><span className="font-medium capitalize">{signatureMethod}</span></div>
            </div>

            <div className="flex gap-3 max-w-sm mx-auto">
              <Link href="/borrower" className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 text-center transition-all">
                Back to Portal
              </Link>
              <button onClick={handleDownloadPDF} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


