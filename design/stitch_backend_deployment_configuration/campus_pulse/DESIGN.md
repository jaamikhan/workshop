---
name: Campus Pulse
colors:
  surface: '#faf8ff'
  surface-dim: '#d5d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ebedff'
  surface-container-high: '#e4e7ff'
  surface-container-highest: '#dde1fc'
  on-surface: '#161b2e'
  on-surface-variant: '#454652'
  inverse-surface: '#2a2f44'
  inverse-on-surface: '#eff0ff'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4957af'
  primary: '#0e1f7a'
  on-primary: '#ffffff'
  primary-container: '#2a3890'
  on-primary-container: '#9ba8ff'
  inverse-primary: '#bbc3ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#00322d'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a43'
  on-tertiary-container: '#4fbfb2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bbc3ff'
  on-primary-fixed: '#000e5f'
  on-primary-fixed-variant: '#303e96'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#faf8ff'
  on-background: '#161b2e'
  surface-variant: '#dde1fc'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a lively, collegiate-modern visual environment tailored to campus ecosystems. It addresses three interconnected user groups—students seeking connection, student organizers orchestrating programming, and campus administrators overseeing safety and engagement. 

The aesthetic blends contemporary digital product cleanliness with an elevated collegiate spirit:
- **Atmosphere:** Spirited, inclusive, focused, and approachable. It strips away stuffy academic bureaucracy in favor of crisp visual hierarchy and kinetic energy.
- **Design Movement:** Modern Clean with Tactile Accents. Layered cards, defined role-based color cues, generous whitespace, and responsive feedback loops deliver a high-utility interface that remains warm and celebratory.
- **Audience Appeal:** Intuitive enough for a first-year student rushing between lectures, robust enough for an admin triaging venue allocations and student group permissions.

## Colors

The color palette centers on a disciplined collegiate foundation balanced by high-spirited kinetic accents to sustain high visual contrast and distinct user states.

- **Primary (`#2A3890` - Collegiate Indigo):** Anchor tone used for core navigation, high-priority interactive triggers, student headers, and institutional stability.
- **Secondary (`#F59E0B` - Energetic Amber):** High-vibrancy accent reserved for event momentum, urgent reminders, registration statuses, RSVP deadlines, and organizer flags.
- **Tertiary (`#0D9488` - Academic Teal):** Used for administrative authority tokens, approved permits, success indicators, and secondary categorization tags.
- **Neutral (`#1E2337` - Nightfall Slate):** Grounds typography, framing boundaries, and baseline iconography on top of soft warm off-white canvas surfaces (`#F8F9FC`).

### Role-Based Theming
Role badges and context borders rely on distinct tints of these system colors:
- **Student View:** Tinted Indigo highlights (`#EEF2FF` fill with `#2A3890` text/accents).
- **Organizer View:** Warm Amber and Copper highlights (`#FEF3C7` fill with `#B45309` text/accents).
- **Admin View:** Deep Teal/Emerald highlights (`#CCFBF1` fill with `#0F766E` text/accents).

## Typography

The type pairing pairs **Space Grotesk** for display headlines with **Plus Jakarta Sans** for body and interface elements.

- **Space Grotesk:** Introduces an inventive, energetic structural edge suitable for campus posters, student union announcements, and prominent event banners. Its geometric character keeps the tone forward-looking.
- **Plus Jakarta Sans:** Brings rounded, humane readability to descriptions, schedules, badge tags, and administrative tables.

### Sizing and Hierarchy Rules
- High-level headlines scale downward for viewports below 768px via dedicated mobile tiers (`display-lg-mobile` and `headline-lg-mobile`) to prevent awkward line breaks in dense mobile contexts.
- Status badges and metadata tags exclusively use `label-sm` or `label-md` with slight letter tracking for instantaneous scanning across busy visual boards.

## Layout & Spacing

The layout model uses an adaptive fluid 12-column grid on desktop and tablet screens, folding into a 4-column structured grid on mobile viewports.

- **Mobile (<640px):** 4 columns, 1rem margin, 1.25rem gutter. Feeds adopt vertical stacking with sticky bottom controls for primary actions (e.g., "RSVP Now", "Scan In").
- **Tablet (640px - 1024px):** 8 columns, 1.5rem margin, 1.25rem gutter. Event grids render as 2-column cards; organizer dashboards adopt split feed/calendar panes.
- **Desktop (>1024px):** 12 columns, 2.5rem margin, 1.75rem gutter. Supports persistent multi-column layouts: persistent utility sidebar, main feed canvas, and ancillary registration/filtering rails.

Vertical rhythm adheres strictly to multiples of 4px and 8px via the defined `space-*` tokens. Cards and inner groupings favor `space-md` internally, while distinct page segments decouple via `space-xl`.

## Elevation & Depth

