
## 2024-05-18 - Non-semantic avatar images need full button affordances
**Learning:** Using `<img>` tags for interactive elements (like the user avatar for sign out) requires significantly more accessibility markup than standard `<button>` elements, including explicit `role="button"`, `tabIndex`, and `onKeyDown` handlers for Space/Enter, as they are not natively keyboard focusable or actionable.
**Action:** Always verify if an interactive element can just use a semantic `<button>` wrapped around the image. If an `<img>` must be used directly for layout/styling reasons, apply the full suite of ARIA and keyboard interaction handlers.
