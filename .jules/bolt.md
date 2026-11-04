## 2026-11-04 - Optimize synchronously derived state
**Learning:** React component derived state evaluated on every render without `useMemo` but with an immediately invoked `useCallback` is an anti-pattern. This is because creating a function instance that is immediately invoked does not provide the intended performance optimizations.
**Action:** Replace immediately invoked `useCallback` on every render with `useMemo` directly. This evaluates only when dependencies change.
