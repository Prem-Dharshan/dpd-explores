## 2023-10-27 - Keyboard Accessibility for Image Buttons
**Learning:** Found a pattern where non-semantic elements like `img` tags are used as buttons (e.g., user avatars for signing out) without proper keyboard navigation or screen reader support.
**Action:** When using images or divs as buttons, always add `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to support Enter and Space keys, `aria-label`, and `focus-visible` utility classes for visual focus indication.
