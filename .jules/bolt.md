## 2024-05-24 - React Router useSearchParams Array Reference Breakage
**Learning:** In React Router, `useSearchParams()[0].getAll()` returns a new array reference on every render, which can silently break React memoization (like `useMemo` or `useCallback`) if used directly in dependency arrays.
**Action:** When extracting arrays from `useSearchParams`, stringify them using `JSON.stringify()` into a stable variable to be used in the dependency array. Add `// eslint-disable-next-line react-hooks/exhaustive-deps` to bypass the missing raw array dependency warning.
