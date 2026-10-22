## 2024-10-22 - Missing ARIA labels on photo carousel buttons
**Learning:** Icon-only navigation buttons in the photo carousel and photo indicator buttons are missing `aria-label`s, rendering them inaccessible to screen readers. They also lack explicit keyboard focus styles for visibility over images.
**Action:** Always add `aria-label` to icon-only buttons (like `ChevronLeft`/`ChevronRight` for previous/next). Add `focus-visible:ring-2 focus-visible:ring-surface focus-visible:outline-none` for elements over photos. Use descriptive `aria-label`s for pagination dots (e.g., `Go to photo 1`).
