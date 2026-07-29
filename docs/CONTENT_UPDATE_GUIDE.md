# Content Update Guide

This guide explains how to update DYOR website content without touching component code.

## Show times and days

Edit `src/content/shows.ts`.

```typescript
{
  id: "dyor-sunday",
  dayOfWeek: 0,        // 0=Sunday, 1=Monday, ... 6=Saturday
  startTime: "16:00",  // 24-hour format in show timezone
  timezone: "America/New_York",
  durationMinutes: 90,
  scheduleConfirmed: true,
}
```

For unconfirmed times (e.g. Will Work for Crypto):

- Omit `startTime`
- Set `scheduleConfirmed: false`

The site will show "Time to be confirmed" with no countdown.

## X Space links

Set `xUrl` on each X Space show, or update the default in `src/content/site.ts`:

```typescript
social: { x: "https://x.com/DYORPod" }
```

## Show artwork

Replace files in `public/shows/`:

- `dyor-sunday.webp`
- `will-work-for-crypto.webp`
- `no-fud-friday.webp`
- `dyor-podcast.webp`

Recommended: 800×450px WebP, under 100KB.

## Hosts

Edit `src/content/hosts.ts`:

```typescript
{
  id: "dw",
  name: "DW",
  handle: "username",       // optional
  role: "DYOR Host",
  bio: "Short bio",         // optional
  image: "/hosts/dw.webp",
  xUrl: "https://x.com/...", // optional
}
```

Replace images in `public/hosts/`.

## Podcast links

Edit `src/content/podcast.ts`:

- `spotifyShowUrl`
- `spotifyEmbedUrl` (Spotify embed URL from Share → Embed)
- `applePodcastsUrl`
- `featuredEpisodeTitle` / `featuredEpisodeUrl` (optional)

## Newsletter provider

Set environment variables (see README). No code changes needed for Mailchimp or custom endpoints.

## Homepage wording

Edit `src/content/site.ts`:

- `hero` — headline, description, supporting points
- `about` — about section copy and disclaimer
- `newsletter` — briefing section copy
- `footer` — footer tagline

## Social links

Edit `src/content/site.ts` → `social`:

```typescript
social: {
  x: "https://x.com/DYORPod",
  spotify: "https://open.spotify.com/show/...",
  applePodcasts: "https://podcasts.apple.com/...",
}
```

Also update `contactEmail` when available.

## Logo

Replace `public/brand/dyor-logo.webp`.

## Manual live override

To force a Space live outside schedule:

```typescript
liveOverride: true,  // on the show in shows.ts
```

Remove when the override is no longer needed.

## Featured podcast episode

Set in `src/content/podcast.ts`:

```typescript
featuredEpisodeTitle: "Episode title",
featuredEpisodeUrl: "https://...",
```

## After updating

```bash
npm run build
```

Verify schedule and countdown on the homepage.
