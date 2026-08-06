import { site } from "@/content/site";
import type { EventStatus } from "@/lib/schedule/types";
import type { Show, ShowAccent } from "@/types/content";

export const showAccentStyles: Record<
  ShowAccent,
  { border: string; label: string }
> = {
  teal: {
    border: "hover:border-brand/45",
    label: "text-brand-bright",
  },
  gold: {
    border: "hover:border-gold/45",
    label: "text-gold",
  },
  cyan: {
    border: "hover:border-brand-bright/45",
    label: "text-brand-bright",
  },
  navy: {
    border: "hover:border-border-strong/60",
    label: "text-text-secondary",
  },
};

export function getShowCtaUrl(show: Show): string | undefined {
  return (
    show.xUrl ??
    show.spotifyUrl ??
    show.appleUrl ??
    site.social.x ??
    site.social.spotify
  );
}

export function getShowCtaLabel(show: Show, status: EventStatus): string {
  if (status === "live") return "Join Live on X";
  if (show.platform === "spotify") return "Listen on Spotify";
  if (status === "schedule-pending") return "Follow on X";
  return "Find on @DYORPod";
}

export function getShowPlatformLabel(show: Show): string {
  if (show.platform === "x") return "X Space";
  if (show.platform === "spotify") return "Spotify Podcast";
  return "Podcast";
}

export function getScheduleCtaLabel(show: Show, status: EventStatus): string {
  if (status === "live") return "Join Live";
  if (show.platform === "spotify") return "Listen";
  return "@DYORPod";
}
