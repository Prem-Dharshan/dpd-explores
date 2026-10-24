## 2023-10-25 - Keyboard Accessibility for Non-Semantic Buttons
**Learning:** Found that custom non-semantic interactive elements like `img` tags used as user avatars lack native keyboard accessibility, requiring manual addition of `role="button"`, `tabIndex={0}`, keyboard event handlers (`onKeyDown` for Enter/Space), and visible focus states to be usable by keyboard navigators.
**Action:** When creating non-semantic interactive controls in the future, ensure full keyboard accessibility properties are added, including focus styles.
