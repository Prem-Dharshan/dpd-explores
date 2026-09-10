## 2024-09-10 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Icon-only controls like carousel arrows (ChevronLeft, ChevronRight), indicator dots, and modal close buttons (X) frequently lack `aria-label` attributes across the application's components, making them inaccessible to screen reader users.
**Action:** Always proactively check for and add missing `aria-label` attributes to these types of icon-only elements when modifying UI components.
