## 2025-03-01 - React Router searchParams.getAll() breaks memoization
**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every single render in React Router. Passing this array directly into a dependency array (e.g. for `useMemo`, `useCallback`, or `useEffect`) breaks memoization entirely, causing the hook to recalculate on every render.
**Action:** Do not pass the array returned by `getAll()` directly into dependency arrays. Instead, assign `JSON.stringify(array)` to a separate variable (to satisfy ESLint, which complains if you stringify inline) and use that variable in the dependency array with a `// eslint-disable-next-line react-hooks/exhaustive-deps` comment to bypass the missing raw array warning.

## 2025-03-01 - Synchronously derived state with useCallback
**Learning:** Using `useCallback` to define a function that derives state synchronously, and then immediately invoking that function on every render (e.g., `const displayed = useCallback(() => { ... }); const result = displayed()`) defeats the purpose of memoization entirely. The callback is memoized, but the expensive operation inside the function runs on every render anyway.
**Action:** Always use `useMemo` for synchronously deriving complex state (like filtering and sorting arrays) to ensure the expensive operation only runs when dependencies actually change.
