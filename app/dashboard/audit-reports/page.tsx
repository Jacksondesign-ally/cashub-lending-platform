"use client"

import React, { useState } from 'react'
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, FileText, Zap, Settings2, BarChart3
} from 'lucide-react'

type Status = 'fixed' | 'pending' | 'in_progress'

interface AuditItem {
  id: string
  title: string
  file?: string
  issue: string
  fix: string
  status: Status
}

const criticalBugs: AuditItem[] = [
  {
    id: 'BUG-01', title: 'Borrower Payments Not Scoped (DATA LEAK)',
    file: 'app/borrower/page.tsx lines 209-221',
    issue: 'Fetches ALL payments in the system. Any borrower sees every other borrower\'s payment records.',
    fix: 'Scope query with .eq(\'borrower_id\', borrowerId) or .eq(\'borrower_email\', email).',
    status: 'fixed'
  },
  {
    id: 'BUG-02', title: 'Active Debt Eligibility Check Not Scoped (DATA LEAK)',
    file: 'app/borrower/page.tsx line 343',
    issue: 'Fetches ALL active loans system-wide during eligibility checks, not just the current borrower\'s.',
    fix: 'Scope to current borrower\'s ID or email.',
    status: 'fixed'
  },
  {
    id: 'BUG-03', title: 'Blacklist Eligibility Check Uses Wrong Column',
    file: 'app/borrower/page.tsx line 334',
    issue: '.eq(\'id_number\', bData?.id) compares id_number with the borrower UUID — these never match so the blacklist check never works.',
    fix: 'Use bData?.id_number or query by borrower email/name.',
    status: 'fixed'
  },
  {
    id: 'BUG-04', title: 'Scam Alert Check Queries Non-Existent Column',
    file: 'app/borrower/page.tsx line 337',
    issue: '.eq(\'reported_email\', userEmail) — scam_alerts table uses suspect_name and suspect_id, not reported_email. Check silently fails.',
    fix: 'Query by suspect_id matching borrower\'s id_number, or by suspect_name.',
    status: 'fixed'
  },
  {
    id: 'BUG-05', title: 'Loan Agreement Fetches Any Borrower\'s Loan',
    file: 'app/borrower/agreement/page.tsx lines 67-73',
    issue: 'Fetches the most recent approved loan globally with no borrower filter. Any borrower can view and sign another borrower\'s loan agreement.',
    fix: 'Filter by borrower_id or borrower_email matching the current user.',
    status: 'fixed'
  },
  {
    id: 'BUG-06', title: 'Lender Fallback Fetches ALL Loans (DATA LEAK)',
    file: 'app/lender/loans/page.tsx, reports/page.tsx, compliance/page.tsx',
    issue: 'If lenderId is null (localStorage not set), the else branch fetches ALL loans in the system with no scoping.',
    fix: 'Show an error or empty state when lenderId is missing — never fetch unscoped data.',
    status: 'fixed'
  },
  {
    id: 'BUG-07', title: 'No Server-Side Route Protection',
    file: 'middleware.ts',
    issue: 'All authentication checks are client-side via localStorage. Anyone can navigate directly to /lender, /dashboard, or /borrower without being logged in.',
    fix: 'Middleware simplified to pass-through. Full server-side protection requires cookie-based Supabase auth.',
    status: 'in_progress'
  },
]

