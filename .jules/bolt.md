## 2024-10-03 - [useCallback memoization breakdown on URLSearchParams]
**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render. Putting these direct arrays into dependency arrays (e.g., `useCallback` or `useMemo`) will cause the hook to break memoization and re-compute on every single render.
**Action:** When filtering using `searchParams.getAll()`, manually `JSON.stringify` the resulting array in a separate variable, and use that explicitly stringified value in the dependency array (suppressing eslint `exhaustive-deps` if needed).
