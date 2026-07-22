## 2026-07-22 - Adding accessibility to non-semantic interactive elements
**Learning:** Found several patterns where `<img>` elements or generic icon containers were being used as buttons without proper ARIA or keyboard navigation support (missing `role`, `tabIndex`, and `onKeyDown` for enter/space).
**Action:** Always ensure that any non-semantic element used as an interactive control receives full keyboard affordances (focus rings, enter/space key triggers) and screen reader labels (`aria-label`, `role=\"button\"`).
