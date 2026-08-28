## 2024-05-24 - Accessibility for Avatar Buttons and Carousel Indicators
**Learning:** Found instances where `img` elements were being used as sign-out buttons (lacking full keyboard accessibility, such as Enter/Space handling and role/tabIndex) and photo carousel controls lacked explicit ARIA labels and focus indicators.
**Action:** Always add full keyboard accessibility affordances (role="button", tabIndex={0}, onKeyDown for Enter/Space, focus-visible classes) when non-semantic elements act as buttons, and ensure icon-only controls (carousel arrows/dots) have `aria-label` attributes.
