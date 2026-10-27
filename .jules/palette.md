## 2024-05-18 - High Contrast Focus Rings for Dynamic Backgrounds
**Learning:** Standard focus rings (e.g., `focus-visible:ring-accent`) often lack sufficient contrast and become invisible when interactive elements (like carousel arrows or dots) are placed over dynamic, image-based backgrounds.
**Action:** When overlaying controls on images, strictly use `focus-visible:ring-surface` (or a color with guaranteed high contrast against the image content) to ensure focus visibility for keyboard users.
