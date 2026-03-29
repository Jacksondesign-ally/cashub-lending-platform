"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ScrollText, Search, RefreshCw, User, Building, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  performed_by?: string
  details?: string
  ip_address?: string
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  approve: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-rose-100 text-rose-700',
  suspend: 'bg-orange-100 text-orange-700',
  login: 'bg-indigo-100 text-indigo-700',
  logout: 'bg-slate-100 text-slate-700',
}

const PAGE_SIZE = 25

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => { fetchLogs() }, [page, entityFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (entityFilter !== 'all') query = query.eq('entity_type', entityFilter)

      const { data, count, error } = await query
      if (!error && data) { setLogs(data); setTotal(count || 0) }
      else setLogs([])
    } catch (err) { console.error('[CasHuB Error]', err); setLogs([]) }
    setLoading(false)
  }

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    return !q || l.action?.toLowerCase().includes(q) || l.entity_type?.toLowerCase().includes(q) || l.performed_by?.toLowerCase().includes(q) || l.details?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Audit Logs</h2>
          <p className="text-neutral-500 text-sm">Complete record of all system actions and events</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium mt-2 sm:mt-0">{total.toLocaleString()} total entries</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> Audit logging requires the <code className="bg-amber-100 px-1 rounded">audit_logs</code> table. Run the migration SQL below if you haven&apos;t already.
        <details className="mt-2">
          <summary className="cursor-pointer font-medium text-xs">Show SQL to create audit_logs table</summary>
          <pre className="mt-2 text-[10px] bg-amber-100 rounded p-2 overflow-x-auto">{`CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  performed_by TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_logs_auth" ON audit_logs;
CREATE POLICY "audit_logs_auth" ON audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);`}</pre>
        </details>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action, entity, user..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(0) }} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500">
          <option value="all">All Entities</option>
          <option value="lender">Lender</option>
          <option value="borrower">Borrower</option>
          <option value="loan">Loan</option>
          <option value="payment">Payment</option>
          <option value="dispute">Dispute</option>
          <option value="blacklist">Blacklist</option>
          <option value="user">User</option>
        </select>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No audit logs found</p>
            <p className="text-neutral-400 text-sm mt-1">System events will be recorded here once the audit_logs table is created and actions are logged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Performed By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${ACTION_COLORS[log.action?.toLowerCase()] || 'bg-neutral-100 text-neutral-700'}`}>
                        {log.action?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-medium text-neutral-700">{log.entity_type}</span>
                      {log.entity_id && <span className="ml-1 text-neutral-400">#{log.entity_id?.slice(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">{log.performed_by || '—'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500 max-w-xs truncate">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
            <span className="text-xs text-neutral-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