const highBugs: AuditItem[] = [
  {
    id: 'BUG-08', title: 'Duplicate Loan Records in Borrower Portal',
    file: 'app/borrower/page.tsx lines 170-204',
    issue: 'Both loans table and loan_applications table are fetched and merged. When an application converts to a loan, both appear — creating duplicates.',
    fix: 'Exclude loan_applications that have a corresponding loans record, or deduplicate by a linking field.',
    status: 'fixed'
  },
  {
    id: 'BUG-09', title: 'Fabricated Email for Non-Email Usernames',
    file: 'app/borrower/page.tsx line 129',
    issue: 'If userName in localStorage is a display name (e.g., "John Doe"), a fake email "john.doe@email.com" is used for all DB queries. This could match the wrong borrower.',
    fix: 'Store the actual email separately in localStorage during login.',
    status: 'fixed'
  },
  {
    id: 'BUG-10', title: 'Staff Deletion Permanently Removes Auth Record',
    file: 'app/lender/staff/page.tsx lines 68-70',
    issue: 'Permanently deletes the user profile record — orphaning Supabase auth records, loans, payments, and other linked data.',
    fix: 'Soft-delete by setting is_active = false instead.',
    status: 'fixed'
  },
  {
    id: 'BUG-11', title: '"Mark as Under Review" Only Updates Local State',
    file: 'app/dashboard/onboarding/page.tsx lines 509-511',
    issue: 'Updates React state only — never persisted to Supabase. Refreshing the page reverts the status.',
    fix: 'Add supabase.from(\'lender_onboarding\').update({ status: \'under_review\' }) call.',
    status: 'pending'
  },
  {
    id: 'BUG-12', title: 'Loan Expanded View Never Renders',
    file: 'app/lender/loans/page.tsx line 37',
    issue: 'expandedId state and expand/collapse buttons exist, but no expanded detail row is rendered. The button does nothing visible.',
    fix: 'Add a conditional row below each loan row that shows details when expanded.',
    status: 'fixed'
  },
]

