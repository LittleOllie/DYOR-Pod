import { LinkButton } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusPill } from "@/components/ui/StatusPill";
import { site } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { formatDayOfWeek, formatShowSchedule } from "@/lib/schedule/formatEventTime";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type ScheduleCardProps = {
  show: Show;
};

const accentStyles: Record<Show["accent"], string> = {
  teal: "border-brand/30",
  gold: "border-gold/30",
  cyan: "border-brand-bright/30",
  navy: "border-border",
};

export function ScheduleCard({ show }: ScheduleCardProps) {
  const status = getEventStatus(show);
  const ctaUrl =
    show.xUrl ?? show.spotifyUrl ?? show.appleUrl ?? site.social.x ?? site.social.spotify;
  const ctaLabel =
    status === "live"
      ? "Join Live"
      : status === "schedule-pending"
        ? "Follow on X"
          : show.platform === "x"
          ? "Find on @DYORPod"
          : "Listen Now";

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[var(--radius-large)] border bg-surface/60 p-4 transition-shadow hover:shadow-soft",
        accentStyles[show.accent],
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          {formatDayOfWeek(show.dayOfWeek)}
        </span>
        <StatusPill status={status} />
      </div>

      <div className="mb-3 overflow-hidden rounded-[var(--radius-medium)]">
        <ImageWithFallback
          src={show.image}
          alt={`${show.name} artwork`}
          width={320}
          height={180}
          className="aspect-video w-full"
          sizes="(max-width:768px) 100vw, 25vw"
        />
      </div>

      <h3 className="font-heading text-lg font-bold text-text-primary">{show.name}</h3>
      <p className="mt-1 text-sm text-text-secondary">{show.tagline}</p>

      <p className="mt-2 flex-1 text-sm text-text-secondary">
        {status === "schedule-pending" ? (
          <>
            {formatDayOfWeek(show.dayOfWeek)}s on X
            <br />
            <span className="text-gold">Time to be confirmed</span>
          </>
        ) : (
          formatShowSchedule(show)
        )}
      </p>

      {ctaUrl && (
        <div className="mt-4">
          <LinkButton
            href={ctaUrl}
            variant={status === "live" ? "live" : "secondary"}
            size="sm"
            external
            className="w-full"
          >
            {ctaLabel}
          </LinkButton>
        </div>
      )}
    </article>
  );
}
