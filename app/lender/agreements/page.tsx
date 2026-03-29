"use client"

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Search, RefreshCw, CheckCircle, Clock, Printer, Eye, Download } from 'lucide-react'

interface Agreement {
  id: string
  loan_number: string
  principal_amount: number
  total_repayable: number
  instalment_amount: number
  number_of_instalments: number
  first_instalment_date: string
  last_instalment_date: string
  penalty_rate: number
  borrower_signature_url: string
  borrower_signed_at: string
  lender_signature_url: string
  lender_signed_at: string
  status: string
  created_at: string
  borrower_id: string
  finance_charge_rate: number
  finance_charge_amount: number
  borrowers?: {
    first_name: string; last_name: string; id_number: string
    email: string; phone: string; postal_address: string; address: string
    marital_status: string; occupation: string; employer_name: string
    employer_tel: string; employer_address: string; payslip_employee_no: string
    bank_name: string; bank_branch: string; bank_account_no: string
    bank_account_type: string; reference1_name: string; reference1_tel: string
    reference2_name: string; reference2_tel: string; tel_no: string
  }
}

interface LenderInfo {
  company_name: string; postal_address: string; address: string
  email: string; phone: string; logo_url: string
  authorized_signatory_name: string; authorized_signatory_title: string
  authorized_signatory_signature_url: string; namfisa_license: string
}