const inconsistencies: AuditItem[] = [
  { id: 'INC-01', title: 'Two Separate Blacklist Tables', issue: 'Lender portal uses blacklist table; Borrower portal uses borrower_blacklist. Entries in one don\'t appear in the other.', fix: 'Consolidate to a single blacklist table with appropriate views per portal.', status: 'fixed' },
  { id: 'INC-02', title: 'Package Pricing Defined in Multiple Places', issue: 'signup/page.tsx, onboarding/page.tsx, and lender/billing/page.tsx each define their own package tiers and prices.', fix: 'Create a single lib/packages.ts constants file as source of truth.', status: 'fixed' },
  { id: 'INC-03', title: 'Compliance Checklist is Hardcoded', issue: 'All checklist items and their done status are static booleans — don\'t reflect actual system state.', fix: 'Derive checklist states from real data or make them toggleable with persistence.', status: 'fixed' },
  { id: 'INC-04', title: 'Dashboard Stats Show Fake Growth Percentages', issue: 'Values like +12.5%, +8.2% are hardcoded strings, not calculated from historical data.', fix: 'Calculate from last-month vs. current-month data, or remove change indicators.', status: 'fixed' },
  { id: 'INC-05', title: 'Reports Period Filter Does Nothing', issue: 'period state is declared and watched by useEffect, but never used in any query.', fix: 'Implement period filtering with date range queries.', status: 'fixed' },
  { id: 'INC-06', title: 'Dashboard Layout References Removed Roles', issue: 'Handles lender, admin, viewer roles which were removed from the system.', fix: 'Clean up to only handle super_admin, lender_admin, loan_officer, borrower.', status: 'fixed' },
  { id: 'INC-07', title: 'Scam Alerts Fetches All Lenders\' Alerts', issue: 'Fetch has no submitted_by filter — all scam alerts from every lender are displayed.', fix: 'Add .eq(\'submitted_by\', lenderEmail) for the "my submissions" view.', status: 'fixed' },
  { id: 'INC-08', title: 'Logos and Documents Stored as Base64 in Database', issue: 'Entire file contents stored as base64 data URLs — significantly bloats the database for large images/PDFs.', fix: 'Use Supabase Storage buckets; store only the URL/path in the database.', status: 'documented' },
  { id: 'INC-09', title: 'Borrower Avatar Stored in localStorage', issue: 'Profile photos stored as base64 in localStorage — device-specific, won\'t persist across browsers, counts toward 5MB limit.', fix: 'Upload to Supabase Storage, store URL in borrower profile.', status: 'documented' },
  { id: 'INC-10', title: 'OTP and Selfie Signing Not Implemented', issue: 'OTP just sets otpSent = true without sending anything. Selfie has no camera integration. Both are non-functional placeholders.', fix: 'Implement with a real SMS provider (e.g., Twilio) and camera API, or disable these options.', status: 'fixed' },
  { id: 'INC-11', title: 'Download PDF Not Implemented', issue: '"Download PDF" button renders but has no onClick handler — it does nothing.', fix: 'Implement with jspdf or @react-pdf/renderer.', status: 'fixed' },
  { id: 'INC-12', title: 'Billing Plan Changes Are UI Stubs', issue: 'Plan upgrade/downgrade buttons exist but no payment gateway or subscription update logic is connected.', fix: 'Integrate a payment provider or clearly mark as "Contact support to change plan."', status: 'fixed' },
  { id: 'INC-13', title: 'No Pagination Anywhere', issue: 'Every data fetch loads all records at once — will cause performance issues with hundreds of records.', fix: 'Implement cursor-based or offset pagination with page size of 20-50 records.', status: 'fixed' },
  { id: 'INC-14', title: 'Silent Error Handling (Empty Catch Blocks)', issue: '20+ instances of empty catch blocks with no error logging or user feedback.', fix: 'console.error all caught errors. Show toast notifications for user-facing failures.', status: 'fixed' },
  { id: 'INC-15', title: 'Notifications Tab is Empty', issue: 'The "Notifications" tab appears in the borrower tab bar but has no implementation.', fix: 'Implement or remove from the tab list.', status: 'fixed' },
  { id: 'INC-16', title: 'Borrower Portal is a Single 1549-Line File', issue: 'All 11 tabs are in one massive component with 30+ state variables — very difficult to maintain.', fix: 'Split into sub-pages using Next.js file-based routing.', status: 'documented' },
  { id: 'INC-17', title: 'Stale localStorage Cache for Lender Info', issue: 'If lenderCompany, lenderLogo, lenderId change in the database, the cached values remain stale until next login.', fix: 'Refresh from Supabase on layout mount, or use React Context with periodic sync.', status: 'fixed' },
  { id: 'INC-18', title: 'Metadata Title Inconsistency', issue: 'app/layout.tsx title is "CashHub - Microlenders" (lowercase h). Rest of app uses "CasHuB".', fix: 'Standardize to "CasHuB" everywhere.', status: 'fixed' },
  { id: 'INC-19', title: 'Lender Onboarding Package Filter Missing New Tiers', issue: 'Package filter shows free-trial, basic, medium, advanced but signup creates starter, professional, enterprise tiers.', fix: 'Update the filter to include all tiers, or consolidate tier names.', status: 'fixed' },
]

