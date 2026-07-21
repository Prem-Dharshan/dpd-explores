## 2024-05-18 - React Router searchParams.getAll breaks memoization

**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render, which will break any memoization (like `useMemo` or `useCallback`) if used directly as a dependency. It will cause unnecessary re-calculations on every render.
**Action:** When extracting arrays from searchParams (like `searchParams.getAll()`), join them into a string (e.g. `const myParamStr = myParam.join(',')`) and use that string as the dependency for `useMemo` or `useCallback`. This is already documented in memory but I verified its importance here.
