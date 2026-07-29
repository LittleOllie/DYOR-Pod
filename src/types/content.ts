export type ShowAccent = "teal" | "gold" | "cyan" | "navy";
export type ShowPlatform = "x" | "spotify" | "apple";

export type Show = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
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

export type PodcastConfig = {
  spotifyShowUrl: string;
  spotifyEmbedUrl: string;
  applePodcastsUrl?: string;
  featuredEpisodeTitle?: string;
  featuredEpisodeUrl?: string;
};
