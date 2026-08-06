# DYOR Website — Deployment Guide

This guide covers pushing the project to GitHub, deploying on Vercel, verifying preview/production builds, and cutting over DNS from Squarespace.

Repository app root: `dyor-website/` (if the monorepo contains other folders, set this as the Vercel **Root Directory**).

---

## 1. GitHub push flow

From your machine (non-destructive):

```bash
cd /path/to/DYOR/dyor-website   # or repo root, then cd dyor-website
git status
git diff
git add .
git status
git commit -m "Pre-launch hardening: SEO, security, performance, CI"
git push origin main
```

Do **not** commit:

- `.env` / `.env.local`
- `node_modules/`
- `.next/`
- local caches or screenshots

`.gitignore` already excludes these. Review `git status` before every commit.

---

## 2. Vercel project configuration

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. **Framework preset:** Next.js
3. **Root Directory:** `dyor-website` (when the repo root is `DYOR/`)
4. **Build Command:** `npm run build` (default)
5. **Install Command:** `npm ci` (default with lockfile)
6. Connect **Upstash Redis** via Vercel Storage (recommended) or add Upstash credentials manually.
7. Add environment variables (Section 4).
8. Deploy to preview first; verify; then promote to production.

---

## 3. Environment variables

Use `.env.example` as the source of truth. Never expose server secrets with `NEXT_PUBLIC_`.

| Variable                         | Required                           | Scope  | Purpose                                                          |
| -------------------------------- | ---------------------------------- | ------ | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | **Yes** (production)               | Public | Canonical URLs, sitemap, OG metadata (`https://www.dyorpod.com`) |
| `UPSTASH_REDIS_REST_URL`         | **Yes** for admin schedule/library | Server | Redis REST endpoint                                              |
| `UPSTASH_REDIS_REST_TOKEN`       | **Yes** for admin schedule/library | Server | Redis auth token                                                 |
| `ADMIN_ALLOWED_EMAILS`           | **Yes** for admin                  | Server | Comma-separated login allowlist                                  |
| `ADMIN_PASSWORD`                 | **Yes** for admin                  | Server | Shared team password                                             |
| `ADMIN_SESSION_SECRET`           | **Yes** for admin                  | Server | HMAC session signing secret                                      |
| `NEWSLETTER_PROVIDER`            | Optional                           | Server | `mailchimp`, `convertkit`, `buttondown`, or `webhook`            |
| `NEWSLETTER_API_KEY`             | Optional                           | Server | Provider API key                                                 |
| `NEWSLETTER_LIST_ID`             | Optional                           | Server | Provider list/audience ID                                        |
| `NEWSLETTER_FORM_ENDPOINT`       | Optional                           | Server | Webhook-style provider URL                                       |
| `CONTACT_FORM_ENDPOINT`          | Optional                           | Server | Contact form destination (e.g. Formspree, custom webhook)        |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | Optional                           | Public | `plausible`, `fathom`, or `ga`                                   |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | Optional                           | Public | Plausible domain                                                 |
| `NEXT_PUBLIC_FATHOM_SITE_ID`     | Optional                           | Public | Fathom site ID                                                   |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`  | Optional                           | Public | Google Analytics 4 ID                                            |

### Graceful degradation

| Missing config   | Behaviour                                         |
| ---------------- | ------------------------------------------------- |
| Redis            | Static schedule/library; admin writes unavailable |
| Newsletter       | Friendly 503 on signup                            |
| Contact endpoint | Friendly 503 on submit                            |
| Analytics        | Events and script safely no-op                    |

---

## 4. Upstash Redis

Required for:

- Admin library recordings (`library:recordings`)
- Admin schedule overrides (`schedule:config`)
- Rate limiting (optional enhancement; in-memory fallback when Redis unavailable)

**Setup:**

1. Vercel → Project → Storage → Create/connect Upstash Redis
2. Confirm `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` appear in Environment Variables
3. Redeploy after connecting storage

---

## 5. Admin setup

1. Set `ADMIN_ALLOWED_EMAILS`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` in Vercel (Production + Preview as needed).
2. Visit `/admin/login` on the preview URL.
3. Sign in with an allowlisted email and the shared password.
4. Verify:
   - `/admin` — library recordings CRUD
   - `/admin/schedule` — recurring schedule and date overrides
