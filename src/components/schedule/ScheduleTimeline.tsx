import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { COUNTDOWN_LETTER_CANVAS, countdownLetters, type CountdownLetterId } from "@/content/brandLogo";
import { cn } from "@/lib/utils/cn";
import { site } from "@/content/site";
import { getWeeklyShows } from "@/content/shows";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { isShowHighlighted } from "@/lib/schedule/getScheduleHighlight";
import { formatDayOfWeek, formatShowSchedule } from "@/lib/schedule/formatEventTime";
import type { Show } from "@/types/content";

/** Weekly timeline order spells D · Y · O · R (Tue → Sun). */
const SCHEDULE_LETTERS: CountdownLetterId[] = ["d", "y", "o", "r"];

const letterById = Object.fromEntries(
  countdownLetters.map((entry) => [entry.id, entry]),
) as Record<CountdownLetterId, (typeof countdownLetters)[number]>;

function ScheduleLetterMark({ letter }: { letter: CountdownLetterId }) {
  const mark = letterById[letter];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-[46%] h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.1] blur-2xl md:blur-3xl" />
      <div className="absolute inset-0 opacity-[0.03]">
        <Image
          src={mark.src}
          alt=""
          width={COUNTDOWN_LETTER_CANVAS.width}
          height={COUNTDOWN_LETTER_CANVAS.height}
          className="brand-watermark h-full w-full object-contain object-center"
          sizes="200px"
        />
      </div>
    </div>
  );
}

function TimelineEntry({
  show,
  isLast,
  variant,
  letter,
}: {
  show: Show;
  isLast: boolean;
  variant: "mobile" | "desktop";
  letter: CountdownLetterId;
}) {
  const status = getEventStatus(show);
  const highlighted = isShowHighlighted(show);
  const ctaUrl =
    show.xUrl ?? show.spotifyUrl ?? show.appleUrl ?? site.social.x ?? site.social.spotify;

  const platformLabel =
    show.platform === "x" ? "X Space" : show.platform === "spotify" ? "Spotify" : "Podcast";

  if (variant === "desktop") {
    return (
      <li
        className={cn(
          "relative flex flex-1 flex-col items-center text-center",
          !highlighted && status !== "live" && "opacity-80",
        )}
      >
        <div
          className={cn(
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-bg-primary",
            highlighted || status === "live"
              ? "border-brand shadow-[0_0_20px_rgba(19,169,166,0.25)]"
              : "border-border",
            status === "live" && "border-live",
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              status === "live" ? "bg-live animate-pulse-live" : highlighted ? "bg-brand" : "bg-text-secondary/50",
            )}
          />
        </div>
        <article
          className={cn(
            "relative mt-4 w-full overflow-hidden rounded-[var(--radius-large)] border p-4 transition-shadow",
            highlighted
              ? "border-brand/40 bg-surface shadow-[var(--shadow-soft)]"
              : "border-border bg-surface/70",
          )}
        >
          <ScheduleLetterMark letter={letter} />
          <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {formatDayOfWeek(show.dayOfWeek)}
          </p>
          <h3 className="mt-1 font-heading text-base font-bold text-text-primary">{show.name}</h3>
          <p className="mt-0.5 text-xs text-text-secondary">{show.tagline}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <StatusPill status={status} />
            <span className="text-xs text-text-secondary">{platformLabel}</span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {status === "schedule-pending" ? (
              <span className="text-gold">Time to be confirmed</span>
            ) : (
              formatShowSchedule(show)
            )}
          </p>
          {ctaUrl && (
            <div className="mt-3">
              {show.platform === "spotify" && show.spotifyUrl ? (
                <SpotifyListenButton href={show.spotifyUrl} size="sm" className="w-full" />
              ) : (
                <LinkButton
                  href={ctaUrl}
                  variant={status === "live" ? "live" : "secondary"}
                  size="sm"
                  external
                  className="w-full min-h-[44px]"
                >
                  {status === "live" ? "Join Live" : show.platform === "x" ? "@DYORPod" : "Listen"}
                </LinkButton>
              )}
            </div>
          )}
          </div>
        </article>
      </li>
    );
  }

  return (
    <li className={cn("relative pl-8", !isLast && "pb-6")}>
      {!isLast && (
        <div
          className="absolute bottom-0 left-[11px] top-5 w-px bg-gradient-to-b from-brand/40 to-border"
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-bg-primary",
          highlighted || status === "live" ? "border-brand" : "border-border",
          status === "live" && "border-live",
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "live" ? "bg-live animate-pulse-live" : highlighted ? "bg-brand" : "bg-text-secondary/40",
          )}
        />
      </div>
      <article
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-large)] border p-4",
          highlighted ? "border-brand/35 bg-surface shadow-[var(--shadow-soft)]" : "border-border bg-surface/80",
          !highlighted && status !== "live" && "opacity-90",
        )}
      >
        <ScheduleLetterMark letter={letter} />
        <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {formatDayOfWeek(show.dayOfWeek)}
            </p>
            <h3 className="font-heading text-lg font-bold text-text-primary">{show.name}</h3>
            <p className="text-sm text-text-secondary">{show.tagline}</p>
          </div>
          <StatusPill status={status} className="shrink-0" />
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          {status === "schedule-pending" ? (
            <span className="text-gold">Time to be confirmed</span>
          ) : (
            <>
              {formatShowSchedule(show)} · {platformLabel}
            </>
          )}
        </p>
        {ctaUrl && (
          <div className="mt-3">
            {show.platform === "spotify" && show.spotifyUrl ? (
              <SpotifyListenButton href={show.spotifyUrl} size="sm" className="w-full" />
            ) : (
              <LinkButton
                href={ctaUrl}
                variant={status === "live" ? "live" : "secondary"}
                size="sm"
                external
                className="min-h-[44px] w-full"
              >
                {status === "live" ? "Join Live" : "@DYORPod"}
              </LinkButton>
            )}
          </div>
        )}
        </div>
      </article>
    </li>
  );
}

export function ScheduleTimeline() {
  const weeklyShows = getWeeklyShows();

  return (
    <>
      {/* Desktop orbital path */}
      <div className="relative hidden md:block">
        <div
          className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent"
          aria-hidden="true"
        />
        <ol className="relative flex gap-3">
          {weeklyShows.map((show, i) => (
            <TimelineEntry
              key={show.id}
              show={show}
              isLast={i === weeklyShows.length - 1}
              variant="desktop"
              letter={SCHEDULE_LETTERS[i]}
            />
          ))}
        </ol>
      </div>

      {/* Mobile vertical journey */}
      <ol className="md:hidden">
        {weeklyShows.map((show, i) => (
          <TimelineEntry
            key={show.id}
            show={show}
            isLast={i === weeklyShows.length - 1}
            variant="mobile"
            letter={SCHEDULE_LETTERS[i]}
          />
        ))}
      </ol>
    </>
  );
}
