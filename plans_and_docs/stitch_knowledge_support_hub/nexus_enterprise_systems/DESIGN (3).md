---
name: Nexus Enterprise Systems
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  h1:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  sidebar-width: 260px
---

## Brand & Style
The design system is engineered for deep focus and high-velocity workflows within enterprise knowledge management. It prioritizes clarity, performance, and a "low-friction" aesthetic that recedes to highlight user content. 

The style is **Corporate / Modern** with a strong influence from **Minimalism**. It utilizes a systematic approach to density, ensuring that complex data remains readable. The emotional response is one of reliability and quiet power—avoiding unnecessary flourishes in favor of precision-engineered utility. Key visual drivers include subtle micro-interactions, mono-weight iconography, and a structured information hierarchy.

## Colors
This design system employs a functional palette optimized for long-duration usage. 

- **Primary Indigo:** Used for actionable elements, focus states, and primary brand moments.
- **Surface Grays:** A multi-tiered gray scale defines depth. In Light Mode, we use cool-toned whites and grays to maintain a "crisp" feel. In Dark Mode, we utilize deep charcoals (not pure black) to reduce eye strain and maintain shadow legibility.
- **Semantic Colors:** Success (Emerald), Warning (Amber), and Error (Rose) should be used sparingly and only for status communication.
- **Interactive States:** Hover states should involve a subtle shift in background luminance (5-10%) rather than a change in hue.

## Typography
We use **Geist** for its exceptional legibility and technical precision. It bridges the gap between a friendly sans-serif and a systematic grotesque.

- **Scale:** A modular scale is used to ensure hierarchy. H1 and H2 are reserved for page titles and major section headers.
- **Body Text:** `body-md` (14px) is the standard for interface text to balance density with readability. `body-lg` is used for long-form documentation or knowledge base articles.
- **Monospace:** `jetbrainsMono` is utilized for code snippets, technical IDs, and metadata in the KMS to provide a clear distinction from prose.
- **Mobile:** For screens below 768px, scale H1 down to 24px and H2 to 20px.

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed sidebar constraints.

- **The 4px Rule:** All spacing increments must be multiples of 4px to maintain vertical rhythm.
- **Sidebar & Top-nav:** The primary navigation is a left-aligned sidebar (`260px`). Global actions and breadcrumbs reside in a fixed top-nav (`56px` height).
- **Page Margins:** Standard page padding is `24px` (lg) on desktop, scaling down to `16px` (md) on mobile.
- **Content Max-Width:** Long-form text (articles/docs) should be constrained to a `720px` readable measure to prevent eye fatigue, centered within the main viewport.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**, mirroring the physical stacking of paper or cards.

- **Level 0 (Canvas):** The base background.
- **Level 1 (Surface):** Cards, sidebars, and navigation bars. Use a subtle 1px border (`border-subtle`) instead of a shadow to maintain a flat, modern look.
- **Level 2 (Popovers):** Tooltips and dropdown menus. These use a "Soft Layered Shadow": `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
- **Level 3 (Modals):** High-elevation elements. These use a deeper, more diffused shadow with a 15% opacity overlay on the canvas.
- **Dark Mode Elevation:** Depth is achieved by lightening the surface hex code rather than increasing shadow opacity, as shadows are less visible on dark backgrounds.

## Shapes
The design system uses a consistent **12px (rounded-lg)** corner radius for primary UI containers to evoke a modern, approachable enterprise feel.

- **Standard Elements:** Buttons, inputs, and small cards use `8px` (0.5rem).
- **Large Containers:** Main content areas and modals use `12px` (0.75rem).
- **Utility:** Icons and small status tags use `4px` or full `pill` shapes depending on the context.

## Components
Consistent component behavior is critical for a productivity-focused KMS.

- **Buttons:** 
  - *Primary:* Solid Indigo with white text. 
  - *Secondary:* Subtle gray ghost background that darkens on hover. 
  - *Size:* 32px height for compact UI, 40px for primary actions.
- **Inputs:** 1px border with a 2px indigo ring on `:focus`. Include clear placeholder text and optional leading icons for search.
- **Cards:** White or dark-gray background with a `1px` border. No shadow unless the card is interactive/draggable.
- **Chips/Tags:** Used for categorization. High-contrast text on a low-opacity background of the same color (e.g., Light blue tag with dark blue text).
- **Lists:** Knowledge base lists should use `12px` vertical padding with a `1px` bottom border separator. Hover states should highlight the entire row.
- **Iconography:** Use `Lucide` icons at a standard `20px` size for sidebars and `16px` for inline actions. Stroke width should remain at `2px` for consistent visual weight.
- **Sidebar:** Nested navigation should use a "chevron-down" pattern for folders. Active states are indicated by a subtle background tint and a 2px vertical indigo bar on the left edge.