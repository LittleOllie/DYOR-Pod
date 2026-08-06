"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ShowCountdown } from "@/components/schedule/ShowCountdown";
import { ShowIdentityCue } from "@/components/shows/ShowIdentityCue";
import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusPill } from "@/components/ui/StatusPill";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { isShowHighlighted } from "@/lib/schedule/getScheduleHighlight";
import { formatDayOfWeek, formatShowSchedule } from "@/lib/schedule/formatEventTime";
import {
  getScheduleCtaLabel,
  getShowCtaUrl,
  getShowPlatformLabel,
  showAccentStyles,
} from "@/lib/shows/showPresentation";
import type { Show } from "@/types/content";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

type ScheduleCarouselProps = {
  shows: Show[];
};

const ROTATE_MS = 6000;
const DESKTOP_CONTENT_HEIGHT = "19rem";

const accentLabels = Object.fromEntries(
  Object.entries(showAccentStyles).map(([key, value]) => [key, value.label]),
) as Record<Show["accent"], string>;

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

function getInitialIndex(shows: Show[]): number {
  const highlighted = shows.findIndex((show) => isShowHighlighted(show));
  return highlighted >= 0 ? highlighted : 0;
}

type SlideProps = {
  show: Show;
  active: boolean;
};

function ScheduleSlidePanel({ show, active }: SlideProps) {
  const status = getEventStatus(show);
  const accent = accentLabels[show.accent];
  const ctaUrl = getShowCtaUrl(show);
  const ctaLabel = getScheduleCtaLabel(show, status);
  const platformLabel = getShowPlatformLabel(show);
  const highlighted = isShowHighlighted(show);

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col transition-opacity duration-700 ease-out motion-reduce:transition-none",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      <div className="flex h-7 shrink-0 items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          {formatDayOfWeek(show.dayOfWeek)}
        </p>
        <div className="flex items-center gap-2">
          <StatusPill status={status} />
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-text-secondary">
            {show.platform === "x" ? (
              <Radio size={12} aria-hidden="true" />
            ) : (
              <SpotifyIcon size={14} className="text-[#1DB954]" />
            )}
            {platformLabel}
          </span>
        </div>
      </div>

      <h3
        className={cn(
          "mt-1.5 line-clamp-2 shrink-0 font-heading text-base font-bold leading-tight text-text-primary md:mt-2 md:text-2xl",
          highlighted && "text-brand-bright",
        )}
      >
        {show.name}
      </h3>

      <p
        className={cn(
          "mt-0.5 h-3.5 shrink-0 truncate text-[10px] font-semibold uppercase tracking-wider md:mt-1 md:h-4 md:text-xs",
          accent,
        )}
      >
        {show.tagline}
      </p>

      <p className="mt-1.5 line-clamp-1 shrink-0 text-xs leading-relaxed text-text-secondary md:mt-2 md:line-clamp-2 md:text-sm">
        {show.description}
      </p>

      <div className="mt-1 shrink-0 md:mt-2">
        {status === "schedule-pending" ? (
          <p className="text-xs text-gold md:text-sm">Time to be confirmed</p>
        ) : status === "live" ? (
          <p className="text-xs font-medium text-live md:text-sm">Live now on X</p>
        ) : (
          <p className="text-xs text-text-secondary md:text-sm">{formatShowSchedule(show)}</p>
        )}
      </div>

      <div className="mt-auto max-w-xs shrink-0 pt-2 md:pt-3">
        {ctaUrl &&
          (show.platform === "spotify" && show.spotifyUrl ? (
            <SpotifyListenButton href={show.spotifyUrl} size="md" className="h-10 w-full md:h-12" />
          ) : (
            <LinkButton
              href={ctaUrl}
              variant={status === "live" ? "live" : "secondary"}
              size="md"
              external
              className="h-10 w-full md:h-12"
            >
              {status === "live" ? "Join Live" : ctaLabel}
            </LinkButton>
          ))}
      </div>
    </div>
  );
}

