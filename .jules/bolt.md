## 2025-02-18 - [Title]
**Learning:** [Insight]
**Action:** [How to apply next time]

## 2025-02-18 - React Router `useSearchParams` array values memoization
**Learning:** `useSearchParams()[0].getAll()` returns a new array reference on every render, which causes performance issues when used in a dependency array directly.
**Action:** Extract stringified value into a variable first using `JSON.stringify(rawArray)` and use `useMemo(() => JSON.parse(arrStr), [arrStr])`. Additionally, for synchronously derived state, use `useMemo` directly instead of an immediately invoked `useCallback`.
