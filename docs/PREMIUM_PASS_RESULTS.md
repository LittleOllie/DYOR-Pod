# Premium Pass Results — DYOR Website

Completion date: July 2026

---

## Build & Test Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass — 21 tests |
| `npm run build` | Pass — Next.js 16.2.12 |
| `npm run test:e2e` | Skipped — Playwright browsers not installed in CI sandbox (`npx playwright install` required locally) |

---

## Performance Review

### Bundle (Production Build)

| Route | First-load JS (uncompressed) |
|-------|------------------------------|
| `/` (homepage) | ~578 KB |
| Legal / contact | ~535 KB |

No new animation libraries added. Client boundaries limited to: header scroll, countdown, newsletter, Spotify lazy embed, reveal-on-scroll, mobile nav.

### Optimisations Preserved

- Spotify iframe lazy-loaded via IntersectionObserver (200px margin)
- Static homepage sections remain server components where possible
- CSS gradients and SVG for atmosphere (no canvas/video)
- Explicit image dimensions on programme/host assets
- Font loading: `display: swap` (Inter, Space Grotesk)

### Lighthouse Targets

Full Lighthouse audit should be run against production deployment (local dev inflates scores). Expected targets based on architecture:

| Category | Target | Notes |
|----------|--------|-------|
| Performance | 90+ | Achievable on production CDN; verify after deploy |
| Accessibility | 95+ | Skip link, labels, live text, reduced motion |
| Best Practices | 95+ | HTTPS on production |
| SEO | 95+ | Metadata, sitemap, JSON-LD present |

**Pre-deploy action:** Run Lighthouse on `https://www.dyorpod.com` after release.

---

## Accessibility Review

| Check | Status |
|-------|--------|
| Colour contrast (text on surfaces) | Pass — warm off-white on deep navy |
| Focus visibility | Pass — `focus-ring` utility |
| Keyboard order | Pass — logical DOM order |
| Skip link | Pass |
| Mobile menu | Pass — existing focus trap |
| Button/link labels | Pass |
| Image alt text | Pass |
| Form labels + errors | Pass — `role="alert"` on errors |
| Live status text | Pass — StatusPill + header indicator |
| Countdown announcements | Pass — stable summary, not per-second |
| Decorative orbit/stars | Pass — `aria-hidden` |
| Reduced motion | Pass — CSS + RevealOnScroll SSR-safe |
| Heading hierarchy | Pass |
| Touch targets ≥44px | Pass — buttons, chips, CTAs |

---

## Functionality Preserved

- Schedule calculations and timezone handling
- DST support
- Countdown behaviour
- Live / upcoming / pending states
- Spotify integration + lazy embed
- Newsletter honest failure (503 when unconfigured)
- Contact form honest failure
- Content configuration architecture
- Route structure and SEO metadata
- Legal pages
- Unit tests (21 passing)

---

## Visual Changes Delivered

1. Refined design tokens and section bands
2. Message-first hero with `HeroBrandVisual`
3. Premium next event card with countdown grid
4. Connected weekly schedule timeline
5. Unified show card system (square art, accents)
6. Editorial podcast section
7. Host cards with orbit rings, stacked mobile layout
8. About section with three principles
9. Newsletter card container
10. Footer with sign-off, watermark, orbit line
11. Header next-event indicator (desktop lg+)
12. Motion system (CSS-only, reduced-motion safe)

---

## Known Limitations

- DYOR Sunday artwork is portrait (784×1168) — crops in square frame
- Janner avatar below preferred 800×800
- Logo PNG only — SVG recommended
- Lighthouse scores not captured in CI this pass
- Legal pages use starter content — owner review required

---

## Recommended Post-Deploy Verification

1. Lighthouse on production URL
2. Manual mobile check at 320px
3. Live state override test
4. Newsletter 503 state with real env
5. Reduced motion in OS settings
6. OG image preview on X/Slack
