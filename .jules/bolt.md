
## 2024-05-24 - React Router useSearchParams Re-render Cycle
**Learning:** In React Router, `useSearchParams()[0].getAll()` returns a new array reference on every render, which can break memoization if passed directly to dependencies. Furthermore, using `useCallback` for synchronously derived state calculations is an anti-pattern that leads to unnecessary function creation and potential downstream recalculations, compared to directly using `useMemo` for derived output like filtered arrays.
**Action:** When filtering data based on array parameters from `useSearchParams`, convert the arrays to stable strings for dependencies (using `JSON.stringify`) and use `useMemo` directly on the filtered results rather than wrapping the filtering logic in a `useCallback` that is immediately executed.
