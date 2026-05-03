# DPD Explores — Design System

## Philosophy

> "A well-organised map for a curious mind."

The app should feel like a **personal journal that thinks**. Not a tech product, not a review platform.
Warm, tactile, focused. Every screen should give the user one clear job — find a place, categorize a place, or discover something new. No clutter. No noise. Just the right information at the right moment.

**Three core feelings:**
- **Organized** — the user always knows where they are and what to do next
- **Warm** — this is a personal space, not a corporate dashboard
- **Focused** — filters, search, and recommendations are the hero, never decoration

---

## Color Palette

### Base

```css
:root {
  /* Backgrounds */
  --color-bg-base: #FAF8F5;          /* warm off-white — page background */
  --color-bg-surface: #FFFFFF;        /* cards, panels */
  --color-bg-sunken: #F2EFE9;        /* input backgrounds, subtle wells */
  --color-bg-overlay: #EFEDE7;       /* hover states, selected rows */

  /* Text */
  --color-text-primary: #1C1917;     /* near-black, warm undertone */
  --color-text-secondary: #78716C;   /* muted labels, metadata */
  --color-text-tertiary: #A8A29E;    /* placeholders, disabled */
  --color-text-inverse: #FAF8F5;     /* text on dark surfaces */

  /* Accent — Forest Green */
  --color-accent: #2D6A4F;           /* primary actions, active states */
  --color-accent-hover: #245C43;     /* hover on accent */
  --color-accent-muted: #D8EDDF;     /* soft accent backgrounds */
  --color-accent-text: #1A4535;      /* text on accent-muted bg */

  /* Semantic */
  --color-visited: #B45309;          /* amber — visited badge */
  --color-visited-muted: #FEF3C7;    /* visited badge background */
  --color-wishlist: #2D6A4F;         /* green — wishlist badge */
  --color-wishlist-muted: #D8EDDF;
  --color-held: #9333EA;             /* purple — held for review */
  --color-held-muted: #F3E8FF;

  /* Borders */
  --color-border: #E5E0D8;           /* default border */
  --color-border-strong: #C9C2B8;    /* emphasized border */

  /* Elevation */
  --shadow-card: 0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow-elevated: 0 4px 12px rgba(28, 25, 23, 0.08);
}

[data-theme="dark"] {
  --color-bg-base: #141210;
  --color-bg-surface: #1E1B18;
  --color-bg-sunken: #111009;
  --color-bg-overlay: #252118;
  --color-text-primary: #F5F0EB;
  --color-text-secondary: #A8A29E;
  --color-text-tertiary: #6B6460;
  --color-border: #2C2720;
  --color-border-strong: #3D3730;
  --color-accent: #4ABA7F;
  --color-accent-hover: #5CC98E;
  --color-accent-muted: #1A3528;
  --color-accent-text: #9EDCBA;
}
```

### Accent Rationale
Forest green (`#2D6A4F`) signals "go", "discover", "nature of exploration" without feeling like a generic app. It contrasts cleanly against the warm off-white base without being harsh.

---

## Typography

```css
/* Import in index.html */
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;450;500&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --font-display: 'Lora', Georgia, serif;       /* headings, place names */
  --font-body: 'DM Sans', system-ui, sans-serif; /* UI, labels, filters */
  --font-mono: 'JetBrains Mono', monospace;      /* ratings, distances */
}
```

### Scale

| Token | Font | Size | Weight | Usage |
|---|---|---|---|---|
| `--text-display` | Lora | 28px | 500 | Page titles, hero place name |
| `--text-heading` | Lora | 20px | 400 | Section headers, card names |
| `--text-subheading` | DM Sans | 13px | 500 | Labels, uppercase category names |
| `--text-body` | DM Sans | 15px | 400 | Body copy, descriptions |
| `--text-small` | DM Sans | 13px | 400 | Metadata, timestamps |
| `--text-micro` | DM Sans | 11px | 450 | Badges, chips, tags |
| `--text-mono` | JetBrains Mono | 13px | 400 | Ratings, coordinates, counts |

### Rules
- Place names always use `--font-display` — this is the single most important nuance
- UI controls (buttons, filter chips, dropdowns) always use `--font-body`
- Rating numbers always use `--font-mono` — they feel measured and precise
- Never use font-weight 700+ — the typefaces are expressive enough without it
- Letter-spacing: `0.06em` on all subheadings (the 13px 500 DM Sans ones)

---

## Spacing

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

- Page padding: `--space-6` on desktop, `--space-4` on mobile
- Card internal padding: `--space-5` (20px)
- Between sections: `--space-8`
- Between filter chips: `--space-2`

