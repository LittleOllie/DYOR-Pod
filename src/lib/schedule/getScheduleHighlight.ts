import { shows as staticShows } from "@/content/shows";
import { getHeaderStateForShows } from "@/lib/schedule/getHeaderState";
import { getResolvedEventStatus } from "@/lib/schedule/resolveShowSchedule";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import type { Show } from "@/types/content";

/** Next live or upcoming X Space — used for schedule card emphasis and countdowns. */
export function getHighlightedShowId(
  showList: Show[] = staticShows,
  now = new Date(),
  dateOverrides: DateScheduleOverride[] = [],
): string | null {
  const live = showList.find(
    (show) =>
      show.isActive &&
      getResolvedEventStatus(show, { dateOverrides, now }) === "live",
  );
  if (live) {
    return live.id;
  }

  const { featuredShow, startDate } = getHeaderStateForShows(showList, dateOverrides, now);
  if (
    featuredShow.platform === "x" &&
    featuredShow.scheduleConfirmed &&
    featuredShow.startTime &&
    startDate
  ) {
    return featuredShow.id;
  }

  return null;
}

export function isShowHighlighted(
  show: Show,
  showList: Show[] = staticShows,
  now = new Date(),
  dateOverrides: DateScheduleOverride[] = [],
): boolean {
  return show.id === getHighlightedShowId(showList, now, dateOverrides);
}
