"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Save, CheckCircle, Building, Mail, Phone, Globe, MapPin, FileText, Upload, Pen, Trash2, User } from 'lucide-react'

export default function LenderSettingsPage() {
  const [form, setForm] = useState({ company_name: '', email: '', phone: '', address: '', postal_address: '', city: '', namfisa_license: '', website: '', about: '', authorized_signatory_name: '', authorized_signatory_title: '', late_fee_percentage: '5' })
  const [lending, setLending] = useState({ min_loan_amount: '', max_loan_amount: '', avg_interest_rate: '', approval_rate: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [sigSignatureUrl, setSigSignatureUrl] = useState('')
  const [sigDrawing, setSigDrawing] = useState(false)
  const [sigHasDraw, setSigHasDraw] = useState(false)
  const sigCanvasRef = React.useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMounted(true)
    setForm({
      company_name: localStorage.getItem('lenderCompany') || '',
      email: localStorage.getItem('lenderEmail') || localStorage.getItem('userName') || '',
      phone: localStorage.getItem('lenderPhone') || '',
      address: localStorage.getItem('lenderAddress') || '',
      postal_address: localStorage.getItem('lenderPostal') || '',
      city: localStorage.getItem('lenderCity') || '',
      namfisa_license: localStorage.getItem('lenderLicense') || '',
      website: localStorage.getItem('lenderWebsite') || '',
      about: localStorage.getItem('lenderAbout') || '',
      authorized_signatory_name: localStorage.getItem('lenderSignatoryName') || '',
      authorized_signatory_title: localStorage.getItem('lenderSignatoryTitle') || '',
      late_fee_percentage: localStorage.getItem('lenderLateFee') || '5',
    })
    setLogoUrl(localStorage.getItem('lenderLogo') || '')
    setSigSignatureUrl(localStorage.getItem('lenderSigSignature') || '')
    // Load lending parameters from Supabase
    const loadLendingParams = async () => {
      try {
        const userEmail = localStorage.getItem('userName') || ''
        const lenderId = localStorage.getItem('lenderId')
        let q = supabase.from('lenders').select('min_loan_amount, max_loan_amount, avg_interest_rate, approval_rate')
        if (lenderId) q = q.eq('id', lenderId)
        else q = q.eq('email', userEmail)
        const { data } = await q.maybeSingle()
        if (data) {
          setLending({
            min_loan_amount: String(data.min_loan_amount || ''),
            max_loan_amount: String(data.max_loan_amount || ''),
            avg_interest_rate: String(data.avg_interest_rate || ''),
            approval_rate: String(data.approval_rate || ''),
          })
          setForm(prev => ({
            ...prev,
            postal_address: (data as any).postal_address || prev.postal_address,
            authorized_signatory_name: (data as any).authorized_signatory_name || prev.authorized_signatory_name,
            authorized_signatory_title: (data as any).authorized_signatory_title || prev.authorized_signatory_title,
            late_fee_percentage: String((data as any).late_fee_percentage || '5'),
          }))
          if ((data as any).authorized_signatory_signature_url) {
            setSigSignatureUrl((data as any).authorized_signatory_signature_url)
          }
        }
      } catch (err) { console.error('Settings fetch error:', err) }
    }
    loadLendingParams()
  }, [])

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      setLogoUrl(base64)
      localStorage.setItem('lenderLogo', base64)
      // Save to Supabase if lender record exists
      try {
        const userEmail = localStorage.getItem('userName') || ''
        const { data: existing } = await supabase.from('lenders').select('id').eq('email', userEmail).maybeSingle()
        if (existing) {
          await supabase.from('lenders').update({ logo_url: base64 }).eq('id', existing.id)
        }
      } catch { /* fallback to localStorage only */ }
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    try {
      localStorage.setItem('lenderCompany', form.company_name)
      localStorage.setItem('lenderEmail', form.email)
      localStorage.setItem('lenderPhone', form.phone)
      localStorage.setItem('lenderAddress', form.address)
      localStorage.setItem('lenderCity', form.city)
      localStorage.setItem('lenderLicense', form.namfisa_license)
      localStorage.setItem('lenderWebsite', form.website)
      localStorage.setItem('lenderAbout', form.about)
      localStorage.setItem('lenderPostal', form.postal_address)
      localStorage.setItem('lenderSignatoryName', form.authorized_signatory_name)
      localStorage.setItem('lenderSignatoryTitle', form.authorized_signatory_title)
      localStorage.setItem('lenderLateFee', form.late_fee_percentage)
      if (sigSignatureUrl) localStorage.setItem('lenderSigSignature', sigSignatureUrl)

      const userEmail = localStorage.getItem('userName') || ''
      const lenderId = localStorage.getItem('lenderId')
      const lendingUpdate = {
        min_loan_amount: lending.min_loan_amount ? parseFloat(lending.min_loan_amount) : null,
        max_loan_amount: lending.max_loan_amount ? parseFloat(lending.max_loan_amount) : null,
        avg_interest_rate: lending.avg_interest_rate ? parseFloat(lending.avg_interest_rate) : null,
        approval_rate: lending.approval_rate ? parseFloat(lending.approval_rate) : null,
      }
      const { data: existing } = await supabase.from('lenders').select('id').eq(lenderId ? 'id' : 'email', lenderId || userEmail).maybeSingle()
      const agreementFields = {
        postal_address: form.postal_address || null,
        authorized_signatory_name: form.authorized_signatory_name || null,
        authorized_signatory_title: form.authorized_signatory_title || null,
        late_fee_percentage: form.late_fee_percentage ? parseFloat(form.late_fee_percentage) : 5.0,
        authorized_signatory_signature_url: sigSignatureUrl || null,
      }
      if (existing) {
        await supabase.from('lenders').update({ company_name: form.company_name, legal_name: form.company_name, phone: form.phone, address: form.address, city: form.city, namfisa_license: form.namfisa_license, website: form.website, about: form.about, logo_url: logoUrl || undefined, ...lendingUpdate, ...agreementFields }).eq('id', existing.id)
      } else {
        await supabase.from('lenders').insert({ company_name: form.company_name, legal_name: form.company_name, email: userEmail, phone: form.phone, address: form.address, city: form.city, namfisa_license: form.namfisa_license, website: form.website, about: form.about, logo_url: logoUrl || undefined, is_active: true, ...lendingUpdate, ...agreementFields })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) { setSaveError(err.message || 'Error saving settings') }
    setSaving(false)
  }

  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = sigCanvasRef.current; if (!c) return
    setSigDrawing(true)
    const ctx = c.getContext('2d')!
    ctx.beginPath(); ctx.moveTo(e.clientX - c.getBoundingClientRect().left, e.clientY - c.getBoundingClientRect().top)
  }
  const onSigDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sigDrawing) return
    const c = sigCanvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a1a'
    ctx.lineTo(e.clientX - c.getBoundingClientRect().left, e.clientY - c.getBoundingClientRect().top); ctx.stroke()
    setSigHasDraw(true)
  }
  const stopSigDraw = () => setSigDrawing(false)
  const clearSigCanvas = () => {
    const c = sigCanvasRef.current; if (!c) return
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setSigHasDraw(false)
  }
  const saveSigDrawing = () => {
    const c = sigCanvasRef.current; if (!c) return
    setSigSignatureUrl(c.toDataURL('image/png'))
  }
  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setSigSignatureUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const fields = [
    { key: 'company_name', label: 'Company / Trading Name', icon: Building, type: 'text', placeholder: 'QuickCash Finance', col: 2 },
    { key: 'email', label: 'Contact Email', icon: Mail, type: 'email', placeholder: 'info@company.com.na', col: 1 },
    { key: 'phone', label: 'Contact Phone', icon: Phone, type: 'tel', placeholder: '+264 61 123 4567', col: 1 },
    { key: 'postal_address', label: 'Postal Address', icon: MapPin, type: 'text', placeholder: 'P.O. Box 1234, Windhoek', col: 1 },
    { key: 'address', label: 'Physical Address', icon: MapPin, type: 'text', placeholder: '15 Independence Ave', col: 1 },
    { key: 'city', label: 'City / Town', icon: MapPin, type: 'text', placeholder: 'Windhoek', col: 1 },
    { key: 'namfisa_license', label: 'NAMFISA License Number', icon: FileText, type: 'text', placeholder: 'ML-2024-0089', col: 1 },
    { key: 'website', label: 'Company Website', icon: Globe, type: 'url', placeholder: 'https://www.company.com.na', col: 1 },
  ]

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Company Settings</h2>
        <p className="text-neutral-500 text-sm">Manage your company profile and branding information</p>
      </div>

      {saveError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{saveError}</div>}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Settings saved successfully. Your branding will appear on borrower invitations and marketplace listings.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          {/* Logo upload area */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-neutral-200 bg-gradient-to-br from-cashub-500 to-accent-500 flex items-center justify-center shadow-md">
              {logoUrl
                ? <img src={logoUrl} alt="Company logo" className="w-full h-full object-contain bg-white p-0.5" />
                : <span className="text-3xl font-black text-white">{(form.company_name || 'L').charAt(0).toUpperCase()}</span>
              }
            </div>
            <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-cashub-600 hover:bg-cashub-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors" title="Upload logo">
              {logoUploading
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Upload className="w-3.5 h-3.5 text-white" />
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-neutral-900">{form.company_name || 'Your Company'}</h3>
            <p className="text-xs text-neutral-500">{form.email || 'no email set'}</p>
            <p className="text-[10px] text-neutral-400 mt-1.5">Click the upload icon to set your company logo</p>
            <p className="text-[10px] text-neutral-400">Logo appears on borrower invites and the marketplace</p>
            {logoUrl && (
              <button onClick={() => { setLogoUrl(''); localStorage.removeItem('lenderLogo') }}
                className="mt-1 text-[10px] text-red-500 hover:text-red-700 underline">
                Remove logo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.col === 2 ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-400"
                />
              </div>
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-700 mb-1">About Your Company</label>
            <textarea
              value={form.about}
              onChange={e => setForm(prev => ({ ...prev, about: e.target.value }))}
              rows={3}
              placeholder="Brief description of your lending services..."
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">Changes are saved to your profile and synced with the platform.</p>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Lending Parameters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-sm font-bold text-neutral-900 mb-1">Lending Parameters</h3>
        <p className="text-xs text-neutral-500 mb-4">These values appear on your marketplace listing and borrower portal profile.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'min_loan_amount', label: 'Minimum Loan Amount (N$)', placeholder: '500', type: 'number' },
            { key: 'max_loan_amount', label: 'Maximum Loan Amount (N$)', placeholder: '50000', type: 'number' },
            { key: 'avg_interest_rate', label: 'Average Interest Rate (%)', placeholder: '20', type: 'number' },
            { key: 'approval_rate', label: 'Approval Rate (%)', placeholder: '80', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-neutral-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(lending as any)[f.key]}
                onChange={e => setLending(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-neutral-100">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving...' : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Parameters</>}
          </button>
        </div>
      </div>

      {/* Agreement Information */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 mb-0.5">Agreement Information</h3>
          <p className="text-xs text-neutral-500">These details appear on loan agreements between you and your borrowers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{k:'authorized_signatory_name',l:'Authorized Signatory Name',p:'John Smith'},{k:'authorized_signatory_title',l:'Signatory Title / Role',p:'Managing Director'}].map(f=>(
            <div key={f.k}>
              <label className="block text-xs font-medium text-neutral-700 mb-1">{f.l}</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" placeholder={f.p} value={(form as any)[f.k]}
                onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))}
                className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" /></div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Late Payment Fee (% per month, max 5%)</label>
            <input type="number" min="0" max="5" step="0.5" placeholder="5"
              value={form.late_fee_percentage}
              onChange={e => setForm(p=>({...p,late_fee_percentage:e.target.value}))}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
            <p className="text-[10px] text-neutral-400 mt-1">NAMFISA regulations cap penalty interest at 5% per month for max 3 months.</p>
          </div>
        </div>

        {/* Authorized Signatory Signature */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-2">Authorized Signatory Signature</label>
          <p className="text-[10px] text-neutral-500 mb-3">This signature auto-applies to loan agreements on behalf of your company. Draw or upload a scanned signature.</p>
          {sigSignatureUrl ? (
            <div className="flex items-start gap-4">
              <div className="border-2 border-neutral-200 rounded-xl p-3 bg-white">
                <img src={sigSignatureUrl} alt="Signatory signature" className="h-16 object-contain" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-green-700 font-medium">✓ Signature saved</p>
                <button onClick={() => { setSigSignatureUrl(''); localStorage.removeItem('lenderSigSignature') }}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-neutral-300 rounded-xl overflow-hidden bg-white">
                <canvas ref={sigCanvasRef} width={400} height={120} className="w-full cursor-crosshair"
                  onMouseDown={startSigDraw} onMouseMove={onSigDraw} onMouseUp={stopSigDraw} onMouseLeave={stopSigDraw} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={saveSigDrawing} disabled={!sigHasDraw}
                  className="flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40">
                  <Pen className="w-3.5 h-3.5" /> Use Drawing
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleSigUpload} />
                </label>
                {sigHasDraw && <button onClick={clearSigCanvas} className="text-xs text-red-500 hover:text-red-600">Clear</button>}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-100">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Agreement Info</>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-sm font-bold text-neutral-900 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-red-900">Deactivate Company Account</p>
              <p className="text-xs text-red-600 mt-0.5">This will suspend all active loans and prevent new applications. Contact CasHuB support to proceed.</p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  )
}
