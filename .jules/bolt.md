## 2024-10-24 - [Fix React Router Array Reference Breaking Memoization]
**Learning:** `useSearchParams()[0].getAll()` in React Router returns a new array reference on every render, which breaks memoization in dependency arrays.
**Action:** Memoize the raw array explicitly using `useMemo` with a stringified dependency (assigned to a separate variable) and a bypassed ESLint warning, to prevent unnecessary re-evaluations.
