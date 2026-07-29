"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

type ShowCarouselProps = {
  shows: Show[];
};

const ROTATE_MS = 6000;

/** Fixed layout — image column */
const IMAGE_WIDTH = "11rem";
const IMAGE_HEIGHT = "13rem";

/** Fixed layout — content column (must fit title, copy, schedule, CTA) */
const CONTENT_HEIGHT = "17.5rem";

const accentLabels: Record<Show["accent"], string> = {
  teal: "text-brand-bright",
  gold: "text-gold",
  cyan: "text-brand-bright",
  navy: "text-text-secondary",
};

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

function getCtaLabel(show: Show, status: ReturnType<typeof getEventStatus>) {
  if (status === "live") return "Join Live on X";
  if (show.platform === "spotify") return "Listen on Spotify";
  if (status === "schedule-pending") return "Follow on X";
  return "Find on @DYORPod";
}

type CarouselSlideProps = {
  show: Show;
  active: boolean;
};

function CarouselSlidePanel({ show, active }: CarouselSlideProps) {
  const status = getEventStatus(show);
  const accent = accentLabels[show.accent];
  const ctaUrl =
    show.xUrl ?? show.spotifyUrl ?? show.appleUrl ?? site.social.x ?? site.social.spotify;
  const ctaLabel = getCtaLabel(show, status);

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col transition-opacity duration-700 ease-out motion-reduce:transition-none",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      <div className="flex h-7 shrink-0 items-center justify-between gap-2">
        <StatusPill status={status} />
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-text-secondary">
          {show.platform === "x" ? (
            <Radio size={12} aria-hidden="true" />
          ) : (
            <SpotifyIcon size={14} className="text-[#1DB954]" />
          )}
          {show.platform === "x" ? "X Space" : "Spotify Podcast"}
        </span>
      </div>

      <p
        className={cn(
          "mt-2 h-4 shrink-0 truncate text-xs font-semibold uppercase tracking-wider",
          accent,
        )}
      >
        {show.tagline}
      </p>

      <h3 className="mt-2 line-clamp-2 h-14 shrink-0 font-heading text-xl font-bold leading-tight text-text-primary md:text-2xl">
        {show.name}
      </h3>

      <p className="mt-2 line-clamp-2 h-11 shrink-0 text-sm leading-relaxed text-text-secondary">
        {show.description}
      </p>

      <p className="mt-2 h-5 shrink-0 truncate text-sm text-text-secondary">
        {status === "schedule-pending" ? (
          <span className="text-gold">Time to be confirmed</span>
        ) : (
          formatShowSchedule(show)
        )}
      </p>

      <div className="mt-auto max-w-xs shrink-0 pt-4">
        {ctaUrl &&
          (show.platform === "spotify" && show.spotifyUrl ? (
            <SpotifyListenButton href={show.spotifyUrl} size="md" className="h-12 w-full" />
          ) : (
            <LinkButton
              href={ctaUrl}
              variant={status === "live" ? "live" : "secondary"}
              size="md"
              external
              className="h-12 w-full"
            >
              {ctaLabel}
            </LinkButton>
          ))}
      </div>
    </div>
  );
}

function CarouselSlideImage({ show, active }: CarouselSlideProps) {
  const imageWidth = show.imageWidth ?? 1122;
  const imageHeight = show.imageHeight ?? 1402;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-out motion-reduce:transition-none",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      <ImageWithFallback
        src={show.image}
        alt={active ? `${show.name} — ${show.tagline}` : ""}
        width={imageWidth}
        height={imageHeight}
        objectFit="contain"
        className="h-full w-full"
        sizes="176px"
      />
    </div>
  );
}

export function ShowCarousel({ shows }: ShowCarouselProps) {
  const [index, setIndex] = useState(0);
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
      aria-label="DYOR programmes"
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
          className="grid p-4 md:grid-cols-[11rem_1fr] md:items-start md:gap-6 md:p-6"
          style={{ minHeight: `calc(${IMAGE_HEIGHT} + 2rem)` }}
        >
          <div
            className="relative mx-auto shrink-0 bg-bg-primary/40 md:mx-0"
            style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
          >
            {shows.map((item, i) => (
              <CarouselSlideImage key={item.id} show={item} active={i === index} />
            ))}
          </div>

          <div
            className="relative mt-4 md:mt-0"
            style={{ height: CONTENT_HEIGHT }}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="sr-only">{activeShow.name}</p>
            {shows.map((item, i) => (
              <CarouselSlidePanel key={item.id} show={item} active={i === index} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring"
          aria-label="Previous programme"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Choose programme">
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
          aria-label="Next programme"
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