const fmt = (n: number) => `N$ ${(n || 0).toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function LenderAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lender, setLender] = useState<LenderInfo | null>(null)
  const [viewing, setViewing] = useState<Agreement | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const lenderId = localStorage.getItem('lenderId')
    const lenderEmail = localStorage.getItem('userName') || ''

    let lQuery = supabase.from('lenders').select('*')
    if (lenderId) lQuery = lQuery.eq('id', lenderId)
    else lQuery = lQuery.eq('email', lenderEmail)
    const { data: lData } = await lQuery.maybeSingle()
    if (lData) setLender(lData as LenderInfo)

    const resolvedLenderId = lenderId || lData?.id
    if (!resolvedLenderId) { setLoading(false); return }

    const { data } = await supabase
      .from('loan_agreements')
      .select('*, borrowers(*)')
      .eq('lender_id', resolvedLenderId)
      .order('created_at', { ascending: false })
    setAgreements((data || []) as Agreement[])
    setLoading(false)
  }

  const filtered = agreements.filter(a => {
    const q = search.toLowerCase()
    const b = a.borrowers
    return !q || a.loan_number?.toLowerCase().includes(q) ||
      b?.first_name?.toLowerCase().includes(q) ||
      b?.last_name?.toLowerCase().includes(q) ||
      b?.email?.toLowerCase().includes(q)
  })

  const handlePrint = (ag: Agreement) => {
    const b = ag.borrowers
    const borrowerName = b ? `${b.first_name} ${b.last_name}` : '___________________'
    const today = new Date()
    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-NA') : '___________'

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Loan Agreement - ${ag.loan_number}</title>
<style>
body{font-family:Arial,sans-serif;font-size:10pt;color:#000;margin:20mm;line-height:1.5}
h1{font-size:14pt;text-align:center;text-decoration:underline}
h2{font-size:11pt;text-transform:uppercase;margin-top:16px}
table{width:100%;border-collapse:collapse;margin:8px 0}
td,th{padding:5px 7px;vertical-align:top;font-size:9.5pt}
.bordered td,.bordered th{border:1px solid #000}
th{background:#f0f0f0;font-weight:bold}
.ul{border-bottom:1px solid #000;display:inline-block;min-width:140px}
.center{text-align:center}
.bold{font-weight:bold}
.sig-img{height:48px;object-fit:contain;border-bottom:1px solid #000}
.sig-line{border-bottom:1px solid #000;width:190px;display:inline-block;height:48px;vertical-align:bottom}
</style></head><body>
<div class="center">
  ${lender?.logo_url ? `<img src="${lender.logo_url}" style="height:60px;object-fit:contain;margin-bottom:8px"><br>` : ''}
  <strong style="font-size:13pt;text-decoration:underline">${lender?.company_name || ''}</strong><br>
  <strong>${lender?.postal_address || ''}</strong><br>
  <strong>${lender?.address || ''}</strong><br>
  <strong>${lender?.email || ''}</strong><br>
  <strong>${lender?.phone || ''}</strong>
</div>
<h1>LOAN AGREEMENT</h1>
<p><strong>Preamble</strong></p>
<p>This loan agreement only applies to loans not exceeding a period of 5 months.</p>
<p>Entered into between:</p>
<p class="center"><strong>${lender?.company_name || '___'}</strong> ("the Lender") and <strong>${borrowerName}</strong> ("the Borrower")</p>
<p><strong><u>BORROWER'S PERSONAL INFORMATION:</u></strong></p>
<table><tbody>
<tr><td>Postal address: <span class="ul">${b?.postal_address||''}</span></td><td>Tel no: <span class="ul">${b?.tel_no||b?.phone||''}</span></td></tr>
<tr><td colspan="2">Residential address: <span class="ul" style="min-width:300px">${b?.address||''}</span></td></tr>
<tr><td>Marital Status: <span class="ul">${b?.marital_status||''}</span></td><td>I.D./Passport No: <span class="ul">${b?.id_number||''}</span></td></tr>
<tr><td>Occupation: <span class="ul">${b?.occupation||''}</span></td><td>Employer Tel no: <span class="ul">${b?.employer_tel||''}</span></td></tr>
<tr><td>Employer Name: <span class="ul">${b?.employer_name||''}</span></td><td>Employer Address: <span class="ul">${b?.employer_address||''}</span></td></tr>
<tr><td colspan="2">Payslip/Employee No: <span class="ul">${b?.payslip_employee_no||''}</span></td></tr>
<tr><td>Bank: <span class="ul">${b?.bank_name||''}</span></td><td>Branch: <span class="ul">${b?.bank_branch||''}</span></td></tr>
<tr><td>Bank Account No: <span class="ul">${b?.bank_account_no||''}</span></td><td>Type of Account: <span class="ul">${b?.bank_account_type||''}</span></td></tr>
</tbody></table>
<p><strong>References:</strong></p>
<table><tbody>
<tr><td>1.</td><td>Name: <span class="ul">${b?.reference1_name||''}</span></td><td>Tel No: <span class="ul">${b?.reference1_tel||''}</span></td></tr>
<tr><td>2.</td><td>Name: <span class="ul">${b?.reference2_name||''}</span></td><td>Tel No: <span class="ul">${b?.reference2_tel||''}</span></td></tr>
</tbody></table>
<table class="bordered" style="margin-top:16px">
<thead><tr>
<th>LOAN AMOUNT</th>
<th>FINANCE CHARGES AT ${ag.finance_charge_rate||0}%<br><small>(INDICATE WHETHER THE RATE IS FIXED OR VARIABLE, WHICH RATE MAY NOT EXCEED 30% OF THE PRINCIPAL DEBT)</small></th>
<th>TOTAL REPAYABLE</th>
<th>INSTALMENT AMOUNT</th>
</tr></thead>
<tbody><tr>
<td>Paid to Borrower<br><br>${fmt(ag.principal_amount)}</td>
<td>${fmt(ag.finance_charge_amount)}</td>
<td>${fmt(ag.total_repayable)}</td>
<td>N$ ${(ag.instalment_amount||0).toFixed(2)}<br>First instalment: ${ag.first_instalment_date||''}<br>Last instalment: ${ag.last_instalment_date||''}<br>No. of instalments: ${ag.number_of_instalments||''}<br>Frequency (monthly):</td>
</tr></tbody></table>
<p><em>Penalty interest will be charged at ${ag.penalty_rate||5}% per month on the outstanding amount.<br>(The penalty interest may not exceed 5% per month and may not be charged for a period of more than three (3) months)</em></p>
<p><strong>PERIOD OF LOAN</strong></p>
<p>The Borrower shall repay the capital amount including interest (as stated above) on or before <span class="ul">${ag.last_instalment_date||''}</span></p>
<p>I acknowledge that this agreement has been completed in full prior to my signature.</p>
<p>Signed at <span class="ul" style="min-width:100px"></span> on this <span class="ul" style="min-width:30px">${today.getDate()}</span> day of <span class="ul" style="min-width:70px">${today.toLocaleDateString('en-NA',{month:'long'})}</span> 20${String(today.getFullYear()).slice(2)}</p>
<p>Witness:</p>
<table style="width:100%"><tbody><tr>
<td style="width:220px"><div class="sig-line"></div><br>Witness</td>
<td>${ag.borrower_signature_url ? `<img src="${ag.borrower_signature_url}" class="sig-img">` : '<div class="sig-line"></div>'}<br>(Signature of Borrower)<br><small>${borrowerName}</small></td>
<td>${ag.lender_signature_url ? `<img src="${ag.lender_signature_url}" class="sig-img">` : '<div class="sig-line"></div>'}<br>(Signature of Lender)<br><small>${lender?.authorized_signatory_name||''}</small></td>
</tr></tbody></table>
</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  const statusBadge = (status: string) => {
    if (status === 'complete') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Signed</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pending</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Loan Agreements</h1>
          <p className="text-sm text-neutral-500 mt-0.5">View and download signed loan agreements</p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agreements', value: agreements.length, color: 'blue' },
          { label: 'Signed', value: agreements.filter(a => a.status === 'complete').length, color: 'emerald' },
          { label: 'Pending Signature', value: agreements.filter(a => a.status !== 'complete').length, color: 'amber' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search by borrower or loan number..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-sm font-medium text-neutral-500">No agreements found</p>
            <p className="text-xs text-neutral-400">Agreements appear here once borrowers sign them.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Loan #', 'Borrower', 'Amount', 'Instalments', 'Signed Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(ag => {
                const b = ag.borrowers
                return (
                  <tr key={ag.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-neutral-900">{ag.loan_number || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-neutral-900">{b ? `${b.first_name} ${b.last_name}` : '—'}</p>
                      <p className="text-xs text-neutral-400">{b?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{fmt(ag.principal_amount)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{ag.number_of_instalments || '—'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {ag.borrower_signed_at ? new Date(ag.borrower_signed_at).toLocaleDateString('en-NA') : '—'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(ag.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewing(ag)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button onClick={() => handlePrint(ag)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-xs font-semibold">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* View Agreement Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Agreement — {viewing.loan_number}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{viewing.borrowers ? `${viewing.borrowers.first_name} ${viewing.borrowers.last_name}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handlePrint(viewing)}
                  className="flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold">
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
                <button onClick={() => setViewing(null)} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">Close</button>
              </div>
            </div>
            <div className="p-6 space-y-5 text-sm">
              {/* Loan Details */}
              <section>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Loan Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Loan Number', viewing.loan_number],
                    ['Principal', fmt(viewing.principal_amount)],
                    ['Finance Charges', `${viewing.finance_charge_rate}% — ${fmt(viewing.finance_charge_amount)}`],
                    ['Total Repayable', fmt(viewing.total_repayable)],
                    ['Instalment', fmt(viewing.instalment_amount)],
                    ['No. of Instalments', viewing.number_of_instalments],
                    ['First Due', viewing.first_instalment_date],
                    ['Last Due', viewing.last_instalment_date],
                    ['Penalty Rate', `${viewing.penalty_rate}% p/m`],
                    ['Status', viewing.status === 'complete' ? '✓ Signed' : 'Pending'],
                  ].map(([k,v]) => (
                    <div key={k as string} className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-[10px] text-neutral-400 mb-0.5">{k}</p>
                      <p className="font-medium text-neutral-900">{v || '—'}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Borrower Info */}
              {viewing.borrowers && (
                <section>
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Borrower Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Name', `${viewing.borrowers.first_name} ${viewing.borrowers.last_name}`],
                      ['ID Number', viewing.borrowers.id_number],
                      ['Email', viewing.borrowers.email],
                      ['Phone', viewing.borrowers.phone],
                      ['Marital Status', viewing.borrowers.marital_status],
                      ['Occupation', viewing.borrowers.occupation],
                      ['Employer', viewing.borrowers.employer_name],
                      ['Bank', `${viewing.borrowers.bank_name} — ${viewing.borrowers.bank_account_no}`],
                    ].map(([k,v]) => (
                      <div key={k as string} className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[10px] text-neutral-400 mb-0.5">{k}</p>
                        <p className="font-medium text-neutral-900">{v || '—'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Signatures */}
              <section>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Signatures</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Borrower Signature', url: viewing.borrower_signature_url, date: viewing.borrower_signed_at },
                    { label: 'Lender Signature', url: viewing.lender_signature_url, date: viewing.lender_signed_at },
                  ].map(sig => (
                    <div key={sig.label} className="border border-neutral-200 rounded-xl p-3 text-center">
                      <p className="text-xs font-medium text-neutral-500 mb-2">{sig.label}</p>
                      {sig.url ? (
                        <img src={sig.url} alt={sig.label} className="h-14 object-contain mx-auto border-b border-neutral-300" />
                      ) : (
                        <div className="h-14 border-b border-neutral-300 flex items-end justify-center">
                          <span className="text-xs text-neutral-300 pb-1">Not yet signed</span>
                        </div>
                      )}
                      {sig.date && <p className="text-[10px] text-neutral-400 mt-1">{new Date(sig.date).toLocaleDateString('en-NA')}</p>}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
