/** DYOR mission section — single source for About / Core Values content. */

export const aboutSection = {
  moduleId: "MOD-04",
  heading: "Do Your Own Research",
  headingAccent: "Own Research",
  mission:
    "Weekly X Spaces and the DYOR Podcast — built to help you think independently, ask better questions and make better long-term decisions.",
  principlesLabel: "Principles",
  valuesLabel: "Values",
  brandStatement: [
    "Signal over noise.",
    "Research over reaction.",
    "Community over ego.",
  ] as const,
  disclaimerLabel: "Disclaimer",
  disclaimer:
    "Content shared by DYOR and its guests is for entertainment and information only — not financial advice. Always do your own research.",
} as const;

export const coreValues = [
  {
    title: "Community First",
    description: "We grow together or not at all.",
  },
  {
    title: "Always Bullish",
    description: "Focus on long-term innovation.",
  },
  {
    title: "Profits Over Screenshots",
    description: "Build conviction before clout.",
  },
  {
    title: "We're Better Together",
    description: "The strongest ideas come from shared perspectives.",
  },
] as const;

export const researchPrinciples = [
  {
    title: "Independent perspectives",
    description: "Different voices across Spaces and the podcast — no single narrative.",
  },
  {
    title: "Live community conversation",
    description: "Real-time discussion on X, not one-way broadcasts.",
  },
  {
    title: "Research before reaction",
    description: "Stay informed, ask questions, draw your own conclusions.",
  },
] as const;
