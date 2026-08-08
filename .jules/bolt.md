## 2024-05-15 - React Router searchParams.getAll() breaks memoization
**Learning:** `searchParams.getAll(key)` returns a new array reference on every render in React Router v6+. If used directly in a dependency array for hooks like `useMemo` or `useEffect`, it will trigger unnecessary re-renders or computations, defeating the purpose of memoization.
**Action:** When using `getAll()` arrays as dependencies, stringify the array (e.g., `JSON.stringify(arr)`) and use the stringified value as the dependency to ensure referential stability, while explicitly bypassing ESLint warnings.
