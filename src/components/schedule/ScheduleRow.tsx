import { LinkButton } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusPill } from "@/components/ui/StatusPill";
import { site } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { formatDayOfWeek, formatShowSchedule } from "@/lib/schedule/formatEventTime";
import type { Show } from "@/types/content";

type ScheduleRowProps = {
  show: Show;
};

export function ScheduleRow({ show }: ScheduleRowProps) {
  const status = getEventStatus(show);
  const ctaUrl =
    show.xUrl ?? show.spotifyUrl ?? show.appleUrl ?? site.social.x ?? site.social.spotify;
  const ctaLabel =
    status === "live"
      ? "Join Live"
      : status === "schedule-pending"
        ? "Follow on X"
        : show.platform === "x"
          ? "@DYORPod"
          : "Listen";

  return (
    <article className="flex gap-3 rounded-[var(--radius-large)] border border-border bg-surface p-3 active:bg-surface-raised">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[var(--radius-medium)]">
        <ImageWithFallback
          src={show.image}
          alt=""
          width={72}
          height={72}
          className="h-full w-full"
          sizes="72px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {formatDayOfWeek(show.dayOfWeek)}
            </p>
            <h3 className="truncate font-heading text-base font-bold text-text-primary">
              {show.name}
            </h3>
            <p className="truncate text-sm text-text-secondary">{show.tagline}</p>
          </div>
          <StatusPill status={status} className="shrink-0 scale-90" />
        </div>

        <p className="mt-1 text-sm text-text-secondary">
          {status === "schedule-pending" ? (
            <span className="text-gold">Time to be confirmed</span>
          ) : (
            formatShowSchedule(show)
          )}
        </p>

        {ctaUrl && (
          <div className="mt-2">
            <LinkButton
              href={ctaUrl}
              variant={status === "live" ? "live" : "secondary"}
              size="sm"
              external
              className="min-h-[44px] w-full sm:w-auto"
            >
              {ctaLabel}
            </LinkButton>
          </div>
        )}
      </div>
    </article>
  );
}
