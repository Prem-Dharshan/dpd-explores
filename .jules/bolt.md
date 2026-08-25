## 2024-05-18 - React Router `useSearchParams` array reference instability

**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render in React Router. This breaks memoization if passed directly to dependency arrays (e.g., `useCallback` or `useMemo`). Directly calling `.join(',')` within the dependency list or render logic is risky and `JSON.stringify()` in dependencies is flagged by ESLint.

**Action:** Assign the stringified version of the array to a separate variable (e.g. `const vibeFilterStr = JSON.stringify(vibeFilter)`), use it in the dependency array, and add `// eslint-disable-next-line react-hooks/exhaustive-deps` to bypass the ESLint warning safely while preserving true memoization without running a potentially expensive callback on every render.
