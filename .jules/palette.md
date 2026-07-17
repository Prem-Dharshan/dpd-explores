
## 2024-05-18 - [Missing ARIA Labels in Photo Carousels]
**Learning:** Found an accessibility issue pattern specific to this app's components, where common interaction patterns like image carousels are constructed using icon-only buttons (Previous, Next, Indicator Dots) and lack screen reader descriptions.
**Action:** Always verify that interactive components with icon-only controls, such as photo carousels or modals, have explicit `aria-label` attributes to ensure they are properly announced by screen readers.
