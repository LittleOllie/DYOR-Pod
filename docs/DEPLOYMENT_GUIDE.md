# Deployment Guide

## Vercel (recommended)

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set root directory to `dyor-website` if the repo contains other folders
4. Framework preset: **Next.js**
5. Add environment variables (see below)
6. Deploy

## Environment variables (production)

```
NEWSLETTER_PROVIDER=mailchimp
NEWSLETTER_API_KEY=...
NEWSLETTER_LIST_ID=...

# Optional
NEWSLETTER_FORM_ENDPOINT=...
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
```

## Domain connection

1. In Vercel → Project → Settings → Domains
2. Add `www.dyorpod.com` and `dyorpod.com`
3. Update DNS at your registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 (or Vercel's current apex IP) |

4. Wait for SSL provisioning (automatic)

## Production build (local verify)

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run start
```

## Testing production

- [ ] Homepage loads over HTTPS
- [ ] Schedule countdown is correct for your timezone
- [ ] Mobile menu works with keyboard
- [ ] Newsletter signup behaves correctly (success or honest error)
- [ ] Spotify embed loads below the fold
- [ ] All external links open correctly
- [ ] Legal pages accessible
- [ ] OG image previews correctly (use X/LinkedIn card validators)

## Rollback

In Vercel:

1. Deployments → select previous successful deployment
2. Click **Promote to Production**

Or via Git: revert the commit and push to trigger a new deploy.

## Updating content after deploy

Content changes in `src/content/` require a new deploy (automatic on push to main).

Environment variable changes take effect on next deployment or via Vercel redeploy.
