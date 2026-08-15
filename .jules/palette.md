## 2024-08-15 - Missing Accessibility Attributes on Icon-Only Controls
**Learning:** Found a pattern across components (e.g., photo carousel arrows, indicator dots, modal close buttons) where icon-only controls were missing critical accessibility affordances such as `aria-label` for screen reader context and `focus-visible` ring classes for keyboard navigation visibility.
**Action:** Always verify that interactive elements without visible text have an explicit `aria-label` attribute and clear visual focus states when navigating by keyboard, ensuring equitable usage for all users.
