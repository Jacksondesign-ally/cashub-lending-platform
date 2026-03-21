# CasHuB System Audit Report

**Date:** June 2025
**Scope:** Full-system audit — Lender Portal, Borrower Portal, Super Admin Portal, Auth Flow, Shared Utilities
**Auditor:** Cascade AI

---

## Executive Summary

The CasHuB platform has a solid feature set covering the full lending lifecycle. However, the audit uncovered **7 critical security/data bugs**, **19 inconsistencies and workflow issues**, and identified **15 smart system improvements**. The most urgent issues are **data isolation failures** where users can see other users' data, and the **complete absence of server-side route protection**.

---

## SECTION A — CRITICAL BUGS (Fix Immediately)

### BUG-01: Borrower Payments Not Scoped (DATA LEAK)
- **File:** `app/borrower/page.tsx` lines 209-221
- **Issue:** `supabase.from('payments').select('*').order(...).limit(20)` fetches ALL payments in the system. Any borrower sees every other borrower's payment records.
- **Fix:** Add `.eq('borrower_id', borrowerId)` or `.eq('borrower_email', email)` filter.

### BUG-02: Active Debt Eligibility Check Not Scoped (DATA LEAK)
- **File:** `app/borrower/page.tsx` line 343
- **Issue:** `supabase.from('loans').select(...).eq('status', 'active')` fetches ALL active loans system-wide during eligibility checks, not just the current borrower's.
- **Fix:** Scope to current borrower's ID or email.

### BUG-03: Blacklist Eligibility Check Uses Wrong Column
- **File:** `app/borrower/page.tsx` line 334
- **Issue:** `.eq('id_number', bData?.id || '')` compares the `id_number` column with the borrower's UUID (`bData.id`). These are completely different values, so the blacklist check **never matches**.
- **Fix:** Use `bData?.id_number` or query by borrower email/name instead.

### BUG-04: Scam Alert Eligibility Check Queries Non-Existent Column
- **File:** `app/borrower/page.tsx` line 337
- **Issue:** `.eq('reported_email', userEmail)` — the `scam_alerts` table uses `suspect_name` and `suspect_id`, not `reported_email`. This check silently fails.
- **Fix:** Query by `suspect_id` matching borrower's `id_number`, or by `suspect_name`.

### BUG-05: Loan Agreement Fetches Any Borrower's Loan
- **File:** `app/borrower/agreement/page.tsx` lines 67-73
- **Issue:** Fetches the most recent `approved` loan globally with no borrower filter. Any borrower can view and sign another borrower's loan agreement.
- **Fix:** Filter by `borrower_id` or `borrower_email` matching the current user.

### BUG-06: Lender Fallback Fetches ALL Loans (DATA LEAK)
- **File:** `app/lender/loans/page.tsx` lines 71-73
- **Issue:** If `lenderId` is null (localStorage not set), the else branch fetches ALL loans in the system: `supabase.from('loans').select(sel).order(...)`.
- **Same pattern in:** `app/lender/reports/page.tsx` lines 69-71, `app/lender/compliance/page.tsx` lines 18-25
- **Fix:** Show an error or empty state when lenderId is missing, never fetch unscoped data.

### BUG-07: No Server-Side Route Protection (NO MIDDLEWARE)
- **Issue:** No `middleware.ts` file exists. All authentication checks are client-side via `localStorage`. Anyone can navigate directly to `/lender`, `/dashboard`, or `/borrower` URLs without being logged in.
- **Impact:** All portals are accessible by typing the URL. Data queries will still run (though RLS may block some).
- **Fix:** Create `middleware.ts` that validates Supabase auth session and redirects unauthenticated users to `/login`.

---

## SECTION B — BUGS (High Priority)

### BUG-08: Duplicate Loan Records in Borrower Portal
- **File:** `app/borrower/page.tsx` lines 170-204
- **Issue:** Both `loans` table and `loan_applications` table are fetched and merged into the same list. When a `loan_application` is converted into a `loan`, both the original application and the new loan appear — creating duplicates.
- **Fix:** Exclude `loan_applications` that have a corresponding `loans` record, or deduplicate by a linking field.

