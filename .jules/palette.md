## 2026-10-10 - High-contrast focus rings for image overlays
**Learning:** When using controls overlaid on dynamic backgrounds like images (e.g. photo carousels), standard focus rings may lack sufficient contrast depending on the image content. Furthermore, icon-only overlay controls are often missing `aria-label`s.
**Action:** Always add explicit `focus-visible:ring-surface` (or similar high-contrast styles) to ensure focus visibility against arbitrary images, alongside required `aria-label`s for screen reader support.