function ScheduleSlideImage({ show, active }: SlideProps) {
  const imageWidth = show.imageWidth ?? 1122;
  const imageHeight = show.imageHeight ?? 1402;
  const highlighted = isShowHighlighted(show);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden rounded-[var(--radius-medium)] bg-bg-primary/40 transition-opacity duration-700 ease-out motion-reduce:transition-none",
        highlighted ? "ring-1 ring-brand/40" : "",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      <ShowIdentityCue cue={show.identityCue} />
      <ImageWithFallback
        src={show.image}
        alt={active ? `${show.name} — ${show.tagline}` : ""}
        width={imageWidth}
        height={imageHeight}
        objectFit="contain"
        className="relative z-[1] h-full max-h-full w-full max-w-full"
        sizes="192px"
      />
    </div>
  );
}

function ScheduleSlideCountdown({ show, active }: SlideProps) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      {active && <ShowCountdown show={show} />}
    </div>
  );
}

function CarouselControls({
  count,
  index,
  goPrev,
  goNext,
  goTo,
  shows,
  reducedMotion,
  paused,
  tabHidden,
  className,
}: {
  count: number;
  index: number;
  goPrev: () => void;
  goNext: () => void;
  goTo: (next: number) => void;
  shows: Show[];
  reducedMotion: boolean;
  paused: boolean;
  tabHidden: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring"
          aria-label="Previous show"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Choose show">
          {shows.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.name}
              onClick={() => goTo(i)}
              className={cn(
                "h-2.5 shrink-0 rounded-full transition-all duration-[var(--motion-base)] focus-ring",
                i === index ? "w-6 bg-brand" : "w-2.5 bg-border hover:bg-brand/50",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring"
          aria-label="Next show"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-text-secondary/70">
        {index + 1} of {count}
        {!reducedMotion && !paused && !tabHidden && " · Rotates automatically"}
      </p>
    </div>
  );
}

export function ScheduleCarousel({ shows }: ScheduleCarouselProps) {
  const [index, setIndex] = useState(() => getInitialIndex(shows));
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const count = shows.length;
  const activeShow = shows[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (reducedMotion || paused || tabHidden || count <= 1) return;

    const id = window.setInterval(goNext, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, tabHidden, count, goNext]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  return (
    <div
      className="mx-auto max-w-3xl"
      role="region"
      aria-label="Weekly DYOR schedule"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div
        className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-soft)]"
        aria-roledescription="carousel"
      >
        <div
          className="grid grid-cols-[6.75rem_1fr] gap-3 p-3 md:grid-cols-[12rem_1fr] md:items-stretch md:gap-6 md:p-6"
          style={{ "--schedule-content-height": DESKTOP_CONTENT_HEIGHT } as CSSProperties}
        >
          <div className="flex min-h-[11.5rem] shrink-0 flex-col md:mx-0 md:min-h-0 md:h-[var(--schedule-content-height)] md:w-full md:max-w-[12rem]">
            <div className="relative h-[7.25rem] shrink-0 md:min-h-0 md:h-auto md:flex-1">
              {shows.map((item, i) => (
                <ScheduleSlideImage key={item.id} show={item} active={i === index} />
              ))}
            </div>

            <div className="relative mt-1.5 min-h-[3rem] shrink-0 md:mt-3 md:min-h-[4.5rem]">
              {shows.map((item, i) => (
                <ScheduleSlideCountdown key={item.id} show={item} active={i === index} />
              ))}
            </div>
          </div>

          <div
            className="relative min-h-[11.5rem] md:min-h-0 md:h-[var(--schedule-content-height)]"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="sr-only">{activeShow.name}</p>
            {shows.map((item, i) => (
              <ScheduleSlidePanel key={item.id} show={item} active={i === index} />
            ))}
          </div>

          <CarouselControls
            count={count}
            index={index}
            goPrev={goPrev}
            goNext={goNext}
            goTo={goTo}
            shows={shows}
            reducedMotion={reducedMotion}
            paused={paused}
            tabHidden={tabHidden}
            className="col-span-2 border-t border-border pt-3 md:hidden"
          />
        </div>
      </div>

      <CarouselControls
        count={count}
        index={index}
        goPrev={goPrev}
        goNext={goNext}
        goTo={goTo}
        shows={shows}
        reducedMotion={reducedMotion}
        paused={paused}
        tabHidden={tabHidden}
        className="mt-4 hidden md:block"
      />
    </div>
  );
}
