## 2026-09-23 - Interactive Avatar Keyboard Nav
**Learning:** When using non-semantic elements like `<img>` for interactive actions (e.g., avatar as a sign-out button), adding `onClick` is not enough for screen readers or keyboard users.
**Action:** Always include `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to capture 'Enter' and ' ' (Space), and visual focus rings (`focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none`) to ensure full accessibility.
