## 2024-10-10 - Add accessibility affordances to icon-only controls

**Learning:** When using non-semantic icon-only buttons overlaying images (like previous/next arrows in carousels) and modal close buttons, they often lack ARIA labels and sufficient keyboard focus indicators, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure that icon-only interactive controls include an `aria-label` and explicit `focus-visible` utility classes. For controls overlaid on dynamic backgrounds like images, use a high-contrast focus ring color like `focus-visible:ring-surface`. For standard modal close buttons, use standard accent rings like `focus-visible:ring-accent`.
