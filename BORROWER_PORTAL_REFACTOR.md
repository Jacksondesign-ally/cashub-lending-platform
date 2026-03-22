# Borrower Portal Refactoring Plan

## Current Issue (INC-16)
The borrower portal is a single 1549-line file (`app/borrower/page.tsx`) with 11 tabs and 30+ state variables, making it difficult to maintain.

## Recommended Approach

### 1. Create Sub-Routes
Move each tab to its own route under `/borrower/`:

```
app/borrower/
├── page.tsx (Dashboard overview)
├── loans/page.tsx
├── applications/page.tsx
├── payments/page.tsx
├── documents/page.tsx
├── profile/page.tsx
├── notifications/page.tsx
├── support/page.tsx
├── calculator/page.tsx
├── marketplace/page.tsx
└── layout.tsx (shared layout with tab navigation)
```

### 2. Shared Components
Extract reusable components:

```
components/borrower/
├── LoanCard.tsx
├── ApplicationCard.tsx
├── PaymentHistory.tsx
├── DocumentUpload.tsx
├── ProfileForm.tsx
└── LoanCalculator.tsx
```

### 3. Shared State Management
Use React Context or Zustand for shared state:

```typescript
// contexts/BorrowerContext.tsx
export const BorrowerContext = createContext({
  borrowerId: '',
  loans: [],
  applications: [],
  refreshLoans: () => {},
  refreshApplications: () => {}
})
```

### 4. Migration Steps
1. Create `app/borrower/layout.tsx` with tab navigation
2. Move dashboard overview to `app/borrower/page.tsx`
3. Create individual route files for each tab
4. Extract shared components
5. Set up context for shared state
6. Update all internal links
7. Test each route independently
8. Remove old monolithic file

### 5. Benefits
- **Maintainability**: Each route is ~150-200 lines instead of 1549
- **Performance**: Code splitting, lazy loading
- **Developer Experience**: Easier to find and modify specific features
- **Scalability**: Easy to add new features without bloating a single file

## Implementation Status
**Status**: Documented, not implemented (requires significant refactoring time)
**Priority**: Medium (improves maintainability but doesn't fix bugs)
**Estimated Effort**: 4-6 hours
