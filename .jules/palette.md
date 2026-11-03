## 2024-05-24 - Add aria-labels and focus states to icon-only buttons
**Learning:** Found multiple instances across the app where icon-only buttons lacked aria-labels and clear keyboard focus states, making them difficult to navigate via keyboard and inaccessible to screen readers.
**Action:** Always add descriptive `aria-label`s and visible focus states (e.g., `focus-visible:ring-2`) to any button that only contains an icon.
