## 2024-05-15 - Micro-UX Add Keyboard Affordances and ARIA Labels
**Learning:** Interactive non-semantic elements like `<img />` used as user avatars lack native keyboard accessibility, and icon-only buttons like those for clear inputs and maps lack screen reader context.
**Action:** When using non-semantic elements as buttons, implement `role="button"`, `tabIndex={0}`, an `onKeyDown` handler for Enter/Space, and visible focus indicators. Always add `aria-label` to icon-only buttons.
