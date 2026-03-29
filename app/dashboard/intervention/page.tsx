"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit-logger'
import {
  Shield, Lock, Unlock, AlertTriangle, Send, MessageSquare,
  RefreshCw, Search, Filter, CheckCircle, XCircle, AlertCircle,
  Building, Users, FileText, DollarSign, Ban, Power, Eye,
  ChevronDown, ChevronUp, MoreHorizontal, Clock, Radio
} from 'lucide-react'

interface LenderAccount {
  id: string
  legal_name: string
  registration_number: string
  email: string
  is_active: boolean
  is_frozen: boolean
  freeze_reason?: string
  freeze_date?: string
  total_loans: number
  total_borrowers: number
}

interface EmergencyMessage {
  id: string
  subject: string
  message: string
  recipient_type: 'all' | 'lenders' | 'borrowers' | 'staff'
  sent_by: string
  sent_at: string
  acknowledged_count: number
}

interface SystemLock {
  id: string
  feature: string
  locked: boolean
  locked_by?: string
  locked_at?: string
  reason?: string
}

export default function InterventionToolsPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'communications' | 'locks' | 'overrides'>('accounts')
  const [lenders, setLenders] = useState<LenderAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLender, setSelectedLender] = useState<LenderAccount | null>(null)
  const [freezeModalOpen, setFreezeModalOpen] = useState(false)
  const [freezeReason, setFreezeReason] = useState('')
  const [emergencyMessage, setEmergencyMessage] = useState({ subject: '', message: '', recipient_type: 'all' as const })
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageHistory, setMessageHistory] = useState<EmergencyMessage[]>([])
  const [systemLocks, setSystemLocks] = useState<SystemLock[]>([
    { id: 'new_registrations', feature: 'New Lender Registrations', locked: false },
    { id: 'new_loans', feature: 'New Loan Creation', locked: false },
    { id: 'disbursements', feature: 'Loan Disbursements', locked: false },
    { id: 'marketplace', feature: 'Marketplace Bidding', locked: false },
    { id: 'withdrawals', feature: 'Lender Withdrawals', locked: false },
  ])
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchLenders()
    fetchMessageHistory()
  }, [])

  const fetchLenders = async () => {
    setLoading(true)
    try {
      const { data: lendersData, error } = await supabase
        .from('lenders')
        .select('id, legal_name, registration_number, email, is_active, created_at')
        .order('legal_name')

      if (error) throw error

      // Fetch loan counts for each lender
      const lendersWithCounts = await Promise.all(
        (lendersData || []).map(async (lender: any) => {
          const { count: loanCount } = await supabase
            .from('loans')
            .select('*', { count: 'exact', head: true })
            .eq('lender_id', lender.id)
          
          const { count: borrowerCount } = await supabase
            .from('borrowers')
            .select('*', { count: 'exact', head: true })
            .eq('lender_id', lender.id)

          // Check if lender has any freeze records in a separate table or field
          // For now, we'll simulate this with local state
          return {
            ...lender,
            total_loans: loanCount || 0,
            total_borrowers: borrowerCount || 0,
            is_frozen: lender.is_frozen || false,
            freeze_reason: lender.freeze_reason,
            freeze_date: lender.freeze_date,
          }
        })
      )

      setLenders(lendersWithCounts)
    } catch (err) {
      console.error('Error fetching lenders:', err)
      setErrorMsg('Failed to load lender accounts')
    }
    setLoading(false)
  }

  const fetchMessageHistory = async () => {
    try {
      const { data } = await supabase
        .from('emergency_communications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10)
      
      setMessageHistory(data || [])
    } catch (err) {
      console.error('Error fetching message history:', err)
    }
  }

  const freezeAccount = async () => {
    if (!selectedLender || !freezeReason.trim()) return
    
    try {
      await supabase
        .from('lenders')
        .update({ 
          is_frozen: true, 
          freeze_reason: freezeReason,
          freeze_date: new Date().toISOString()
        })
        .eq('id', selectedLender.id)

      await logAudit({
        action: 'account.frozen',
        entity_type: 'auth',
        entity_id: selectedLender.id,
        details: { reason: freezeReason, lender_name: selectedLender.legal_name },
      })

      setLenders(prev => prev.map(l => 
        l.id === selectedLender.id 
          ? { ...l, is_frozen: true, freeze_reason: freezeReason, freeze_date: new Date().toISOString() }
          : l
      ))

      setSuccessMsg(`Account for ${selectedLender.legal_name} has been frozen`)
      setFreezeModalOpen(false)
      setFreezeReason('')
      setSelectedLender(null)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg('Failed to freeze account')
      setTimeout(() => setErrorMsg(''), 5000)
    }
  }

  const unfreezeAccount = async (lender: LenderAccount) => {
    try {
      await supabase
        .from('lenders')
        .update({ 
          is_frozen: false, 
          freeze_reason: null,
          freeze_date: null
        })
        .eq('id', lender.id)

      await logAudit({
        action: 'account.unfrozen',
        entity_type: 'auth',
        entity_id: lender.id,
        details: { lender_name: lender.legal_name },
      })

      setLenders(prev => prev.map(l => 
        l.id === lender.id 
          ? { ...l, is_frozen: false, freeze_reason: undefined, freeze_date: undefined }
          : l
      ))

      setSuccessMsg(`Account for ${lender.legal_name} has been unfrozen`)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg('Failed to unfreeze account')
      setTimeout(() => setErrorMsg(''), 5000)
    }
  }

  const sendEmergencyMessage = async () => {
    if (!emergencyMessage.subject.trim() || !emergencyMessage.message.trim()) return
    
    setSendingMessage(true)
    try {
      const { error } = await supabase
        .from('emergency_communications')
        .insert({
          subject: emergencyMessage.subject,
          message: emergencyMessage.message,
          recipient_type: emergencyMessage.recipient_type,
          sent_by: localStorage.getItem('userName') || 'System Admin',
          sent_at: new Date().toISOString(),
        })

      if (error) throw error

      await logAudit({
        action: 'emergency.message_sent',
        entity_type: 'communication',
        details: { 
          subject: emergencyMessage.subject, 
          recipient_type: emergencyMessage.recipient_type 
        },
      })

      setSuccessMsg('Emergency message sent successfully')
      setEmergencyMessage({ subject: '', message: '', recipient_type: 'all' })
      fetchMessageHistory()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg('Failed to send emergency message')
      setTimeout(() => setErrorMsg(''), 5000)
    }
    setSendingMessage(false)
  }

  const toggleSystemLock = async (lockId: string) => {
    const lock = systemLocks.find(l => l.id === lockId)
    if (!lock) return

    const newLockedState = !lock.locked
    
    setSystemLocks(prev => prev.map(l => 
      l.id === lockId 
        ? { 
            ...l, 
            locked: newLockedState, 
            locked_by: newLockedState ? localStorage.getItem('userName') || 'System Admin' : undefined,
            locked_at: newLockedState ? new Date().toISOString() : undefined
          }
        : l
    ))

    await logAudit({
      action: newLockedState ? 'system.lock' : 'system.unlock',
      entity_type: 'system',
      entity_id: lockId,
      details: { feature: lock.feature, locked: newLockedState },
    })

    setSuccessMsg(`${lock.feature} has been ${newLockedState ? 'locked' : 'unlocked'}`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const filteredLenders = lenders.filter(l => 
    l.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Intervention Tools</h2>
          <p className="text-sm text-neutral-500">Emergency controls and system administration</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-medium text-red-700">Emergency Access</span>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
        {[
          { id: 'accounts', label: 'Account Control', icon: Building },
          { id: 'communications', label: 'Emergency Comms', icon: Radio },
          { id: 'locks', label: 'System Locks', icon: Lock },
          { id: 'overrides', label: 'Overrides', icon: Shield },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white shadow text-neutral-900' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Control Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900">Lender Account Control</h3>
                <p className="text-xs text-neutral-500">Freeze or unfreeze lender accounts in case of violations or emergencies</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search lenders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cashub-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Lender</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Loans</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Borrowers</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Account State</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {filteredLenders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-400">
                          No lenders found
                        </td>
                      </tr>
                    ) : (
                      filteredLenders.map(lender => (
                        <tr key={lender.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-neutral-900">{lender.legal_name}</p>
                            <p className="text-xs text-neutral-400">{lender.registration_number}</p>
                            <p className="text-xs text-neutral-400">{lender.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              lender.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {lender.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{lender.total_loans}</td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{lender.total_borrowers}</td>
                          <td className="px-4 py-3">
                            {lender.is_frozen ? (
                              <div className="flex items-center gap-1">
                                <Ban className="w-4 h-4 text-red-500" />
                                <div>
                                  <span className="text-xs font-medium text-red-600">Frozen</span>
                                  <p className="text-xs text-neutral-400">{lender.freeze_reason}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {lender.is_frozen ? (
                              <button
                                onClick={() => unfreezeAccount(lender)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                Unfreeze
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedLender(lender)
                                  setFreezeModalOpen(true)
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Freeze
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Communications Tab */}
      {activeTab === 'communications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500" />
              Send Emergency Message
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase">Recipients</label>
                <select
                  value={emergencyMessage.recipient_type}
                  onChange={(e) => setEmergencyMessage(prev => ({ ...prev, recipient_type: e.target.value as any }))}
                  className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
                >
                  <option value="all">All Users</option>
                  <option value="lenders">All Lenders</option>
                  <option value="borrowers">All Borrowers</option>
                  <option value="staff">Lender Staff Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase">Subject</label>
                <input
                  type="text"
                  value={emergencyMessage.subject}
                  onChange={(e) => setEmergencyMessage(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject..."
                  className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase">Message</label>
                <textarea
                  value={emergencyMessage.message}
                  onChange={(e) => setEmergencyMessage(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter emergency message..."
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 resize-none"
                />
              </div>
              <button
                onClick={sendEmergencyMessage}
                disabled={sendingMessage || !emergencyMessage.subject.trim() || !emergencyMessage.message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Emergency Message
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-5 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-900">Message History</h3>
              <p className="text-xs text-neutral-500">Recent emergency communications</p>
            </div>
            <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
              {messageHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-neutral-200 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No emergency messages sent yet</p>
                </div>
              ) : (
                messageHistory.map(msg => (
                  <div key={msg.id} className="p-4 hover:bg-neutral-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{msg.subject}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          To: {msg.recipient_type} • By: {msg.sent_by}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(msg.sent_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        {msg.acknowledged_count} ack
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Locks Tab */}
      {activeTab === 'locks' && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-2">System Feature Locks</h3>
          <p className="text-xs text-neutral-500 mb-4">
            Temporarily disable specific platform features during maintenance or emergencies
          </p>
          <div className="space-y-3">
            {systemLocks.map(lock => (
              <div
                key={lock.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  lock.locked ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${lock.locked ? 'bg-red-100' : 'bg-green-100'}`}>
                    {lock.locked ? (
                      <Lock className={`w-5 h-5 ${lock.locked ? 'text-red-600' : 'text-green-600'}`} />
                    ) : (
                      <Unlock className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${lock.locked ? 'text-red-900' : 'text-green-900'}`}>
                      {lock.feature}
                    </p>
                    {lock.locked && lock.locked_by && (
                      <p className="text-xs text-red-600">
                        Locked by {lock.locked_by} on {new Date(lock.locked_at!).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleSystemLock(lock.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    lock.locked
                      ? 'bg-red-200 text-red-700 hover:bg-red-300'
                      : 'bg-green-200 text-green-700 hover:bg-green-300'
                  }`}
                >
                  {lock.locked ? 'Unlock' : 'Lock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overrides Tab */}
      {activeTab === 'overrides' && (
        <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Data Overrides</h3>
              <p className="text-sm text-amber-800 mt-1">
                Direct database overrides require SQL access and are not available through this interface.
              </p>
              <p className="text-sm text-amber-700 mt-2">
                For emergency data corrections, please:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 mt-1 space-y-1">
                <li>Contact the technical team lead</li>
                <li>Use the Supabase SQL Editor with proper authorization</li>
                <li>Document all changes in the audit log</li>
                <li>Follow the emergency change management process</li>
              </ul>
              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-amber-800 font-medium">Emergency Contact:</p>
                <p className="text-xs text-amber-700">Tech Lead: Available 24/7 via emergency hotline</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {freezeModalOpen && selectedLender && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Freeze Account</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              You are about to freeze <strong>{selectedLender.legal_name}</strong>. This will prevent them from creating new loans, accessing borrower data, or performing any lending operations.
            </p>
            <div className="mb-4">
              <label className="text-xs font-medium text-neutral-600 uppercase">Reason for Freeze *</label>
              <textarea
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="Enter reason for freezing this account..."
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFreezeModalOpen(false)
                  setFreezeReason('')
                  setSelectedLender(null)
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={freezeAccount}
                disabled={!freezeReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Freeze Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
