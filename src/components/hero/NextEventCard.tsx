"use client";

import Image from "next/image";
import { useMemo } from "react";
import { CountdownTimer } from "@/components/hero/CountdownTimer";
import { LiveBadge } from "@/components/hero/LiveBadge";
import { LinkButton } from "@/components/ui/Button";
import { site, xSpaceNote } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { getNextOccurrence } from "@/lib/schedule/getNextOccurrence";
import {
  formatDayOfWeek,
  formatEventTime,
  formatShowSchedule,
} from "@/lib/schedule/formatEventTime";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type NextEventCardProps = {
  show: Show;
  startDate?: string;
  className?: string;
};

export function NextEventCard({ show, startDate, className }: NextEventCardProps) {
  const status = getEventStatus(show);
  const isLive = status === "live";
  const isPending = status === "schedule-pending";
  const isUpcoming = status === "upcoming";

  const start = useMemo(() => {
    if (startDate) return new Date(startDate);
    return getNextOccurrence(show) ?? undefined;
  }, [show, startDate]);

  const formatted = start ? formatEventTime(start, show.timezone) : null;

  const ctaUrl = show.xUrl ?? show.spotifyUrl ?? site.social.x;
  const ctaLabel = isLive
    ? "Join Live on X"
    : isPending
      ? "Follow DYOR on X"
      : show.platform === "x"
        ? "Find on @DYORPod"
        : "Listen on Spotify";

  const statusLabel = isLive
    ? "Live now"
    : isPending
      ? `${formatDayOfWeek(show.dayOfWeek)}s on X`
      : isUpcoming
        ? "Next live space"
        : "Programme";

  return (
    <article
      className={cn(
        "card-surface relative overflow-hidden p-4 md:p-6",
        isLive && "card-surface--highlight border-live/40 animate-signal-pulse",
        isUpcoming && "card-surface--highlight",
        className,
      )}
    >
      {isLive && (
        <div
          className="absolute left-0 top-0 h-full w-1 bg-live"
          aria-hidden="true"
        />
      )}
      {isUpcoming && !isLive && (
        <div className="absolute left-0 top-0 h-full w-1 bg-brand" aria-hidden="true" />
      )}

      <div
        className="pointer-events-none absolute inset-4 z-0 p-[5%] md:inset-6"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-[48%] h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.12] blur-3xl" />
        <div className="relative h-full w-full opacity-[0.03]">
          <Image
            src="/brand/Rocket.png"
            alt=""
            fill
            className="brand-watermark object-contain object-center"
            sizes="(max-width: 768px) 320px, 400px"
          />
        </div>
      </div>

      <div className="relative z-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-bright">
        {statusLabel}
      </p>

      <h3 className="mt-2 font-heading text-xl font-bold text-text-primary md:text-2xl">
        {show.name}
      </h3>

      {show.tagline && (
        <p className="mt-1 text-sm text-text-secondary">{show.tagline}</p>
      )}

      <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {isPending ? (
          <p className="font-medium text-gold">Time to be confirmed</p>
        ) : formatted ? (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-secondary">Schedule</p>
              <p className="mt-0.5 font-medium text-text-primary">
                {formatted.sourceDay} · {formatted.sourceTime}
              </p>
            </div>
            {formatted.localTime && formatted.localDay && (
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Your time</p>
                <p className="mt-0.5 text-text-secondary">
                  {formatted.localDay} · {formatted.localTime}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-text-secondary">{formatShowSchedule(show)}</p>
        )}
      </div>

      {start && isUpcoming && (
        <div className="mt-4">
          <CountdownTimer targetDate={start.toISOString()} />
        </div>
      )}

      <div className="mt-5">
        <LiveBadge status={status} />
      </div>

      {ctaUrl && (
        <div className="mt-4">
          <LinkButton
            href={ctaUrl}
            variant={isLive ? "live" : "primary"}
            size="lg"
            external
            className="min-h-[52px] w-full text-base"
            aria-label={`${ctaLabel} — ${show.name}`}
          >
            {ctaLabel}
          </LinkButton>
          {show.platform === "x" && !isLive && (
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{xSpaceNote}</p>
          )}
        </div>
      )}
      </div>
    </article>
  );
}
