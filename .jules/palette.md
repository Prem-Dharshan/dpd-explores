## 2026-09-09 - Interactive User Avatars Require Semantic Equivalency
**Learning:** Using an `<img>` tag as a sign-out button breaks keyboard navigation and screen reader accessibility because it lacks implicit interactive semantics.
**Action:** When a non-semantic element like `img` is used as a button, it must be supplemented with full keyboard accessibility affordances (`role="button"`, `tabIndex={0}`, `onKeyDown` handlers for Enter/Space) and explicit visual focus styles (e.g., `focus-visible:ring-2`) to ensure an equitable experience for all users.
