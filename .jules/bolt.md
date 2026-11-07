## 2025-02-18 - React Router getAll() anti-pattern & Single-Pass Filtering

**Learning:**
1. React Router's `searchParams.getAll()` returns a new array reference on every render. Using it directly inside a component's render body or as a dependency to a `useMemo`/`useCallback`/`useEffect` causes continuous re-renders and breaks memoization.
2. Chained `.filter()` methods iterate through the entire array multiple times, causing O(m*n) complexity.

**Action:**
1. Extract array values returned by `searchParams.getAll()` to a string format (e.g., using `JSON.stringify(rawArray)`) and parse them back inside a `useMemo` that uses the stringified value as its dependency.
2. Group chained `.filter()` conditions into a single `.filter()` method (O(n) complexity) with early returns to iterate the array only once.