const suggestions: AuditItem[] = [
  { id: 'S01', title: 'Server-Side Middleware for Auth', issue: 'All route protection is client-side only.', fix: 'Create middleware.ts to validate Supabase auth sessions server-side. Enforce role-based access.', status: 'in_progress' },
  { id: 'S02', title: 'Move to Supabase Storage for All Files', issue: 'Base64 blobs in DB columns bloat storage by 10-100x.', fix: 'Replace base64 storage for logos, documents, avatars, signatures with Supabase Storage buckets.', status: 'pending' },
  { id: 'S03', title: 'Real-Time Notifications via Supabase Realtime', issue: 'No live updates — users must refresh to see changes.', fix: 'Subscribe to loan_applications, loans, payments, blacklist table changes for instant push notifications.', status: 'pending' },
  { id: 'S04', title: 'Automated Credit Scoring Engine', issue: 'Credit scores are static values with no dynamic calculation.', fix: 'Build scoring algorithm that adjusts based on repayment history, defaults, active debt ratio.', status: 'pending' },
  { id: 'S05', title: 'Smart Loan Matching', issue: 'Marketplace matching is manual.', fix: 'Auto-match loan requests with lenders based on amount, risk level, approval rate, geography.', status: 'pending' },
  { id: 'S06', title: 'Payment Reminders & Scheduling', issue: 'No automated payment reminders.', fix: 'SMS/email reminders 3 days before due. Escalation alerts for 7/14/30-day overdue.', status: 'pending' },
  { id: 'S07', title: 'Comprehensive Audit Trail', issue: 'Critical actions are not logged consistently.', fix: 'Log all approvals, rejections, blacklist actions, payments, settings changes to audit_logs table.', status: 'pending' },
  { id: 'S08', title: 'Split Borrower Portal into Sub-Routes', issue: '1549-line single file is unmaintainable.', fix: 'Refactor into app/borrower/loans, apply, marketplace, documents sub-pages.', status: 'pending' },
  { id: 'S09', title: 'Server-Side Data Fetching for Sensitive Queries', issue: 'All queries run client-side, exposing logic and keys in the browser bundle.', fix: 'Move critical queries to Next.js Server Actions or API routes.', status: 'pending' },
  { id: 'S10', title: 'Centralized State Management', issue: 'Scattered localStorage.getItem() calls across 30+ pages — no single source of truth.', fix: 'Replace with React Context or Zustand store for user info, lender ID, company details.', status: 'pending' },
  { id: 'S11', title: 'Form Validation with Zod', issue: 'No schema validation before database inserts.', fix: 'Add Zod schema validation on all forms — loan applications, registration, blacklist, staff invites.', status: 'pending' },
  { id: 'S12', title: 'Interest Rate Compliance Auto-Check', issue: 'Loans can be created with any interest rate including non-compliant ones.', fix: 'Auto-flag loans where rates exceed NAMFISA regulatory caps. Block non-compliant loan creation.', status: 'pending' },
  { id: 'S13', title: 'Visual Analytics with Charts', issue: 'Stats shown as static numbers with no trend visualization.', fix: 'Add Recharts for disbursement volume, collection trends, risk distribution, revenue waterfall.', status: 'pending' },
  { id: 'S14', title: 'Automated Overdue Detection', issue: 'Loan overdue status must be updated manually.', fix: 'Supabase Edge Function/cron job that checks schedules daily and auto-marks overdue/defaulted loans.', status: 'pending' },
  { id: 'S15', title: 'Complete Multi-Language (i18n) Support', issue: 'Language dropdown exists but translations are incomplete.', fix: 'Implement next-intl or i18next for English, Afrikaans, and Oshiwambo.', status: 'pending' },
]

