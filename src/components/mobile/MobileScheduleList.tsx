"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CompactCountdown } from "@/components/schedule/CompactCountdown";
import { LinkButton } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import {
  getResolvedEventStatus,
  getResolvedNextOccurrence,
} from "@/lib/schedule/resolveShowSchedule";
import { formatDayOfWeek, formatShowSchedule } from "@/lib/schedule/formatEventTime";
import {
  getScheduleCtaLabel,
  getShowCtaUrl,
} from "@/lib/shows/showPresentation";
import { isShowHighlighted } from "@/lib/schedule/getScheduleHighlight";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type MobileScheduleListProps = {
  shows: Show[];
  dateOverrides?: DateScheduleOverride[];
};

function dayAbbrev(dayOfWeek: number): string {
  return formatDayOfWeek(dayOfWeek).slice(0, 3).toUpperCase();
}

function MobileScheduleRow({
  show,
  open,
  onToggle,
  dateOverrides,
  allShows,
}: {
  show: Show;
  open: boolean;
  onToggle: () => void;
  dateOverrides: DateScheduleOverride[];
  allShows: Show[];
}) {
  const status = getResolvedEventStatus(show, { dateOverrides });
  const ctaUrl = getShowCtaUrl(show);
  const ctaLabel = getScheduleCtaLabel(show, status);
  const isLive = status === "live";
  const isPending = status === "schedule-pending";
  const isUpcoming = status === "upcoming";
  const highlighted = isShowHighlighted(show, allShows, new Date(), dateOverrides);
  const nextStart = useMemo(
    () =>
      isUpcoming ? getResolvedNextOccurrence(show, { dateOverrides }) : null,
    [show, isUpcoming, dateOverrides],
  );
  const panelId = `mobile-schedule-${show.id}`;

  return (
    <div className="border-b border-border/80 last:border-b-0">
      <button
        type="button"
        className="flex w-full min-h-[44px] items-start gap-3 py-4 text-left focus-ring"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="w-11 shrink-0 pt-0.5">
          <p className="font-heading text-sm font-bold text-brand-bright">{dayAbbrev(show.dayOfWeek)}</p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-bold leading-snug text-text-primary">{show.name}</p>
          {show.tagline ? (
            <p className="mt-0.5 text-sm leading-snug text-text-secondary">{show.tagline}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
          {isLive ? (
            <StatusPill status="live" />
          ) : isPending ? (
            <span className="text-xs font-medium text-gold">Time TBC</span>
          ) : (
            <span className="max-w-[5.5rem] text-right text-xs text-text-secondary">
              {formatShowSchedule(show).split(", ").pop()}
            </span>
          )}
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={cn(
              "text-text-secondary transition-transform duration-[var(--motion-base)] motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {highlighted && isUpcoming && nextStart && !open ? (
        <div className="pb-3 pl-14 pr-1">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
            Next Space starts in
          </p>
          <CompactCountdown targetDate={nextStart.toISOString()} />
        </div>
      ) : null}

      {open ? (
        <div id={panelId} className="pb-4 pl-14 pr-1">
          <p className="text-sm leading-relaxed text-text-secondary">{show.description}</p>
          {nextStart ? (
            <div className="mt-3 max-w-xs">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
                Countdown
              </p>
              <CompactCountdown targetDate={nextStart.toISOString()} />
            </div>
          ) : null}
          {ctaUrl ? (
            <LinkButton
              href={ctaUrl}
              variant={isLive ? "live" : "secondary"}
              size="md"
              external
              className="mt-3 min-h-[44px]"
            >
              {ctaLabel}
            </LinkButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function MobileScheduleList({
  shows,
  dateOverrides = [],
}: MobileScheduleListProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="md:hidden" role="list" aria-label="Weekly schedule">
      {shows.map((show) => (
        <div key={show.id} role="listitem">
          <MobileScheduleRow
            show={show}
            open={openId === show.id}
            dateOverrides={dateOverrides}
            allShows={shows}
            onToggle={() => setOpenId((current) => (current === show.id ? null : show.id))}
          />
        </div>
      ))}
    </div>
  );
}
