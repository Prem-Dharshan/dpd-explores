## 2025-05-15 - [Add ARIA labels to icon-only buttons]
**Learning:** Found a recurring pattern in the application where icon-only buttons (like modal close buttons, carousel controls, and tag removal buttons) lacked `aria-label` attributes. This made these controls inaccessible to screen readers, as they had no textual representation.
**Action:** When adding new icon-only controls, actively check for and add an explicit `aria-label` attribute describing the action (e.g., `aria-label="Close modal"`). Include this check in standard UI component reviews.
