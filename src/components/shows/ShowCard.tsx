import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusPill } from "@/components/ui/StatusPill";
import { site } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { formatShowSchedule } from "@/lib/schedule/formatEventTime";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";
import { Radio } from "lucide-react";

type ShowCardProps = {
  show: Show;
};

const accentStyles: Record<
  Show["accent"],
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
    border: "hover:border-text-secondary/30",
    label: "text-text-secondary",
  },
};

export function ShowCard({ show }: ShowCardProps) {
  const status = getEventStatus(show);
  const accent = accentStyles[show.accent];
  const imageWidth = show.imageWidth ?? 1122;
  const imageHeight = show.imageHeight ?? 1402;
  const ctaUrl =
    show.xUrl ?? show.spotifyUrl ?? show.appleUrl ?? site.social.x ?? site.social.spotify;
  const ctaLabel =
    status === "live"
      ? "Join Live on X"
      : show.platform === "spotify"
        ? "Listen on Spotify"
        : status === "schedule-pending"
          ? "Follow on X"
          : "Find on @DYORPod";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-large)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-all duration-[var(--motion-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] focus-within:ring-2 focus-within:ring-brand-bright",
        accent.border,
      )}
    >
      <div
        className="relative flex items-center justify-center bg-bg-primary/40"
        style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
      >
        <ImageWithFallback
          src={show.image}
          alt={`${show.name} — ${show.tagline}`}
          width={imageWidth}
          height={imageHeight}
          objectFit="contain"
          className="h-full w-full"
          sizes="(max-width:768px) 100vw, 25vw"
        />
        <div className="absolute right-3 top-3">
          <StatusPill status={status} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-border/60 bg-bg-primary/85 px-2.5 py-1 text-xs text-text-secondary backdrop-blur-sm">
          {show.platform === "x" ? (
            <Radio size={12} aria-hidden="true" />
          ) : (
            <SpotifyIcon size={14} className="text-[#1DB954]" />
          )}
          {show.platform === "x" ? "X Space" : "Spotify Podcast"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className={cn("text-xs font-semibold uppercase tracking-wider", accent.label)}>
          {show.tagline}
        </p>
        <h3 className="mt-1 font-heading text-xl font-bold text-text-primary">{show.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">
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
