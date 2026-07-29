# Premium Pass Audit — DYOR Website

Audit date: July 2026  
Scope: Visual, interaction, brand consistency and mobile refinement pass  
Site: `dyor-website` (Next.js 16, production-ready baseline)

---

## Executive Summary

The site was technically strong before this pass — schedule logic, timezone handling, honest newsletter states, and accessibility foundations were solid. Visually it read as a capable crypto podcast site with independently styled rectangular sections stacked vertically. The premium pass targets cohesion, editorial confidence, and a connected weekly rhythm.

---

## Visual North Star

**Concept:** DYOR Mission Control — not a space gimmick, but a modern editorial broadcast hub.

The DYOR rocket represents curiosity, discovery, momentum, research, conversation, and forward movement.

### Design Principles

1. **Content before decoration** — message and schedule clarity lead; atmosphere supports.
2. **One continuous page journey** — sections blend via tone shifts and shared motifs, not isolated boxes.
3. **Brand teal used with restraint** — interaction, highlights, important labels.
4. **Gold only for deliberate emphasis** — pending schedule, orbit accents, special programme emphasis.
5. **Rocket and orbit motifs must have purpose** — hero, timeline, hosts, footer watermark.
6. **Motion should guide attention** — reveals, live pulse, gentle float; never block content.
7. **Every section must feel related** — shared tokens, card system, typography scale.
8. **Mobile must feel designed, not compressed** — message-first hero, vertical timeline, stacked hosts.
9. **No fake futuristic interface clutter** — no HUD noise, fake stats, or decorative data panels.
10. **Strong calls to action without aggressive marketing** — specific, honest, conversion-focused copy.

---

## Audit Findings (Pre-Pass Baseline)

### Brand Strength

| Issue | Severity | Notes |
|-------|----------|-------|
| Generic Web3 card-stack feel | Important | Sections used alternating flat backgrounds without visual continuity |
| Logo felt pasted above hero on mobile | Important | Large logo dominated first viewport before message |
| Inconsistent accent usage across programmes | Polish | Show cards shared structure but lacked coordinated accent system |

### Hero Impact

| Issue | Severity | Notes |
|-------|----------|-------|
| Mobile content order placed event card before CTAs | Important | Spec requires message → CTAs → event card |
| Weak atmospheric depth | Polish | Grid and glow were present but understated |
| No animation-ready brand visual architecture | Optional | Needed for future logo launch animation |

**Resolution:** Message-first mobile order; `HeroBrandVisual` with static rocket + orbit rings; refined glow layers.

### Layout Rhythm & Section Transitions

| Issue | Severity | Notes |
|-------|----------|-------|
| Hard section breaks (`bg-bg-secondary/30`) | Important | Felt like stacked cards |
| Inconsistent vertical spacing | Polish | Mixed `py-10` / `py-24` without token system |

**Resolution:** `section-band` gradients, `--section-py` tokens, `RevealOnScroll` for staggered entry.

### Typography

| Issue | Severity | Notes |
|-------|----------|-------|
| Section descriptions oversized on desktop (`text-xl`) | Polish | Reduced to comfortable editorial scale |
| Body line length unconstrained in places | Important | Added `.prose-width` (~42rem / ~60–70 chars) |
| Tiny uppercase labels inconsistent | Polish | Unified tracking and weight on eyebrows |

### Colour Use

| Issue | Severity | Notes |
|-------|----------|-------|
| Border colour too teal-tinted globally | Important | Neutralised to blue-grey opacity for cleaner surfaces |
| Live vs brand teal could blur on badges | Polish | Live remains coral; brand teal for upcoming |

**Resolution:** Refined token palette in `globals.css` — see `DESIGN_SYSTEM.md`.

### Schedule Presentation

| Issue | Severity | Notes |
|-------|----------|-------|
| Four unrelated cards / rows | **Critical** | Did not communicate weekly rhythm |
| No visual connection between days | Important | Desktop grid felt like a dashboard widget row |

**Resolution:** `ScheduleTimeline` — orbital line on desktop, connected vertical timeline on mobile; highlight for live/next programme.

