## 2024-10-27 - [Title]
**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-10-27 - React Router useSearchParams Array Reference
**Learning:** `searchParams.getAll()` in React Router returns a new array reference on every render, which can break memoization (like `useMemo` or `useCallback`) if used directly as a dependency. Also, derived state arrays (like filtered lists or metadata lists) should be wrapped in `useMemo` to avoid unnecessary recalculations during non-related renders (e.g. typing in an input field).
**Action:** When using array results from `useSearchParams`, explicitly extract their stringified values (e.g. `JSON.stringify(raw)`) and memoize them using `useMemo` based on the string. Use `useMemo` rather than an immediately-invoked `useCallback` for derived state calculations.
