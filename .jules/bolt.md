## 2026-09-27 - React Router `useSearchParams()[0].getAll()` Breaks Memoization

**Learning:** In React Router, `useSearchParams()[0].getAll()` returns a new array reference on every render, even if the URL parameters haven't changed. This causes referential inequality in dependency arrays, breaking `useMemo` and `useCallback` hooks and triggering unnecessary re-evaluations and re-renders. Furthermore, an immediately-invoked `useCallback` is inefficient for synchronously derived state compared to `useMemo`.

**Action:** When depending on arrays from `searchParams.getAll()`, explicitly stringify them (e.g., `const stringified = JSON.stringify(rawArray)`) and use the stringified variable in the dependency array with an ESLint disable comment (`// eslint-disable-next-line react-hooks/exhaustive-deps`). Use `useMemo` directly for derived state instead of `useCallback`.
