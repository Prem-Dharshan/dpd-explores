## 2024-05-24 - Accessible Visual Controls (Carousels & Modals)
**Learning:** Purely visual components like carousels and modal close buttons frequently omit semantic ARIA labels and focus states, leading to poor keyboard and screen reader accessibility despite strong visual affordances.
**Action:** Always verify icon-only interactive elements in carousels and overlays for `aria-label` and `focus-visible` utilities, taking care to choose a ring color with high contrast against dynamic backgrounds (e.g., using `ring-surface` over images).
