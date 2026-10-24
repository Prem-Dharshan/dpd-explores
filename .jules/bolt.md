## 2024-05-24 - React Router useSearchParams array reference anti-pattern
**Learning:** In React Router, `useSearchParams()[0].getAll()` returns a new array reference on every render. Using it in dependency arrays breaks memoization. Also, using `useCallback` to create a function that is immediately invoked on every render to derive state is an anti-pattern.
**Action:** Extract stringified value of array to use in dependency arrays, and replace immediately invoked `useCallback` for synchronously derived state with direct `useMemo`.
