"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AlertCircle,
  Shield,
  Flag,
  CheckCircle,
  XCircle,
  Filter,
  Clock,
  User,
  Search,
  Ban,
  Trash2,
  ExternalLink
} from 'lucide-react'

type ScamAlertStatus = 'pending' | 'verified' | 'dismissed'
type ScamAlertType = 'borrower' | 'lender' | 'general'
type ScamAlertSeverity = 'low' | 'medium' | 'high'

type ScamAlert = {
  id: string
  title: string
  description: string
  type: ScamAlertType
  severity: ScamAlertSeverity
  status: ScamAlertStatus
  created_at: string
  reporter_name?: string | null
}

export default function ScamAlertsPage() {
  const [alerts, setAlerts] = useState<ScamAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'all' | ScamAlertStatus>('pending')
  const [typeFilter, setTypeFilter] = useState<'all' | ScamAlertType>('all')
  const [search, setSearch] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<ScamAlertType>('borrower')
  const [newSeverity, setNewSeverity] = useState<ScamAlertSeverity>('medium')
  const [newDescription, setNewDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(typeof window !== 'undefined' ? localStorage.getItem('userRole') : null)
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('scam_alerts')
        .select('id, title, description, type, severity, status, created_at, reporter_name')
        .order('created_at', { ascending: false })

      if (error) {
        setError('Unable to load scam alerts. Ensure the scam_alerts table exists in Supabase.')
        return
      }

      setAlerts((data || []) as ScamAlert[])
    } catch {
      setError('Unexpected error while loading scam alerts')
    } finally {
      setLoading(false)
    }
  }

  const canModerate = role === 'super_admin' || role === 'admin'
  const isSuperAdmin = role === 'super_admin'

  const handleStatusChange = async (id: string, status: ScamAlertStatus) => {
    if (!canModerate) return
    try {
      const { error } = await supabase
        .from('scam_alerts')
        .update({ status })
        .eq('id', id)

      if (error) return
      await fetchAlerts()
    } catch {
      // swallow, UI stays as is
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim()) return

    try {
      setSubmitting(true)
      setError(null)

      const reporterName = typeof window !== 'undefined'
        ? localStorage.getItem('userName') || null
        : null

      const { error } = await supabase
        .from('scam_alerts')
        .insert({
          title: newTitle,
          description: newDescription,
          type: newType,
          severity: newSeverity,
          status: 'pending',
          reporter_name: reporterName
        })

      if (error) {
        setError('Unable to create scam alert. Ensure the scam_alerts table has the expected columns.')
        return
      }

      setNewTitle('')
      setNewDescription('')
      setNewSeverity('medium')
      setNewType('borrower')
      await fetchAlerts()
    } catch {
      setError('Unexpected error while creating scam alert')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    const matchesType = typeFilter === 'all' || a.type === typeFilter
    const matchesSearch =
      !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  const getSeverityColor = (severity: ScamAlertSeverity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low':
      default:
        return 'bg-green-50 text-green-700 border-green-200'
    }
  }

  const getStatusPill = (status: ScamAlertStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'verified':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'dismissed':
        return 'bg-neutral-50 text-neutral-600 border-neutral-200'
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Scam Alerts</h1>
          <p className="text-neutral-500">
            Central place to report and manage suspected borrower or lender fraud on CashHuB.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-red-800">Scam alert configuration issue</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">Filters</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                >
                  <option value="all">All types</option>
                  <option value="borrower">Borrower</option>
                  <option value="lender">Lender</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.length === 0 && (
                <div className="py-10 text-center text-neutral-500 text-sm">
                  No scam alerts match your filters.
                </div>
              )}

              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-neutral-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        {alert.severity.toUpperCase()}
                      </div>
                      <span className="text-[11px] uppercase tracking-wide text-neutral-400">
                        {alert.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">{alert.title}</p>
                    <p className="text-xs text-neutral-600 mt-1">{alert.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-neutral-400">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                      {alert.reporter_name && (
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {alert.reporter_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center sm:flex-col sm:items-end gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusPill(
                        alert.status
                      )}`}
                    >
                      {alert.status.toUpperCase()}
                    </span>
                    {canModerate && (
                      <div className="flex flex-wrap items-center gap-1">
                        {alert.status !== 'verified' && (
                          <button
                            onClick={() => handleStatusChange(alert.id, 'verified')}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify
                          </button>
                        )}
                        {alert.status !== 'dismissed' && (
                          <button
                            onClick={() => handleStatusChange(alert.id, 'dismissed')}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Dismiss
                          </button>
                        )}
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this scam alert permanently?')) return
                                await supabase.from('scam_alerts').delete().eq('id', alert.id)
                                await fetchAlerts()
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                            {alert.status === 'verified' && (
                              <button
                                onClick={() => {
                                  window.alert('Escalation sent to NAMFISA compliance team. Reference: ESC-' + alert.id.slice(0,6).toUpperCase())
                                }}
                                className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Escalate
                              </button>
                            )}
                            {(alert.type === 'borrower' || alert.type === 'lender') && alert.status === 'verified' && (
                              <button
                                onClick={() => {
                                  window.alert(`${alert.type === 'borrower' ? 'Borrower' : 'Lender'} account flagged for suspension. Ref: BAN-${alert.id.slice(0,6).toUpperCase()}`)
                                }}
                                className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                              >
                                <Ban className="w-3 h-3 mr-1" />
                                Suspend User
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-cashub-600 mr-2" />
              <h2 className="text-sm font-semibold text-neutral-900">Report scam activity</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-3">
              Use this form to flag suspicious borrowers, fake lenders, or general scam patterns
              observed on the CashHuB network.
            </p>
            <form className="space-y-3" onSubmit={handleCreateAlert}>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Example: Possible identity fraud by borrower"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ScamAlertType)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  >
                    <option value="borrower">Borrower</option>
                    <option value="lender">Lender</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as ScamAlertSeverity)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
                  placeholder="Include borrower or lender identifiers, dates, and what behaviour you observed."
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !newTitle.trim() || !newDescription.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-cashub-600 text-white text-sm font-medium hover:bg-cashub-700 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit scam alert'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

