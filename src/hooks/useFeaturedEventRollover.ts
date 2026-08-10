"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import {
  getNextStatusTransitionMs,
  getResolvedEventStatus,
  getResolvedNextOccurrence,
} from "@/lib/schedule/resolveShowSchedule";
import type { Show } from "@/types/content";
import type { EventStatus } from "@/lib/schedule/types";

type UseFeaturedEventRolloverOptions = {
  show: Show;
  startDate?: string;
  dateOverrides: DateScheduleOverride[];
};

type FeaturedEventRolloverState = {
  status: EventStatus;
  start: Date | undefined;
};

/**
 * Schedules a single timeout at the next status boundary (upcoming→live,
 * live→ended, recently-ended→upcoming) then calls router.refresh() so the
 * hero picks up the next Space without manual reload or polling.
 */
export function useFeaturedEventRollover({
  show,
  startDate,
  dateOverrides,
}: UseFeaturedEventRolloverOptions): FeaturedEventRolloverState {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());

  const ctx = useMemo(
    () => ({ dateOverrides, now }),
    [dateOverrides, now],
  );

  const status = getResolvedEventStatus(show, ctx);
  const start = useMemo(() => {
    if (startDate) {
      return new Date(startDate);
    }
    return getResolvedNextOccurrence(show, ctx) ?? undefined;
  }, [startDate, show, ctx]);

  useEffect(() => {
    const transitionMs = getNextStatusTransitionMs(show, {
      dateOverrides,
      now: new Date(),
    });

    if (transitionMs === null) {
      return;
    }

    const delay = Math.min(transitionMs + 750, 86_400_000);
    const timer = window.setTimeout(() => {
      setNow(new Date());
      router.refresh();
    }, Math.max(delay, 0));

    return () => window.clearTimeout(timer);
  }, [show, dateOverrides, status, start?.toISOString(), router]);

  return { status, start };
}
