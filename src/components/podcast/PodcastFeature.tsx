"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { PodcastPlatformButtons } from "@/components/podcast/PodcastPlatformButtons";
import { SpaceshipPodcastController } from "@/components/podcast/SpaceshipPodcastController";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { podcast, podcastSection } from "@/content/podcast";
import { podcastMobile } from "@/content/site";
import { getShowById } from "@/content/shows";
import { site } from "@/content/site";

function BroadcastWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 20, 40, 60, 80, 100].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={12 - (i % 3) * 3 - 2}
          width="3"
          height={(i % 3) * 3 + 4}
          rx="1.5"
          className="fill-brand/40"
        />
      ))}
    </svg>
  );
}

function useLazyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, shouldLoad };
}

export function SpotifyEmbed({ compact = false }: { compact?: boolean }) {
  const { containerRef, shouldLoad } = useLazyEmbed();
  const [embedFailed, setEmbedFailed] = useState(false);

  const heightClass = compact ? "min-h-[232px]" : "min-h-[232px] sm:min-h-[352px]";

  if (embedFailed) {
    return (
      <div className="rounded-[var(--radius-large)] border border-border/80 bg-surface/40 p-6 text-center md:border-0 md:bg-surface/25">
        <p className="text-text-secondary">Player unavailable.</p>
        <Link
          href={podcast.spotifyShowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center text-sm font-medium text-brand-bright underline-offset-4 hover:underline focus-ring"
        >
          Open on Spotify
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${heightClass} w-full overflow-hidden rounded-[var(--radius-large)] border border-border/80 bg-surface/40 md:rounded-[var(--radius-xl)] md:border-border/40 md:bg-surface/25`}
    >
      {shouldLoad ? (
        <iframe
          src={podcast.spotifyEmbedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="The DYOR Podcast on Spotify"
          className="border-0"
          onError={() => setEmbedFailed(true)}
        />
      ) : (
        <div
          className={`flex ${heightClass} items-center justify-center text-text-secondary`}
          aria-hidden="true"
        >
          Loading player…
        </div>
      )}
    </div>
  );
}

export function PodcastFeature() {
  const podcastShow = getShowById("dyor-podcast");
  const imageWidth = podcastShow?.imageWidth ?? 1122;
  const imageHeight = podcastShow?.imageHeight ?? 1402;
  const appleUrl = podcast.applePodcastsUrl ?? site.social.applePodcasts;

  return (
    <div>
      <MobileSectionHeader
        eyebrow={podcastMobile.eyebrow}
        title={podcastSection.heading}
        accent="Space Ends"
        description={podcastSection.description}
        className="md:hidden"
      />

      {/* Mobile layout — unchanged */}
      <div className="md:hidden">
        <div className="flex gap-4">
          <div
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-large)] border border-border/80 bg-bg-primary/40"
            style={{ aspectRatio: "1 / 1" }}
          >
            <ImageWithFallback
              src={podcastShow?.image ?? "/shows/dyor-podcast.webp"}
              alt="The DYOR Podcast artwork"
              width={imageWidth}
              height={imageHeight}
              objectFit="contain"
              className="h-full w-full"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-bold text-text-primary">The DYOR Podcast</p>
            <p className="mt-1 text-sm font-medium text-gold">{podcastMobile.highlight}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-snug text-text-secondary">
              {podcastSection.description}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <SpotifyEmbed compact />
        </div>

        <PodcastPlatformButtons
          spotifyUrl={podcast.spotifyShowUrl}
          appleUrl={appleUrl}
          className="mt-4"
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          The weekly podcast
        </p>
        <h2 className="mt-3 max-w-4xl font-heading text-4xl font-bold leading-[1.08] text-text-primary lg:text-5xl xl:text-[3.25rem]">
          Research Never Stops When the{" "}
          <span className="bg-clip-text text-transparent bg-[linear-gradient(100deg,#13a9a6_0%,#22c4bd_28%,#31d1c6_52%,#4ecde8_76%,#7dd3fc_100%)]">
            Space Ends
          </span>
        </h2>

        <div className="mt-8 flex min-w-0 items-stretch gap-5 lg:gap-8">
          <div
            className="relative w-[20rem] shrink-0 overflow-hidden rounded-[var(--radius-xl)] bg-bg-primary/30 shadow-[var(--shadow-soft)] lg:w-[22rem]"
            style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
          >
            <ImageWithFallback
              src={podcastShow?.image ?? "/shows/dyor-podcast.webp"}
              alt="The DYOR Podcast artwork"
              width={imageWidth}
              height={imageHeight}
              objectFit="contain"
              className="h-full w-full"
              sizes="(max-width: 1280px) 320px, 352px"
            />
            <BroadcastWave className="absolute bottom-4 left-4 h-6 w-28" />
          </div>

          <div className="flex min-w-0 flex-1">
            <SpaceshipPodcastController fillHeight className="w-full" />
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-text-secondary lg:text-xl">
          {podcastSection.description}
        </p>
        <p className="mt-3 text-base font-medium text-gold">{podcastSection.releaseNote}</p>

        <PodcastPlatformButtons
          spotifyUrl={podcast.spotifyShowUrl}
          appleUrl={appleUrl}
          className="mt-6"
        />
      </div>
    </div>
  );
}