Visual hierarchy combines tonal surface stratification with ambient, indigo-tinted soft shadows to maintain a crisp, clean layer stack.

- **Level 0 (Base Canvas):** Light soft-slate `#F8F9FC`, completely flat, hosting cards and structural modules.
- **Level 1 (Card & Content Blocks):** Pure white `#FFFFFF` surface with a micro-stroke border (`1px solid rgba(42, 56, 144, 0.08)`) and an ultra-subtle tinted shadow: `0 2px 6px -1px rgba(30, 35, 55, 0.04), 0 1px 3px -1px rgba(42, 56, 144, 0.03)`.
- **Level 2 (Hovered Cards & Role Switchers):** Pure white with increased prominence: `0 8px 20px -3px rgba(42, 56, 144, 0.08), 0 3px 6px -2px rgba(30, 35, 55, 0.04)`.
- **Level 3 (Modals, Overlays, Floating Action Banners):** Elevated above contextual scrims with directional depth: `0 16px 36px -6px rgba(42, 56, 144, 0.16), 0 6px 12px -3px rgba(30, 35, 55, 0.08)`.

Heavy drop shadows and deep dark skeuomorphic drop-offs are prohibited; depth remains clean, atmospheric, and distinctly tinted.

## Shapes

The design system implements a **Rounded** (Level 2) shape language, establishing balance between professional organization and approachable, student-friendly visual warmth.

- **Base Radius (0.5rem / 8px):** Applied to form fields, utility chips, list group rows, and sub-tier action items.
- **Large Radius (`rounded-lg`, 1rem / 16px):** Applied to primary event cards, registration modals, side sheets, and administrative panels.
- **Extra-Large Radius (`rounded-xl`, 1.5rem / 24px):** Reserved for floating navigation bars, role-switching pills, and hero banner treatments.
- **Full Radius (Pill / 9999px):** Dedicated to role status indicators, active tag chips, and RSVP notification badges.

## Components

### Persistent Role Switcher
- **Structure:** Floating or fixed segment control with three states: *Student*, *Organizer*, *Admin*.
- **Style:** Housed inside a capsule (`rounded-xl`) pill enclosure with pure white background, subtle border, and elevation Level 2.
- **Interaction:** Selected role adopts an active color pill:
  - Student: `#2A3890` (White text)
  - Organizer: `#F59E0B` (Slate text)
  - Admin: `#0D9488` (White text)
  Switching immediately alters layout allowances, permission tags, and dashboard shortcuts.

### Event Cards
- **Base Style:** Pure white container with `rounded-lg` corners, micro-border, and Level 1 elevation.
- **Elements:**
  - Date Stamp badge nestled in top-right or top-left corner using a condensed box with dynamic primary-tinted backgrounds.
  - Category and Capacity chips (`label-sm`).
  - Clear typography stack with `headline-sm` title, single-line location icon + text, and attendee avatars.
- **Hover State:** Rises to Level 2 elevation with a subtle translate-y of `-2px`.

### Buttons & Interactive Controls
- **Primary Button:** `#2A3890` fill, white text, 8px radius, `label-lg` typography. Transitions to deeper shade `#1F296D` on hover.
- **Secondary / Action Button:** `#F59E0B` fill with `#1E2337` text for time-sensitive tasks like "RSVP Now", "Check In", or "Publish Event".
- **Ghost / Outlined:** Transparent surface with `1.5px solid rgba(42, 56, 144, 0.2)` border, expanding on hover to subtle Indigo wash (`#EEF2FF`).

### Role Status Badges
- **Shape & Form:** Fully rounded pill (`rounded-full`), padding `0.25rem 0.625rem`, `label-sm` weight with an inline pulse dot or icon.
- **Variants:**
  - *Student Participant:* Lavender background (`#EEF2FF`), text `#2A3890`.
  - *Registered Club Officer:* Amber background (`#FEF3C7`), text `#B45309`.
  - *Campus Administrator / Safety Lead:* Mint background (`#CCFBF1`), text `#0F766E`.

### Event Registration Feedback Loops
- **Inline Ticket/RSVP State Machine:**
  - *Idle:* Amber-accented action button displaying spots remaining.
  - *Loading:* Spinner embedded into button, disabling repeated clicks.
  - *Success Confirmation:* Morphing transition from button into a confirmed badge showing a checkmark, instant calendar add trigger, and celebratory micro-animation.
  - *Waitlist Alert:* High-contrast warning banner using amber outlines and descriptive queuing rank.

### Form Inputs & Checkboxes
- **Input Fields:** Crisp 1px slate-tinted borders (`#E2E8F0`), active focus state transitioning to a 2px ring in primary Indigo (`#2A3890`), background remaining white or subtle cool gray on base canvas.
- **Checkboxes & Radios:** 4px rounded squares (checkboxes) and circles (radios). Checked state uses solid Indigo fill with crisp white geometric check/dot indicators.