## 2026-10-21 - [Memoize URLSearchParams arrays safely]
**Learning:** `searchParams.getAll()` returns a new array reference on every render, defeating referential equality and breaking memoization (e.g., in `useMemo` or `useCallback`).
**Action:** Stringify the array variables before using them as dependencies and bypass the missing raw array warning with `// eslint-disable-next-line react-hooks/exhaustive-deps`.
