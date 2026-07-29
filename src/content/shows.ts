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
    tagline: "Crypto News & Opinion",
    description:
      "Breaking crypto, blockchain and NFT news with sharp expert analysis and bold, thought-provoking opinions.",
    dayOfWeek: 0,
    startTime: "16:00",
    timezone: "America/New_York",
    durationMinutes: SPACE_DURATION_MINUTES,
    platform: "x",
    image: "/shows/DYORSunday.png",
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
    tagline: "Charts & Analysis",
    description:
      "A weekly live X Space focused on charts, markets and crypto analysis.",
    dayOfWeek: 2,
    timezone: "America/New_York",
    platform: "x",
    image: "/shows/WillWorkForCrypto.png",
    imageWidth: 1122,
    imageHeight: 1402,
    xUrl: xAccountUrl,
    accent: "cyan",
    category: "Live X Space",
    isActive: true,
    displayOrder: 1,
    scheduleConfirmed: false, // Owner: confirm Tuesday start time
  },
  {
    id: "no-fud-friday",
    name: "No FUD Friday",
    shortName: "No FUD Friday",
    tagline: "Crypto News & Meaningful Interviews",
    description:
      "Live crypto news, conversations and meaningful interviews from across the industry.",
    dayOfWeek: 5,
    startTime: "16:00",
    timezone: "America/New_York",
    durationMinutes: SPACE_DURATION_MINUTES,
    platform: "x",
    image: "/shows/NOFUDFriday.png",
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
    tagline: "Weekly Crypto News & Opinion",
    description:
      "The weekly DYOR Podcast covering crypto news, opinions and conversations.",
    dayOfWeek: 3,
    timezone: "America/New_York",
    platform: "spotify",
    image: "/shows/DYORPodcast.png",
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
