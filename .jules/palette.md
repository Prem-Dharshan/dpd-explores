## 2024-05-15 - Interactive Image Accessibility
**Learning:** When non-semantic elements like `img` tags are used as interactive buttons (e.g., user avatars for sign out), they completely lack keyboard accessibility by default. Relying solely on `onClick` makes them unusable for keyboard and screen reader users.
**Action:** Always ensure that any `img` or `div` acting as a button includes `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to support Space and Enter keys, and visual focus styling (`focus-visible:ring-2 focus-visible:outline-none`) to provide full interactive affordances.
