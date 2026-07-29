# Asset Review — DYOR Website

Review date: July 2026

---

## Summary

| Asset | Dimensions | Quality | Replace? |
|-------|------------|---------|----------|
| DYOR logo PNG | 1536×1024 | Good resolution, non-square | Optional SVG preferred |
| dyor-logo.webp | 1000×1000 | Good | Keep as square fallback |
| DYORSunday.png | 1122×1402 | Portrait — owner-provided; crops in square card | Optional square 1600×1600 later |
| will-work-for-crypto.webp | 1000×1000 | Adequate | Optional upgrade to 1600×1600 |
| NOFUDFriday.png | 1122×1402 | Portrait — owner-provided | Optional square export later |
| dyor-podcast.webp | 1000×1000 | Adequate | Optional upgrade |
| dw.webp | 500×500 | Acceptable | Optional 800×800 |
| petey-k.webp | 500×500 | Acceptable | Optional 800×800 |
| janner.webp | 400×400 | **Below preferred min** | **Yes — 800×800 minimum** |
| OG image | 1200×630 (expected) | Not re-audited this pass | Verify before launch |
| favicon / apple-touch | Present | Not re-audited | Verify crispness at 32px |

---

## Detailed Inventory

### Brand

| File | Used in | Dimensions | Assessment | Recommendation |
|------|---------|------------|------------|----------------|
| `public/brand/DYORLogo.png` | `BrandLogo.tsx`, header, footer | 1536×1024 | Clear, transparent PNG; landscape ratio | Provide **SVG** primary + transparent PNG fallback |
| `public/brand/dyor-logo.webp` | Available, not primary | 1000×1000 | Square webp | Use if square logo needed; align with PNG art direction |

### Programme Artwork

| File | Used in | Dimensions | Assessment | Recommendation |
|------|---------|------------|------------|----------------|
| `public/shows/DYORSunday.png` | ShowCard, schedule | 1122×1402 | Owner-provided PNG; portrait crops in square frame | Optional: square export later |
| `public/shows/will-work-for-crypto.webp` | ShowCard | 1000×1000 | Square, acceptable | Upgrade to 1600×1600 when refreshing |
| `public/shows/NOFUDFriday.png` | ShowCard, schedule | 1122×1402 | Owner-provided PNG | Optional: square export later |
| `public/shows/dyor-podcast.webp` | ShowCard, PodcastFeature | 1000×1000 | Square, acceptable | Same |

**Preferred format:** Square PNG or high-quality WebP, ≥1600×1600, no browser UI or screenshots.

### Host Avatars

| File | Used in | Dimensions | Assessment | Recommendation |
|------|---------|------------|------------|----------------|
| `public/hosts/dw.webp` | HostCard | 500×500 | OK at 128px display | 800×800 for retina headroom |
| `public/hosts/petey-k.webp` | HostCard | 500×500 | OK | Same |
| `public/hosts/janner.webp` | HostCard | 400×400 | Smallest asset; may soften on retina | **Replace at 800×800** |

**Preferred format:** Square PNG/WebP, ≥800×800, clean crop.

### Social / SEO

| File | Used in | Notes |
|------|---------|-------|
| `public/og/dyor-social-preview.jpg` | `layout.tsx` metadata | Verify 1200×630, readable at small preview |
| `public/favicon.ico` | Browser tab | Standard |
| `public/apple-touch-icon.png` | iOS home screen | Standard |

### Decorative

| Component | Type | Notes |
|-----------|------|-------|
| `RocketMark.tsx` | Inline SVG | Vector — no replacement needed |
| Star field / grid | CSS | No image asset |

---

## TODO for Owner

1. **DYOR Sunday artwork** — optional square export (current `DYORSunday.png` is 1122×1402 portrait).
2. **Janner avatar** — provide ≥800×800 source.
3. **Logo SVG** — optional but recommended for crisp scaling.
4. Do not upscale low-quality assets — replace with native resolution sources.

---

## Alt Text Status

All programme and host images use descriptive `alt` attributes via components. Decorative hero/footer elements use `aria-hidden`.