### BUG-09: Fabricated Email for Non-Email Usernames
- **File:** `app/borrower/page.tsx` line 129
- **Issue:** `name.includes('@') ? name : \`${name.toLowerCase().replace(/\\s/g, '.')}@email.com\`` — if `userName` in localStorage is a display name (e.g., "John Doe"), a fake email "john.doe@email.com" is used for all database queries. This could match the wrong borrower or match nobody.
- **Fix:** Store the actual email separately in localStorage during login (it's available from `authData.user.email`).

### BUG-10: Staff Deletion Deletes Auth User Record
- **File:** `app/lender/staff/page.tsx` lines 68-70
- **Issue:** `supabase.from('users').delete().eq('id', id)` permanently deletes the user profile record. This could orphan Supabase auth records, loans, payments, and other linked data.
- **Fix:** Soft-delete by setting `status = 'removed'` or `is_active = false` instead.

### BUG-11: "Mark as Under Review" Only Updates Local State
- **File:** `app/dashboard/onboarding/page.tsx` lines 509-511
- **Issue:** The "Mark as Under Review" button updates React state only — the change is never persisted to Supabase. Refreshing the page reverts the status.
- **Fix:** Add a `supabase.from('lender_onboarding').update({ status: 'under_review' })` call.

### BUG-12: Loan Expanded View Never Renders
- **File:** `app/lender/loans/page.tsx` line 37
- **Issue:** `expandedId` state and expand/collapse buttons exist, but no expanded detail row is rendered in the table. The button does nothing visible.
- **Fix:** Add a conditional row below each loan row that shows details (purpose, dates, etc.) when expanded.

---

## SECTION C — INCONSISTENCIES & WORKFLOW ISSUES

### INC-01: Two Separate Blacklist Tables
- Lender portal uses the `blacklist` table (in blacklist page, registry, eligibility checks)
- Borrower portal uses `borrower_blacklist` table (line 291-308)
- These are different tables with different schemas, creating a split data source where blacklist entries in one table don't appear in the other.
- **Recommendation:** Consolidate to a single `blacklist` table with views/queries appropriate for each portal.

### INC-02: Package Pricing Defined in Multiple Places
- `app/signup/page.tsx` (`LENDER_PACKAGES`): Starter N$250, Professional N$350, Enterprise N$500
- `app/dashboard/onboarding/page.tsx` (`PACKAGE_INFO`): Also defines free-trial N$0, basic N$499, medium N$999, advanced N$1999
- `app/lender/billing/page.tsx`: Has its own plan definitions
- **Recommendation:** Create a single `lib/packages.ts` constants file as the source of truth.

### INC-03: Compliance Checklist is Hardcoded
- **File:** `app/lender/compliance/page.tsx` lines 131-137
- All checklist items and their `done` status are static booleans. They don't reflect actual system state (e.g., whether all borrowers actually have ID documents).
- **Recommendation:** Derive checklist states from real data or make them toggleable with persistence.

### INC-04: Dashboard Stats Show Fake Growth Percentages
- **File:** `app/dashboard/page.tsx` lines 163-166
- Values like `+12.5%`, `+8.2%`, `+15.3%` are hardcoded strings, not calculated from historical data.
- **Recommendation:** Calculate from last-month vs. current-month data, or remove the change indicators.

### INC-05: Reports Period Filter Does Nothing
- **File:** `app/lender/reports/page.tsx` lines 26-28
- `period` state is declared and watched by `useEffect`, but never used in any query. No UI control to change it either.
- **Recommendation:** Implement period filtering (this month, last 3 months, YTD, all time) with date range queries.

### INC-06: Dashboard Layout References Removed Roles
- **File:** `app/dashboard/layout.tsx` lines 44, 52, 60
- Handles `lender`, `admin`, and `viewer` roles which were removed from the system. Dashboard module filter also includes these roles.
- **Recommendation:** Clean up to only handle `super_admin`, `lender_admin`, `loan_officer`, `borrower`.

### INC-07: Scam Alerts Fetches All Lenders' Alerts
- **File:** `app/lender/scam-alerts/page.tsx` lines 35-39
- The fetch has no `submitted_by` filter — all scam alerts from every lender are displayed. The blacklist page correctly filters by `submitted_by`, but scam alerts doesn't.
- **Recommendation:** Add `.eq('submitted_by', lenderEmail)` for the "my submissions" view, or clearly label it as a shared feed.

### INC-08: Logo and Documents Stored as Base64 in Database
- **Files:** `app/lender/settings/page.tsx` (logo), `app/borrower/page.tsx` line 498 (documents)
- Entire file contents stored as base64 data URLs in database columns. For large images/PDFs, this significantly bloats the database.
- **Recommendation:** Use Supabase Storage buckets; store only the URL/path in the database.

### INC-09: Borrower Avatar Stored in localStorage
- **File:** `app/borrower/page.tsx` line 1058
- Profile photos stored as base64 in `localStorage` keyed by email. This is device-specific, won't persist across browsers/devices, and counts toward the 5MB localStorage limit.
- **Recommendation:** Upload to Supabase Storage, store URL in borrower profile.

### INC-10: OTP and Selfie Signing Not Implemented
- **File:** `app/borrower/agreement/page.tsx` lines 140-142, 423-434
- OTP just sets `otpSent = true` without sending anything. Selfie has no camera integration. Both are non-functional placeholders.
- **Recommendation:** Either implement with a real SMS provider (e.g., Twilio) and camera API, or remove/disable these options.

### INC-11: Download PDF Not Implemented
- **File:** `app/borrower/agreement/page.tsx` line 472
- "Download PDF" button renders but has no `onClick` handler — it does nothing.
- **Recommendation:** Implement with a library like `jspdf` or `@react-pdf/renderer`.

### INC-12: Billing Plan Changes Are UI Stubs
- **File:** `app/lender/billing/page.tsx`
- Plan upgrade/downgrade buttons exist but no payment gateway or subscription update logic is connected.
- **Recommendation:** Integrate a payment provider or clearly mark as "Contact support to change plan."

### INC-13: No Pagination Anywhere
- Every data fetch loads all records at once. For a system with hundreds of loans/borrowers/payments, this will cause performance degradation.
- **Recommendation:** Implement cursor-based or offset pagination with a reasonable page size (20-50 records).

### INC-14: Silent Error Handling (Empty Catch Blocks)
- Found 20+ instances of `catch {}` or `catch { setX([]) }` across the codebase with no error logging or user feedback.
- **Recommendation:** At minimum, `console.error` all caught errors. Show toast notifications for user-facing failures.

### INC-15: Notifications Tab is Empty
- **File:** `app/borrower/page.tsx` — The "Notifications" tab appears in the tab bar but has no implementation.
- **Recommendation:** Implement or remove from the tab list.

### INC-16: Borrower Portal is a Single 1549-Line File
- **File:** `app/borrower/page.tsx`
- All 11 tabs are in one massive component with 30+ state variables. This makes maintenance, testing, and code review very difficult.
- **Recommendation:** Split into sub-pages using Next.js file-based routing (`app/borrower/loans/page.tsx`, etc.).

### INC-17: stale localStorage Cache for Lender Info
- Multiple pages read `lenderCompany`, `lenderLogo`, `lenderId` from localStorage. If these values change in the database (e.g., company name updated in settings), the cached values become stale until next login.
- **Recommendation:** Refresh from Supabase on layout mount, or use React Context with periodic sync.

### INC-18: Metadata Title Inconsistency
- **File:** `app/layout.tsx` line 16: Title is "CashHub - Microlenders" (note lowercase 'h')
- The rest of the app uses "CasHuB" (with uppercase H and B).
- **Recommendation:** Standardize to "CasHuB" everywhere.

### INC-19: Lender Onboarding Package Filter Missing New Tiers
- **File:** `app/dashboard/onboarding/page.tsx` lines 349-356
- Package filter dropdown only shows `free-trial`, `basic`, `medium`, `advanced` — but the signup flow creates `starter`, `professional`, `enterprise` tiers. New signups won't match the old filters.
- **Recommendation:** Update the filter to include all tiers, or consolidate tier names.

---

## SECTION D — SMART SYSTEM SUGGESTIONS

### S01: Server-Side Middleware for Auth
Create `middleware.ts` to validate Supabase auth sessions. Redirect unauthenticated users to `/login`. Enforce role-based access (borrowers can't access `/lender`, etc.).

### S02: Move to Supabase Storage for All Files
Replace base64 storage for logos, documents, avatars, and signatures with Supabase Storage buckets. Store only URLs in the database. This reduces DB size by 10-100x for file-heavy records.

### S03: Real-Time Notifications via Supabase Realtime
Subscribe to changes on `loan_applications`, `loans`, `payments`, `blacklist` tables. Push instant notifications for: loan status changes, new marketplace offers, payment confirmations, blacklist alerts.

### S04: Automated Credit Scoring Engine
Build a scoring algorithm that auto-adjusts borrower `credit_score` based on:
- On-time repayment history (+points)
- Late payments (-points)
- Default events (-major points)
- Loan completion (+points)
- Active debt ratio (warning threshold)

### S05: Smart Loan Matching
Auto-match marketplace loan requests with lenders based on: loan amount vs. lender min/max range, borrower risk level vs. lender appetite, lender approval rate, and geographic proximity.

### S06: Payment Reminders & Scheduling
- SMS/email reminders 3 days before payment due date
- Support recurring payment schedules with auto-debit integration
- Escalation alerts for 7-day, 14-day, 30-day overdue

### S07: Comprehensive Audit Trail
Log all critical actions to the `audit_logs` table:
- Loan approvals/rejections
- Blacklist submissions/approvals
- Status changes
- Payment recordings
- Settings changes
This is essential for NAMFISA compliance.

### S08: Split Borrower Portal into Sub-Routes
Refactor the 1549-line `app/borrower/page.tsx` into:
- `app/borrower/page.tsx` (overview)
- `app/borrower/loans/page.tsx`
- `app/borrower/apply/page.tsx`
- `app/borrower/marketplace/page.tsx`
- `app/borrower/documents/page.tsx`
- etc.

### S09: Server-Side Data Fetching for Sensitive Queries
Move critical queries (all loans, all borrowers, financial summaries) to Next.js Server Actions or API routes. This prevents exposing query logic and Supabase keys in the client bundle.

### S10: Centralized State Management
Replace scattered `localStorage.getItem()` calls with React Context or Zustand store for user info, lender ID, and company details. Single source of truth, automatic sync.

### S11: Form Validation with Zod
Add schema validation on all forms (loan applications, borrower registration, blacklist submissions, staff invites) before database inserts. Catch invalid data early with clear error messages.

### S12: Interest Rate Compliance Auto-Check
Auto-flag loans where interest rates exceed NAMFISA regulatory caps. Show warnings in the compliance dashboard. Block creation of non-compliant loans.

### S13: Visual Analytics with Charts
Add Recharts or Chart.js for:
- Loan disbursement volume over time
- Collection trends (monthly/quarterly)
- Risk distribution pie charts
- Revenue vs. outstanding waterfall charts

### S14: Automated Overdue Detection
Create a Supabase Edge Function or cron job that:
- Checks loan payment schedules daily
- Auto-marks loans as `overdue` when payment dates pass
- Triggers notification to both lender and borrower
- Auto-escalates to `defaulted` after 60 days

### S15: Complete Multi-Language (i18n) Support
The `LanguageDropdown` component exists in the borrower portal but there's no actual translation implementation. Implement `next-intl` or `i18next` for English, Afrikaans, and Oshiwambo to serve the Namibian market.

---

## Priority Matrix

| Priority | Count | Items |
|----------|-------|-------|
| **Critical (fix now)** | 7 | BUG-01 through BUG-07 |
| **High (fix this sprint)** | 5 | BUG-08 through BUG-12 |
| **Medium (next sprint)** | 19 | INC-01 through INC-19 |
| **Enhancement (roadmap)** | 15 | S01 through S15 |

---

## Recommended Fix Order

1. **BUG-07** — Add middleware (blocks all unauthorized access)
2. **BUG-01, BUG-02, BUG-06** — Fix data scoping (prevents data leaks)
3. **BUG-03, BUG-04** — Fix eligibility checks (currently non-functional)
4. **BUG-05** — Fix agreement page scoping
5. **BUG-08, BUG-09** — Fix duplicate records and email derivation
6. **BUG-10, BUG-11, BUG-12** — Fix delete behavior, persistence, and UI gaps
7. **INC-01, INC-02** — Consolidate blacklist tables and pricing
8. **S01, S02, S10** — Middleware, storage, state management (foundational)
9. **S04, S06, S14** — Credit scoring, reminders, overdue detection (smart features)
10. Everything else in priority order

---

*End of Audit Report*
