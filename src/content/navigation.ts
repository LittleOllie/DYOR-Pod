import type { NavItem } from "@/types/content";

export const mainNav: NavItem[] = [
  { label: "Schedule", href: "/#schedule" },
  { label: "Podcast", href: "/#podcast" },
  { label: "Library", href: "/#library" },
  { label: "Hosts", href: "/#hosts" },
  { label: "Mission Control", href: "/#about" },
  { label: "Join", href: "/#newsletter" },
  { label: "Contact", href: "/contact" },
];

/** Labels used in the mobile navigation drawer. */
export const mobileNav: NavItem[] = [
  { label: "Next Space", href: "/#schedule" },
  { label: "Weekly Schedule", href: "/#schedule" },
  { label: "Podcast", href: "/#podcast" },
  { label: "Spaces Library", href: "/#library" },
  { label: "Hosts", href: "/#hosts" },
  { label: "Mission", href: "/#about" },
  { label: "Contact", href: "/contact" },
  { label: "Join the Briefing", href: "/#newsletter" },
];

export const footerNav: NavItem[] = [
  { label: "Schedule", href: "/#schedule" },
  { label: "Podcast", href: "/#podcast" },
  { label: "Library", href: "/#library" },
  { label: "Hosts", href: "/#hosts" },
  { label: "Mission Control", href: "/#about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/legal?tab=privacy" },
  { label: "Terms", href: "/legal?tab=terms" },
  { label: "Disclaimer", href: "/legal?tab=disclaimer" },
];

/** Grouped footer links for mobile — clearer scan hierarchy. */
export const footerLinkGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Schedule", href: "/#schedule" },
      { label: "Podcast", href: "/#podcast" },
      { label: "Library", href: "/#library" },
      { label: "Hosts", href: "/#hosts" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Mission", href: "/#about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/legal?tab=privacy" },
      { label: "Terms", href: "/legal?tab=terms" },
      { label: "Disclaimer", href: "/legal?tab=disclaimer" },
    ],
  },
];
