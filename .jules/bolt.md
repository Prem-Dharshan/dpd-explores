## 2024-05-24 - React Router useSearchParams breaks Memoization

**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render. If used directly in a `useMemo` dependency array, it causes continuous re-renders and breaks memoization, making expensive sorting/filtering operations run excessively.
**Action:** Stringify the raw arrays using `JSON.stringify(rawArray)` into a separate variable before passing them to the dependency array. Use `// eslint-disable-next-line react-hooks/exhaustive-deps` to bypass the linter warning about the missing raw array, and replace `useCallback()` (which was being invoked on every render) with `useMemo` for derived synchronous state.
