## 2024-05-15 - React Hook Best Practices Avoid Immediate useCallback Execution
**Learning:** Returning an immediately invoked `useCallback` directly limits React's ability to memoize properly because it creates and runs the function on every single render. Additionally, arrays returned from `searchParams.getAll()` create new references every render.
**Action:** Use `useMemo` for synchronously derived state instead of `useCallback` when generating values on the fly. Stringify and parse arrays to maintain stable references if they are derived from dynamic sources like React Router hooks.