---

## Border Radius

```css
:root {
  --radius-sm: 6px;    /* chips, badges, tags */
  --radius-md: 10px;   /* buttons, inputs */
  --radius-lg: 14px;   /* cards */
  --radius-xl: 20px;   /* bottom sheets, modals */
  --radius-full: 9999px; /* pill badges only */
}
```

---

## Components

### Place Card (Dashboard)

```
┌─────────────────────────────────────┐
│ [photo 16:9, object-fit cover]      │
│                              [badge]│
├─────────────────────────────────────┤
│ Place Name (Lora 17px 500)          │
│ Cuisine · Area · City (DM 13px muted│
│                                     │
│ [chip] [chip] [chip]                │
│                              ★ 8.4  │
└─────────────────────────────────────┘
```

- Photo always present — if no photo, show a warm gradient placeholder with first letter of place name
- Badge: "Visited" (amber) / "Wishlist" (green) — top right of photo
- Rating in mono font, right-aligned
- Chips: max 3 visible, rest collapsed to "+2 more"
- Card hover: subtle translate(-1px, -2px) + stronger shadow

### Filter Chip

```
Active:   [● Veg ×]     — accent bg, accent text, filled
Inactive: [  Veg  ]     — transparent bg, border, secondary text
```

- Active chips use `--color-accent-muted` bg + `--color-accent-text`
- All chips: `--radius-full`, `--text-micro`, 28px height
- Chips never wrap mid-word — use ellipsis if needed

### Search Bar

Full-width, prominent. Not a small input.
- 48px height on desktop
- `--color-bg-sunken` background
- Left icon: magnifying glass in `--color-text-tertiary`
- Placeholder: "Search by name, cuisine, vibe..." in tertiary color
- On focus: border changes to `--color-accent`, no box shadow (clean)

### Mood Recommender Bar

A distinct UI element — not a regular input.
```
┌──────────────────────────────────────────────────┐
│  ✦  I'm in the mood for...          [Find →]     │
└──────────────────────────────────────────────────┘
```

- Background: `--color-accent-muted`
- Text: `--font-display` italic placeholder
- The `✦` icon (or similar small star/compass) in `--color-accent`
- Full width, sits above the place grid
- On submit: place cards animate to show matched results, non-matches dim to 40% opacity

### Flashcard

The categorizer is the most distinctive screen. Should feel like a ritual, not a chore.

```
┌────────────────────────────────────────┐
│                                 12/47  │ ← progress, top right, mono
│                                        │
│  [photo, large, rounded corners]       │
│                                        │
│  Place Name                            │ ← Lora display
│  Chennai, Anna Nagar                   │ ← muted secondary
│                                        │
│  AI suggests:                          │ ← micro label, uppercase
│  [Cafe] [Veg] [Chill] [Quick Bite]    │ ← editable chips
│                                        │
│  Must try: "Filter coffee"             │ ← italic, accent color
│                                        │
│  [Hold]      [Edit & Save]   [✓ Save] │
└────────────────────────────────────────┘
```

- Progress shown as `12 / 47` in mono font — not a progress bar (feels less pressured)
- Photo takes up 40% of screen height
- Chips are directly tappable to remove; + button to add new ones
- Keyboard shortcut hints visible on desktop: `→` approve, `e` edit, `s` skip

### Rating Display (Place Detail)

Don't use stars. Use a horizontal bar system:

```
Food        ████████░░  8.2
Ambience    ███████░░░  7.0
Service     █████████░  9.0
Value       ██████░░░░  6.5
```

- Bars use `--color-accent` fill, `--color-bg-sunken` track
- Numbers in `--font-mono`
- Overall score: large, centered, Lora display font, with label below

---

## Layout

### Dashboard

```
[Topbar: logo + user avatar]
[Search bar — full width]
[Mood recommender bar]
─────────────────────────────────────────────
[Filter sidebar 260px] | [Place grid flex-1]
                       |
  City                 | [Card] [Card] [Card]
  Cuisine              | [Card] [Card] [Card]
  Diet                 |
  Vibe                 | [Load more]
  ...                  |
```

- Sidebar is sticky, scrolls independently
- On mobile: sidebar becomes a bottom sheet triggered by a filter icon
- Filter count badge on the filter button: "Filters (4)"
- Grid: 3 col desktop, 2 col tablet, 1 col mobile

### Filter Sidebar

