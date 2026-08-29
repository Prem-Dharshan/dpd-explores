## 2024-08-30 - Memoization of computed properties

**Learning:** Using `useCallback` to create a function (e.g. `filtered`) and then immediately invoking it on every render (`const displayedPlaces = filtered()`) defeats the purpose of React's memoization and causes expensive filtering, sorting, and array creation to run on every render.
**Action:** Use `useMemo` instead for synchronously derived state. Assign the result directly to the variable (`const displayedPlaces = useMemo(() => { ... }, [deps])`) so that the computation only runs when its dependencies change, preventing unnecessary re-renders and CPU cycles.