### Next Event Card

| Issue | Severity | Notes |
|-------|----------|-------|
| Status hierarchy unclear | Important | Status label, left accent bar, countdown dividers added |
| Countdown felt generic | Polish | Unified grid with restrained dividers, not e-commerce boxes |

### Show Cards

| Issue | Severity | Notes |
|-------|----------|-------|
| Mixed 16:9 image ratio vs square programme art | Important | Unified square ratio with accent gradients |
| Inconsistent metadata order | Polish | Category → title → description → schedule → CTA |

### Podcast Section

| Issue | Severity | Notes |
|-------|----------|-------|
| Felt like embed + blurb | Important | Editorial layout with artwork, broadcast motif, external CTAs retained |
| Embed could dominate | Polish | Constrained container with lazy load preserved |

### Host Section

| Issue | Severity | Notes |
|-------|----------|-------|
| Three-column grid too early on small tablets | Important | Single column until `md` breakpoint |
| Avatars slightly small on mobile | Polish | Increased to 128px with orbit ring |

### Newsletter

| Issue | Severity | Notes |
|-------|----------|-------|
| Generic form appearance | Important | Card container with brand border accent |
| Touch targets on interest chips | Polish | Min 44px height on optional interest buttons |

### Footer

| Issue | Severity | Notes |
|-------|----------|-------|
| Functional but forgettable | Important | Sign-off typography, orbit line, rocket watermark |
| Mobile too tall with bottom bar | Polish | Maintained `pb-28` for action bar clearance |

### Header & Navigation

| Issue | Severity | Notes |
|-------|----------|-------|
| No next-event awareness | Important | Added "Next: [Programme]" / "Live Now" indicator (lg+) |
| Logo slightly large on mobile | Polish | Reduced max height |

### Mobile Experience

| Issue | Severity | Notes |
|-------|----------|-------|
| Schedule rhythm unclear on small screens | Important | Vertical connected timeline |
| Horizontal overflow risk on orbit graphics | Polish | Contained within section bounds |

### Interaction Feedback

| Issue | Severity | Notes |
|-------|----------|-------|
| Card hover inconsistent | Polish | Unified elevation + border brightening |
| Button focus rings present | — | Maintained |

### Accessibility

| Issue | Severity | Notes |
|-------|----------|-------|
| Countdown per-second announcements | — | Already using stable `aria-live` summary |
| Decorative orbit/stars | — | `aria-hidden` on brand visuals |
| Live status text + colour | — | StatusPill includes text labels |

### Performance

| Issue | Severity | Notes |
|-------|----------|-------|
| No heavy animation libraries added | — | CSS + IntersectionObserver only |
| Spotify lazy load preserved | — | IntersectionObserver unchanged |

### Content Clarity

| Issue | Severity | Notes |
|-------|----------|-------|
| About section wall of text | Important | Single paragraph + three principle cards |
| Generic marketing phrases | — | Copy already specific; maintained |

### Conversion Hierarchy

| Issue | Severity | Notes |
|-------|----------|-------|
| Hero CTA clear | — | Live / View Next Space + Spotify |
| Newsletter value prop strong | — | "Join the DYOR Briefing" retained |

---

## Post-Pass Status

| Area | Status |
|------|--------|
| Design tokens | Refined |
| Hero | Refined |
| Next event card | Refined |
| Weekly schedule timeline | Implemented |
| Show cards | Unified |
| Section transitions | Improved |
| Podcast / hosts / about / newsletter | Refined |
| Header / footer | Refined |
| Motion system | CSS-based, reduced-motion safe |
| Documentation | Updated |

---

## Manual Review Checklist

- [ ] Hero at 320px — message visible without excessive scroll
- [ ] Live state simulation (override) — coral accent, Join Live CTA
- [ ] Tuesday pending state — gold "Time to be confirmed"
- [ ] Newsletter 503 honest failure
- [ ] Reduced motion — no float/pulse/reveal animation
- [ ] Keyboard nav through mobile menu
- [ ] Legal pages typography consistency
