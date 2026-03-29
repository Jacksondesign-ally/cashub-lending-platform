"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Brain, Search, RefreshCw, AlertTriangle, Shield, TrendingUp, TrendingDown, User, ChevronDown, ChevronUp, Activity, Zap } from 'lucide-react'

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface BorrowerRisk {
  id: string
  first_name: string
  last_name: string
  id_number?: string
  email?: string
  phone?: string
  risk_level?: RiskLevel
  credit_score?: number
  status?: string
  created_at: string
  // computed
  activeLoans?: number
  totalOutstanding?: number
  isBlacklisted?: boolean
  hasScamAlert?: boolean
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; bar: string }> = {
  low:      { label: 'Low Risk',      color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  bar: 'bg-green-500' },
  medium:   { label: 'Medium Risk',   color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', bar: 'bg-yellow-500' },
  high:     { label: 'High Risk',     color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', bar: 'bg-orange-500' },
  critical: { label: 'Critical Risk', color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       bar: 'bg-red-600' },
}

const scoreToRisk = (score: number): RiskLevel => {
  if (score >= 700) return 'low'
  if (score >= 500) return 'medium'
  if (score >= 300) return 'high'
  return 'critical'
}

export default function RiskEnginePage() {
  const [borrowers, setBorrowers] = useState<BorrowerRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [{ data: bData }, { data: lData }, { data: blData }, { data: scData }] = await Promise.all([
        supabase.from('borrowers').select('*').order('created_at', { ascending: false }),
        supabase.from('loans').select('borrower_id, outstanding_balance, status'),
        supabase.from('borrower_blacklist').select('borrower_id').eq('status', 'active'),
        supabase.from('scam_alerts').select('borrower_id').eq('status', 'active'),
      ])

      const blacklistedIds = new Set((blData || []).map((b: any) => b.borrower_id))
      const scamIds = new Set((scData || []).map((s: any) => s.borrower_id))

      const enriched: BorrowerRisk[] = (bData || []).map((b: any) => {
        const bLoans = (lData || []).filter((l: any) => l.borrower_id === b.id)
        const activeLoans = bLoans.filter((l: any) => l.status === 'active').length
        const totalOutstanding = bLoans.reduce((s: number, l: any) => s + (l.outstanding_balance || 0), 0)
        const isBlacklisted = blacklistedIds.has(b.id)
        const hasScamAlert = scamIds.has(b.id)

        // Compute score if not set
        let score = b.credit_score || 600
        if (isBlacklisted) score -= 200
        if (hasScamAlert) score -= 150
        if (activeLoans > 3) score -= 50
        score = Math.max(100, Math.min(850, score))

        return { ...b, activeLoans, totalOutstanding, isBlacklisted, hasScamAlert, credit_score: score, risk_level: b.risk_level || scoreToRisk(score) }
      })

      setBorrowers(enriched)
    } catch (err) { console.error('[CasHuB Error]', err); setBorrowers([]) }
    setLoading(false)
  }

  const updateRiskLevel = async (id: string, level: RiskLevel) => {
    setUpdatingId(id)
    await supabase.from('borrowers').update({ risk_level: level }).eq('id', id)
    setBorrowers(prev => prev.map(b => b.id === id ? { ...b, risk_level: level } : b))
    setUpdatingId(null)
  }

  const filtered = borrowers.filter(b => {
    const q = search.toLowerCase()
    const name = `${b.first_name} ${b.last_name}`.toLowerCase()
    const matchSearch = !q || name.includes(q) || b.id_number?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q)
    const matchRisk = riskFilter === 'all' || b.risk_level === riskFilter
    return matchSearch && matchRisk
  })

  const stats = {
    total: borrowers.length,
    low: borrowers.filter(b => b.risk_level === 'low').length,
    medium: borrowers.filter(b => b.risk_level === 'medium').length,
    high: borrowers.filter(b => b.risk_level === 'high').length,
    critical: borrowers.filter(b => b.risk_level === 'critical').length,
    blacklisted: borrowers.filter(b => b.isBlacklisted).length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Risk Engine</h2>
          <p className="text-neutral-500 text-sm">Credit scoring and risk classification for all borrowers</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{stats.critical} Critical</span>
          <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">{stats.high} High</span>
        </div>
      </div>

      {/* Blueprint V1 rule-based scoring info */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <Brain className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-sky-900">V1 Rules-Based Scoring Engine</p>
          <p className="text-xs text-sky-700 mt-0.5">Credit scores are calculated from: active loans, outstanding balance, blacklist status, scam alerts, overdue history. Range: 100–850. AI upgrade planned for V2.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Low Risk', value: stats.low, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Medium Risk', value: stats.medium, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'High Risk', value: stats.high, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Critical', value: stats.critical, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <p className="text-xs font-medium text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.bg.replace('bg-', 'bg-').replace('-50', '-500')} rounded-full`} style={{ width: stats.total > 0 ? `${(s.value / stats.total) * 100}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID number, email..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value as any)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
          <option value="critical">Critical</option>
        </select>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Brain className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No borrowers found</p>
          </div>
        )}
        {filtered.map(b => {
          const risk = RISK_CONFIG[b.risk_level || 'medium']
          const scorePercent = Math.round(((b.credit_score || 500) - 100) / 750 * 100)
          return (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{b.first_name?.charAt(0)}{b.last_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-neutral-900">{b.first_name} {b.last_name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${risk.bg} ${risk.color}`}>{risk.label}</span>
                      {b.isBlacklisted && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">BLACKLISTED</span>}
                      {b.hasScamAlert && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">SCAM ALERT</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      <span>{b.id_number || 'No ID'}</span>
                      <span>Score: <span className={`font-bold ${risk.color}`}>{b.credit_score}</span></span>
                      <span>{b.activeLoans || 0} active loan(s)</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 max-w-[160px] h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className={`h-full ${risk.bar} rounded-full transition-all`} style={{ width: `${scorePercent}%` }} />
                      </div>
                      <span className="text-[10px] text-neutral-400">{b.credit_score}/850</span>
                    </div>
                  </div>
                </div>
                {expandedId === b.id ? <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
              </div>
              {expandedId === b.id && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Risk Factors</h4>
                    {[
                      { label: 'Active Loans', value: b.activeLoans || 0, flag: (b.activeLoans || 0) > 2 },
                      { label: 'Total Outstanding', value: `N$ ${(b.totalOutstanding || 0).toLocaleString()}`, flag: (b.totalOutstanding || 0) > 50000 },
                      { label: 'Blacklisted', value: b.isBlacklisted ? 'Yes' : 'No', flag: !!b.isBlacklisted },
                      { label: 'Scam Alert', value: b.hasScamAlert ? 'Yes' : 'No', flag: !!b.hasScamAlert },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">{item.label}</span>
                        <span className={`font-semibold ${item.flag ? 'text-red-600' : 'text-neutral-800'}`}>{String(item.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Override Risk Level</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map(level => (
                        <button key={level} onClick={() => updateRiskLevel(b.id, level)} disabled={updatingId === b.id || b.risk_level === level} className={`py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border ${b.risk_level === level ? `${RISK_CONFIG[level].bg} ${RISK_CONFIG[level].color} font-bold` : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                          {updatingId === b.id && b.risk_level !== level ? '...' : RISK_CONFIG[level].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

