export type LegalTabId = "privacy" | "terms" | "disclaimer";

export type LegalSection = {
  heading?: string;
  paragraphs: string[];
};

export type LegalDocument = {
  id: LegalTabId;
  label: string;
  title: string;
  showLastUpdated?: boolean;
  intro?: string;
  sections: LegalSection[];
};

export const legalDocuments: LegalDocument[] = [
  {
    id: "privacy",
    label: "Privacy",
    title: "Privacy Policy",
    showLastUpdated: true,
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          'DYOR ("we", "us") operates dyorpod.com. This policy describes how we collect, use, and protect information when you visit our website or subscribe to our newsletter.',
        ],
      },
      {
        heading: "Information We Collect",
        paragraphs: [
          "We may collect your email address when you subscribe to the DYOR Briefing. We may also collect standard analytics data (page views, referral source) if analytics are enabled.",
        ],
      },
      {
        heading: "How We Use Information",
        paragraphs: [
          "Email addresses are used to send newsletter updates about DYOR Spaces, podcast releases, and related announcements. We do not sell personal information.",
        ],
      },
      {
        heading: "Third-Party Services",
        paragraphs: [
          "Our site may link to X, Spotify, Apple Podcasts, and newsletter providers. These services have their own privacy policies.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["For privacy questions, contact the DYOR team through their official X account."],
      },
    ],
  },
  {
    id: "terms",
    label: "Terms",
    title: "Terms of Use",
    showLastUpdated: true,
    sections: [
      {
        heading: "Acceptance",
        paragraphs: [
          "By accessing dyorpod.com, you agree to these terms. If you do not agree, please do not use the site.",
        ],
      },
      {
        heading: "Content",
        paragraphs: [
          "All content on this site and in DYOR programmes is for informational and entertainment purposes. It does not constitute financial, investment, or legal advice.",
        ],
      },
      {
        heading: "External Links",
        paragraphs: [
          "Our site links to third-party platforms including X and Spotify. We are not responsible for content or policies on external sites.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: ["We may update these terms at any time. Continued use constitutes acceptance."],
      },
    ],
  },
  {
    id: "disclaimer",
    label: "Disclaimer",
    title: "Disclaimer",
    intro:
      "Content shared by DYOR and its guests is provided for entertainment and informational purposes only and does not constitute financial advice. Always do your own research.",
    sections: [
      {
        heading: "No Financial Advice",
        paragraphs: [
          "Nothing on this website, in DYOR X Spaces, or on the DYOR Podcast should be interpreted as investment, trading, tax, or legal advice. Consult qualified professionals before making financial decisions.",
        ],
      },
      {
        heading: "Cryptocurrency Risk",
        paragraphs: [
          "Cryptocurrency and digital assets involve substantial risk, including total loss of capital. Past performance is not indicative of future results.",
        ],
      },
      {
        heading: "External Links",
        paragraphs: [
          "Links to third-party websites are provided for convenience. DYOR does not endorse or guarantee external content.",
        ],
      },
      {
        heading: "Guest Opinions",
        paragraphs: [
          "Views expressed by guests and contributors are their own and may not represent the views of DYOR or its hosts.",
        ],
      },
    ],
  },
];

export const legalTabIds = legalDocuments.map((d) => d.id);

export function isLegalTabId(value: string | null | undefined): value is LegalTabId {
  return value === "privacy" || value === "terms" || value === "disclaimer";
}

export function getLegalDocument(id: LegalTabId): LegalDocument {
  return legalDocuments.find((d) => d.id === id) ?? legalDocuments[0];
}