5. Session cookie is scoped to `/admin`, HttpOnly, Secure (production), SameSite=Lax, 7-day TTL.

---

## 6. Newsletter setup

1. Choose provider and create list/audience.
2. Set `NEWSLETTER_PROVIDER`, `NEWSLETTER_API_KEY`, `NEWSLETTER_LIST_ID`.
3. Test signup on preview — expect success message or honest configuration error.

---

## 7. Contact setup

1. Create a form endpoint (Formspree, custom webhook, etc.).
2. Set `CONTACT_FORM_ENDPOINT` in Vercel.
3. Test `/contact` on preview.

---

## 8. Preview deployment verification

On the Vercel preview URL:

- [ ] Homepage loads; schedule and countdown render
- [ ] `/contact`, `/legal`, `/mission` load with correct titles/canonicals
- [ ] `/sitemap.xml` lists `/`, `/contact`, `/legal`, `/mission` only
- [ ] `/robots.txt` disallows `/admin` and `/api/`
- [ ] Newsletter and contact forms handle missing/existing config gracefully
- [ ] Admin login and protected routes work
- [ ] Mission Ascent opens from homepage and `/mission`
- [ ] PWA manifest and service worker register
- [ ] Spotify embed and X links work (CSP)

---

## 9. Production deployment verification

Repeat preview checks on the production Vercel URL **before** DNS cutover.

Also verify:

- [ ] `NEXT_PUBLIC_SITE_URL=https://www.dyorpod.com`
- [ ] HTTPS and security headers (HSTS in production)
- [ ] OG/social previews use correct domain

---

## 10. Squarespace DNS cutover

**Only after preview and production Vercel builds pass.**

1. Vercel → Project → Settings → Domains
2. Add `www.dyorpod.com` and `dyorpod.com`
3. At your DNS provider, replace Squarespace records:

| Type  | Name | Value                                            |
| ----- | ---- | ------------------------------------------------ |
| CNAME | www  | `cname.vercel-dns.com`                           |
| A     | @    | Vercel apex IP (shown in Vercel domain settings) |

4. Wait for DNS propagation and automatic SSL (typically minutes to a few hours).
5. Confirm `https://www.dyorpod.com` serves the Vercel deployment.

---

## 11. Rollback procedure

**Fast rollback (recommended):**

1. Vercel → Deployments
2. Select the last known-good deployment
3. **Promote to Production**

**Git rollback:**

```bash
git revert <commit-sha>
git push origin main
```

**DNS rollback:**

Point `www` and `@` back to Squarespace records if the previous site must be restored immediately.

---

## 12. Post-launch smoke tests

- [ ] Homepage hero, schedule, show cards, podcast, hosts, newsletter
- [ ] Mobile menu and keyboard navigation
- [ ] Legal tabs keyboard navigation (arrows, Home, End)
- [ ] Admin login + library + schedule edit
- [ ] `/api/schedule` returns events (or static fallback)
- [ ] Logo intro dismissible; respects reduced motion
- [ ] No duplicate page `<h1>` with intro dismissed

---

## 13. Local production build verify

```bash
cd dyor-website
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run start
```

CI runs the same checks on push/PR via `.github/workflows/ci.yml`.

---

## 14. Content updates after launch

- **Code/content in `src/content/`:** deploys automatically on push to `main`
- **Admin library/schedule:** stored in Redis; no redeploy needed
- **Environment variables:** take effect on next deployment (or manual redeploy)

---

## 15. Security notes

- Admin session cookie path: `/admin` only
- Rate limits: admin login, newsletter, contact (Redis + in-memory fallback)
- CSP allows Spotify embeds, X/Twitter frames, analytics providers, and service workers — see `next.config.ts`
- Do not commit secrets; rotate `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` if exposed
