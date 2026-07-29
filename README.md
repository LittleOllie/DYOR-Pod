# DYOR Website

Production website for **DYOR — Do Your Own Research**, the home of weekly crypto X Spaces and the DYOR Podcast.

Built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

Default port is **3002** (3000 is used by other local apps). Only one `npm run dev` instance can run at a time.

Custom port: `npx next dev -p 3003`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest unit/component tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright browser tests |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |

## Updating content

All site content lives in `src/content/`:

- **Shows & schedule** — `src/content/shows.ts`
- **Hosts** — `src/content/hosts.ts`
- **Podcast links** — `src/content/podcast.ts`
- **Site copy & social links** — `src/content/site.ts`
- **Navigation** — `src/content/navigation.ts`

See [docs/CONTENT_UPDATE_GUIDE.md](docs/CONTENT_UPDATE_GUIDE.md) for detailed instructions.

## Replacing images

Place optimised WebP images in:

- `public/brand/` — logo
- `public/shows/` — programme artwork
- `public/hosts/` — host profile photos
- `public/og/` — social preview (`dyor-social-preview.jpg`, 1200×630)

Run `node scripts/convert-images.mjs` after updating source assets in `/tmp` or adapt the script.

## Newsletter configuration

The newsletter API (`POST /api/newsletter`) requires server-side environment variables:

```env
NEWSLETTER_PROVIDER=mailchimp
NEWSLETTER_API_KEY=your-api-key
NEWSLETTER_LIST_ID=your-list-id

# Or use a custom form endpoint:
NEWSLETTER_FORM_ENDPOINT=https://your-provider.com/subscribe
```

Until configured, signup returns an honest 503 error — never a fake success.

Supported providers (adapter extensible): Mailchimp, Kit, Beehiiv, Substack, Brevo, custom endpoint.

## Analytics (optional)

```env
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
```

Supported: `plausible`, `fathom`, `ga`. No tracking occurs unless configured.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEWSLETTER_PROVIDER` | No | Newsletter provider name |
| `NEWSLETTER_API_KEY` | No | Provider API key (server only) |
| `NEWSLETTER_LIST_ID` | No | Mailing list ID |
| `NEWSLETTER_FORM_ENDPOINT` | No | Custom subscribe endpoint |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | No | Analytics provider |

Never expose API keys in `NEXT_PUBLIC_*` variables.

## Deployment

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

Recommended: deploy to [Vercel](https://vercel.com) and connect `www.dyorpod.com`.

```bash
npm run build
```

## Project structure

```
src/
  app/           # Routes, layout, API
  components/    # UI components by feature
  content/       # Editable site content
  lib/           # Schedule logic, newsletter, analytics
  types/         # Shared TypeScript types
docs/            # Owner and deployment guides
public/          # Static assets
e2e/             # Playwright tests
```

## Owner checklist

See [docs/OWNER_CONTENT_CHECKLIST.md](docs/OWNER_CONTENT_CHECKLIST.md) for items needed before launch.

## Design system

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
