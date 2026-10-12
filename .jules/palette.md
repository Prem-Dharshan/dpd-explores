## 2024-06-11 - Full keyboard accessibility for non-semantic interactive elements
**Learning:** When using non-semantic HTML elements like `<img>` as buttons (e.g., for user avatars), it is easy to overlook that simply adding an `onClick` handler does not make them accessible. Screen reader and keyboard users cannot interact with them.
**Action:** When a non-semantic element acts as a control, ALWAYS add `role="button"`, `tabIndex={0}`, an explicit `aria-label`, and an `onKeyDown` handler to capture 'Enter' and ' ' (Space) keys, alongside visual focus indicators (`focus-visible`).
