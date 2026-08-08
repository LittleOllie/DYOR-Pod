/** DYOR mission section — single source for About / Core Values content. */

import type { GameLetterId } from "@/content/brandLogo";

export const aboutSection = {
  moduleId: "MOD-04",
  heading: "Our Values",
  headingAccent: "Values",
  mission:
    "Weekly X Spaces and the DYOR Podcast — built to help you think independently, ask better questions and make better long-term decisions.",
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

export const coreValues: {
  letterId: GameLetterId;
  title: string;
  description: string;
}[] = [
  {
    letterId: "d",
    title: "Community First",
    description: "We grow together or not at all.",
  },
  {
    letterId: "y",
    title: "Always Bullish",
    description: "Focus on long-term innovation.",
  },
  {
    letterId: "o",
    title: "Profits Over Screenshots",
    description: "Build conviction before clout.",
  },
  {
    letterId: "r",
    title: "We're Better Together",
    description: "The strongest ideas come from shared perspectives.",
  },
];
