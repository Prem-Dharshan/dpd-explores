## 2024-10-15 - Semantic Keyboard Affordances for Image Buttons
**Learning:** When non-semantic elements like `<img>` tags are used as clickable elements (e.g., user avatars), they completely lack native keyboard accessibility. They must be explicitly given `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for "Enter" and " " (space) to be usable by keyboard users. Focus styles (`focus-visible:ring-2`) are also crucial.
**Action:** Always verify if a visual clickable element is a native `<button>` or `<a>`. If not, either wrap it in a native interactive element or provide the full suite of ARIA roles, tabindex, keyboard event handlers, and explicit focus indicators.

## 2024-10-15 - Focus Contrast on Dynamic Backgrounds
**Learning:** Using standard accent colors for focus rings (`focus-visible:ring-accent`) on elements overlaid over dynamic backgrounds (like image carousels) can result in poor contrast and invisible focus states depending on the image content.
**Action:** For UI controls positioned over images or dynamic content (like carousel arrows and indicator dots), use high-contrast neutral focus rings like `focus-visible:ring-surface` (white/light) to ensure visibility regardless of the background image's color palette.
