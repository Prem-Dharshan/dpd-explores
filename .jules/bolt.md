## 2024-05-24 - `useSearchParams().getAll()` breaks React memoization

**Learning:** In React Router, `useSearchParams()[0].getAll()` returns a new array reference on every render. Using these raw array references directly in dependency arrays for `useMemo` or `useEffect` breaks memoization and causes excessive re-evaluations. Furthermore, when computing derived state synchronously, using `useCallback` to wrap a function that gets immediately invoked defeats the purpose of the hook since the function executes anyway.

**Action:** For derived state relying on `useSearchParams().getAll()`, explicitly memoize the returned arrays using `JSON.stringify` to create stable primitives for the dependency array (e.g., `const stringified = JSON.stringify(rawArray)`), and add `// eslint-disable-next-line react-hooks/exhaustive-deps` to satisfy the linter. Always prefer `useMemo` over immediately-invoked `useCallback` functions for synchronously derived state.