const statusConfig: Record<Status, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  fixed:       { label: 'Fixed',       icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  in_progress: { label: 'In Progress', icon: <Clock className="w-4 h-4" />,        color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  pending:     { label: 'Pending',     icon: <XCircle className="w-4 h-4" />,      color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
}

function AuditCard({ item }: { item: AuditItem }) {
  const [open, setOpen] = useState(false)
  const s = statusConfig[item.status]
  return (
    <div className={`border rounded-lg overflow-hidden ${s.bg}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-400 w-14 shrink-0">{item.id}</span>
          <span className="text-sm font-semibold text-neutral-800">{item.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${s.bg} ${s.color}`}>
            {s.icon} {s.label}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-neutral-200 pt-3">
          {item.file && (
            <p className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-1 rounded">📁 {item.file}</p>
          )}
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase mb-1">Issue</p>
            <p className="text-sm text-neutral-700">{item.issue}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">Fix</p>
            <p className="text-sm text-neutral-700">{item.fix}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: AuditItem[]; color: string }) {
  const fixed = items.filter(i => i.status === 'fixed').length
  const inProgress = items.filter(i => i.status === 'in_progress').length
  const pending = items.filter(i => i.status === 'pending').length
  return (
    <div className="mb-8">
      <div className={`flex items-center gap-3 mb-4 p-4 rounded-xl ${color}`}>
        {icon}
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <p className="text-xs text-neutral-500">
            {fixed > 0 && <span className="text-green-600 font-medium mr-3">✓ {fixed} Fixed</span>}
            {inProgress > 0 && <span className="text-blue-600 font-medium mr-3">⟳ {inProgress} In Progress</span>}
            {pending > 0 && <span className="text-orange-600 font-medium">✗ {pending} Pending</span>}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map(item => <AuditCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

export default function AuditReportsPage() {
  const allItems = [...criticalBugs, ...highBugs, ...inconsistencies, ...suggestions]
  const totalFixed = allItems.filter(i => i.status === 'fixed').length
  const totalInProgress = allItems.filter(i => i.status === 'in_progress').length
  const totalPending = allItems.filter(i => i.status === 'pending').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">System Audit Report</h1>
        <p className="text-neutral-500 text-sm">Scope: Lender Portal · Borrower Portal · Super Admin · Auth Flow · Shared Utilities</p>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-neutral-900">{allItems.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Total Issues</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{totalFixed}</p>
          <p className="text-xs text-green-600 mt-1">Fixed</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{totalInProgress}</p>
          <p className="text-xs text-blue-600 mt-1">In Progress</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-700">{totalPending}</p>
          <p className="text-xs text-orange-600 mt-1">Pending</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white border border-neutral-200 rounded-xl p-4">
        <div className="flex justify-between text-xs text-neutral-500 mb-2">
          <span>Overall Fix Progress</span>
          <span>{Math.round((totalFixed / allItems.length) * 100)}% complete</span>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden flex">
          <div className="bg-green-500 h-full transition-all" style={{ width: `${(totalFixed / allItems.length) * 100}%` }} />
          <div className="bg-blue-400 h-full transition-all" style={{ width: `${(totalInProgress / allItems.length) * 100}%` }} />
        </div>
      </div>

      {/* Sections */}
      <Section
        title="Section A — Critical Bugs (Fix Immediately)"
        icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
        items={criticalBugs}
        color="bg-red-50"
      />
      <Section
        title="Section B — High Priority Bugs"
        icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        items={highBugs}
        color="bg-orange-50"
      />
      <Section
        title="Section C — Inconsistencies & Workflow Issues"
        icon={<Settings2 className="w-6 h-6 text-yellow-600" />}
        items={inconsistencies}
        color="bg-yellow-50"
      />
      <Section
        title="Section D — Smart System Improvements"
        icon={<Zap className="w-6 h-6 text-purple-600" />}
        items={suggestions}
        color="bg-purple-50"
      />

      {/* Priority Matrix */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-bold text-neutral-900">Priority Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 pr-4 text-neutral-600 font-medium">Priority</th>
                <th className="text-left py-2 pr-4 text-neutral-600 font-medium">Count</th>
                <th className="text-left py-2 text-neutral-600 font-medium">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr><td className="py-2 pr-4 font-semibold text-red-600">Critical (fix now)</td><td className="py-2 pr-4">7</td><td className="py-2 text-neutral-500">BUG-01 through BUG-07</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-orange-600">High (fix this sprint)</td><td className="py-2 pr-4">5</td><td className="py-2 text-neutral-500">BUG-08 through BUG-12</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-yellow-600">Medium (next sprint)</td><td className="py-2 pr-4">19</td><td className="py-2 text-neutral-500">INC-01 through INC-19</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-purple-600">Enhancement (roadmap)</td><td className="py-2 pr-4">15</td><td className="py-2 text-neutral-500">S01 through S15</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-neutral-400 text-center pb-6">
        <FileText className="w-4 h-4 inline mr-1" />
        CasHuB System Audit — Auditor: Cascade AI · Click any item to expand details
      </div>
    </div>
  )
}









