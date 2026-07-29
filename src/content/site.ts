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
  description:
    "Live crypto news, charts, interviews and independent opinions across weekly X Spaces and the DYOR Podcast.",
  supportingPoints: [
    "Weekly X Spaces",
    "Crypto news and analysis",
    "Podcast every Wednesday",
  ],
};

export const about = {
  heading: "Do Your Own Research",
  body: "DYOR brings together live crypto news, charts, interviews and independent opinions across recurring X Spaces and the weekly DYOR Podcast. It is a place for thoughtful conversations, different perspectives and staying informed in a fast-moving industry.",
  disclaimer:
    "Content shared by DYOR and its guests is provided for entertainment and informational purposes only and does not constitute financial advice. Always do your own research.",
};

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
