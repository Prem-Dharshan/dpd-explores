## 2024-09-26 - Prevent memoization breaking with URLSearchParams

**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render. This breaks referential equality checks in dependency arrays (like `useCallback` or `useMemo`), leading to continuous re-computation and re-rendering, causing an O(N) filtering and sorting cost per render for large lists. Furthermore, using `useCallback` on every render just to execute a synchronously derived state is less efficient than using `useMemo` to cache the state computation.

**Action:** Explicitly memoize raw array results from `searchParams.getAll()` (e.g., using `JSON.stringify` outside the dependency array with a disable-eslint comment on `useMemo`) before using them as dependencies. For synchronously derived state, use `useMemo` directly instead of a `useCallback` function wrapper.
