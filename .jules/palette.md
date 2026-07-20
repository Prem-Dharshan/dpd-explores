
## 2024-05-18 - Keyboard Accessibility for Interactive Images
**Learning:** Interactive `img` tags acting as buttons (e.g., user avatars) completely lack keyboard accessibility by default. Relying solely on `onClick` excludes users navigating via keyboard. They don't receive focus and don't trigger events on "Enter" or "Space".
**Action:** When an `img` tag functions as a button, always convert it into an accessible interactive element by adding `role="button"`, `tabIndex={0}`, an `onKeyDown` handler (to process "Enter" and "Space" keys), `aria-label`, and appropriate focus-visible styling (like `focus-visible:ring-2`), or wrap it inside a semantic `<button>` tag instead.
