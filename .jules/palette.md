## 2024-05-18 - Non-semantic Elements Accessibility Requirements
**Learning:** When non-semantic elements like `img` tags are used as interactive controls (e.g. user avatars for triggering menus or logouts), they completely lack native keyboard support or screen reader context. Simply adding an `onClick` handler is insufficient.
**Action:** Any non-semantic element used as a button must explicitly include `role="button"`, `tabIndex={0}`, an explicit `aria-label`, an `onKeyDown` handler listening for 'Enter' or 'Space' keys, and distinct visual focus indicators (e.g., `focus-visible:ring-2`).
