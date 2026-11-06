## 2024-05-17 - React Router useSearchParams().getAll() Breaks Memoization & Chained Filters
**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render, breaking memoization arrays if passed directly. Additionally, chaining `.filter()` on arrays in derived state is O(m*n) and causes multiple array iterations.
**Action:** Extract stringified arrays (`JSON.stringify(rawArray)`) before `useMemo`, and combine multiple filter conditions into a single pass (`.filter(p => cond1 && cond2)`) for O(n) filtering.
