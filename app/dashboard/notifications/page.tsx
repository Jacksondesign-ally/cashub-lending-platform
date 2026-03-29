"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, Search, RefreshCw, CheckCircle, AlertTriangle, Info, Building, User, Gavel, Shield, Clock, Trash2 } from 'lucide-react'

type NotifType = 'lender_onboarding' | 'dispute' | 'scam_alert' | 'blacklist' | 'subscription' | 'system'

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  is_read: boolean
  created_at: string
  link?: string
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  lender_onboarding: { icon: Building,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
  dispute:           { icon: Gavel,           color: 'text-amber-600',  bg: 'bg-amber-50' },
  scam_alert:        { icon: AlertTriangle,   color: 'text-rose-600',   bg: 'bg-rose-50' },
  blacklist:         { icon: Shield,          color: 'text-red-600',    bg: 'bg-red-50' },
  subscription:      { icon: CheckCircle,     color: 'text-green-600',  bg: 'bg-green-50' },
  system:            { icon: Info,            color: 'text-blue-600',   bg: 'bg-blue-50' },
}

// Generate notifications from real data if no notifications table exists
async function generateNotificationsFromData(): Promise<Notification[]> {
  const notifs: Notification[] = []

  const [{ data: onboarding }, { data: disputes }, { data: scamAlerts }] = await Promise.all([
    supabase.from('lender_onboarding').select('id, company_name, status, submitted_at').eq('status', 'pending').order('submitted_at', { ascending: false }).limit(10),
    supabase.from('borrower_disputes').select('id, dispute_number, status, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
    supabase.from('scam_alerts').select('id, alert_title, status, created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(10),
  ])

  ;(onboarding || []).forEach((o: any) => notifs.push({
    id: `onboard-${o.id}`,
    type: 'lender_onboarding',
    title: 'New Lender Application',
    message: `${o.company_name} has submitted a lender registration request pending your review.`,
    is_read: false,
    created_at: o.submitted_at,
    link: '/dashboard/onboarding',
  }))

  ;(disputes || []).forEach((d: any) => notifs.push({
    id: `dispute-${d.id}`,
    type: 'dispute',
    title: 'Open Dispute Awaiting Review',
    message: `Dispute ${d.dispute_number || d.id?.slice(0, 8)} is pending resolution.`,
    is_read: false,
    created_at: d.created_at,
    link: '/dashboard/disputes',
  }))

  ;(scamAlerts || []).forEach((s: any) => notifs.push({
    id: `scam-${s.id}`,
    type: 'scam_alert',
    title: 'Active Scam Alert',
    message: `${s.alert_title || 'Scam alert'} is currently active and visible to all lenders.`,
    is_read: false,
    created_at: s.created_at,
    link: '/dashboard/scam-alerts',
  }))

  return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const notifs = await generateNotificationsFromData()
      setNotifications(notifs)
    } catch (err) { console.error('[CasHuB Error]', err); setNotifications([]) }
    setLoading(false)
  }

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))

  const filtered = notifications.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || !n.is_read
    return matchSearch && matchFilter
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Notifications</h2>
          <p className="text-neutral-500 text-sm">Platform-level alerts and activity updates</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          {unreadCount > 0 && (
            <>
              <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{unreadCount} Unread</span>
              <button onClick={markAllRead} className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg font-medium transition-colors">Mark all read</button>
            </>
          )}
          <button onClick={fetchNotifications} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications..." className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
        </div>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Bell className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">No notifications</p>
            <p className="text-neutral-400 text-sm mt-1">System alerts will appear here automatically based on platform activity.</p>
          </div>
        )}
        {filtered.map(notif => {
          const cfg = TYPE_CONFIG[notif.type]
          const Icon = cfg.icon
          return (
            <div key={notif.id} className={`bg-white rounded-xl shadow-sm border transition-all ${notif.is_read ? 'border-neutral-200 opacity-75' : 'border-l-4 border-l-cashub-500 border-neutral-200'}`}>
              <div className="p-4 flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${cfg.bg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold ${notif.is_read ? 'text-neutral-600' : 'text-neutral-900'}`}>{notif.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-neutral-400 whitespace-nowrap">{new Date(notif.created_at).toLocaleDateString()}</span>
                      {!notif.is_read && <div className="w-2 h-2 bg-cashub-500 rounded-full" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {notif.link && (
                      <a href={notif.link} onClick={() => markRead(notif.id)} className="text-xs text-cashub-600 hover:text-cashub-700 font-medium hover:underline">
                        View →
                      </a>
                    )}
                    {!notif.is_read && (
                      <button onClick={() => markRead(notif.id)} className="text-xs text-neutral-500 hover:text-neutral-700">
                        Mark read
                      </button>
                    )}
                    <button onClick={() => dismiss(notif.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5">
                      <Trash2 className="w-3 h-3" /> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

