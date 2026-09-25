## 2024-05-24 - [Preventing Unnecessary Re-renders from React Router SearchParams]
**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render, breaking memoization.
**Action:** Memoize the raw array explicitly using a stringified version of the array assigned to a separate variable for the dependency array and `eslint-disable-next-line react-hooks/exhaustive-deps`. For synchronously derived state, use `useMemo` directly instead of invoking a `useCallback` on every render.
