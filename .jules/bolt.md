## 2026-07-28 - [React Router useSearchParams getAll]
**Learning:** useSearchParams()[0].getAll() returns a new array reference on every render, which can break memoization (like useMemo/useCallback dependencies) causing unnecessary re-renders.
**Action:** Stringify these arrays (e.g., using .join(',')) before passing them as dependencies to hooks, then construct the actual array inside the hook or use a separate useMemo that depends only on the stringified variable.
