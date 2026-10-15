## 2024-10-15 - High-contrast focus rings for image-overlaid controls

**Learning:** When adding focus states to icon-only buttons overlaid on dynamic image backgrounds (like carousels), standard focus colors (like `ring-accent`) might clash or lack contrast depending on the image. Additionally, missing `aria-label`s on dot indicators are common accessibility oversights.
**Action:** Always pair `aria-label` additions on overlaid controls with a high-contrast focus ring using the `surface` color (`focus-visible:ring-surface`) to ensure visibility regardless of the background image's content.
