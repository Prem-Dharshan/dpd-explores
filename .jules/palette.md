## 2023-10-27 - Keyboard Navigation for Non-Semantic UI Controls & Dynamic Backgrounds
**Learning:** We observed two specific accessibility pitfalls in this app's components:
1. When non-semantic tags (like `<img />` for user avatars) are bound with `onClick` handlers, screen readers and keyboard-only users are entirely excluded. These lack focusability and space/enter key interaction.
2. For interactive elements overlaid on photos (like the image carousel dots and arrows), the standard `focus-visible:ring-accent` often fails WCAG contrast requirements depending on the underlying image.
**Action:**
- When non-semantic tags act as buttons, always apply `role="button"`, `tabIndex={0}`, an `onKeyDown` listener checking for "Enter" or " " (with `e.preventDefault()`), and distinct `focus-visible` outline utilities.
- For controls overlaid on dynamic image backgrounds (like carousels), always use `focus-visible:ring-surface` (white/light ring) alongside `focus-visible:ring-offset-1` with a semi-transparent offset to guarantee high contrast visibility against any photo.
