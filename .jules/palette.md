## 2024-10-28 - Dynamic Background Focus Visibility
**Learning:** Standard focus rings (like `ring-accent`) often fail color contrast requirements when applied to controls overlaid on dynamic image backgrounds (like carousel arrows), making them invisible to keyboard users depending on the current image.
**Action:** Use `focus-visible:ring-surface` (or white/high-contrast equivalent) for interactive elements positioned over arbitrary background images to ensure the focus indicator is always discernible.
