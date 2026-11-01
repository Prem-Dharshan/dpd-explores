## 2024-11-01 - Avoid synchronous filter and map computations within React Component render

**Learning:** In a heavily filterable Dashboard component such as `src/pages/Dashboard.tsx`, performing filtering and mapping computations in the render path synchronously, using immediately-invoked functions on every render (e.g. `const displayedPlaces = filtered()` via `useCallback`), triggers re-calculations unconditionally, leading to sub-optimal rendering performance on large lists.

**Action:** Directly memoize derived view states (e.g. `displayedPlaces`) using `useMemo`. Also, for array structures returned from hook getters (`searchParams.getAll()`), stabilize their references by parsing their JSON representations instead of keeping them un-memoized in the dependency arrays, preventing unnecessary re-renders.
