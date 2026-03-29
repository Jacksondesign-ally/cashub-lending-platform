"use client"

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FileText, CheckCircle, ArrowLeft, Pen, Upload, Printer, AlertCircle, RefreshCw } from 'lucide-react'

type Step = 'review' | 'sign' | 'complete'
type SignMethod = 'draw' | 'upload'

interface LenderData {
  company_name: string; postal_address: string; address: string; email: string
  phone: string; namfisa_license: string; logo_url: string
  authorized_signatory_name: string; authorized_signatory_title: string
  authorized_signatory_signature_url: string; late_fee_percentage: number
}
interface BorrowerData {
  id: string; first_name: string; last_name: string; id_number: string
  email: string; phone: string; postal_address: string; address: string
  marital_status: string; occupation: string; employer_name: string
  employer_tel: string; employer_address: string; payslip_employee_no: string
  bank_name: string; bank_branch: string; bank_account_no: string
  bank_account_type: string; reference1_name: string; reference1_tel: string
  reference2_name: string; reference2_tel: string; tel_no: string
}
interface LoanData {
  id: string; loan_number: string; lender_id: string
  principal_amount: number; interest_rate: number; term_months: number
  start_date: string; lender_name: string
}

const fmt = (n: number) => `N$ ${n.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const blank = (s?: string) => s || '___________________'

export default function LoanAgreementPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const agreementRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<Step>('review')
  const [signMethod, setSignMethod] = useState<SignMethod>('draw')
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [borrowerSigUrl, setBorrowerSigUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAgreementId, setSavedAgreementId] = useState('')

  const [lender, setLender] = useState<LenderData | null>(null)
  const [borrower, setBorrower] = useState<BorrowerData | null>(null)
  const [loan, setLoan] = useState<LoanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true); setError('')
    try {
      const email = localStorage.getItem('userName') || localStorage.getItem('userEmail') || ''
      if (!email) { setError('Please log in to view your agreement.'); setLoading(false); return }

      const { data: bData } = await supabase.from('borrowers').select('*').eq('email', email).maybeSingle()
      if (bData) setBorrower(bData as BorrowerData)

      const borrowerId = bData?.id
      const filter = borrowerId ? `borrower_id.eq.${borrowerId},borrower_email.eq.${email}` : `borrower_email.eq.${email}`
      const { data: lData } = await supabase.from('loans').select('*').eq('status', 'approved').or(filter).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (lData) {
        setLoan(lData as LoanData)
        if ((lData as any).lender_id) {
          const { data: lrData } = await supabase.from('lenders').select('*').eq('id', (lData as any).lender_id).maybeSingle()
          if (lrData) setLender(lrData as LenderData)
        } else if ((lData as any).lender_name) {
          const { data: lrData } = await supabase.from('lenders').select('*').ilike('company_name', (lData as any).lender_name).maybeSingle()
          if (lrData) setLender(lrData as LenderData)
        }
      }
    } catch (e: any) { setError(e.message || 'Error loading agreement') }
    setLoading(false)
  }

  // Derived loan values
  const principal = loan?.principal_amount || 0
  const rate = loan?.interest_rate || 0
  const term = loan?.term_months || 0
  const financeAmount = Math.round(principal * (rate / 100) * 100) / 100
  const totalRepayable = principal + financeAmount
  const instalment = term > 0 ? Math.round((totalRepayable / term) * 100) / 100 : 0
  const startDate = loan?.start_date ? new Date(loan.start_date) : new Date()
  const firstDue = new Date(startDate); firstDue.setMonth(firstDue.getMonth() + 1)
  const lastDue = new Date(startDate); lastDue.setMonth(lastDue.getMonth() + term)
  const penaltyRate = lender?.late_fee_percentage || 5
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-NA', { day: '2-digit', month: 'long', year: 'numeric' })
  const loanNum = loan?.loan_number || '___________'
  const borrowerName = borrower ? `${borrower.first_name} ${borrower.last_name}` : '___________________'

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return
    setIsDrawing(true)
    const ctx = c.getContext('2d')!
    ctx.beginPath(); ctx.moveTo(e.clientX - c.getBoundingClientRect().left, e.clientY - c.getBoundingClientRect().top)
  }
  const onDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a1a'
    ctx.lineTo(e.clientX - c.getBoundingClientRect().left, e.clientY - c.getBoundingClientRect().top); ctx.stroke()
    setHasSignature(true)
  }
  const stopDraw = () => setIsDrawing(false)
  const clearCanvas = () => {
    const c = canvasRef.current; if (!c) return
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setHasSignature(false)
  }
  const handleUploadSig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setBorrowerSigUrl(ev.target?.result as string); setHasSignature(true) }
    reader.readAsDataURL(file)
  }

  const handleSign = async () => {
    setSaving(true)
    try {
      let sigUrl = borrowerSigUrl
      if (signMethod === 'draw' && canvasRef.current) sigUrl = canvasRef.current.toDataURL('image/png')
      setBorrowerSigUrl(sigUrl)
      const lenderSigUrl = lender?.authorized_signatory_signature_url || ''
      const { data: saved } = await supabase.from('loan_agreements').insert({
        loan_id: loan?.id || null,
        borrower_id: borrower?.id || null,
        lender_id: loan ? (loan as any).lender_id : null,
        loan_number: loanNum,
        principal_amount: principal,
        finance_charge_rate: rate,
        finance_charge_amount: financeAmount,
        total_repayable: totalRepayable,
        instalment_amount: instalment,
        first_instalment_date: firstDue.toLocaleDateString('en-NA'),
        last_instalment_date: lastDue.toLocaleDateString('en-NA'),
        number_of_instalments: term,
        penalty_rate: penaltyRate,
        borrower_signature_url: sigUrl,
        borrower_signed_at: new Date().toISOString(),
        lender_signature_url: lenderSigUrl,
        lender_signed_at: new Date().toISOString(),
        status: 'complete',
      }).select('id').maybeSingle()
      if (saved?.id) setSavedAgreementId(saved.id)
      if (borrower?.id && sigUrl) await supabase.from('borrowers').update({ signature_url: sigUrl }).eq('id', borrower.id)
      setStep('complete')
    } catch (e: any) { alert('Error saving agreement: ' + e.message) }
    setSaving(false)
  }

  const handlePrint = () => {
    const el = agreementRef.current
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Loan Agreement - ${loanNum}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:10pt;color:#000;margin:20mm;line-height:1.5}
      h1{font-size:14pt;text-align:center;text-decoration:underline;text-transform:uppercase}
      h2{font-size:11pt;text-transform:uppercase;margin-top:16px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      td,th{border:1px solid #000;padding:6px 8px;font-size:9pt;vertical-align:top}
      th{background:#f0f0f0;font-weight:bold}
      .field{border-bottom:1px solid #000;display:inline-block;min-width:150px}
      .center{text-align:center}
      .bold{font-weight:bold}
      .sig-line{border-bottom:1px solid #000;width:200px;display:inline-block}
      @media print{body{margin:10mm}}
    </style></head><body>${el.innerHTML}</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm text-neutral-500">Loading your loan agreement...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900">Unable to Load Agreement</h2>
        <p className="text-sm text-neutral-500">{error}</p>
        <div className="flex gap-3">
          <Link href="/borrower" className="flex-1 py-2.5 bg-neutral-100 rounded-xl text-sm font-medium text-center">Back to Portal</Link>
          <button onClick={loadData} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">Try Again</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      <style>{`@media print{.no-print{display:none!important}body{margin:0}}`}</style>

      {/* Header - no-print */}
      <header className="no-print bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/borrower" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold">Loan Agreement — {loanNum}</span>
          </div>
          {step === 'complete' && (
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">
              <Printer className="w-4 h-4" /> Print / Download PDF
            </button>
          )}
          {step !== 'complete' && <div className="w-32" />}
        </div>
      </header>

      {/* Step indicator - no-print */}
      {step !== 'complete' && (
        <div className="no-print max-w-5xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2">
            {(['review','sign'] as Step[]).map((s,i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step===s?'bg-emerald-600 text-white':'bg-white text-neutral-400 border'}`}>
                  <span>{i+1}</span><span className="capitalize">{s==='review'?'Review Agreement':'Sign'}</span>
                </div>
                {i===0 && <div className="flex-1 h-0.5 bg-neutral-200 max-w-12" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── AGREEMENT DOCUMENT (always rendered, used for print) ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div ref={agreementRef} id="agreement-doc" className="bg-white shadow rounded-lg p-10 text-[10pt] text-black leading-relaxed font-['Arial',sans-serif] print:shadow-none print:rounded-none">

          {/* LENDER HEADER */}
          <div className="text-center mb-6 space-y-0.5">
            {lender?.logo_url && (
              <div className="flex justify-center mb-3">
                <img src={lender.logo_url} alt="Lender logo" className="h-16 object-contain" />
              </div>
            )}
            <p className="font-bold text-[13pt] underline">{lender?.company_name || 'Name of Microlender'}</p>
            <p className="font-bold">{lender?.postal_address || 'Postal Address'}</p>
            <p className="font-bold">{lender?.address || 'Physical Address'}</p>
            <p className="font-bold">{lender?.email || 'E-mail Address'}</p>
            <p className="font-bold">{lender?.phone || 'Contact Numbers'}</p>
          </div>

          <h1 className="text-center text-[14pt] font-bold underline mb-6">LOAN AGREEMENT</h1>

          {/* PREAMBLE */}
          <p className="font-bold mb-1">Preamble</p>
          <p className="mb-4">This loan agreement only applies to loans not exceeding a period of 5 months.</p>
          <p className="mb-6">Entered into between:</p>
          <p className="mb-6 text-center">
            <span className="font-bold">{lender?.company_name || '___________________'}</span>
            {' '}(&quot;the Lender&quot;) and{' '}
            <span className="font-bold">{borrowerName}</span>
            {' '}(&quot;the Borrower&quot;)
          </p>

          {/* BORROWER'S PERSONAL INFORMATION */}
          <p className="font-bold underline mb-3">BORROWER&apos;S PERSONAL INFORMATION:</p>
          <table className="w-full mb-1 border-0" style={{borderCollapse:'collapse'}}>
            <tbody>
              <tr>
                <td className="py-1 w-1/2 align-top">Postal address: <span className="border-b border-black inline-block min-w-[180px]">{borrower?.postal_address || ''}</span></td>
                <td className="py-1 align-top">Tel no: <span className="border-b border-black inline-block min-w-[120px]">{borrower?.tel_no || borrower?.phone || ''}</span></td>
              </tr>
              <tr>
                <td colSpan={2} className="py-1">Residential address: <span className="border-b border-black inline-block min-w-[350px]">{borrower?.address || ''}</span></td>
              </tr>
              <tr>
                <td className="py-1 align-top">Marital Status: <span className="border-b border-black inline-block min-w-[120px]">{borrower?.marital_status || ''}</span></td>
                <td className="py-1 align-top">I.D./Passport No: <span className="border-b border-black inline-block min-w-[150px]">{borrower?.id_number || ''}</span></td>
              </tr>
              <tr>
                <td className="py-1 align-top">Occupation: <span className="border-b border-black inline-block min-w-[130px]">{borrower?.occupation || ''}</span></td>
                <td className="py-1 align-top">Employer Tel no: <span className="border-b border-black inline-block min-w-[130px]">{borrower?.employer_tel || ''}</span></td>
              </tr>
              <tr>
                <td className="py-1 align-top">Employer Name: <span className="border-b border-black inline-block min-w-[140px]">{borrower?.employer_name || ''}</span></td>
                <td className="py-1 align-top">Employer Address: <span className="border-b border-black inline-block min-w-[140px]">{borrower?.employer_address || ''}</span></td>
              </tr>
              <tr>
                <td colSpan={2} className="py-1">Payslip/Employee No: <span className="border-b border-black inline-block min-w-[200px]">{borrower?.payslip_employee_no || ''}</span></td>
              </tr>
              <tr>
                <td className="py-1 align-top">Bank: <span className="border-b border-black inline-block min-w-[150px]">{borrower?.bank_name || ''}</span></td>
                <td className="py-1 align-top">Branch: <span className="border-b border-black inline-block min-w-[150px]">{borrower?.bank_branch || ''}</span></td>
              </tr>
              <tr>
                <td className="py-1 align-top">Bank Account No: <span className="border-b border-black inline-block min-w-[140px]">{borrower?.bank_account_no || ''}</span></td>
                <td className="py-1 align-top">Type of Account: <span className="border-b border-black inline-block min-w-[140px]">{borrower?.bank_account_type || ''}</span></td>
              </tr>
            </tbody>
          </table>

          <p className="font-bold mb-2 mt-4">References:</p>
          <table className="w-full mb-1 border-0" style={{borderCollapse:'collapse'}}>
            <tbody>
              {[{n:'1',name:borrower?.reference1_name,tel:borrower?.reference1_tel},{n:'2',name:borrower?.reference2_name,tel:borrower?.reference2_tel}].map(r=>(
                <tr key={r.n}>
                  <td className="py-1 w-8">{r.n}.</td>
                  <td className="py-1">Name: <span className="border-b border-black inline-block min-w-[180px]">{r.name||''}</span></td>
                  <td className="py-1">Tel No: <span className="border-b border-black inline-block min-w-[140px]">{r.tel||''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* LOAN AMOUNTS TABLE */}
          <table className="w-full border border-black mt-6 mb-2" style={{borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th className="border border-black p-2 text-center text-[9pt]">LOAN AMOUNT</th>
                <th className="border border-black p-2 text-center text-[9pt]">FINANCE CHARGES AT {rate}%<br /><span className="font-normal text-[8pt]">(INDICATE WHETHER THE RATE IS FIXED OR VARIABLE, WHICH RATE MAY NOT EXCEED 30% OF THE PRINCIPAL DEBT)</span></th>
                <th className="border border-black p-2 text-center text-[9pt]">TOTAL REPAYABLE</th>
                <th className="border border-black p-2 text-center text-[9pt]">INSTALMENT AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-[9pt]">
                  <p>Paid to Borrower</p>
                  <p className="mt-2">{principal > 0 ? fmt(principal) : 'N$'}</p>
                </td>
                <td className="border border-black p-2 text-[9pt]">
                  <p>{financeAmount > 0 ? fmt(financeAmount) : 'N$'}</p>
                </td>
                <td className="border border-black p-2 text-[9pt]">
                  <p>{totalRepayable > 0 ? fmt(totalRepayable) : 'N$'}</p>
                </td>
                <td className="border border-black p-2 text-[9pt] space-y-1">
                  <p>N$ {instalment > 0 ? instalment.toFixed(2) : '___'}</p>
                  <p>First instalment due date:<br />{firstDue.toLocaleDateString('en-NA')}</p>
                  <p>Last instalment due date:<br />{lastDue.toLocaleDateString('en-NA')}</p>
                  <p>Number of instalments: {term || '___'}</p>
                  <p>Frequency (monthly):</p>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-[9pt] italic mb-4">Penalty interest will be charged at {penaltyRate}% per month on the outstanding amount.<br />
          (The penalty interest may not exceed 5% per month and may not be charged for a period of more than three (3) months)</p>

          {/* PERIOD OF LOAN */}
          <p className="font-bold mb-2">PERIOD OF LOAN</p>
          <p className="mb-6">The Borrower shall repay the capital amount including interest (as stated above) on or before <span className="border-b border-black inline-block min-w-[180px]">{lastDue.toLocaleDateString('en-NA')}</span></p>

          {/* FIRST SIGNATURE BLOCK */}
          <p className="mb-4">I acknowledge that this agreement has been completed in full prior to my signature.</p>
          <SignatureBlock
            label="Borrower"
            place=""
            sigUrl={step === 'complete' ? borrowerSigUrl : ''}
            signedName={borrowerName}
          />
          <SignatureBlock
            label="Lender"
            place=""
            sigUrl={lender?.authorized_signatory_signature_url || ''}
            signedName={lender?.authorized_signatory_name || ''}
          />

          {/* TERMS & CONDITIONS */}
          <div className="mt-10 border-t-2 border-black pt-6">
            <h2 className="text-center font-bold underline text-[12pt] mb-6">TERMS &amp; CONDITIONS</h2>

            <TC n="1" title="Confidentiality">
              <p className="mb-2">The microlender may not, without the express consent of the loan applicant / borrower and apart from disclosing relevant information to a registered credit bureau, disclose any confidential information obtained in the course of a microlending transaction other than if it is required by a court order from a court with competent jurisdiction; and</p>
              <p>The microlender may not, without the express written consent of the loan applicant / borrower, obtain from or to disclose to a third party, other than a registered credit bureau, the loan applicant / borrower&apos;s credit record and payment history.</p>
            </TC>

            <TC n="2" title="Legal Costs">
              <p>The microlender may not collect or attempt to collect legal costs in excess of costs allowed on a party and party scale in terms of the Magistrates&apos; Courts Act, 1944 (Act No. 32 of 1944) or the High Court Act, 1990 (Act No. 16 of 1990).</p>
            </TC>

            <TC n="3" title="Consent to Judgment and Emolument Attachment Orders">
              <p>Any consent to judgment forms or emolument attachment orders obtained prior to the borrower defaulting, is considered void and not enforceable;</p>
            </TC>

            <TC n="4" title="Dispute Resolution">
              <p>Complaints, which cannot be resolved between the microlender and the borrower, should be referred to NAMFISA. Attached is the complaints procedure, marked &quot;Annexure A&quot;, which forms part of the agreement.</p>
            </TC>

            <TC n="5" title="Cooling Off">
              <p>The borrower may cancel the microlending transaction within three (3) business days after signing of the loan agreement, provided that the loan amount and pro rata finance charges in terms of section 26(2) of the Act at the rate applicable to that microlending transaction, be repaid simultaneously.</p>
            </TC>

            <TC n="6" title="Prepayment of Instalments and Principal Debt">
              <p>The borrower may make additional payments or settle the outstanding balance early in one or more payments without any penalties being levied for early settlement and that the microlender may, in such event, only stipulate for demand or receive from the borrower pro rata finance charges at the rate applicable to that microlending transaction.</p>
            </TC>

            <TC n="7" title="The Whole Contract">
              <p>No addition to or variation of the agreement shall be of any force and effect unless the change reduces the borrower&apos;s liabilities under the agreement or the change is recorded in writing and signed by both parties; and</p>
            </TC>

            <TC n="8" title="Governing Law">
              <p>The agreement shall be governed in all respects by the laws of the Republic of Namibia.</p>
            </TC>

            <TC n="9" title="Disclosure">
              <p className="mb-2">9.1. The microlender must, at every licensed premises where the microlender conducts the microlending business &ndash;</p>
              <div className="ml-4 space-y-2 mb-3">
                <p>9.1.1. keep available a copy of the Microlending Act, 2018 (Act No. 7 of 2018) (&quot;the Act&quot;), the regulations and the standards issued under the Act which must, on request, be made available to the loan applicant or borrower for perusal. The microlender must further draw the attention of the loan applicant or borrower to section 23 of the Act, which provides for prohibited conduct of a microlender.</p>
                <p>9.1.2. keep available a copy of the complaint procedures as required by the standards, which must be made available to the borrower on request.</p>
                <p>9.1.3. keep available copies of the complaint intake forms as required by the standards, which must be made available to the borrower on request.</p>
                <p>9.1.4. display prominently, in the form of an A3 poster, the complaint Procedures as required by the standards.</p>
                <p>9.1.5. display in a form required by the standards the maximum finance charges determined by the Registrar in terms of the Usury Act; and</p>
                <p>9.1.6. display prominently the registration certificate of the microlender issued by NAMFISA.</p>
              </div>
              <p className="mb-2">9.2. The microlender must, before the conclusion of the microlending transaction &ndash;</p>
              <div className="ml-4 space-y-2 mb-3">
                <p>9.2.1. Provide the loan applicant with a schedule in writing setting out &ndash;</p>
                <div className="ml-4 space-y-1">
                  <p>9.2.1.1. the principal debt in Namibia Dollars and cents;</p>
                  <p>9.2.1.2. the amount of finance charges in Namibia Dollars and cents at the applicable rate over the repayment period and the elements comprising the finance charges;</p>
                  <p>9.2.1.3. the total amount repayable in Namibia Dollars and cents at the then current interest rate, over the repayment period;</p>
                  <p>9.2.1.4. the finance charge rate, whether this is fixed or variable and, if variable, how it may vary;</p>
                  <p>9.2.1.5. the nature and amount of any insurance, if required, including the name of the insurer and the amount of the premiums payable;</p>
                  <p>9.2.1.6. the penalty interest and any additional costs that would become payable in the case of default by the loan applicant and how that would be calculated;</p>
                  <p>9.2.1.7. the instalment amount in Namibia Dollars and cents, at the then current interest rate, and the number of instalments;</p>
                  <p>9.2.1.8. the period of the microlending transaction; and</p>
                  <p>9.2.1.9. any other costs and expenses;</p>
                </div>
                <p>9.2.2. allow the loan applicant an opportunity to read the agreement, or have it read to the loan applicant if he or she is illiterate.</p>
                <p>9.2.3. allow the loan applicant an opportunity to read the agreement, or have it read to the loan applicant if he or she is illiterate.</p>
              </div>
              <p className="mb-2">9.2.4. The microlender must, after the conclusion of the microlending transaction &ndash;</p>
              <div className="ml-4 space-y-2 mb-3">
                <p>9.2.4.1. provide the borrower, at no cost, with a copy of the signed loan agreement before or at the time of advancing and, if applicable, a copy of the insurance contract pertaining to the microlending transaction; and</p>
                <p>9.2.4.2. provide the borrower with a written or electronic statement, the frequency and the costs of which is to be as required by the standards, of his or her loan position setting out all the charges levied, all the payments made and the balance outstanding.</p>
              </div>
              <p className="mb-2">9.2.5. The microlender must, at the request of the borrower, provide the borrower with a statement setting out all the charges levied, all the payments made and the balance outstanding, and may impose a charge for the provision of a duplicate copy of the statement but in no case may the charge exceed the amount per page of the statement as required by the standards.</p>
              <p className="mb-2">9.2.6. If the microlender refuses to approve a loan application based on the reason of an adverse credit record, then the name and details of the credit bureau must be provided to the loan applicant so as to enable the loan applicant to check the accuracy of the credit information held by the credit bureau.</p>
              <p>9.2.7. The microlender must, at least 28 days before the microlender forwards any adverse information on the borrower to a credit bureau, which information will be capable of being accessed by subscribers to this credit bureau, inform the borrower by way of a notice addressed to the chosen address of the borrower of the intention of the microlender to do so.</p>
            </TC>
          </div>

          {/* SECOND SIGNATURE BLOCK (end of T&Cs) */}
          <div className="mt-8">
            <p className="mb-6">I acknowledge that this agreement has been completed in full prior to my signature.</p>
            <SignatureBlock label="Borrower" place="" sigUrl={step === 'complete' ? borrowerSigUrl : ''} signedName={borrowerName} />
            <SignatureBlock label="Lender" place="" sigUrl={lender?.authorized_signatory_signature_url || ''} signedName={lender?.authorized_signatory_name || ''} />
          </div>

          {/* ANNEXURE A */}
          <div className="mt-12 border-t-2 border-black pt-8">
            <h2 className="text-center font-bold text-[13pt] mb-2">&quot;Annexure A&quot;</h2>
            <h2 className="text-center font-bold underline text-[12pt] mb-6">COMPLAINTS PROCEDURES</h2>
            <p className="mb-3">The Namibia Financial Institutions Supervisory Authority (NAMFISA) regulates and supervises financial institutions including microlenders.</p>
            <p className="mb-3">Microlenders are regulated under the provisions of the Microlending Act.</p>
            <p className="mb-3">The inspection of microlenders is coordinated in accordance with the Inspection of Financial Institutions Act, 1984 (Act No. 38 of 1984).</p>
            <p className="mb-6">If a microlender has treated you unfairly, you may complain to NAMFISA by filling out a <em>Complaint Intake Form</em>. You can get a <em>Complaint Intake Form</em> from your microlender. Please ask for a form.</p>
            <p className="font-bold mb-4">PLEASE FOLLOW THESE STEPS BEFORE MAKING A COMPLAINT WITH NAMFISA</p>
            <p className="font-bold text-center mb-2">Step I</p>
            <p className="mb-4">First, take up the matter with the fronting staff of the Microlender. State the problem and ask for a solution. Specifically ask if the staff is able to resolve the complaint.</p>
            <p className="font-bold text-center mb-2">Step II</p>
            <p className="mb-4">If the staff is unable to resolve the complaint, make an appointment with the Principal Officer/Owner of the Microlending business. Put the problem in writing, ask for a solution within a certain period and hand the complaint to the Principal Officer/Owner at the day at the meeting. If the Principal Officer/Owner does not want to meet you or cannot give you a date within a reasonable time for a meeting, go to Step III.</p>
            <p className="font-bold text-center mb-2">Step III</p>
            <p className="mb-3">If the microlender fails to reply or the complainant is not satisfied with the reply, or could not meet with the Principal Officer/Owner:</p>
            <ul className="list-disc ml-6 space-y-2 mb-4">
              <li>Complete a <em>Complaint Intake Form</em>.</li>
              <li>Give the Complaint Intake Form plus any relevant supporting documents to the Consumer Complaints and Education Department of NAMFISA.</li>
              <li>Should you want to make the complaint by e-mail, send it to <strong>complaints@namfisa.com.na</strong> and mail the relevant supporting documentation to NAMFISA at the following postal address:<br />
                <span className="ml-4 block mt-1">The Registrar<br />NAMFISA<br />P.O Box 21250<br />Windhoek<br /><strong>NAMIBIA</strong></span>
              </li>
              <li>Alternatively, submit the supporting documentation personally to:<br />
                <span className="ml-4 block mt-1">The Registrar<br />NAMFISA<br />Gutenberg Plaza, Upper Ground Floor<br />51-55 Werner List Street<br /><strong>WINDHOEK</strong></span>
              </li>
              <li>Refer to the e-mail complaint, particularly the date when it was sent.</li>
              <li>NAMFISA shall study the complaint and inform the complainant of the appropriate action.</li>
            </ul>
          </div>
        </div>

        {/* ── CONTROLS (no-print) ── */}
        <div className="no-print mt-6 space-y-4">

          {/* STEP: review */}
          {step === 'review' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-neutral-300" />
                <span className="text-sm text-neutral-700">I have carefully read and understood this entire loan agreement including all terms and conditions, and I agree to be bound by them.</span>
              </label>
              <button onClick={() => setStep('sign')} disabled={!agreedToTerms}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                <Pen className="w-4 h-4" /> Proceed to Sign Agreement
              </button>
            </div>
          )}

          {/* STEP: sign */}
          {step === 'sign' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">Sign the Agreement</h3>
                <p className="text-sm text-neutral-500">Choose how you would like to provide your digital signature.</p>
              </div>

              {/* Method selector */}
              <div className="flex gap-2">
                {([['draw','Draw Signature',Pen],['upload','Upload / Photo',Upload]] as const).map(([m,label,Icon])=>(
                  <button key={m} onClick={()=>{setSignMethod(m as SignMethod);setHasSignature(false);setBorrowerSigUrl('')}}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${signMethod===m?'border-emerald-500 bg-emerald-50 text-emerald-700':'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              {signMethod === 'draw' && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Draw your signature below using your mouse or finger (touch):</p>
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden">
                    <canvas ref={canvasRef} width={600} height={160} className="w-full cursor-crosshair touch-none"
                      onMouseDown={startDraw} onMouseMove={onDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-[10px] text-neutral-400">Sign above ↑</p>
                    <button onClick={clearCanvas} className="text-xs text-red-500 hover:text-red-700">Clear</button>
                  </div>
                </div>
              )}

              {signMethod === 'upload' && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Upload a photo or scanned image of your handwritten signature:</p>
                  <label className="block border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                    {borrowerSigUrl ? (
                      <img src={borrowerSigUrl} alt="Your signature" className="h-20 object-contain mx-auto" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-neutral-400 mx-auto" />
                        <p className="text-sm text-neutral-500">Click to upload signature image</p>
                        <p className="text-xs text-neutral-400">JPG, PNG accepted</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadSig} />
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('review')} className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700">
                  ← Back to Review
                </button>
                <button onClick={handleSign} disabled={!hasSignature || saving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                  {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Sign &amp; Complete</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP: complete */}
          {step === 'complete' && (
            <div className="bg-white rounded-xl shadow p-8 text-center space-y-5">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Agreement Signed Successfully!</h2>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                Your loan agreement <strong>{loanNum}</strong> has been digitally signed and saved.
                Both lender and borrower signatures have been applied.
              </p>
              <div className="bg-neutral-50 rounded-xl p-5 max-w-sm mx-auto space-y-2 text-sm text-left">
                <div className="flex justify-between"><span className="text-neutral-500">Loan</span><span className="font-medium">{loanNum}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Amount</span><span className="font-medium">{fmt(principal)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Signed</span><span className="font-medium">{todayStr}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Status</span><span className="text-emerald-600 font-semibold">Complete</span></div>
              </div>
              <div className="flex gap-3 max-w-sm mx-auto">
                <Link href="/borrower" className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-center">
                  Back to Portal
                </Link>
                <button onClick={handlePrint} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TC({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-bold mb-1">{n}. {title}</p>
      <div className="text-[9.5pt] leading-relaxed ml-4">{children}</div>
    </div>
  )
}

function SignatureBlock({ label, place, sigUrl, signedName }: { label: string; place: string; sigUrl: string; signedName: string }) {
  const today = new Date()
  return (
    <div className="mb-8">
      <p className="mb-3">Signed at <span className="border-b border-black inline-block min-w-[120px]">{place}</span> on this <span className="border-b border-black inline-block min-w-[30px]">{today.getDate()}</span> day of <span className="border-b border-black inline-block min-w-[80px]">{today.toLocaleDateString('en-NA',{month:'long'})}</span> 20<span className="border-b border-black inline-block min-w-[30px]">{String(today.getFullYear()).slice(2)}</span></p>
      <p className="mb-4">Witness:</p>
      <div className="flex items-end gap-8">
        <div>
          <div className="border-b border-black w-40 mb-1" />
          <p className="text-[9pt]">Witness</p>
        </div>
        <div>
          {sigUrl ? (
            <img src={sigUrl} alt={`${label} signature`} className="h-12 object-contain border-b border-black" />
          ) : (
            <div className="border-b border-black w-48 h-12 mb-0" />
          )}
          <p className="text-[9pt]">(Signature of {label})</p>
          {signedName && <p className="text-[8pt] text-neutral-600">{signedName}</p>}
        </div>
      </div>
    </div>
  )
}
