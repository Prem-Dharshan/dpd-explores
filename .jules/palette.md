## 2024-10-01 - Missing ARIA Labels on Inline Icon Actions
**Learning:** Ad-hoc icon-only buttons built directly into components for inline editing (e.g., `X` or `Check` icons without accompanying text, inside input fields or modest popups) consistently miss `aria-label`s, unlike standard standalone UI buttons that get more design review.
**Action:** Always verify all clickable icons specifically checking forms and inline editing behaviors for hidden interaction triggers, ensuring `aria-label`s and `focus-visible` styling is strictly applied to them.
