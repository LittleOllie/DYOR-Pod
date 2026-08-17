import type { Show } from "@/types/content";
import { site } from "./site";

/** Weekly Space links are posted on @DYORPod — no permanent per-show URL. */
const xAccountUrl = site.social.x;

/** Spaces run on US Eastern Time (ET). Schedule logic uses America/New_York (handles DST). */
const SPACE_DURATION_MINUTES = 60;

export const shows: Show[] = [
  {
    id: "dyor-sunday",
    name: "DYOR Sunday",
    shortName: "DYOR Sunday",
    tagline: "News • Markets • Weekly Recap",
    description:
      "Your weekly overview of crypto news, market moves, project updates, and the stories shaping the week.",
    identityCue: "briefing",
    dayOfWeek: 0,
    startTime: "16:00",
    timezone: "America/New_York",
    durationMinutes: SPACE_DURATION_MINUTES,
    platform: "x",
    image: "/shows/dyor-sunday.webp",
    imageWidth: 1122,
    imageHeight: 1402,
    xUrl: xAccountUrl,
    accent: "teal",
    category: "Live X Space",
    isActive: true,
    displayOrder: 4,
    scheduleConfirmed: true,
  },
  {
    id: "will-work-for-crypto",
    name: "Will Work for Crypto",
    shortName: "WWFC",
    tagline: "Markets • Trading • TA · Every Tuesday 6pm ET",
    description:
      "Live every Tuesday at 6pm ET. Market analysis, trading perspectives, and technical analysis — charts, structure, and actionable crypto discussion.",
    identityCue: "chart",
    dayOfWeek: 2,
    startTime: "18:00",
    timezone: "America/New_York",
    durationMinutes: SPACE_DURATION_MINUTES,
    platform: "x",
    image: "/shows/will-work-for-crypto.webp",
    imageWidth: 1122,
    imageHeight: 1402,
    xUrl: xAccountUrl,
    accent: "cyan",
    category: "Live X Space",
    isActive: true,
    displayOrder: 1,
    scheduleConfirmed: true,
  },
  {
    id: "no-fud-friday",
    name: "No FUD Friday",
    shortName: "No FUD Friday",
    tagline: "News • NFTs • Zero FUD",
    description:
      "Crypto and NFT news without the noise — balanced discussion that cuts through misinformation and end-of-week hype.",
    identityCue: "signal",
    dayOfWeek: 5,
    startTime: "16:00",
    timezone: "America/New_York",
    durationMinutes: SPACE_DURATION_MINUTES,
    platform: "x",
    image: "/shows/no-fud-friday.webp",
    imageWidth: 1122,
    imageHeight: 1402,
    xUrl: xAccountUrl,
    accent: "navy",
    category: "Live X Space",
    isActive: true,
    displayOrder: 3,
    scheduleConfirmed: true,
  },
  {
    id: "dyor-podcast",
    name: "The DYOR Podcast",
    shortName: "DYOR Podcast",
    tagline: "Guests • Insights • Conversations",
    description:
      "In-depth crypto conversations with guests — builders, founders, traders, and voices from across the community.",
    identityCue: "audio",
    dayOfWeek: 3,
    timezone: "America/New_York",
    platform: "spotify",
    image: "/shows/dyor-podcast.webp",
    imageWidth: 1122,
    imageHeight: 1402,
    spotifyUrl:
      "https://open.spotify.com/show/2vjrGgVaLcP1VWJGeKKohf?si=oYEkIXFXTjWuhPwe4FnZFA",
    appleUrl: "https://podcasts.apple.com/us/podcast/dyor/id1889952204",
    accent: "gold",
    category: "Podcast",
    isActive: true,
    displayOrder: 2,
    scheduleConfirmed: true,
  },
];

export function getActiveShows(): Show[] {
  return [...shows]
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getShowById(id: string): Show | undefined {
  return shows.find((s) => s.id === id);
}

export function getWeeklyShows(): Show[] {
  return [...shows]
    .filter((s) => s.isActive)
    .sort((a, b) => {
      const dayOrder = (d: number) => (d === 0 ? 7 : d);
      return dayOrder(a.dayOfWeek) - dayOrder(b.dayOfWeek);
    });
}
