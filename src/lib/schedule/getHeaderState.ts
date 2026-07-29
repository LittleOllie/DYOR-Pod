import { shows } from "@/content/shows";
import { site } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import {
  getFeaturedEvent,
  getNextScheduledSpace,
} from "@/lib/schedule/getNextOccurrence";
import type { Show } from "@/types/content";

export function getHeaderState(now = new Date()): {
  isLive: boolean;
  ctaHref: string;
  featuredShow: Show;
  startDate?: string;
} {
  const featured = getFeaturedEvent(shows, now);
  const nextSpace = getNextScheduledSpace(shows, now);

  const isLive =
    shows.some((s) => getEventStatus(s, now) === "live") ||
    Boolean(featured?.show.liveOverride);

  const featuredShow = featured?.show ?? shows[0];
  const startDate = featured?.start?.toISOString() ?? nextSpace?.start.toISOString();

  let ctaHref = "/#schedule";
  if (isLive) {
    const liveShow = shows.find((s) => getEventStatus(s, now) === "live");
    ctaHref = liveShow?.xUrl ?? site.social.x ?? "/#schedule";
  } else if (nextSpace) {
    ctaHref = nextSpace.show.xUrl ?? site.social.x ?? "/#schedule";
  }

  return { isLive, ctaHref, featuredShow, startDate };
}
