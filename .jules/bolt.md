## 2024-05-24 - React Router searchParams.getAll() instability
**Learning:** `useSearchParams()[0].getAll("key")` in React Router returns a new array reference on every single render. Using it directly in a `useMemo` or `useEffect` dependency array will break memoization/trigger infinite loops.
**Action:** When depending on array search params, explicitly stringify them (e.g. `const arrayStr = JSON.stringify(array)`) and use the stringified value in the dependency array with a `// eslint-disable-next-line react-hooks/exhaustive-deps` comment to bypass the ESLint warning.
