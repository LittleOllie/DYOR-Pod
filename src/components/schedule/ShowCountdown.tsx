"use client";

import { CompactCountdown } from "@/components/schedule/CompactCountdown";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { getResolvedNextOccurrence } from "@/lib/schedule/resolveShowSchedule";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type ShowCountdownProps = {
  show: Show;
  className?: string;
  dateOverrides?: DateScheduleOverride[];
};

/** Countdown to the next occurrence — only when the show has a confirmed start time. */
export function ShowCountdown({
  show,
  className,
  dateOverrides = [],
}: ShowCountdownProps) {
  const status = getEventStatus(show, new Date(), dateOverrides);

  if (status === "live" || status === "recently-ended" || status === "schedule-pending") {
    return null;
  }

  if (!show.scheduleConfirmed || !show.startTime) {
    return null;
  }

  const next = getResolvedNextOccurrence(show, { dateOverrides });
  if (!next) {
    return null;
  }

  const platformWord = show.platform === "x" ? "Space" : "episode";

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-1 text-center text-[9px] font-semibold uppercase leading-[1.15] tracking-wider text-text-secondary md:mb-1.5 md:text-[10px]">
        <span className="block md:hidden">Next {platformWord} starts</span>
        <span className="block md:hidden">in</span>
        <span className="hidden md:inline">Next {platformWord} starts in</span>
      </p>
      <CompactCountdown targetDate={next.toISOString()} className="w-full" />
    </div>
  );
}
