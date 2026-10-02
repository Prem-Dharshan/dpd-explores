## 2024-10-02 - Optimize Synchronously Derived State in React

**Learning:** Using `useCallback` and invoking it immediately during the render cycle (e.g., `const derived = myCallback()`) causes the logic to execute on every single render. This negates the benefits of memoization and can cause performance bottlenecks when dealing with operations like list filtering, mapping, or sorting.
**Action:** Always use `useMemo` for synchronously derived state. Assign the hook's return value directly to a variable so that expensive calculations are only re-run when their explicit dependencies change.
