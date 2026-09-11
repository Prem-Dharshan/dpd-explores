## 2024-05-24 - [User Avatar Keyboard Accessibility]
**Learning:** Found a specific pattern in the app where non-semantic elements (like `img` tags) are used as interactive buttons (e.g., user avatars for sign out) but lack essential keyboard accessibility.
**Action:** When using images or divs as buttons, always include `role="button"`, `tabIndex={0}`, an `onKeyDown` handler for Enter/Space, explicit `focus-visible` utility classes (e.g., `focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none`), and an `aria-label` to ensure screen reader and keyboard user compatibility.
