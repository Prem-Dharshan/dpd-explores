## 2024-05-24 - React Router useSearchParams breaking memoization
**Learning:** `searchParams.getAll()` returns a new array reference on every render, invalidating memoized arrays/callbacks causing extensive array sorting and filtering on every re-render.
**Action:** Stringify array dependency references to separate variables when used in hooks arrays to ensure shallow equality behaves correctly. E.g. `const arrayStr = JSON.stringify(array)` and bypassing exhaustive deps with `// eslint-disable-next-line react-hooks/exhaustive-deps`.
