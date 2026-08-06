"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { CountdownTimer } from "@/components/hero/CountdownTimer";
import { CompactCountdown } from "@/components/schedule/CompactCountdown";
import { LiveBadge } from "@/components/hero/LiveBadge";
import { LinkButton } from "@/components/ui/Button";
import { site, xSpaceNote } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { getNextOccurrence } from "@/lib/schedule/getNextOccurrence";
import {
  formatEventTime,
  formatShowSchedule,
} from "@/lib/schedule/formatEventTime";
import { formatMobileEventTiming } from "@/lib/schedule/formatMobileEventTiming";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type NextEventCardProps = {
  show: Show;
  startDate?: string;
  className?: string;
  /** Desktop hero featured broadcast treatment */
  featured?: boolean;
};

export function NextEventCard({
  show,
  startDate,
  className,
  featured = false,
}: NextEventCardProps) {
  const status = getEventStatus(show);
  const isLive = status === "live";
  const isPending = status === "schedule-pending";
  const isUpcoming = status === "upcoming";

  const start = useMemo(() => {
    if (startDate) return new Date(startDate);
    return getNextOccurrence(show) ?? undefined;
  }, [show, startDate]);

  const formatted = start ? formatEventTime(start, show.timezone) : null;
  const mobileTiming =
    start && isUpcoming ? formatMobileEventTiming(start, show.timezone) : null;

  const ctaUrl = show.xUrl ?? show.spotifyUrl ?? site.social.x;
  const ctaLabel = isLive
    ? "Join live"
    : isPending
      ? "Follow DYOR on X"
      : show.platform === "x"
        ? "View on X"
        : "Listen on Spotify";

  const statusLabel = isLive
    ? "LIVE NOW"
    : isPending
      ? "NEXT LIVE SPACE"
      : isUpcoming
        ? "NEXT LIVE SPACE"
        : "PROGRAMME";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] bg-surface/60 p-5",
        "border border-border/80 md:border-border/60 md:bg-surface/40",
        featured && "md:rounded-[1.25rem] md:p-8 md:desktop-feature-glow lg:p-10",
        !featured && "md:card-surface md:p-6",
        isLive && "border-live/35 md:border-live/40 md:animate-signal-pulse",
        isUpcoming && "border-t-2 border-t-brand md:border-t-0 md:ring-1 md:ring-brand/15",
        className,
      )}
    >
      {isLive && (
        <div className="absolute left-0 top-0 hidden h-full w-1 bg-live md:block" aria-hidden="true" />
      )}

      {featured && (
        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-br from-brand/[0.06] via-transparent to-transparent md:block"
          aria-hidden="true"
        />
      )}

      <div
        className="pointer-events-none absolute inset-4 z-0 p-[5%] md:inset-6"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-[48%] h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.08] blur-3xl" />
        <div className="relative h-full w-full opacity-[0.03]">
          <Image
            src="/brand/Rocket.png"
            alt=""
            fill
            priority
            className="brand-watermark object-contain object-center"
            sizes="(max-width: 768px) 320px, 400px"
          />
        </div>
      </div>

      <div className="relative z-10">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-bright md:text-xs md:tracking-widest">
          {isLive ? (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-live animate-pulse-live" aria-hidden="true" />
              {statusLabel}
            </>
          ) : (
            statusLabel
          )}
        </p>

        <h3
          className={cn(
            "mt-2 font-heading font-bold leading-tight text-text-primary",
            featured
              ? "text-[1.35rem] md:mt-3 md:text-3xl lg:text-[2rem] xl:text-4xl"
              : "text-[1.35rem] md:text-2xl",
          )}
        >
          {show.name}
        </h3>

        {show.tagline ? (
          <p className={cn("mt-1 text-sm text-text-secondary", featured && "md:text-base")}>
            {show.tagline}
          </p>
        ) : null}

        {show.description && featured ? (
          <p className="mt-3 hidden line-clamp-2 text-sm leading-relaxed text-text-secondary/90 md:block md:text-base">
            {show.description}
          </p>
        ) : null}

        <div
          className={cn(
            "mt-4 space-y-2 border-t border-border/70 pt-4 text-sm",
            featured && "md:mt-6 md:space-y-3 md:pt-6",
          )}
        >
          {isPending ? (
            <p className="font-medium text-gold">Time to be confirmed</p>
          ) : isLive ? (
            <p className="font-semibold text-live">Live now on X</p>
          ) : mobileTiming ? (
            <>
              <p className="font-medium text-text-primary md:hidden">{mobileTiming}</p>
              {formatted?.localTime && formatted.localDay ? (
                <p className="text-xs text-text-secondary md:hidden">
                  {formatted.localDay} · {formatted.localTime} your time
                </p>
              ) : null}
              <div className="hidden md:block">
                <p className="text-xs uppercase tracking-wide text-text-secondary/80">When</p>
                <p className="mt-1 text-lg font-medium text-text-primary lg:text-xl">
                  {formatted!.sourceDay} · {formatted!.sourceTime}
                </p>
                {formatted!.localTime && formatted!.localDay ? (
                  <p className="mt-1 text-sm text-text-secondary">
                    {formatted!.localDay} · {formatted!.localTime} your time
                  </p>
                ) : null}
              </div>
            </>
          ) : formatted ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary/80">When</p>
                <p className="mt-1 font-medium text-text-primary md:text-lg">
                  {formatted.sourceDay} · {formatted.sourceTime}
                </p>
              </div>
              {formatted.localTime && formatted.localDay ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary/80">Your time</p>
                  <p className="mt-1 text-text-secondary">
                    {formatted.localDay} · {formatted.localTime}
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-text-secondary">{formatShowSchedule(show)}</p>
          )}
        </div>

        {start && isUpcoming && (
          <div className={cn("mt-4", featured && "md:opacity-80")}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/75">
              Countdown
            </p>
            <div className="md:hidden">
              <CompactCountdown targetDate={start.toISOString()} />
            </div>
            <div className="hidden md:block">
              <CountdownTimer targetDate={start.toISOString()} />
            </div>
          </div>
        )}

        <div className="mt-4 hidden md:block">
          <LiveBadge status={status} />
        </div>

        {ctaUrl ? (
          <div className={cn("mt-5", featured && "md:mt-8")}>
            <LinkButton
              href={ctaUrl}
              variant={isLive ? "live" : "primary"}
              size="lg"
              external
              className={cn(
                "min-h-[50px] w-full text-base md:min-h-[52px]",
                featured && "md:min-h-[56px] md:text-lg",
              )}
              aria-label={`${ctaLabel} — ${show.name}`}
            >
              {ctaLabel}
            </LinkButton>
            <Link
              href="/#schedule"
              className="mt-3 inline-flex min-h-[44px] items-center text-sm text-brand-bright underline-offset-4 hover:underline focus-ring md:hidden"
            >
              View full schedule
            </Link>
            {show.platform === "x" && !isLive && (
              <p className="mt-3 hidden text-xs leading-relaxed text-text-secondary/80 md:block">
                {xSpaceNote}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
