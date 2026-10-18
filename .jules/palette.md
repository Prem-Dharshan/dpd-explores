## 2026-10-18 - [Missing Aria Labels on Icon-only Controls in Image Carousel]
**Learning:** Found multiple icon-only interactive controls (close modal, previous/next carousel arrows) in PlaceDetail.tsx that lack aria-label attributes, making them inaccessible to screen readers.
**Action:** Adding `aria-label` to these `button` elements to improve accessibility without changing layout or adding custom CSS.
