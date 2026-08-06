"use client";

import { ShowIdentityCue } from "@/components/shows/ShowIdentityCue";
import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDayOfWeek, formatShowSchedule } from "@/lib/schedule/formatEventTime";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { isShowHighlighted } from "@/lib/schedule/getScheduleHighlight";
import {
  getScheduleCtaLabel,
  getShowCtaUrl,
  getShowPlatformLabel,
  showAccentStyles,
} from "@/lib/shows/showPresentation";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";
import { Radio } from "lucide-react";

type DesktopScheduleGridProps = {
  shows: Show[];
};

const accentLabels = Object.fromEntries(
  Object.entries(showAccentStyles).map(([key, value]) => [key, value.label]),
) as Record<Show["accent"], string>;

function ProgrammeCard({ show, index, total }: { show: Show; index: number; total: number }) {
  const status = getEventStatus(show);
  const accent = accentLabels[show.accent];
  const ctaUrl = getShowCtaUrl(show);
  const ctaLabel = getScheduleCtaLabel(show, status);
  const platformLabel = getShowPlatformLabel(show);
  const highlighted = isShowHighlighted(show);
  const imageWidth = show.imageWidth ?? 1122;
  const imageHeight = show.imageHeight ?? 1402;

  return (
    <article
      className={cn(
        "desktop-hover-lift group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-surface/35 p-5 lg:p-6",
        highlighted && "ring-1 ring-brand/25",
      )}
    >
      {index < total - 1 && (
        <div
          className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-brand/40 to-transparent xl:block"
          aria-hidden="true"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {formatDayOfWeek(show.dayOfWeek)}
        </p>
        <StatusPill status={status} />
      </div>

      <div className="relative mx-auto mt-4 aspect-[4/5] w-full max-w-[9.5rem] overflow-hidden rounded-[var(--radius-large)] bg-bg-primary/30 lg:max-w-[10.5rem]">
        <ShowIdentityCue cue={show.identityCue} />
        <ImageWithFallback
          src={show.image}
          alt=""
          width={imageWidth}
          height={imageHeight}
          objectFit="contain"
          className="relative z-[1] h-full w-full"
          sizes="168px"
        />
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3
          className={cn(
            "font-heading text-xl font-bold leading-tight text-text-primary lg:text-2xl",
            highlighted && "text-brand-bright",
          )}
        >
          {show.name}
        </h3>
        <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wider", accent)}>
          {show.tagline}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">
          {show.description}
        </p>

        <div className="mt-4 space-y-1 border-t border-border/50 pt-4">
          {status === "schedule-pending" ? (
            <p className="text-sm font-medium text-gold">Time to be confirmed</p>
          ) : status === "live" ? (
            <p className="text-sm font-semibold text-live">Live now</p>
          ) : (
            <p className="text-sm text-text-secondary">{formatShowSchedule(show)}</p>
          )}
          <p className="flex items-center gap-1.5 text-xs text-text-secondary/80">
            {show.platform === "x" ? (
              <Radio size={12} aria-hidden="true" />
            ) : (
              <SpotifyIcon size={12} className="text-[#1DB954]" />
            )}
            {platformLabel}
          </p>
        </div>

        {ctaUrl && (
          <div className="mt-4">
            {show.platform === "spotify" && show.spotifyUrl ? (
              <SpotifyListenButton href={show.spotifyUrl} size="md" className="h-11 w-full" />
            ) : (
              <LinkButton
                href={ctaUrl}
                variant={status === "live" ? "live" : "primary"}
                size="md"
                external
                className="h-11 w-full"
              >
                {status === "live" ? "Join live" : ctaLabel}
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function DesktopScheduleGrid({ shows }: DesktopScheduleGridProps) {
  return (
    <div role="region" aria-label="Weekly DYOR programming">
      <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-[42%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          aria-hidden="true"
        />
        {shows.map((show, index) => (
          <ProgrammeCard key={show.id} show={show} index={index} total={shows.length} />
        ))}
      </div>
    </div>
  );
}