```
FILTERS                     [Clear all]

Search in filters...        ← meta-search within filters

LOCATION
  City [Chennai ×] [Mumbai]
  Area [Anna Nagar ×]

FOOD
  Diet  ○ All  ● Veg  ○ Non-veg
  Cuisine [Italian] [North Indian ×]

VIBE
  [Chill ×] [Rooftop] [Hidden gem]

STATUS
  ○ All  ○ Visited  ● Wishlist

RATING
  Min score  ████░  7+

PRICE
  [₹] [₹₹ ×] [₹₹₹]
```

- Section headers in `--text-subheading` (13px 500, letter-spaced, muted)
- Thin divider between sections (`1px solid --color-border`)
- Active filter sections get a subtle left border in `--color-accent`

---

## Motion

Keep animations purposeful and fast. This is a utility app — animations serve clarity, not delight.

```css
:root {
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 350ms ease;
}
```

| Interaction | Animation |
|---|---|
| Card hover | `transform: translateY(-2px)` + shadow increase, 120ms |
| Filter chip toggle | background/color crossfade, 120ms |
| Flashcard advance | slide out left, next slides in from right, 200ms |
| Mood search submit | non-matching cards fade to 40% opacity, 350ms |
| Filter panel open | slide in from left, 200ms |
| Page transitions | fade 150ms |
| Rating bars on load | grow from 0% width, 600ms staggered |

No bounces. No spring physics. Clean ease.

---

## Iconography

Use **Lucide React** throughout. Never mix icon sets.

Key icons and their usage:

| Icon | Usage |
|---|---|
| `MapPin` | Place identity, location |
| `Search` | Search bar |
| `SlidersHorizontal` | Filter toggle |
| `Bookmark` | Save to wishlist |
| `CheckCircle` | Visited |
| `Star` | Rating (use bar system instead where possible) |
| `ChevronRight` | Navigation |
| `X` | Remove chip, close sheet |
| `Plus` | Add place, add dish |
| `Sparkles` | Mood recommender |
| `Clock` | Opening hours |
| `IndianRupee` | Budget/price |
| `UtensilsCrossed` | Food category |

Icon size: 16px inline, 20px standalone actions, 24px empty states.
Color: always `currentColor` — icons inherit the text color of their container.

---

## States

### Empty States

Warm, encouraging, not sterile.

```
[icon — large, muted, centered]

No places yet.
Upload a CSV from Google Takeout
to get started.

[Upload CSV →]
```

- Icon: 48px, `--color-text-tertiary`
- Title: Lora, 18px
- Subtitle: DM Sans, 14px, secondary
- CTA button below

### Loading

Skeleton cards — not spinners. Match the exact shape of the place card.
- Background: `--color-bg-sunken`
- Animated shimmer: subtle left-to-right gradient sweep, 1.5s loop

### Error

Inline, not a modal. Red left-border on the affected component + error message below in 13px.

---

## Tailwind Config Extension

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        base: '#FAF8F5',
        surface: '#FFFFFF',
        sunken: '#F2EFE9',
        overlay: '#EFEDE7',
        accent: {
          DEFAULT: '#2D6A4F',
          hover: '#245C43',
          muted: '#D8EDDF',
          text: '#1A4535',
        },
        border: {
          DEFAULT: '#E5E0D8',
          strong: '#C9C2B8',
        },
        ink: {
          DEFAULT: '#1C1917',
          secondary: '#78716C',
          tertiary: '#A8A29E',
        },
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
        elevated: '0 4px 12px rgba(28,25,23,0.08)',
      },
    },
  },
}
```

---

## Nuances (the details that matter)

1. **Place names are always Lora** — everywhere, in every context. This is the single rule that makes the app feel designed.

2. **Ratings are always monospace** — `8.4`, not `8.4`. The mono font makes numbers feel measured and trustworthy.

3. **No blue anywhere** — blue is a browser default. Every link and action uses the forest green accent. This enforces a cohesive visual identity.

4. **Photos define the card** — if no photo is available, generate a warm gradient placeholder using the place name's first letter as a large Lora glyph. Never show a broken image or generic icon.

5. **Chips are tactile** — active filter chips have a slight inset shadow to feel pressed. Remove the shadow on inactive.

6. **The mood bar is italic** — the placeholder text `I'm in the mood for...` is in Lora italic. It's the only italic UI element. Makes it feel like a thought, not a command.

7. **Loading skeletons match card layout exactly** — no generic grey boxes. The skeleton is a ghost of the exact card that will appear.

8. **Filter sections remember scroll position** — if the user scrolls down in filters, applies them, and comes back, the sidebar is in the same position.

9. **Page background is not white** — it's `#FAF8F5`. The warmth is subtle but it prevents the app from feeling like a spreadsheet.

10. **The flashcard progress is `n / total` in mono** — not a progress bar, not a percentage. It's a count. Counts feel less pressured than percentages.