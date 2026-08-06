export type ShowAccent = "teal" | "gold" | "cyan" | "navy";
export type ShowPlatform = "x" | "spotify" | "apple";
export type ShowIdentityCue = "chart" | "briefing" | "signal" | "audio";

export type Show = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  identityCue: ShowIdentityCue;
  dayOfWeek: number;
  startTime?: string;
  timezone: string;
  durationMinutes?: number;
  platform: ShowPlatform;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  xUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  accent: ShowAccent;
  category: string;
  isActive: boolean;
  displayOrder: number;
  scheduleConfirmed: boolean;
  /** Manual override: force live status regardless of schedule */
  liveOverride?: boolean;
};

export type Host = {
  id: string;
  name: string;
  handle?: string;
  role: string;
  bio?: string;
  image: string;
  /** Full-length character art — enables hover reveal portrait when set */
  fullImage?: string;
  /** Circle background behind portrait (hex) */
  portraitBackground?: string;
  xUrl?: string;
  displayOrder: number;
};

export type NavItem = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  domain: string;
  contactEmail?: string;
  social: {
    x?: string;
    spotify?: string;
    applePodcasts?: string;
  };
};

export type FeaturedEpisode = {
  number: number;
  title: string;
  date: string;
  duration: string;
  description?: string;
  spotifyUrl?: string;
};

export type PodcastConfig = {
  spotifyShowUrl: string;
  spotifyEmbedUrl: string;
  applePodcastsUrl?: string;
  featuredEpisode?: FeaturedEpisode;
  /** @deprecated use featuredEpisode.title */
  featuredEpisodeTitle?: string;
  /** @deprecated use featuredEpisode.spotifyUrl */
  featuredEpisodeUrl?: string;
};
