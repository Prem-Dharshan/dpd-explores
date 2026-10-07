## 2024-03-08 - Dynamic Background Focus Styles
**Learning:** In this application, standard `focus-visible:ring-accent` utility classes fail to provide sufficient contrast when overlaid on dynamic image backgrounds like photo carousels.
**Action:** When adding keyboard navigation support to controls overlaid on images, explicitly use `focus-visible:ring-surface` (instead of standard accent rings) to ensure the focus indicator maintains high contrast against variable backgrounds.
