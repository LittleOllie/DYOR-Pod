# Owner Content Checklist

Track what is confirmed vs still needed before launch.

---

## Remind me later — still needed

Copy this list when following up with the DYOR team:

- [ ] **Will Work for Crypto — Tuesday start time** (exact time not yet confirmed)
- [ ] **Newsletter / email service** they currently use (Mailchimp, Kit, Beehiiv, etc.)
- [ ] **Contact form backend** — set `CONTACT_FORM_ENDPOINT` or `CONTACT_WEBHOOK_URL` (page live at `/contact`)
- [ ] **Short host bios** (even one sentence each for DW, Petey K, Janner)

---

## Confirmed ✓

- [x] **Main DYOR X account** — https://x.com/DYORPod
- [x] **DW X profile** — https://x.com/DWDrummer_eth
- [x] **Petey K X profile** — https://x.com/PeteyK
- [x] **Janner X profile** — https://x.com/NF_Janner
- [x] **DYOR Sunday** — Sundays, 4:00 pm ET on X
- [x] **No FUD Friday** — Fridays, 4:00 pm ET on X
- [x] **Space duration** — ~60 minutes each
- [x] **Timezone** — US Eastern (ET); site uses `America/New_York` so daylight saving is handled automatically
- [x] **X Space links** — new link each week; posted on @DYORPod (not permanent per-show URLs)
- [x] **Spotify Podcast** — https://open.spotify.com/show/2vjrGgVaLcP1VWJGeKKohf
- [x] **Apple Podcasts** — https://podcasts.apple.com/us/podcast/dyor/id1889952204
- [x] **Logo** — `public/brand/DYORLogo.png` (transparent PNG)

---

## Required before launch

- [ ] **Will Work for Crypto time** — see “Remind me later” above
- [ ] **Newsletter provider** — configure env vars once service is confirmed
- [ ] **Legal pages review** — privacy, terms, disclaimer are starter content only

## Recommended

- [ ] **Contact email** — when available
- [ ] **Host bios** — when available
- [ ] **Featured podcast episode** — optional highlight
- [ ] **Analytics provider** — Plausible, Fathom, Vercel Analytics, or GA
- [ ] **Show artwork review** — confirm programme images are correct
- [ ] **OG image update** — regenerate with new logo if desired

## Post-launch

- [ ] Connect custom domain `www.dyorpod.com` in Vercel
- [ ] Test newsletter signup in production
- [ ] Test Spotify embed on mobile Safari
- [ ] Verify live status during an actual Space
- [ ] Submit sitemap to search engines

---

## Quick reference — where to update

| Item | File |
|------|------|
| Show times | `src/content/shows.ts` |
| Host links & bios | `src/content/hosts.ts` |
| Social links | `src/content/site.ts` |
| Spotify | `src/content/podcast.ts` |
| Logo | `public/brand/DYORLogo.png` |
| Newsletter | Environment variables (see README) |
