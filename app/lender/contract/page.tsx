"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FileText, CheckCircle, Download, Printer, RefreshCw, AlertCircle,
  Clock, XCircle, Pen, Trash2, Lock, Info
} from 'lucide-react'

type SignMethod = 'draw' | 'type'
type ContractStatus = 'none' | 'pending' | 'under_review' | 'approved' | 'rejected'

interface LenderInfo {
  id: string
  legal_name: string
  company_name: string
  registration_number: string
  email: string
  phone: string
  address: string
  postal_address: string
  authorized_signatory_name: string
  authorized_signatory_title: string
}

function LenderContractContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectReason = searchParams.get('reason')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signMethod, setSignMethod] = useState<SignMethod>('draw')
  const [typedSig, setTypedSig] = useState('')

  const [lender, setLender] = useState<LenderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contractStatus, setContractStatus] = useState<ContractStatus>('none')
  const [rejectionReason, setRejectionReason] = useState('')
  const [existingContractId, setExistingContractId] = useState('')
  const [sigDataUrl, setSigDataUrl] = useState('')

  const [form, setForm] = useState({
    legal_name: '', registration_number: '', authorized_rep: '',
    position_title: '', business_email: '', business_phone: '', business_address: '',
    bank_name: '', bank_branch: '', branch_code: '', account_holder: '',
    account_number: '', account_type: 'Cheque / Current',
    billing_frequency: 'Monthly', preferred_debit_date: '', subscription_amount: '',
    signatory_name: '', signatory_title: '',
  })

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedAuthority, setAcceptedAuthority] = useState(false)
  const [acceptedDebit, setAcceptedDebit] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const lenderId = localStorage.getItem('lenderId')
      const email = localStorage.getItem('userName') || localStorage.getItem('userEmail') || ''
      let lQuery = supabase.from('lenders').select('*')
      if (lenderId) lQuery = lQuery.eq('id', lenderId)
      else if (email) lQuery = lQuery.eq('email', email)
      const { data: lData } = await lQuery.maybeSingle()
      if (lData) {
        setLender(lData as LenderInfo)
        setForm(f => ({
          ...f,
          legal_name: lData.legal_name || lData.company_name || '',
          registration_number: lData.registration_number || '',
          authorized_rep: lData.authorized_signatory_name || '',
          position_title: lData.authorized_signatory_title || '',
          business_email: lData.email || email,
          business_phone: lData.phone || '',
          business_address: lData.address || lData.postal_address || '',
          signatory_name: lData.authorized_signatory_name || '',
          signatory_title: lData.authorized_signatory_title || '',
        }))
        const lid = lData.id || lenderId
        if (lid) {
          const { data: cData } = await supabase.from('lender_contracts')
            .select('id, status, rejection_reason')
            .eq('lender_id', lid)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (cData) {
            setContractStatus(cData.status as ContractStatus)
            setExistingContractId(cData.id)
            if (cData.rejection_reason) setRejectionReason(cData.rejection_reason)
          }
        }
      }
    } catch (e: unknown) { console.error(e) }
    setLoading(false)
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return
    setIsDrawing(true)
    const rect = c.getBoundingClientRect()
    const ctx = c.getContext('2d')!
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }
  const onDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a1a'
    const rect = c.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    setHasSignature(true)
    setSigDataUrl(c.toDataURL('image/png'))
  }
  const stopDraw = () => setIsDrawing(false)
  const clearCanvas = () => {
    const c = canvasRef.current; if (!c) return
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setHasSignature(false)
    setSigDataUrl('')
  }

  const canSubmit = acceptedTerms && acceptedAuthority && acceptedDebit &&
    form.legal_name.trim() !== '' && form.signatory_name.trim() !== '' &&
    (signMethod === 'type' ? typedSig.trim().length > 2 : hasSignature)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      const finalSigUrl = signMethod === 'draw' ? sigDataUrl : `typed:${typedSig}`
      const lenderId = lender?.id || localStorage.getItem('lenderId')
      const payload = {
        lender_id: lenderId,
        ...form,
        preferred_debit_date: form.preferred_debit_date ? parseInt(form.preferred_debit_date) : null,
        subscription_amount: form.subscription_amount ? parseFloat(form.subscription_amount) : null,
        signature_url: finalSigUrl,
        signed_at: new Date().toISOString(),
        accepted_terms: acceptedTerms,
        accepted_authority: acceptedAuthority,
        accepted_debit: acceptedDebit,
        status: 'pending',
        agreement_version: 'v1.0',
      }
      if (existingContractId) {
        await supabase.from('lender_contracts')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', existingContractId)
      } else {
        const { data } = await supabase.from('lender_contracts')
          .insert(payload).select('id').maybeSingle()
        if (data?.id) setExistingContractId(data.id)
      }
      setContractStatus('pending')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      alert('Error submitting: ' + msg)
    }
    setSaving(false)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  if (loading) return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-cashub-600 animate-spin" />
    </div>
  )

  const ReasonBanner = () => {
    if (!redirectReason || redirectReason === 'pending') return null
    if (contractStatus === 'approved') return null
    const msgs: Record<string, { bg: string; icon: React.ReactNode; text: string }> = {
      required: { bg: 'bg-orange-50 border-orange-300', icon: <Lock className="w-5 h-5 text-orange-600 flex-shrink-0" />, text: 'You must complete and sign this Platform Contract before you can access your CasHuB portal. Please fill in all fields, accept the terms, sign, and submit.' },
      rejected: { bg: 'bg-red-50 border-red-300', icon: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />, text: 'Your previous contract submission was rejected. Please review the reason below, correct the details, and resubmit.' },
    }
    const m = msgs[redirectReason]
    if (!m) return null
    return (
      <div className={`no-print border-2 rounded-xl p-4 flex items-start gap-3 mb-6 ${m.bg}`}>
        {m.icon}
        <div>
          <p className="font-bold text-sm text-neutral-900 mb-0.5">Contract Required to Access Portal</p>
          <p className="text-sm text-neutral-700">{m.text}</p>
        </div>
      </div>
    )
  }

  if (contractStatus === 'approved') return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Contract Approved</h2>
        <p className="text-sm text-neutral-500">Your platform participation agreement has been approved. You now have full access to the CasHuB portal.</p>
        <button onClick={() => router.push('/lender')}
          className="w-full py-3 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold">
          Go to Dashboard
        </button>
      </div>
    </div>
  )

  if (contractStatus === 'pending' || contractStatus === 'under_review') return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Contract Under Review</h2>
        <p className="text-sm text-neutral-500">Your signed platform agreement has been submitted and is awaiting review by the CasHuB admin team. You will receive access once approved.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 text-left space-y-1">
          <p><strong>Status:</strong> Pending Admin Review</p>
          <p><strong>Agreement Version:</strong> v1.0</p>
          <p><strong>Submitted by:</strong> {form.signatory_name || localStorage.getItem('userName')}</p>
        </div>
        <button onClick={() => window.print()}
          className="w-full py-2.5 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 flex items-center justify-center gap-2 hover:bg-neutral-50">
          <Printer className="w-4 h-4" /> Print / Download Copy
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      <style>{`@media print { .no-print { display: none !important } body { background: white } }`}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-20 bg-white border-b-2 border-red-800 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/cashub-icon.svg" alt="CasHuB" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-red-900 text-sm">CasHuB Lender Contract &amp; Bank Authorization</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {contractStatus === 'rejected' && (
        <div className="no-print bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <strong>Your previous submission was rejected.</strong>
            {rejectionReason && <> Reason: {rejectionReason}.</>} Please review, update and resubmit below.
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto my-6 px-4 pb-16" id="contractDocument">
        <ReasonBanner />
        {/* Brand Header */}
        <div className="bg-white rounded-2xl shadow p-8 mb-5 border-2 border-red-800">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Image src="/cashub-icon.svg" alt="CasHuB" width={64} height={64} className="rounded-xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-900">CasHuB Lender Subscription &amp; Platform Participation Agreement</h1>
              <p className="text-sm text-neutral-600 mt-1"><strong>Legal Company Name:</strong> Xtreme Group Empire</p>
              <p className="text-sm text-neutral-600"><strong>Trading / Platform Name:</strong> CasHuB</p>
              <p className="text-xs text-neutral-500 mt-2">This agreement is between <strong>Xtreme Group Empire, herein trading as CasHuB</strong>, and the registered lender/subscriber.</p>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <Section n="1" title="Lender Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Lender Legal Name *" value={form.legal_name} onChange={set('legal_name')} />
            <Field label="Registration Number" value={form.registration_number} onChange={set('registration_number')} />
            <Field label="Authorized Representative" value={form.authorized_rep} onChange={set('authorized_rep')} />
            <Field label="Position / Title" value={form.position_title} onChange={set('position_title')} />
            <Field label="Business Email" type="email" value={form.business_email} onChange={set('business_email')} />
            <Field label="Business Phone" value={form.business_phone} onChange={set('business_phone')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Business Address</label>
            <textarea value={form.business_address} onChange={set('business_address')} rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 resize-none" />
          </div>
        </Section>

        {/* Section 2 */}
        <Section n="2" title="Agreement Summary">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-sm text-neutral-700 space-y-3 leading-relaxed">
            <p>This Agreement is entered into between <strong>Xtreme Group Empire, herein as CasHuB</strong> (&quot;CasHuB&quot;), and the subscribing lending institution (&quot;Lender&quot;). CasHuB is a technology platform provider and shared lending ecosystem administrator.</p>
            <p>The subscription term is <strong>twelve (12) months</strong> and shall <strong>automatically renew for successive 12-month periods</strong> unless either party gives written notice of non-renewal at least <strong>30 calendar days</strong> before the end of the current term.</p>
            <p>The Lender agrees to use the platform lawfully, protect borrower data, comply with all applicable laws, and only use shared registry or blacklist tools in good faith and with lawful authority.</p>
          </div>
        </Section>

        {/* Section 3 */}
        <Section n="3" title="Subscription & Auto-Renewal Acceptance">
          <div className="space-y-3">
            <CheckRow checked={acceptedTerms} onChange={setAcceptedTerms}
              label="I confirm that I have read, understood, and agree to the CasHuB Lender Subscription & Platform Participation Agreement, including the 12-month automatic renewal terms." />
            <CheckRow checked={acceptedAuthority} onChange={setAcceptedAuthority}
              label="I confirm that the individual completing this form is duly authorized to bind the lender institution to this agreement." />
          </div>
        </Section>

        {/* Section 4 */}
        <Section n="4" title="Bank Authorization (Debit Order / Subscription Collection Consent)">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-sm text-neutral-700 space-y-3 leading-relaxed mb-5">
            <p>By completing this section, the Lender authorizes <strong>Xtreme Group Empire, herein as CasHuB</strong>, or its designated payment processor, to debit the lender&apos;s nominated bank account for subscription fees, renewal fees, and any other approved platform charges.</p>
            <p>This authority remains valid for the duration of the agreement and any renewal period, unless cancelled in writing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Name" value={form.bank_name} onChange={set('bank_name')} />
            <Field label="Branch Name" value={form.bank_branch} onChange={set('bank_branch')} />
            <Field label="Branch Code" value={form.branch_code} onChange={set('branch_code')} />
            <Field label="Account Holder Name" value={form.account_holder} onChange={set('account_holder')} />
            <Field label="Account Number" value={form.account_number} onChange={set('account_number')} />
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Account Type</label>
              <select value={form.account_type} onChange={set('account_type')}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 bg-white">
                <option>Cheque / Current</option>
                <option>Savings</option>
                <option>Business Account</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Billing Frequency</label>
              <select value={form.billing_frequency} onChange={set('billing_frequency')}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 bg-white">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
            <Field label="Preferred Debit Date (1–31)" type="number" value={form.preferred_debit_date} onChange={set('preferred_debit_date')} placeholder="e.g. 5" />
            <Field label="Subscription Amount (N$)" type="number" value={form.subscription_amount} onChange={set('subscription_amount')} placeholder="0.00" />
          </div>
          <div className="mt-4">
            <CheckRow checked={acceptedDebit} onChange={setAcceptedDebit}
              label="I authorize CasHuB to debit the above bank account for subscription and renewal charges in accordance with this agreement and approved invoices." />
          </div>
        </Section>

        {/* Section 5 */}
        <Section n="5" title="Required Supporting Documents">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <ul className="space-y-2 text-sm text-neutral-700">
              {[
                'Company Registration Documents',
                'Proof of Bank Account / Cancelled Cheque / Bank Confirmation Letter',
                'ID of Authorized Representative',
                'Regulatory / Lending License (NAMFISA, if applicable)',
                'Proof of Business Address',
              ].map(doc => (
                <li key={doc} className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-700 flex-shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-400 mt-3">Please email supporting documents to <strong>admin@cashub.com</strong> quoting your company name.</p>
          </div>
        </Section>

        {/* Section 6 – Signature */}
        <Section n="6" title="Digital Signature & Declaration">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Field label="Authorized Representative Full Name *" value={form.signatory_name} onChange={set('signatory_name')} />
            <Field label="Date" type="date" value={new Date().toISOString().split('T')[0]} onChange={() => { /* read-only */ }} readOnly />
            <Field label="Position / Title" value={form.signatory_title} onChange={set('signatory_title')} />
          </div>

          <div className="no-print flex gap-2 mb-4">
            {(['draw', 'type'] as SignMethod[]).map(m => (
              <button key={m} onClick={() => { setSignMethod(m); clearCanvas(); setTypedSig('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${signMethod === m ? 'border-red-700 bg-red-50 text-red-800' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                <Pen className="w-3.5 h-3.5" />
                {m === 'draw' ? 'Draw Signature' : 'Type Signature'}
              </button>
            ))}
          </div>

          {signMethod === 'draw' && (
            <div className="no-print">
              <p className="text-xs text-neutral-500 mb-2">Draw your signature using mouse or touch:</p>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden">
                <canvas ref={canvasRef} width={700} height={140} className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDraw} onMouseMove={onDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[10px] text-neutral-400">Sign above ↑</p>
                <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
          )}

          {signMethod === 'type' && (
            <div className="no-print">
              <p className="text-xs text-neutral-500 mb-2">Type your full name as your digital signature:</p>
              <input type="text" value={typedSig}
                onChange={e => { setTypedSig(e.target.value); setHasSignature(e.target.value.trim().length > 2) }}
                placeholder="Type your full name here..."
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl text-lg italic text-neutral-800 focus:ring-2 focus:ring-red-400 focus:border-red-400" />
            </div>
          )}

          {(sigDataUrl || typedSig) && (
            <div className="mt-4 border border-neutral-200 rounded-xl p-4">
              <p className="text-xs text-neutral-500 mb-2">Signature preview:</p>
              {signMethod === 'draw' && sigDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sigDataUrl} alt="Signature" className="h-14 object-contain border-b border-neutral-300" />
              ) : (
                <p className="text-xl italic border-b border-neutral-300 pb-1 text-neutral-800">{typedSig}</p>
              )}
              <p className="text-[10px] text-neutral-400 mt-1">
                {form.signatory_name} — {new Date().toLocaleDateString('en-NA', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </Section>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-xs text-amber-800">
          <strong>Legal Notice:</strong> This agreement is a professional platform participation contract. Before live use, it should be reviewed by a Namibian legal professional regarding bank debit authorization, auto-renewal, data-sharing, and borrower registry clauses.
        </div>

        <div className="no-print mt-8 flex flex-col items-center gap-3">
          {!canSubmit && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Please complete all required fields, accept all terms, and provide your signature before submitting.
            </div>
          )}
          <button onClick={handleSubmit} disabled={!canSubmit || saving}
            className="w-full max-w-md py-4 bg-red-800 hover:bg-red-900 text-white rounded-2xl text-base font-bold disabled:opacity-40 flex items-center justify-center gap-3 transition-all shadow-lg">
            {saving
              ? <><RefreshCw className="w-5 h-5 animate-spin" /> Submitting...</>
              : <><CheckCircle className="w-5 h-5" /> Sign &amp; Submit Agreement</>}
          </button>
          <p className="text-xs text-neutral-400 text-center">By submitting, you digitally sign this agreement. Portal access will be activated after admin approval.</p>
        </div>
      </div>
    </div>
  )
}

export default function LenderContractPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center"><RefreshCw className="w-8 h-8 text-cashub-600 animate-spin" /></div>}>
      <LenderContractContent />
    </Suspense>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-5">
      <h2 className="text-base font-bold text-red-900 mb-4 pb-2 border-b border-neutral-100">
        {n}. {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', readOnly = false }:
  { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; readOnly?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        className={`w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 ${readOnly ? 'bg-neutral-50 text-neutral-500' : 'bg-white'}`} />
    </div>
  )
}

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-red-700 border-red-700' : 'border-neutral-300 group-hover:border-red-400'}`}
        onClick={() => onChange(!checked)}>
        {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="text-sm text-neutral-700 leading-relaxed">{label}</span>
    </label>
  )
}
