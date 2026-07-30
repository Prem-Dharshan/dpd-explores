## 2024-05-24 - React Router useSearchParams hook array behavior

**Learning:** `useSearchParams()[0].getAll('key')` returns a new array reference on every render, even if the underlying search parameters haven't changed. If this array is used directly in a dependency array (like in `useMemo` or `useCallback`), it causes the hook to re-run on every render, defeating the purpose of memoization and causing performance issues for expensive derived state computations.

**Action:** When extracting array values from `searchParams` that will be used in dependency arrays, either stringify them before the hook (e.g., using `.join(',')`) and reconstruct the array inside the `useMemo`, or use a custom hook to memoize the array based on a deep comparison or stringified value. Additionally, ensure `useCallback` isn't used just to immediately invoke the returned function, as `useMemo` is the correct hook for derived state.
