## 2024-03-01 - [Avoid useCallback for derived state with array params]
**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render. If this is passed into a `useCallback` that is then called synchronously in the render flow (e.g. `const displayedPlaces = filtered()`), it completely defeats the purpose of the hook and recalculates the filter every render.
**Action:** Use `useMemo` for synchronously derived state instead of `useCallback`, and stringify array dependencies to prevent breaking memoization due to new array references.
