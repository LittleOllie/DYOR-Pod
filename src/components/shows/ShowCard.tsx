import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { ShowIdentityCue } from "@/components/shows/ShowIdentityCue";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusPill } from "@/components/ui/StatusPill";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { formatShowSchedule } from "@/lib/schedule/formatEventTime";
import {
  getShowCtaLabel,
  getShowCtaUrl,
  getShowPlatformLabel,
  showAccentStyles,
} from "@/lib/shows/showPresentation";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";
import { Radio } from "lucide-react";

type ShowCardProps = {
  show: Show;
  compact?: boolean;
};

export function ShowCard({ show, compact = false }: ShowCardProps) {
  const status = getEventStatus(show);
  const accent = showAccentStyles[show.accent];
  const imageWidth = show.imageWidth ?? 1122;
  const imageHeight = show.imageHeight ?? 1402;
  const ctaUrl = getShowCtaUrl(show);
  const ctaLabel = getShowCtaLabel(show, status);
  const platformLabel = getShowPlatformLabel(show);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-large)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-all duration-[var(--motion-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] focus-within:ring-2 focus-within:ring-brand-bright",
        accent.border,
      )}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden bg-bg-primary/40"
        style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
      >
        <ShowIdentityCue cue={show.identityCue} />
        <ImageWithFallback
          src={show.image}
          alt={`${show.name} — ${show.tagline}`}
          width={imageWidth}
          height={imageHeight}
          objectFit="contain"
          className="relative z-[1] h-full w-full"
          sizes="(max-width:768px) 88vw, 25vw"
        />
        <div className="absolute right-3 top-3 z-[2]">
          <StatusPill status={status} />
        </div>
        <div className="absolute bottom-3 left-3 z-[2] flex items-center gap-1.5 rounded-full border border-border/60 bg-bg-primary/85 px-2.5 py-1 text-xs text-text-secondary backdrop-blur-sm">
          {show.platform === "x" ? (
            <Radio size={12} aria-hidden="true" />
          ) : (
            <SpotifyIcon size={14} className="text-[#1DB954]" />
          )}
          {platformLabel}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-5")}>
        <p className={cn("text-xs font-semibold uppercase tracking-wider", accent.label)}>
          {show.tagline}
        </p>
        <h3
          className={cn(
            "mt-1 font-heading font-bold text-text-primary",
            compact ? "text-lg" : "text-xl",
          )}
        >
          {show.name}
        </h3>
        <p
          className={cn(
            "mt-2 flex-1 text-sm leading-relaxed text-text-secondary",
            compact ? "line-clamp-2" : "line-clamp-3",
          )}
        >
          {show.description}
        </p>

        <p className="mt-3 text-sm text-text-secondary">
          {status === "schedule-pending" ? (
            <span className="text-gold">Time to be confirmed</span>
          ) : (
            formatShowSchedule(show)
          )}
        </p>

        {ctaUrl && (
          <div className="mt-4">
            {show.platform === "spotify" && show.spotifyUrl ? (
              <SpotifyListenButton href={show.spotifyUrl} size="md" className="w-full" />
            ) : (
              <LinkButton
                href={ctaUrl}
                variant={status === "live" ? "live" : "secondary"}
                size="md"
                external
                className="min-h-[48px] w-full text-base"
              >
                {ctaLabel}
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
