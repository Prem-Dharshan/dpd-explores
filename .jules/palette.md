## 2024-07-23 - Interactive Element Accessibility
**Learning:** Found multiple instances where non-semantic elements (like `<img>`) or icon-only buttons were used for actions but lacked `role="button"`, `tabIndex`, keyboard event handlers, and `aria-label`s.
**Action:** Always ensure that when applying click handlers to `<img>` tags, they also receive full keyboard support. Added `aria-label`s to modal close buttons and carousel controls to ensure screen reader compatibility.
