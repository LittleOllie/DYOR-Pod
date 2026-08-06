import type { SiteConfig } from "@/types/content";

export const site: SiteConfig = {
  name: "DYOR",
  tagline: "Do Your Own Research",
  domain: "https://www.dyorpod.com",
  contactEmail: undefined, // Owner: add when available
  social: {
    x: "https://x.com/DYORPod",
    spotify:
      "https://open.spotify.com/show/2vjrGgVaLcP1VWJGeKKohf?si=oYEkIXFXTjWuhPwe4FnZFA",
    applePodcasts: "https://podcasts.apple.com/us/podcast/dyor/id1889952204",
  },
};

/** Each week's live Space link is posted on the @DYORPod X account. */
export const xSpaceNote =
  "Each week's Space link is posted on @DYORPod on X.";

export const hero = {
  eyebrow: "DYOR Mission Control",
  headline: "Crypto conversations worth tuning in for.",
  headlineAccent: "conversations",
  description:
    "Live crypto news, charts, interviews and independent opinions across weekly X Spaces and the DYOR Podcast.",
  supportingPoints: [
    "Weekly X Spaces",
    "Crypto news and analysis",
    "Podcast every Wednesday",
  ],
};

/** Mobile homepage hero — shorter, editorial copy. Desktop uses `hero`. */
export const heroMobile = {
  eyebrow: "Independent crypto conversations",
  headline: "Crypto conversations worth tuning in for.",
  headlineAccent: "conversations",
  description:
    "Live Spaces, market perspectives and the weekly DYOR Podcast — without the noise.",
  primaryCta: "See what's next",
  secondaryCta: "Listen to the podcast",
} as const;

export const scheduleMobile = {
  eyebrow: "Weekly lineup",
  title: "This Week at DYOR",
  description: "Three conversations. One place to stay informed.",
} as const;

export const hostsMobile = {
  eyebrow: "The DYOR team",
  title: "Meet the Voices Behind DYOR",
  description: "Independent perspectives from the people behind the weekly conversations.",
} as const;

export const missionMobile = {
  eyebrow: "Mission Control",
  title: "Do Your Own Research",
  mission:
    "A live crypto broadcast built to help you think independently, ask better questions and make better long-term decisions.",
  valuesLine: "Community first. Always bullish. Profits over screenshots.",
  readMoreLabel: "Read our mission and values",
} as const;

export const newsletterMobile = {
  eyebrow: "The weekly briefing",
} as const;

export const podcastMobile = {
  eyebrow: "The weekly podcast",
  highlight: "New episodes every Wednesday",
} as const;

export const libraryMobile = {
  eyebrow: "Spaces archive",
  description: "Replay recorded X Spaces from the DYOR lineup.",
} as const;

/** Desktop homepage copy — editorial, wider layouts */
export const scheduleDesktop = {
  eyebrow: "Weekly programming",
  title: "This Week at DYOR",
  description:
    "Four conversations across the week — live on X and on demand on Spotify.",
} as const;

export const hostsDesktop = {
  title: "Meet the Voices Behind DYOR",
  accent: "DYOR",
  description:
    "Three hosts. One team. Independent perspectives on crypto every week.",
} as const;

export const heroDesktop = {
  primaryCta: "View next Space",
  secondaryCta: "Listen to the podcast",
} as const;

export const newsletter = {
  heading: "Join the DYOR Briefing",
  description:
    "Get upcoming Space details, guest announcements and new podcast releases in one concise weekly update.",
  buttonLabel: "Join the Briefing",
  consentText:
    "By subscribing you agree to receive DYOR updates. Unsubscribe anytime. We never sell your email.",
  interests: [
    "Bitcoin",
    "Ethereum",
    "NFTs",
    "Trading and charts",
    "Builders and technology",
    "AI and crypto",
    "General crypto news",
    "Everything",
  ] as const,
};

export const footer = {
  tagline: "Stay curious. Stay informed. Always DYOR.",
  eyebrow: "End of Transmission",
  poweredBy: "Little Ollie Labs",
};
