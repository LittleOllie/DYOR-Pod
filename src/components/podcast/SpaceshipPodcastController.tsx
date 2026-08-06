"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { podcast } from "@/content/podcast";
import { cn } from "@/lib/utils/cn";

type SpaceshipPodcastControllerProps = {
  className?: string;
  /** Stretch to match sibling artwork height in parallel layout */
  fillHeight?: boolean;
};

function SignalBars({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-[3px]", className)} aria-hidden="true">
      {[0.35, 0.55, 0.75, 1, 0.6, 0.85, 0.45].map((scale, i) => (
        <span
          key={i}
          className="spaceship-signal-bar w-[3px] rounded-full bg-brand-bright/70"
          style={{
            height: `${scale * 100}%`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function CornerBracket({ className }: { className?: string }) {
  return (
    <span
      className={cn("pointer-events-none absolute h-4 w-4 border-brand/50", className)}
      aria-hidden="true"
    />
  );
}

/** Episode title — always wraps so the full name is visible in the readout. */
function EpisodeTitleReadout({ title }: { title: string }) {
  return (
    <p className="mt-1 break-words font-heading text-base font-bold leading-snug text-text-primary [overflow-wrap:anywhere] lg:text-lg">
      {title}
    </p>
  );
}

export function SpaceshipPodcastController({
  className,
  fillHeight = false,
}: SpaceshipPodcastControllerProps) {
  const [armed, setArmed] = useState(false);
  const episode = podcast.featuredEpisode;
  const playUrl =
    episode?.spotifyUrl ?? podcast.featuredEpisodeUrl ?? podcast.spotifyShowUrl;
  const title = episode?.title ?? podcast.featuredEpisodeTitle ?? "The DYOR Podcast";
  const description = episode?.description;
  const duration = episode?.duration ?? "--:--";
  const episodeLabel = episode ? `EP. ${episode.number}` : "LATEST";
  const dateLabel = episode?.date ?? "On demand";

  const handlePlay = () => {
    setArmed(true);
    window.open(playUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "spaceship-controller relative overflow-hidden rounded-[var(--radius-xl)] border border-brand/30 bg-[linear-gradient(165deg,#0e2f3a_0%,#061821_45%,#040f14_100%)] p-5 shadow-[0_0_40px_rgba(19,169,166,0.12),inset_0_1px_0_rgba(49,209,198,0.12)] lg:p-6",
        fillHeight && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      <CornerBracket className="left-3 top-3 border-l-2 border-t-2" />
      <CornerBracket className="right-3 top-3 border-r-2 border-t-2" />
      <CornerBracket className="bottom-3 left-3 border-b-2 border-l-2" />
      <CornerBracket className="bottom-3 right-3 border-b-2 border-r-2" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(49,209,198,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(49,209,198,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Status row */}
      <div className="relative flex items-center justify-between gap-3 border-b border-brand/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-bright opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-bright shadow-[0_0_8px_rgba(49,209,198,0.9)]" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-bright">
            Audio transmission
          </p>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary/70">
          Signal locked
        </p>
      </div>

      {/* Episode readout */}
      <div
        className={cn(
          "relative mt-4 min-w-0 rounded-[var(--radius-medium)] border border-brand/20 bg-bg-deep/80 px-4 py-3 shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)]",
          fillHeight && "shrink-0",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary/60">
          Latest episode
        </p>
        <EpisodeTitleReadout title={title} />
        {description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-secondary/90">
            {description}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-text-secondary">{dateLabel}</p>
      </div>

      {/* Control deck */}
      <div
        className={cn(
          "relative mt-5 flex items-center gap-4 lg:gap-6",
          fillHeight && "my-auto flex-1",
        )}
      >
        {/* Episode badge */}
        <div className="hidden shrink-0 flex-col items-center sm:flex">
          <span className="rounded border border-brand/25 bg-brand/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-bright">
            {episodeLabel}
          </span>
          <SignalBars className="mt-3 h-8 w-10" />
        </div>

        {/* Play control */}
        <div className="flex flex-1 flex-col items-center">
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${title} on Spotify`}
            className={cn(
              "group relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-brand/50 bg-[radial-gradient(circle_at_35%_30%,#1a5c58_0%,#0a2630_55%,#061821_100%)] shadow-[0_0_24px_rgba(19,169,166,0.35),inset_0_2px_8px_rgba(49,209,198,0.15)] transition-[transform,box-shadow,border-color] duration-[var(--motion-base)] hover:border-brand-bright hover:shadow-[0_0_32px_rgba(49,209,198,0.45)] focus-ring active:scale-95 lg:h-20 lg:w-20",
              armed && "border-brand-bright",
            )}
          >
            <span
              className="absolute inset-1 rounded-full border border-brand/20 motion-safe:animate-[spin_12s_linear_infinite] motion-reduce:animate-none"
              aria-hidden="true"
            />
            {armed ? (
              <span
                className="relative font-mono text-xs font-bold uppercase tracking-widest text-brand-bright"
                aria-hidden="true"
              >
                Go
              </span>
            ) : (
              <Play
                size={30}
                className="relative ml-1 text-brand-bright drop-shadow-[0_0_8px_rgba(49,209,198,0.8)]"
                aria-hidden="true"
              />
            )}
          </button>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-text-secondary/70">
            {armed ? "Channel open" : "Engage playback"}
          </p>
        </div>

        {/* Timer display */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary/60">
            Duration
          </p>
          <p
            className="mt-1 font-mono text-2xl font-bold tabular-nums tracking-wider text-brand-bright lg:text-3xl"
            style={{ textShadow: "0 0 12px rgba(49, 209, 198, 0.45)" }}
          >
            {duration}
          </p>
          <SignalBars className="mt-3 ml-auto h-6 w-8 sm:hidden" />
        </div>
      </div>

      {/* Decorative progress track */}
      <div className={cn("relative mt-5", fillHeight && "mt-auto shrink-0")}>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-deep/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
          <div
            className="h-full w-[18%] rounded-full bg-[linear-gradient(90deg,#13a9a6_0%,#31d1c6_100%)] shadow-[0_0_10px_rgba(49,209,198,0.6)]"
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-text-secondary/50">
          <span>00:00</span>
          <span>{duration}</span>
        </div>
      </div>

      <p className="relative mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-text-secondary/45">
        Opens in Spotify · Full bridge controls
      </p>
    </div>
  );
}
