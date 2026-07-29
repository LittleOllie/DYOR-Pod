# DYOR Design System

Mission Control visual language for dyorpod.com.  
Updated: Premium pass, July 2026.

---

## Colours

### Hierarchy

| Token | Value | Usage |
|-------|-------|-------|
| `--colour-bg-primary` | `#061821` | Page background — deep navy, soft not pure black |
| `--colour-bg-secondary` | `#0A2630` | Footer, section bands |
| `--colour-bg-elevated` | `#0E2F3A` | Elevated section tones |
| `--colour-surface` | `#0F2A35` | Cards, form containers |
| `--colour-surface-raised` | `#143442` | Raised interactive surfaces |
| `--colour-brand` | `#13A9A6` | Primary DYOR teal — interaction, labels |
| `--colour-brand-bright` | `#31D1C6` | Active emphasis (sparingly) |
| `--colour-brand-muted` | `rgba(19,169,166,0.12)` | Subtle teal fills |
| `--colour-gold` | `#E5CF59` | Pending schedule, deliberate accents |
| `--colour-gold-muted` | `rgba(229,207,89,0.12)` | Gold tint backgrounds |
| `--colour-text-primary` | `#F5FAFA` | Headings, body — warm off-white |
| `--colour-text-secondary` | `#A8BCC1` | Supporting copy — muted blue-grey |
| `--colour-border` | `rgba(168,188,193,0.14)` | Default borders — neutral, not teal-heavy |
| `--colour-border-strong` | `rgba(19,169,166,0.28)` | Highlighted cards |
| `--colour-live` | `#E85D4C` | Live status only — coral/red |
| `--colour-success` | `#3ECF8E` | Success states |

**Rule:** Never use brand teal for live status. Gold is never used for large body paragraphs.

---

## Typography

- **Headings:** Space Grotesk (`--font-heading`), `letter-spacing: -0.02em`, `line-height: 1.15`
- **Body:** Inter (`--font-body`), `line-height: 1.65`

### Scale

| Element | Size | Weight |
|---------|------|--------|
| Hero H1 | 1.875rem → 3.25rem | Bold |
| Section H2 | 2rem → 2.25rem (md: 3rem, lg: 2.25rem/4xl) | Bold |
| Body | 1rem → 1.125rem | Regular |
| Eyebrow / labels | 0.75rem → 0.875rem | Semibold, uppercase, wide tracking |
| Buttons | 1rem | Semibold |

**Prose width:** `.prose-width` = `42rem` (~60–70 characters).

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--section-py` | 3.5rem | Mobile section padding |
| `--section-py-lg` | 6rem | Desktop section padding |
| `--content-width` | 72rem | Max content width |
| `--prose-width` | 42rem | Readable text blocks |
| `--header-height` | 4rem | Sticky header |

Card padding: `p-4` → `p-6`  
Grid gaps: `gap-4` → `gap-6`

---

## Radii

| Token | Value |
|-------|-------|
| `--radius-small` | 0.375rem |
| `--radius-medium` | 0.75rem |
| `--radius-large` | 1rem |
| `--radius-xl` | 1.25rem |

Buttons and cards use `--radius-medium` to `--radius-large`.

---

## Shadows

| Token | Value |
|-------|-------|
| `--shadow-soft` | `0 4px 20px rgba(0,0,0,0.28)` |
| `--shadow-elevated` | `0 8px 32px rgba(0,0,0,0.32)` |
| `--shadow-brand` | `0 0 32px rgba(19,169,166,0.12)` |

Use `shadow-[var(--shadow-soft)]` in Tailwind utilities.

---

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--motion-fast` | 150ms | Hover, focus |
| `--motion-base` | 220ms | Cards, header |
| `--motion-slow` | 450ms | Section reveals |
| `--ease-out` | `cubic-bezier(0.22,1,0.36,1)` | Standard easing |

### Effects

| Effect | Duration | Reduced motion |
|--------|----------|----------------|
| Hero float | 6s ease-in-out | Disabled |
| Live pulse | 2s | Disabled |
| Signal pulse (live card) | 2.5s | Disabled |
| Reveal on scroll | 500ms | Immediate show |
| Card hover lift | 220ms | Instant |

No Framer Motion. IntersectionObserver + CSS only.

---

## Components

### Buttons

| Variant | Use |
|---------|-----|
| Primary | Main CTAs (teal fill) |
| Secondary | Outlined surface |
| Ghost | Tertiary |
| Live | Join live Space (coral) |

Minimum tap target: **44×44px**. Input font size: **16px** minimum on mobile.

### Cards

- Base: `.card-surface` — surface bg, neutral border, soft shadow
- Highlight: `.card-surface--highlight` — brand border + brand shadow
- Show cards: square artwork, accent gradient overlay, unified min-height
- Hover: `-translate-y-0.5`, elevated shadow, border brightening — no 3D tilt

### Status

| Status | Colour | Always includes text label |
|--------|--------|---------------------------|
| Live | Coral | Yes |
| Upcoming / Next | Teal | Yes |
| Schedule pending | Gold | Yes |

### Background System (`.bg-atmosphere`)

1. Radial teal + faint gold gradients
2. Sparse CSS star points
3. Faint grid with radial mask
4. Section bands blend secondary/elevated tones

### Orbit Motifs

- Hero: dual orbital rings + rocket (`HeroBrandVisual`)
- Schedule: horizontal path (desktop) / vertical line (mobile)
- Hosts: ring around avatar
- Footer: large watermark rocket at 4% opacity

---

## Section Bands

| Class | Effect |
|-------|--------|
| `section-band--secondary` | Soft navy-teal gradient band |
| `section-band--elevated` | Slightly lighter elevated band (newsletter) |

---

## Image Treatments

| Type | Ratio | Notes |
|------|-------|-------|
| Programme art | 1:1 square | `object-cover`, accent gradient |
| Podcast art | 1:1 | Editorial frame with broadcast motif |
| Host PFP | 1:1 circle | 128px display, orbit ring |
| Logo | Contain | Header/footer max heights enforced |

---

## Accessibility

- Skip link to `#main-content`
- Focus ring: 2px brand-bright
- Decorative visuals: `aria-hidden`
- Countdown: visual grid + stable screen reader summary (no per-second spam)
- Form errors: `role="alert"`

---

## Premium Pass Changelog

- Neutralised border token (less teal tint globally)
- Added elevated surface, gold-muted, motion tokens
- Section band gradients for page continuity
- Card surface utility classes
- Prose width constraint
- Signal pulse for live next-event card
- Header next-event indicator pattern
